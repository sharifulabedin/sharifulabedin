/* ==========================================================================
   MAIN APPLICATION ENTRY — SHARIF UL ABEDIN NEO-BRUTALIST PORTFOLIO
   ========================================================================== */

import { PROFILE } from './data/profile.js';
import { FLAGSHIP_WORKS } from './data/projects.js';
import { initSketchfabLab } from './components/sketchfabLab.js';
import { initContactDispatch } from './components/contactDispatch.js';
import { initCommandPalette } from './components/commandPalette.js';
import { initPortfolioMicroInteractions } from './components/microInteractions.js';

function showToast(message) {
  const toast = document.getElementById('nb-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2600);
}

function initThemeRocker() {
  const root = document.documentElement;
  const saved = localStorage.getItem('sua_theme') || 'paper';
  applyTheme(saved);

  function applyTheme(mode) {
    const clean = mode === 'ink' ? 'ink' : 'paper';
    const nextLabel = clean === 'ink' ? 'PAPER' : 'INK';
    root.setAttribute('data-theme', clean);
    localStorage.setItem('sua_theme', clean);

    document.querySelectorAll('[data-theme-label]').forEach((el) => {
      el.textContent = nextLabel;
    });

    document.querySelectorAll('[data-toggle-theme]').forEach((btn) => {
      btn.setAttribute(
        'aria-label',
        clean === 'ink' ? 'Switch to Paper light theme' : 'Switch to Dark Ink theme'
      );
    });
  }

  function toggleTheme() {
    const next = root.getAttribute('data-theme') === 'ink' ? 'paper' : 'ink';
    applyTheme(next);
    showToast(`SURFACE MODE // ${next === 'ink' ? 'DARK INK CONSOLE' : 'ARCHIVAL BONE PAPER'}`);
  }

  document.querySelectorAll('[data-toggle-theme]').forEach((btn) => {
    btn.addEventListener('click', toggleTheme);
  });

  return { toggleTheme };
}

function renderDynamicSections(sketchfabLabRef) {
  // 1. Telemetry Matrix
  const telemetryEl = document.getElementById('hero-telemetry-matrix');
  if (telemetryEl) {
    telemetryEl.innerHTML = PROFILE.telemetry
      .map(
        (t) => `
        <div class="telemetry-cell">
          <div class="telemetry-cell__val">${t.value}</div>
          <div class="telemetry-cell__lbl">${t.label}</div>
        </div>
      `
      )
      .join('');
  }

  // 2. Engineering Pillars (Desktop 2x2 Bento, Mobile Tactile Accordion with P.01 Open)
  const pillarsEl = document.getElementById('pillars-sheet');
  if (pillarsEl) {
    pillarsEl.innerHTML = PROFILE.pillars
      .map(
        (p, idx) => `
        <article class="pillar-box ${idx === 0 ? 'is-expanded' : ''}">
          <h3 class="pillar-box__heading">
            <button
              type="button"
              class="pillar-box__trigger"
              aria-expanded="${idx === 0 ? 'true' : 'false'}"
              aria-controls="pillar-panel-${idx}"
            >
              <span class="pillar-box__trigger-main">
                <span class="pillar-box__top">
                  <span class="pillar-box__idx">${p.id}</span>
                  <span class="spec-tag">${p.tag}</span>
                </span>
                <span class="pillar-box__title">${p.title}</span>
              </span>
              <span class="pillar-box__chevron" aria-hidden="true">▾</span>
            </button>
          </h3>
          <div class="pillar-box__collapse" id="pillar-panel-${idx}">
            <div class="pillar-box__collapse-inner">
              <p class="pillar-box__body">${p.body}</p>
              <div class="pillar-box__stack">${p.stack}</div>
            </div>
          </div>
        </article>
      `
      )
      .join('');
  }

  // 3. Flagship Works
  const worksEl = document.getElementById('flagship-works-grid');
  if (worksEl) {
    worksEl.innerHTML = FLAGSHIP_WORKS.map(
      (w) => `
        <article class="work-card nb-slab--interactive" id="work-${w.id}">
          <div class="work-card__plate">
            <img src="${w.image}" alt="${w.imageAlt}" loading="lazy" decoding="async" />
            <div class="work-card__stamps">
              <span class="spec-tag" style="background:#0D0D0D;color:#F4F0EA;border-color:#F4F0EA;">${w.code}</span>
              <span class="spec-tag ${w.badgeVariant}">${w.badge}</span>
            </div>
          </div>
          <div class="work-card__content">
            <div>
              <div class="work-card__org">${w.org}</div>
              <h3 class="work-card__title">${w.title}</h3>
              <div class="work-card__subtitle">${w.subtitle}</div>
              <p class="work-card__desc">${w.description}</p>
              <div class="work-card__stack">
                ${w.stack.map((s) => `<span class="spec-tag">${s}</span>`).join('')}
              </div>
            </div>
            <div class="work-card__foot">
              <a
                href="${w.primaryUrl}"
                target="_blank"
                rel="noopener"
                class="nb-btn nb-btn--sm nb-btn--primary"
                id="work-link-${w.id}"
              >${w.primaryLabel}</a>
              ${
                w.youtubeEmbedId
                  ? `<button type="button" class="nb-btn nb-btn--sm nb-btn--yellow" data-play-showreel="${w.youtubeEmbedId}" id="play-showreel-btn">PLAY INLINE ▶</button>`
                  : ''
              }
            </div>
          </div>
        </article>
      `
    ).join('');

    worksEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-play-showreel]');
      if (!btn) return;
      sketchfabLabRef.current?.openYoutubeShowreel(btn.dataset.playShowreel);
    });
  }

  // 4. Technical Arsenal (4-Column Desktop Grid / 4-Tab Mobile Switcher)
  const arsenalEl = document.getElementById('arsenal-grid');
  if (arsenalEl) {
    arsenalEl.innerHTML = PROFILE.arsenal
      .map(
        (col, idx) => `
        <div
          class="arsenal-col ${idx === 0 ? 'is-active-panel' : ''}"
          id="arsenal-panel-${idx}"
          role="tabpanel"
          aria-labelledby="arsenal-tab-${idx}"
        >
          <h3 class="arsenal-col__head">${col.category}</h3>
          <ul class="arsenal-list">
            ${col.items
              .map((item) => `<li><span class="arsenal-bullet"></span><span>${item}</span></li>`)
              .join('')}
          </ul>
        </div>
      `
      )
      .join('');
  }

  // 5. Career Chronology Ledger (Recent 2 Open on Mobile, Earlier 4 Tap-to-Expand)
  const ledgerEl = document.getElementById('career-ledger');
  if (ledgerEl) {
    ledgerEl.innerHTML = PROFILE.experience
      .map(
        (job, idx) => `
        <article class="ledger-item ${idx < 2 ? 'is-expanded' : ''}">
          <div class="ledger-item__heading">
            <button
              type="button"
              class="ledger-item__trigger"
              aria-expanded="${idx < 2 ? 'true' : 'false'}"
              aria-controls="career-panel-${idx}"
            >
              <span class="ledger-item__trigger-main">
                <span class="ledger-item__top">
                  <h3 class="ledger-item__role">${job.role}</h3>
                  <span class="ledger-item__period">${job.period}</span>
                </span>
                <span class="ledger-item__org">${job.org} // ${job.location}</span>
              </span>
              <span class="ledger-item__chevron" aria-hidden="true">▾</span>
            </button>
          </div>
          <div class="ledger-item__collapse" id="career-panel-${idx}">
            <div class="ledger-item__collapse-inner">
              <ul class="ledger-item__bullets">
                ${job.bullets.map((b) => `<li>${b}</li>`).join('')}
              </ul>
            </div>
          </div>
        </article>
      `
      )
      .join('');
  }

  // 6. Endorsement + 3-Tab Credentials Switcher (ACADEMIC · CERTS · REFEREES)
  const credsEl = document.getElementById('credentials-stack');
  if (credsEl) {
    const e = PROFILE.endorsement;
    credsEl.innerHTML = `
      <aside class="endorsement-box">
        <span class="spec-tag" style="background:#0D0D0D;color:#E5FF00;border-color:#0D0D0D;">EXECUTIVE ENDORSEMENT</span>
        <blockquote class="endorsement-box__quote">“${e.quote}”</blockquote>
        <div class="endorsement-box__author">
          <strong>${e.author}</strong><br/>
          ${e.title}<br/>
          <span>${e.sub}</span>
        </div>
      </aside>

      <div class="mobile-tablist mobile-tablist--3" id="credentials-tablist" role="tablist" aria-label="Verified Credentials">
        <button type="button" class="mobile-tab is-active" role="tab" id="cred-tab-0" aria-selected="true" aria-controls="cred-panel-0" tabindex="0">ACADEMIC</button>
        <button type="button" class="mobile-tab" role="tab" id="cred-tab-1" aria-selected="false" aria-controls="cred-panel-1" tabindex="-1">CERTS</button>
        <button type="button" class="mobile-tab" role="tab" id="cred-tab-2" aria-selected="false" aria-controls="cred-panel-2" tabindex="-1">REFEREES</button>
      </div>

      <div class="cred-box is-active-panel" id="cred-panel-0" role="tabpanel" aria-labelledby="cred-tab-0">
        <h3 class="cred-box__head">ACADEMIC FOUNDATION</h3>
        ${PROFILE.education
          .map(
            (ed) => `
            <div class="cred-entry">
              <div class="cred-entry__title">${ed.degree}</div>
              <div class="cred-entry__meta">${ed.school} • ${ed.meta}</div>
            </div>
          `
          )
          .join('')}
      </div>

      <div class="cred-box" id="cred-panel-1" role="tabpanel" aria-labelledby="cred-tab-1">
        <h3 class="cred-box__head">CERTIFICATIONS &amp; LEADERSHIP</h3>
        ${PROFILE.certifications
          .map(
            (c) => `
            <div class="cred-entry">
              <div class="cred-entry__title">${c.title}</div>
              <div class="cred-entry__meta">${c.issuer} • ${c.code}</div>
            </div>
          `
          )
          .join('')}
        <div class="cred-entry">
          <div class="cred-entry__title">Academic &amp; Industry Leadership</div>
          <div class="cred-entry__meta">${PROFILE.leadership.join('<br/>')}</div>
        </div>
      </div>

      <div class="cred-box" id="cred-panel-2" role="tabpanel" aria-labelledby="cred-tab-2">
        <h3 class="cred-box__head">VERIFIED REFEREES</h3>
        ${PROFILE.references
          .map(
            (r) => `
            <div class="cred-entry">
              <div class="cred-entry__title">${r.name}</div>
              <div class="cred-entry__meta">${r.role} • ${r.org}</div>
            </div>
          `
          )
          .join('')}
      </div>
    `;
  }

  // 7. Social Matrix
  const socialsEl = document.getElementById('social-matrix');
  if (socialsEl) {
    socialsEl.innerHTML = PROFILE.socials
      .map(
        (s) => `
        <a href="${s.url}" target="_blank" rel="noopener" class="social-tile" id="social-${s.label.toLowerCase().replace(/\s+/g, '-')}">
          <span>${s.label}</span>
          <span class="nb-circle-icon" style="width:28px;height:28px;font-size:0.78rem;">↗</span>
        </a>
      `
      )
      .join('');
  }
}

