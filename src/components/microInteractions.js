/* ==========================================================================
   PORTFOLIO MICRO-INTERACTIONS & MOBILE PROGRESSIVE DISCLOSURE ARCHITECT
   - Compositor-only GPU scroll progress bar (scaleX) + ResizeObserver sync
   - Floating bottom thumb-zone dock active section spy & scroll-to-top
   - Flagship Works horizontal scroll-snap rail counter + VIEW ALL toggle
   - Tactile Pillars accordion (P.01 open, P.02-P.04 tap-to-expand on <=760px)
   - Technical Arsenal 4-tab switcher & Credentials 3-tab switcher (ARIA + keys)
   - Progressive Career Chronology ledger + EXPAND ALL roundtrip
   - Animated modal open/close lifecycle with focus trap & trigger focus restore
   ========================================================================== */

import { computeRailCounter } from './sketchfabLab.js';

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
const mobileDisclosureQuery = window.matchMedia('(max-width: 760px)');

export function prefersReducedMotion() {
  return reducedMotionQuery.matches;
}

function pad2(num) {
  return String(num).padStart(2, '0');
}

const dialogState = new WeakMap();

export function openAnimatedDialog(backdrop, initialFocusEl) {
  if (!backdrop) return;
  const prev = dialogState.get(backdrop);
  if (prev?.closeTimer) {
    clearTimeout(prev.closeTimer);
  }

  const triggerEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  const trapHandler = (e) => {
    if (e.key !== 'Tab' || backdrop.hidden) return;
    const focusables = Array.from(
      backdrop.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('hidden') && !el.closest('[hidden], [inert]'));
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  backdrop.addEventListener('keydown', trapHandler);
  dialogState.set(backdrop, { triggerEl, trapHandler, closeTimer: null });

  backdrop.hidden = false;
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(() => {
    backdrop.classList.add('is-open');
    if (initialFocusEl) {
      initialFocusEl.focus();
    }
  });
}

export function closeAnimatedDialog(backdrop, onAfterClose) {
  if (!backdrop || backdrop.hidden) return;
  const state = dialogState.get(backdrop);
  backdrop.classList.remove('is-open');
  document.body.style.overflow = '';

  if (state?.trapHandler) {
    backdrop.removeEventListener('keydown', state.trapHandler);
  }

  const finish = () => {
    backdrop.hidden = true;
    onAfterClose?.();
    if (state?.triggerEl && document.contains(state.triggerEl)) {
      state.triggerEl.focus({ preventScroll: true });
    }
  };

  if (prefersReducedMotion()) {
    finish();
    return;
  }

  const timer = setTimeout(finish, 155);
  if (state) {
    state.closeTimer = timer;
  }
}

function wireAriaTablist(tablistEl, panelEls, onActivate) {
  if (!tablistEl || !panelEls.length) {
    return { activate: () => {} };
  }
  const tabs = Array.from(tablistEl.querySelectorAll('[role="tab"]'));

  function activate(index, focusTab = false) {
    const safeIdx = Math.max(0, Math.min(index, tabs.length - 1));
    tabs.forEach((tab, idx) => {
      const selected = idx === safeIdx;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.setAttribute('tabindex', selected ? '0' : '-1');
      if (selected && focusTab) {
        tab.focus();
      }
    });

    panelEls.forEach((panel, idx) => {
      const active = idx === safeIdx;
      panel.classList.toggle('is-active-panel', active);
      if (active) {
        panel.classList.add('is-revealed');
      }
    });

    onActivate?.(safeIdx);
    window.dispatchEvent(new Event('scroll'));
  }

  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => activate(idx, false));
  });

  tablistEl.addEventListener('keydown', (e) => {
    const cur = tabs.indexOf(document.activeElement);
    if (cur === -1) return;
    let next = -1;
    if (e.key === 'ArrowRight') next = (cur + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (cur - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next !== -1) {
      e.preventDefault();
      activate(next, true);
    }
  });

  activate(0, false);
  return { activate };
}

function initScrollProgressAndThumbDock() {
  const progressEl = document.querySelector('.mobile-thumb-dock__progress');
  const topBtn = document.getElementById('mobile-dock-top-btn');
  const dockLinks = Array.from(document.querySelectorAll('#mobile-thumb-dock [data-dock-section]'));
  const navLinks = Array.from(document.querySelectorAll('.site-nav__link'));

  function updateProgress() {
    if (!progressEl) return;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
    const formatted = ratio.toFixed(4);
    progressEl.style.setProperty('--scroll-progress', formatted);
    progressEl.style.transform = `scaleX(${formatted})`;
  }

  function updateActiveSection() {
    const trackedIds = ['pillars', 'stage', 'works', 'arsenal', 'chronology', 'dispatch'];
    const probeY = window.scrollY + window.innerHeight * 0.34;
    let activeId = '';

    for (const id of trackedIds) {
      const sec = document.getElementById(id);
      if (!sec) continue;
      const top = sec.offsetTop;
      if (probeY >= top) {
        activeId = id;
      }
    }

    // Map pillars/arsenal to nearest primary dock item when between sections
    const dockId =
      activeId === 'arsenal'
        ? 'works'
        : activeId === 'pillars'
          ? ''
          : activeId;

    dockLinks.forEach((link) => {
      const match = link.dataset.dockSection === dockId && Boolean(dockId);
      link.classList.toggle('is-active', match);
      if (match) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });

    navLinks.forEach((link) => {
      const match = activeId && link.getAttribute('href') === `#${activeId}`;
      link.classList.toggle('is-active', Boolean(match));
    });
  }

  function onScrollOrResize() {
    updateProgress();
    updateActiveSection();
  }

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => {
      updateProgress();
    });
    ro.observe(document.documentElement);
  }

  topBtn?.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  });

  onScrollOrResize();
  return { updateProgress };
}

