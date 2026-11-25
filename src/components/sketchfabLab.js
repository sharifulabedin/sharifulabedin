/* ==========================================================================
   11-MODEL SKETCHFAB CAD STAGE, INLINE CARD 3D PLAYER & FULLSCREEN MODAL
   ========================================================================== */

import { SKETCHFAB_MODELS } from '../data/models.js';

function buildEmbedUrl(uid, autostart = 1) {
  return `https://sketchfab.com/models/${uid}/embed?autostart=${autostart}&ui_theme=dark&dnt=1&ui_inspector=1&ui_ar=1&ui_vr=1&ui_settings=1&ui_watermark=1`;
}

export function initSketchfabLab() {
  const stageTitleEl = document.getElementById('skf-stage-title');
  const stageMetaEl = document.getElementById('skf-stage-meta');
  const stageIframe = document.getElementById('skf-stage-iframe');
  const stageExternalLink = document.getElementById('skf-stage-link');
  const stageResetBtn = document.getElementById('skf-stage-reset');
  const stageFullscreenBtn = document.getElementById('skf-stage-fullscreen');
  const gridEl = document.getElementById('skf-models-grid');
  const filterTabs = document.querySelectorAll('[data-skf-filter]');

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

  function updateStageDisplay(model, autostart = 1) {
    currentModel = model;
    stageTitleEl.textContent = `${model.code} // ${model.title}`;
    stageMetaEl.textContent = `${model.faces} FACES • ${model.verts} VERTICES • ${model.tags.join(' / ')}`;
    stageExternalLink.href = model.sketchfabUrl;
    stageIframe.src = buildEmbedUrl(model.uid, autostart);

    gridEl.querySelectorAll('.model-card').forEach((card) => {
      card.classList.toggle('is-staged', card.dataset.uid === model.uid);
    });
  }

  function renderGrid(filter = 'all') {
    currentFilter = filter;
    const list =
      filter === 'all'
        ? SKETCHFAB_MODELS
        : SKETCHFAB_MODELS.filter((m) => m.category === filter);

    gridEl.innerHTML = list
      .map((model) => {
        const isStaged = model.uid === currentModel.uid;
        return `
          <article class="model-card ${isStaged ? 'is-staged' : ''}" data-uid="${model.uid}">
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
  }

  // Filter buttons
  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      filterTabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      renderGrid(tab.dataset.skfFilter);
    });
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
      document.getElementById('stage-deck-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (btn.dataset.action === 'mount-inline') {
      const mediaBox = document.getElementById(`card-media-${model.uid}`);
      if (!mediaBox) return;
      const existingIframe = mediaBox.querySelector('iframe');
      if (existingIframe) {
        existingIframe.remove();
        btn.textContent = 'INLINE 3D ▶';
      } else {
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
    modalTitle.textContent = title;
    modalMeta.textContent = meta;
    modalExtLink.href = externalHref;
    modalExtLink.textContent = externalText || 'OPEN SOURCE ↗';
    modalBody.innerHTML = `
      <iframe
        src="${embedSrc}"
        title="${title}"
        style="width:100%;height:100%;border:none;"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; xr-spatial-tracking"
        allowfullscreen
      ></iframe>
    `;
    modalBackdrop.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalBackdrop || !modalBody) return;
    modalBackdrop.hidden = true;
    modalBody.innerHTML = '';
    document.body.style.overflow = '';
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
  renderGrid('all');
  updateStageDisplay(SKETCHFAB_MODELS[0], 0);

  return {
    selectSketchfabByUid(uid) {
      const m = SKETCHFAB_MODELS.find((item) => item.uid === uid);
      if (!m) return;
      updateStageDisplay(m, 1);
      document.getElementById('stage-deck-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
