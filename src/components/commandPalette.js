/* ==========================================================================
   MECHANICAL COMMAND PALETTE (Cmd+K / Ctrl+K)
   ========================================================================== */

import { PROFILE } from '../data/profile.js';
import { SKETCHFAB_MODELS } from '../data/models.js';
import { FLAGSHIP_WORKS } from '../data/projects.js';
import { openAnimatedDialog, closeAnimatedDialog } from './microInteractions.js';

export function initCommandPalette({ sketchfabLab, toggleTheme, copyEmail }) {
  const backdrop = document.getElementById('cmdk-backdrop');
  const input = document.getElementById('cmdk-input');
  const resultsEl = document.getElementById('cmdk-results');
  const openBtns = document.querySelectorAll('[data-open-cmdk]');
  const closeBtn = document.getElementById('cmdk-close');

  if (!backdrop || !input || !resultsEl) return;

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
      keywords: 'freelance hire contact lead xr role brief whatsapp',
      run: () => {
        document.getElementById('dispatch')?.scrollIntoView({ behavior: 'smooth' });
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
      keywords: `${w.title} ${w.org} ${w.stack.join(' ')}`,
      run: () => {
        const card = document.getElementById(`work-${w.id}`);
        card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