function initWorksHorizontalRail() {
  const worksGrid = document.getElementById('flagship-works-grid');
  const counterEl = document.getElementById('works-rail-counter');
  const viewAllBtn = document.getElementById('works-view-all-btn');
  if (!worksGrid) return;

  const totalWorks = worksGrid.querySelectorAll('.work-card').length;

  function syncCounter() {
    if (!counterEl) return;
    const { current, total } = computeRailCounter(worksGrid, '.work-card');
    counterEl.textContent = total ? `${pad2(current)}/${pad2(total)}` : '00/00';
  }

  function syncViewAllBtn() {
    if (!viewAllBtn) return;
    const expanded = worksGrid.classList.contains('is-grid-expanded');
    viewAllBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    viewAllBtn.textContent = expanded
      ? `COMPACT RAIL [${totalWorks}]`
      : `VIEW ALL [${totalWorks}]`;
  }

  worksGrid.addEventListener('scroll', syncCounter, { passive: true });
  window.addEventListener('resize', syncCounter, { passive: true });

  viewAllBtn?.addEventListener('click', () => {
    worksGrid.classList.toggle('is-grid-expanded');
    worksGrid.querySelectorAll('.work-card').forEach((c) => c.classList.add('is-revealed'));
    syncViewAllBtn();
    syncCounter();
    window.dispatchEvent(new Event('scroll'));
  });

  syncViewAllBtn();
  syncCounter();
}

function initPillarsAccordion() {
  const boxes = Array.from(document.querySelectorAll('#pillars .pillar-box'));
  if (!boxes.length) return { expandPillar: () => {} };

  function syncInertState() {
    const isMobile = mobileDisclosureQuery.matches;
    boxes.forEach((box) => {
      const expanded = box.classList.contains('is-expanded');
      const trig = box.querySelector('.pillar-box__trigger');
      const collapse = box.querySelector('.pillar-box__collapse');
      trig?.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      if (collapse) {
        collapse.inert = isMobile && !expanded;
      }
    });
  }

  function setExpanded(index, expanded) {
    const box = boxes[index];
    if (!box) return;
    box.classList.toggle('is-expanded', expanded);
    box.classList.add('is-revealed');
    syncInertState();
    window.dispatchEvent(new Event('scroll'));
  }

  boxes.forEach((box, idx) => {
    const trig = box.querySelector('.pillar-box__trigger');
    trig?.addEventListener('click', () => {
      if (!mobileDisclosureQuery.matches) return;
      const next = !box.classList.contains('is-expanded');
      setExpanded(idx, next);
    });
  });

  mobileDisclosureQuery.addEventListener('change', syncInertState);
  syncInertState();

  return {
    expandPillar(idx) {
      setExpanded(idx, true);
    },
  };
}

