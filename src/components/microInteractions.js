/* ==========================================================================
   PORTFOLIO MICRO-INTERACTIONS ARCHITECT MODULE
   - Compositor-only GPU scroll progress bar (scaleX)
   - Active section navigation spy (IntersectionObserver)
   - Fire-once staggered scroll-triggered reveals (IntersectionObserver)
   - Hero portrait sticker magnetic micro-parallax & domain jump triggers
   - Animated modal open/close lifecycle with focus trap & trigger focus restore
   ========================================================================== */

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

export function prefersReducedMotion() {
  return reducedMotionQuery.matches;
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
    ).filter((el) => !el.hasAttribute('hidden'));
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

function initScrollReveals() {
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return;

  const groups = [
    '#pillars-sheet .pillar-box',
    '#flagship-works-grid .work-card',
    '#arsenal-grid .arsenal-col',
    '#career-ledger .ledger-item',
    '#credentials-stack > *',
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
    { threshold: 0.12, rootMargin: '0px 0px -32px 0px' }
  );

  groups.forEach((selector) => {
    const items = document.querySelectorAll(selector);
    items.forEach((el, idx) => {
      el.classList.add('mi-reveal');
      el.style.setProperty('--reveal-delay', `${Math.min(idx * 45, 180)}ms`);
      observer.observe(el);
    });
  });
}

function initHeroStickerInteractions(showToast) {
  const stage = document.getElementById('hero-portrait-stage');
  if (!stage) return;

  // 1. Click / keyboard jump-to-section triggers on the 4 domain stickers
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

  // 2. Subtle desktop-only magnetic micro-parallax on floating badges (±3.5px GPU translate3d)
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
  initHeroStickerInteractions(showToast);
  initToastDismiss();
}
