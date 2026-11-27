/* ==========================================================================
   MECHANICAL COMMAND PALETTE (Cmd+K / Ctrl+K) + MOBILE AUTO-REVEAL HANDOFF
   ========================================================================== */

import { PROFILE } from '../data/profile.js';
import { SKETCHFAB_MODELS } from '../data/models.js';
import { FLAGSHIP_WORKS } from '../data/projects.js';
import { openAnimatedDialog, closeAnimatedDialog, prefersReducedMotion } from './microInteractions.js';

export function initCommandPalette({
  sketchfabLab,
  toggleTheme,
  copyEmail,
  openBriefDrawer,
  disclosureApi,
}) {
  const backdrop = document.getElementById('cmdk-backdrop');
  const input = document.getElementById('cmdk-input');
  const resultsEl = document.getElementById('cmdk-results');
  const openBtns = document.querySelectorAll('[data-open-cmdk]');
  const closeBtn = document.getElementById('cmdk-close');

  if (!backdrop || !input || !resultsEl) return;

  function scrollBehavior() {
    return prefersReducedMotion() ? 'auto' : 'smooth';
  }

  const commands = [
    {
      title: 'Download Official CV (Sharif_Ul_Abedin_CV.pdf)',
      cat: 'CV DOC',
      keywords: 'pdf resume download curriculum vitae',
      run: () => {
        const a = document.createElement('a');
        a.href = PROFILE.cvPdfPath;
        a.download = 'Sharif_Ul_Abedin_CV.pdf';
        a.click();
      },
    },
    {
      title: 'Open Printable 2-Page A4 CV (/cv)',
      cat: 'PRINT A4',
      keywords: 'print a4 cv resume html paper',
      run: () => {
        window.open(PROFILE.cvPrintPath, '_blank', 'noopener');
      },
    },
    {
      title: 'Copy Email Address (sharifulabedin@live.com)',
      cat: 'CONTACT',
      keywords: 'email copy hire mail',
      run: () => copyEmail(),
    },
    {
      title: 'Jump to Availability & Project Brief (#dispatch)',
      cat: 'DISPATCH',
      keywords: 'freelance hire contact lead xr role project brief compose whatsapp',
      run: () => {
        openBriefDrawer?.(false);
        document.getElementById('dispatch')?.scrollIntoView({ behavior: scrollBehavior() });
      },
    },
    {
      title: 'Switch Paper / Dark Ink Theme',
      cat: 'THEME',
      keywords: 'dark light mode paper ink theme toggle',
      run: () => toggleTheme(),
    },
    ...SKETCHFAB_MODELS.map((m) => ({
      title: `Inspect Sketchfab 3D: ${m.title} (${m.faces} Tris)`,
      cat: 'SKETCHFAB',
      keywords: `${m.code} ${m.title} ${m.tags.join(' ')} ${m.category}`,
      run: () => sketchfabLab?.selectSketchfabByUid(m.uid),
    })),
    ...FLAGSHIP_WORKS.map((w) => ({
      title: `Open Flagship Work: ${w.title} (${w.org})`,
      cat: 'PROJECT',
      keywords: `${w.code} ${w.title} ${w.org} ${w.stack.join(' ')}`,
      run: () => {
        const card = document.getElementById(`work-${w.id}`);
        const grid = document.getElementById('flagship-works-grid');
        if (card && grid && grid.scrollWidth > grid.clientWidth + 4) {
          grid.scrollTo({
            left: Math.max(0, card.offsetLeft - grid.offsetLeft),
            behavior: scrollBehavior(),
          });
        }
        card?.scrollIntoView({ behavior: scrollBehavior(), block: 'nearest' });
      },
    })),
    ...PROFILE.arsenal.map((col, idx) => ({
      title: `Technical Arsenal: ${col.category} (${col.items[0]})`,
      cat: 'ARSENAL',
      keywords: `arsenal skills code engines dmx scan ${col.category} ${col.items.join(' ')}`,
      run: () => {
        disclosureApi?.activateArsenalTab(idx);
        document.getElementById('arsenal')?.scrollIntoView({ behavior: scrollBehavior() });
      },
    })),
    ...PROFILE.experience.map((job, idx) => ({
      title: `Career Role: ${job.role} — ${job.org}`,
      cat: 'CAREER',
      keywords: `career chronology timeline experience cv ${job.role} ${job.org} ${job.period} ${job.location}`,
      run: () => {
        disclosureApi?.expandCareerRole(idx);
        const item = document.querySelectorAll('#career-ledger .ledger-item')[idx];
        (item || document.getElementById('chronology'))?.scrollIntoView({
          behavior: scrollBehavior(),
          block: 'center',
        });
      },
    })),
    ...PROFILE.pillars.map((p, idx) => ({
      title: `Engineering Pillar ${p.id}: ${p.title}`,
      cat: 'PILLAR',
      keywords: `pillars architecture ${p.id} ${p.tag} ${p.title} ${p.stack}`,
      run: () => {
        disclosureApi?.expandPillar(idx);
        const box = document.querySelectorAll('#pillars .pillar-box')[idx];
        (box || document.getElementById('pillars'))?.scrollIntoView({
          behavior: scrollBehavior(),
          block: 'center',
        });
      },
    })),
    ...PROFILE.socials.map((s) => ({
      title: `Visit ${s.label} (${s.handle})`,
      cat: 'SOCIAL',
      keywords: `social ${s.label} ${s.handle}`,
      run: () => window.open(s.url, '_blank', 'noopener'),
    })),
  ];

  let filtered = commands;
  let activeIndex = 0;

  function renderList() {
    if (!filtered.length) {
      resultsEl.innerHTML = `<li class="cmdk-item"><span>No matching commands or 3D models.</span><span class="cmdk-item__cat">0 HITS</span></li>`;
      return;
    }

    resultsEl.innerHTML = filtered
      .map(
        (cmd, idx) => `
        <li class="cmdk-item ${idx === activeIndex ? 'is-selected' : ''}" data-cmd-idx="${idx}" role="option" aria-selected="${idx === activeIndex}">
          <span>${cmd.title}</span>
          <span class="cmdk-item__cat">${cmd.cat}</span>
        </li>
      `
      )
      .join('');

    const activeEl = resultsEl.querySelector('.cmdk-item.is-selected');
    activeEl?.scrollIntoView({ block: 'nearest' });
  }

  function filterCommands(q) {
    const term = q.trim().toLowerCase();
    filtered = !term
      ? commands
      : commands.filter((c) => `${c.title} ${c.cat} ${c.keywords}`.toLowerCase().includes(term));
    activeIndex = 0;
    renderList();
  }

  function openPalette() {
    input.value = '';
    filterCommands('');
    openAnimatedDialog(backdrop, input);
  }

  function closePalette() {
    closeAnimatedDialog(backdrop);
  }

  openBtns.forEach((btn) => btn.addEventListener('click', openPalette));
  closeBtn?.addEventListener('click', closePalette);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closePalette();
  });

  input.addEventListener('input', () => filterCommands(input.value));

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filtered.length) {
        activeIndex = (activeIndex + 1) % filtered.length;
        renderList();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filtered.length) {
        activeIndex = (activeIndex - 1 + filtered.length) % filtered.length;
        renderList();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filtered[activeIndex];
      if (target) {
        closePalette();
        target.run();
      }
    }
  });

  resultsEl.addEventListener('click', (e) => {
    const li = e.target.closest('[data-cmd-idx]');
    if (!li) return;
    const cmd = filtered[Number(li.dataset.cmdIdx)];
    if (cmd) {
      closePalette();
      cmd.run();
    }
  });

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (backdrop.hidden) openPalette();
      else closePalette();
    } else if (e.key === 'Escape' && !backdrop.hidden) {
      closePalette();
    }
  });
}