function initCareerAndCredentials() {
  const ledgerItems = Array.from(document.querySelectorAll('#career-ledger .ledger-item'));
  const expandAllBtn = document.getElementById('career-expand-all-btn');
  const roleCounterEl = document.getElementById('career-role-counter');

  function syncCareerState() {
    const isMobile = mobileDisclosureQuery.matches;
    let openCount = 0;
    ledgerItems.forEach((item) => {
      const expanded = item.classList.contains('is-expanded');
      if (expanded) openCount += 1;
      const trig = item.querySelector('.ledger-item__trigger');
      const collapse = item.querySelector('.ledger-item__collapse');
      trig?.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      if (collapse) {
        collapse.inert = isMobile && !expanded;
      }
    });

    const total = ledgerItems.length;
    const allOpen = total > 0 && openCount === total;
    if (roleCounterEl) {
      roleCounterEl.textContent = `${openCount}/${total} OPEN`;
    }
    if (expandAllBtn) {
      expandAllBtn.setAttribute('aria-expanded', allOpen ? 'true' : 'false');
      expandAllBtn.textContent = allOpen ? `COLLAPSE ROLES [${total}]` : `EXPAND ALL [${total}]`;
    }
  }

  ledgerItems.forEach((item) => {
    const trig = item.querySelector('.ledger-item__trigger');
    trig?.addEventListener('click', () => {
      if (!mobileDisclosureQuery.matches) return;
      item.classList.toggle('is-expanded');
      item.classList.add('is-revealed');
      syncCareerState();
      window.dispatchEvent(new Event('scroll'));
    });
  });

  expandAllBtn?.addEventListener('click', () => {
    const allOpen = ledgerItems.every((it) => it.classList.contains('is-expanded'));
    ledgerItems.forEach((it, idx) => {
      const shouldOpen = allOpen ? idx < 2 : true;
      it.classList.toggle('is-expanded', shouldOpen);
      it.classList.add('is-revealed');
    });
    syncCareerState();
    window.dispatchEvent(new Event('scroll'));
  });

  mobileDisclosureQuery.addEventListener('change', syncCareerState);
  syncCareerState();

  // Technical Arsenal 4-Tab Switcher
  const arsenalTablist = document.getElementById('arsenal-tablist');
  const arsenalPanels = Array.from(document.querySelectorAll('#arsenal-grid .arsenal-col'));
  const arsenalTabs = wireAriaTablist(arsenalTablist, arsenalPanels);

  // Credentials 3-Tab Switcher
  const credsTablist = document.getElementById('credentials-tablist');
  const credsPanels = Array.from(document.querySelectorAll('#credentials-stack .cred-box'));
  const credsTabs = wireAriaTablist(credsTablist, credsPanels);

  return {
    expandCareerRole(idx) {
      const item = ledgerItems[idx];
      if (!item) return;
      item.classList.add('is-expanded', 'is-revealed');
      syncCareerState();
      window.dispatchEvent(new Event('scroll'));
    },
    activateArsenalTab(idx) {
      arsenalTabs.activate(idx, false);
    },
    activateCredentialsTab(idx) {
      credsTabs.activate(idx, false);
    },
  };
}

function initScrollReveals() {
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return;

  const groups = [
    '#pillars-sheet .pillar-box',
    '#flagship-works-grid .work-card',
    '#arsenal-grid .arsenal-col',
    '#career-ledger .ledger-item',
    '#credentials-stack .endorsement-box',
    '#credentials-stack .cred-box',
    '#dispatch .nb-slab',
  ];

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('is-revealed');
        observer.unobserve(el);
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
  );

  groups.forEach((selector) => {
    const items = document.querySelectorAll(selector);
    items.forEach((el, idx) => {
      el.classList.add('mi-reveal');
      el.style.setProperty('--reveal-delay', `${Math.min(idx * 40, 160)}ms`);
      observer.observe(el);
    });
  });
}

function initHeroStickerInteractions(showToast) {
  const stage = document.getElementById('hero-portrait-stage');
  if (!stage) return;

  stage.querySelectorAll('[data-sticker-target]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetSel = btn.dataset.stickerTarget;
      const label = btn.dataset.stickerLabel;
      const targetEl = targetSel ? document.querySelector(targetSel) : null;
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }
      if (label && showToast) {
        showToast(`SECTION // ${label}`);
      }
    });
  });

  const floaters = [
    { el: document.getElementById('hero-tag-name'), factor: 4.5 },
    { el: document.getElementById('hero-sticker-xr'), factor: -5.5 },
    { el: document.getElementById('hero-sticker-engine'), factor: 5.0 },
    { el: document.getElementById('hero-sticker-dmx'), factor: -4.5 },
    { el: document.getElementById('hero-sticker-cube'), factor: 5.5 },
    { el: document.getElementById('hero-status-pill'), factor: -3.5 },
  ].filter((item) => item.el);

  let rafId = 0;
  stage.addEventListener('mousemove', (e) => {
    if (prefersReducedMotion() || !finePointerQuery.matches) return;
    if (rafId) cancelAnimationFrame(rafId);

    const rect = stage.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    rafId = requestAnimationFrame(() => {
      floaters.forEach(({ el, factor }) => {
        el.style.setProperty('--mx', `${(nx * factor).toFixed(2)}px`);
        el.style.setProperty('--my', `${(ny * factor).toFixed(2)}px`);
      });
    });
  });

  stage.addEventListener('mouseleave', () => {
    if (rafId) cancelAnimationFrame(rafId);
    floaters.forEach(({ el }) => {
      el.style.setProperty('--mx', '0px');
      el.style.setProperty('--my', '0px');
    });
  });
}

function initToastDismiss() {
  const toast = document.getElementById('nb-toast');
  if (!toast) return;
  toast.addEventListener('click', () => {
    toast.classList.remove('is-visible');
  });
}

export function initPortfolioMicroInteractions(showToast) {
  initScrollReveals();
  initWorksHorizontalRail();
  const { expandPillar } = initPillarsAccordion();
  const { expandCareerRole, activateArsenalTab, activateCredentialsTab } = initCareerAndCredentials();
  const { updateProgress } = initScrollProgressAndThumbDock();
  initHeroStickerInteractions(showToast);
  initToastDismiss();

  return {
    expandPillar,
    expandCareerRole,
    activateArsenalTab,
    activateCredentialsTab,
    updateProgress,
  };
}
