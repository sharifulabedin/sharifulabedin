/* ==========================================================================
   DIRECT CONTACT DISPATCH (1-Click Copy Email + Collapsible Brief Drawer)
   ========================================================================== */

import { PROFILE } from '../data/profile.js';
import { prefersReducedMotion } from './microInteractions.js';

const mobileBriefQuery = window.matchMedia('(max-width: 760px)');

export function initContactDispatch(showToast) {
  const copyBtns = document.querySelectorAll('[data-copy-email]');
  const form = document.getElementById('brief-dispatch-form');
  const whatsappBtn = document.getElementById('brief-whatsapp-btn');
  const nameInput = document.getElementById('brief-name');
  const orgInput = document.getElementById('brief-org');
  const messageInput = document.getElementById('brief-message');

  const briefToggle = document.getElementById('brief-drawer-toggle');
  const briefCollapse = document.getElementById('brief-drawer-collapse');

  let briefOpen = false;

  function isBriefDirty() {
    return Boolean(
      nameInput?.value.trim() ||
      orgInput?.value.trim() ||
      messageInput?.value.trim()
    );
  }

  function syncBriefDrawer() {
    if (!briefCollapse) return;
    briefCollapse.classList.toggle('is-expanded', briefOpen);
    briefToggle?.setAttribute('aria-expanded', briefOpen ? 'true' : 'false');
    briefCollapse.inert = mobileBriefQuery.matches && !briefOpen;
    window.dispatchEvent(new Event('scroll'));
  }

  function openBriefDrawer(focusFirstInput = false) {
    briefOpen = true;
    syncBriefDrawer();
    if (focusFirstInput && nameInput) {
      setTimeout(() => nameInput.focus({ preventScroll: true }), 60);
    }
  }

  briefToggle?.addEventListener('click', () => {
    if (briefOpen && isBriefDirty()) {
      showToast?.('BRIEF LOCKED OPEN // CLEAR DRAFT FIELDS TO COLLAPSE');
      return;
    }
    briefOpen = !briefOpen;
    syncBriefDrawer();
  });

  mobileBriefQuery.addEventListener('change', syncBriefDrawer);
  syncBriefDrawer();

  // Auto-open brief drawer when clicking HIRE in dock or Hero availability status pill
  const heroStatusPill = document.getElementById('hero-status-pill');
  heroStatusPill?.addEventListener('click', () => {
    openBriefDrawer(false);
  });

  document.querySelectorAll('[data-open-brief]').forEach((el) => {
    el.addEventListener('click', () => {
      openBriefDrawer(false);
      document
        .getElementById('dispatch')
        ?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    });
  });

  function flashCopyButtonSuccess(btn) {
    if (!btn) return;
    const origText = btn.dataset.origLabel || btn.textContent;
    btn.dataset.origLabel = origText;
    btn.textContent = '✓ COPIED';
    btn.classList.add('is-success');
    clearTimeout(btn._copyTimer);
    btn._copyTimer = setTimeout(() => {
      btn.classList.remove('is-success');
      btn.textContent = origText;
    }, 1800);
  }

  async function copyEmail(e) {
    const triggerBtn =
      e?.currentTarget instanceof HTMLElement
        ? e.currentTarget
        : document.getElementById('copy-email-btn');
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      flashCopyButtonSuccess(triggerBtn);
      showToast?.(`COPIED TO CLIPBOARD // ${PROFILE.email}`);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = PROFILE.email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      flashCopyButtonSuccess(triggerBtn);
      showToast?.(`COPIED // ${PROFILE.email}`);
    }
  }

  copyBtns.forEach((btn) => {
    btn.addEventListener('click', copyEmail);
  });

  // Non-intrusive blur validation (validate on blur, clear immediately when corrected)
  function validateField(inputEl, errEl, message) {
    if (!inputEl) return true;
    const valid = inputEl.value.trim().length > 0;
    if (valid) {
      inputEl.classList.remove('is-invalid');
      inputEl.classList.add('is-valid');
      inputEl.removeAttribute('aria-invalid');
      if (errEl) {
        errEl.classList.remove('is-visible');
        errEl.textContent = '';
      }
      return true;
    }

    inputEl.classList.remove('is-valid', 'is-invalid');
    void inputEl.offsetWidth;
    inputEl.classList.add('is-invalid');
    inputEl.setAttribute('aria-invalid', 'true');
    if (errEl) {
      errEl.textContent = message;
      errEl.classList.add('is-visible');
    }
    return false;
  }

  [
    { input: nameInput, err: document.getElementById('brief-name-err'), msg: 'REQUIRED // PLEASE ENTER YOUR NAME' },
    { input: messageInput, err: document.getElementById('brief-message-err'), msg: 'REQUIRED // ADD PROJECT OR ROLE DETAILS' },
  ].forEach(({ input, err, msg }) => {
    if (!input) return;
    let touched = false;
    input.addEventListener('blur', () => {
      if (!touched && input.value.length === 0) return;
      touched = true;
      validateField(input, err, msg);
    });
    input.addEventListener('input', () => {
      touched = true;
      if (input.value.trim().length > 0) {
        validateField(input, err, msg);
      }
    });
  });

  function readBriefFields() {
    const name = nameInput?.value.trim() || '';
    const org = orgInput?.value.trim() || '';
    const scope = document.getElementById('brief-scope')?.value || 'Senior XR / Technical Artist Engagement';
    const message = messageInput?.value.trim() || '';
    return { name, org, scope, message };
  }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    openBriefDrawer(false);
    const okName = validateField(
      nameInput,
      document.getElementById('brief-name-err'),
      'REQUIRED // PLEASE ENTER YOUR NAME'
    );
    const okMsg = validateField(
      messageInput,
      document.getElementById('brief-message-err'),
      'REQUIRED // ADD PROJECT OR ROLE DETAILS'
    );
    if (!okName || !okMsg) {
      const firstInvalid = !okName ? nameInput : messageInput;
      firstInvalid?.focus();
      return;
    }

    const { name, org, scope, message } = readBriefFields();
    const senderLine = org ? `${name} (${org})` : name;
    const subject = encodeURIComponent(`[Portfolio Inquiry] ${scope} — ${senderLine}`);
    const body = encodeURIComponent(
      `Hi Sharif,\n\nName: ${name}\nOrganization: ${org || 'N/A'}\nEngagement Scope: ${scope}\n\nProject / Role Brief:\n${message}\n`
    );
    window.location.href = `mailto:${PROFILE.email}?subject=${subject}&body=${body}`;
    showToast?.('OPENING MAIL CLIENT WITH FORMATTED BRIEF...');
  });

  whatsappBtn?.addEventListener('click', () => {
    const { name, org, scope, message } = readBriefFields();
    if (!name && !message) {
      window.open(PROFILE.whatsappUrl, '_blank', 'noopener');
      return;
    }
    const text = encodeURIComponent(
      `Hi Sharif! I'm ${name || 'reaching out'}${org ? ` from ${org}` : ''} regarding ${scope}.\n\n${message}`
    );
    window.open(`${PROFILE.whatsappUrl}?text=${text}`, '_blank', 'noopener');
  });

  return { copyEmail, openBriefDrawer };
}