function initMobileDrawer() {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  if (!toggleBtn || !drawer) return;

  function setDrawerOpen(open) {
    drawer.classList.toggle('is-open', open);
    drawer.inert = !open;
    toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  setDrawerOpen(false);

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const next = !drawer.classList.contains('is-open');
    setDrawerOpen(next);
  });

  drawer.querySelectorAll('a, button').forEach((el) => {
    el.addEventListener('click', () => {
      setDrawerOpen(false);
    });
  });

  document.addEventListener('click', (e) => {
    if (!drawer.classList.contains('is-open')) return;
    if (!drawer.contains(e.target) && e.target !== toggleBtn && !toggleBtn.contains(e.target)) {
      setDrawerOpen(false);
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      setDrawerOpen(false);
      toggleBtn.focus({ preventScroll: true });
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && drawer.classList.contains('is-open')) {
      setDrawerOpen(false);
    }
  });
}

function initHeroPortrait() {
  const namePillEl = document.getElementById('hero-name-pill-text');
  if (namePillEl && PROFILE.shortName) {
    namePillEl.textContent = PROFILE.shortName;
  }

  const photoEl = document.getElementById('hero-portrait-photo');
  if (photoEl && PROFILE.portraitUrl && photoEl.getAttribute('href') !== PROFILE.portraitUrl) {
    photoEl.setAttribute('href', PROFILE.portraitUrl);
  }
}

function bootPortfolio() {
  const sketchfabLabRef = { current: null };

  const { toggleTheme } = initThemeRocker();
  renderDynamicSections(sketchfabLabRef);
  initMobileDrawer();
  initHeroPortrait();

  const sketchfabLab = initSketchfabLab();
  sketchfabLabRef.current = sketchfabLab;

  const { copyEmail, openBriefDrawer } = initContactDispatch(showToast);
  const disclosureApi = initPortfolioMicroInteractions(showToast);
  initCommandPalette({
    sketchfabLab,
    toggleTheme,
    copyEmail,
    openBriefDrawer,
    disclosureApi,
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootPortfolio, { once: true });
} else {
  bootPortfolio();
}
