/* ==========================================================================
   11-MODEL SKETCHFAB CAD STAGE, TOUCH SCROLL SHIELD, HORIZONTAL RAIL & MODAL
   ========================================================================== */

import { SKETCHFAB_MODELS } from '../data/models.js';
import { openAnimatedDialog, closeAnimatedDialog, prefersReducedMotion } from './microInteractions.js';

function buildEmbedUrl(uid, autostart = 1) {
  return `https://sketchfab.com/models/${uid}/embed?autostart=${autostart}&ui_theme=dark&dnt=1&ui_inspector=1&ui_ar=1&ui_vr=1&ui_settings=1&ui_watermark=1`;
}

function pad2(num) {
  return String(num).padStart(2, '0');
}

export function computeRailCounter(gridEl, cardSelector) {
  const cards = Array.from(gridEl.querySelectorAll(cardSelector));
  const total = cards.length;
  if (!total) return { current: 0, total: 0 };

  const maxScroll = gridEl.scrollWidth - gridEl.clientWidth;
  if (maxScroll <= 4) {
    return { current: 1, total };
  }
  if (gridEl.scrollLeft >= maxScroll - 8) {
    return { current: total, total };
  }

  let bestIdx = 0;
  let bestDist = Infinity;
  const baseLeft = gridEl.offsetLeft;
  for (let i = 0; i < total; i += 1) {
    const cardLeft = Math.max(0, cards[i].offsetLeft - baseLeft);
    const dist = Math.abs(cardLeft - gridEl.scrollLeft);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return { current: bestIdx + 1, total };
}

export function initSketchfabLab() {
  const stageTitleEl = document.getElementById('skf-stage-title');
  const stageMetaEl = document.getElementById('skf-stage-meta');
  const stageFrameWrap = document.getElementById('skf-stage-frame-wrap') || document.querySelector('.stage-frame-wrap');
  const stageIframe = document.getElementById('skf-stage-iframe');
  const stageLoaderEl = document.getElementById('skf-stage-loader');
  const stageExternalLink = document.getElementById('skf-stage-link');
  const stageResetBtn = document.getElementById('skf-stage-reset');
  const stageFullscreenBtn = document.getElementById('skf-stage-fullscreen');

  // Mobile Touch Scroll Shield ("TAP TO ORBIT 3D" / "LOCK SCROLL")
  const touchShield = document.getElementById('skf-touch-shield');
  const orbitUnlockBtn = document.getElementById('skf-orbit-unlock-btn');
  const lockScrollBtn = document.getElementById('skf-lock-scroll-btn');

  // Filter Tablist & Horizontal Rail Controls
  const filterBar = document.getElementById('skf-filter-bar');
  const filterTabs = Array.from(document.querySelectorAll('[data-skf-filter]'));
  const railCounterEl = document.getElementById('skf-rail-counter');
  const viewAllBtn = document.getElementById('skf-view-all-btn');
  const gridEl = document.getElementById('skf-models-grid');

  // Inspector / Media Modal Elements
  const modalBackdrop = document.getElementById('inspector-modal');
  const modalTitle = document.getElementById('inspector-modal-title');
  const modalMeta = document.getElementById('inspector-modal-meta');
  const modalBody = document.getElementById('inspector-modal-body');
  const modalExtLink = document.getElementById('inspector-modal-link');
  const modalCloseBtn = document.getElementById('inspector-modal-close');

  if (!gridEl || !stageIframe) return null;

  let currentModel = SKETCHFAB_MODELS[0];
  let currentFilter = 'all';
  let visibleCount = SKETCHFAB_MODELS.length;

  stageIframe.addEventListener('load', () => {
    stageLoaderEl?.classList.add('is-loaded');
  });

  function unlockOrbit() {
    stageFrameWrap?.classList.add('is-orbit-unlocked');
    if (touchShield) touchShield.hidden = true;
    if (lockScrollBtn) lockScrollBtn.hidden = false;
  }

  function lockOrbit() {
    stageFrameWrap?.classList.remove('is-orbit-unlocked');
    if (touchShield) touchShield.hidden = false;
    if (lockScrollBtn) lockScrollBtn.hidden = true;
  }

  orbitUnlockBtn?.addEventListener('click', unlockOrbit);
  lockScrollBtn?.addEventListener('click', lockOrbit);

  function syncViewAllButton() {
    if (!viewAllBtn) return;
    const expanded = gridEl.classList.contains('is-grid-expanded');
    viewAllBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    viewAllBtn.textContent = expanded ? `COMPACT RAIL [${visibleCount}]` : `VIEW ALL [${visibleCount}]`;
  }

  function syncRailCounter() {
    if (!railCounterEl) return;
    const { current, total } = computeRailCounter(gridEl, '.model-card');
    if (total === 0) {
      railCounterEl.textContent = '00/00';
      return;
    }
    railCounterEl.textContent = `${pad2(current)}/${pad2(total)}`;
  }

  function unmountAllInlinePlayers(exceptMediaEl = null) {
    gridEl.querySelectorAll('.model-card__media').forEach((mediaEl) => {
      if (mediaEl === exceptMediaEl) return;
      const iframe = mediaEl.querySelector('iframe');
      if (iframe) {
        iframe.remove();
        const card = mediaEl.closest('.model-card');
        const inlineBtn = card?.querySelector('button[data-action="mount-inline"]');
        if (inlineBtn) inlineBtn.textContent = 'INLINE 3D ▶';
      }
    });
  }

  function updateStageDisplay(model, autostart = 1) {
    currentModel = model;
    if (stageTitleEl) stageTitleEl.textContent = `${model.code} // ${model.title}`;
    if (stageMetaEl) {
      stageMetaEl.textContent = `${model.faces} FACES • ${model.verts} VERTICES • ${model.tags.join(' / ')}`;
    }
    if (stageExternalLink) stageExternalLink.href = model.sketchfabUrl;
    stageLoaderEl?.classList.remove('is-loaded');
    stageIframe.src = buildEmbedUrl(model.uid, autostart);

    gridEl.querySelectorAll('.model-card').forEach((card) => {
      card.classList.toggle('is-staged', card.dataset.uid === model.uid);
    });
  }

  function renderGrid(filter = 'all', animateFilter = false) {
    currentFilter = filter;
    const list =
      filter === 'all'
        ? SKETCHFAB_MODELS
        : SKETCHFAB_MODELS.filter((m) => m.category === filter);
    visibleCount = list.length;

    gridEl.innerHTML = list
      .map((model, idx) => {
        const isStaged = model.uid === currentModel.uid;
        const filterClass = animateFilter ? 'mi-filter-in' : '';
        const delayStyle = animateFilter ? `style="--stagger-delay:${Math.min(idx * 32, 220)}ms;"` : '';
        return `
          <article class="model-card ${isStaged ? 'is-staged' : ''} ${filterClass}" data-uid="${model.uid}" ${delayStyle}>
            <div class="model-card__media" id="card-media-${model.uid}">
              <img
                src="${model.thumb}"
                alt="${model.title} 3D model preview"
                loading="lazy"
                decoding="async"
              />
              <div class="model-card__badges">
                <span class="spec-tag spec-tag--yellow">${model.code} • ${model.categoryLabel}</span>
                <span class="spec-tag" style="background:#0D0D0D;color:#F4F0EA;border-color:#F4F0EA;">${model.faces} TRIS</span>
              </div>
            </div>

            <div class="model-card__body">
              <div>
                <h3 class="model-card__title">${model.title}</h3>
                <p class="model-card__desc">${model.description}</p>
                <div class="model-card__tags">
                  ${model.tags.map((t) => `<span class="spec-tag">${t}</span>`).join('')}
                </div>
              </div>

              <div class="model-card__actions">
                <button
                  type="button"
                  class="nb-btn nb-btn--sm nb-btn--primary"
                  data-action="load-stage"
                  data-uid="${model.uid}"
                >STAGE ↑</button>
                <button
                  type="button"
                  class="nb-btn nb-btn--sm"
                  data-action="mount-inline"
                  data-uid="${model.uid}"
                >INLINE 3D ▶</button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    gridEl.scrollLeft = 0;
    syncViewAllButton();
    syncRailCounter();
    window.dispatchEvent(new Event('scroll'));
  }

  function activateFilterTab(targetTab, focusTab = false) {
    if (!targetTab) return;
    const nextFilter = targetTab.dataset.skfFilter || 'all';
    filterTabs.forEach((t) => {
      const active = t === targetTab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
      t.setAttribute('tabindex', active ? '0' : '-1');
    });
    if (focusTab) {
      targetTab.focus();
    }
    if (nextFilter !== currentFilter) {
      renderGrid(nextFilter, true);
    }
  }

  // Filter buttons + ARIA Tablist keyboard navigation
  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => activateFilterTab(tab, false));
  });

  filterBar?.addEventListener('keydown', (e) => {
    const idx = filterTabs.indexOf(document.activeElement);
    if (idx === -1) return;
    let nextIdx = -1;
    if (e.key === 'ArrowRight') nextIdx = (idx + 1) % filterTabs.length;
    else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + filterTabs.length) % filterTabs.length;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = filterTabs.length - 1;
    if (nextIdx !== -1) {
      e.preventDefault();
      activateFilterTab(filterTabs[nextIdx], true);
    }
  });

  // Rail scroll listener + View All toggle
  gridEl.addEventListener('scroll', syncRailCounter, { passive: true });
  window.addEventListener('resize', syncRailCounter, { passive: true });

  viewAllBtn?.addEventListener('click', () => {
    gridEl.classList.toggle('is-grid-expanded');
    syncViewAllButton();
    syncRailCounter();
    window.dispatchEvent(new Event('scroll'));
  });

  // Card actions delegation
  gridEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const uid = btn.dataset.uid;
    const model = SKETCHFAB_MODELS.find((m) => m.uid === uid);
    if (!model) return;

    if (btn.dataset.action === 'load-stage') {
      updateStageDisplay(model, 1);
      document
        .getElementById('stage-deck-anchor')
        ?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    } else if (btn.dataset.action === 'mount-inline') {
      const mediaBox = document.getElementById(`card-media-${model.uid}`);
      if (!mediaBox) return;
      const existingIframe = mediaBox.querySelector('iframe');
      if (existingIframe) {
        existingIframe.remove();
        btn.textContent = 'INLINE 3D ▶';
      } else {
        unmountAllInlinePlayers(mediaBox);
        const iframe = document.createElement('iframe');
        iframe.src = buildEmbedUrl(model.uid, 1);
        iframe.title = `${model.title} Inline 3D Player`;
        iframe.allow = 'autoplay; fullscreen; xr-spatial-tracking';
        iframe.setAttribute('allowfullscreen', '');
        mediaBox.appendChild(iframe);
        btn.textContent = 'UNMOUNT ✕';
      }
    }
  });

  // Stage Controls
  stageResetBtn?.addEventListener('click', () => {
    updateStageDisplay(currentModel, 1);
  });

  function openModal({ title, meta, embedSrc, externalHref, externalText }) {
    if (!modalBackdrop || !modalBody) return;
    if (modalTitle) modalTitle.textContent = title;
    if (modalMeta) modalMeta.textContent = meta;
    if (modalExtLink) {
      modalExtLink.href = externalHref;
      modalExtLink.textContent = externalText || 'OPEN SOURCE ↗';
    }
    modalBody.innerHTML = `
      <iframe
        src="${embedSrc}"
        title="${title}"
        style="width:100%;height:100%;border:none;"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; xr-spatial-tracking"
        allowfullscreen
      ></iframe>
    `;
    openAnimatedDialog(modalBackdrop, modalCloseBtn);
  }

  function closeModal() {
    if (!modalBackdrop || !modalBody) return;
    closeAnimatedDialog(modalBackdrop, () => {
      modalBody.innerHTML = '';
    });
  }

  stageFullscreenBtn?.addEventListener('click', () => {
    openModal({
      title: `${currentModel.code} // ${currentModel.title}`,
      meta: `${currentModel.faces} FACES • ${currentModel.verts} VERTS • ${currentModel.tags.join(', ')}`,
      embedSrc: buildEmbedUrl(currentModel.uid, 1),
      externalHref: currentModel.sketchfabUrl,
      externalText: 'OPEN ON SKETCHFAB ↗',
    });
  });

  modalCloseBtn?.addEventListener('click', closeModal);
  modalBackdrop?.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop && !modalBackdrop.hidden) {
      closeModal();
    }
  });

  // Initial mount (autostart=0 so initial page load stays featherlight & non-intrusive)
  lockOrbit();
  renderGrid('all', false);
  updateStageDisplay(SKETCHFAB_MODELS[0], 0);

  return {
    selectSketchfabByUid(uid) {
      const m = SKETCHFAB_MODELS.find((item) => item.uid === uid);
      if (!m) return;
      if (currentFilter !== 'all' && m.category !== currentFilter) {
        const allTab = document.getElementById('filter-all');
        if (allTab) activateFilterTab(allTab, false);
      }
      updateStageDisplay(m, 1);
      document
        .getElementById('stage-deck-anchor')
        ?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    },
    openYoutubeShowreel(videoId) {
      openModal({
        title: 'WRK-05 // BROADCAST VIRTUAL PRODUCTION SHOWREEL',
        meta: 'ECUBE ENTERTAINMENT • UNREAL ENGINE 4/5 + GRANDMA2 DMX512',
        embedSrc: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
        externalHref: `https://youtu.be/${videoId}`,
        externalText: 'WATCH ON YOUTUBE ↗',
      });
    },
  };
}
