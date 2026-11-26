/* ==========================================================================
   DIRECT CONTACT DISPATCH (1-Click Copy Email + Real Mailto/WhatsApp Brief)
   ========================================================================== */

import { PROFILE } from '../data/profile.js';

export function initContactDispatch(showToast) {
  const copyBtns = document.querySelectorAll('[data-copy-email]');
  const form = document.getElementById('brief-dispatch-form');
  const whatsappBtn = document.getElementById('brief-whatsapp-btn');
  const nameInput = document.getElementById('brief-name');
  const messageInput = document.getElementById('brief-message');

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
    const triggerBtn = e?.currentTarget instanceof HTMLElement ? e.currentTarget : document.getElementById('copy-email-btn');
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      flashCopyButtonSuccess(triggerBtn);
      showToast(`COPIED TO CLIPBOARD // ${PROFILE.email}`);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = PROFILE.email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      flashCopyButtonSuccess(triggerBtn);
      showToast(`COPIED // ${PROFILE.email}`);
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

    // Re-trigger shake animation cleanly if already invalid
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
      if (!touched && !input.value.trim()) return;
      touched = true;
      validateField(input, err, msg);
    });
    input.addEventListener('input', () => {
      touched = true;
      if (input.classList.contains('is-invalid') && input.value.trim().length > 0) {
        validateField(input, err, msg);
      }
    });
  });

  function readBriefFields() {
    const name = nameInput?.value.trim() || '';
    const org = document.getElementById('brief-org')?.value.trim() || '';
    const scope = document.getElementById('brief-scope')?.value || 'Senior XR / Technical Artist Engagement';
    const message = messageInput?.value.trim() || '';
    return { name, org, scope, message };
  }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const okName = validateField(nameInput, document.getElementById('brief-name-err'), 'REQUIRED // PLEASE ENTER YOUR NAME');
    const okMsg = validateField(messageInput, document.getElementById('brief-message-err'), 'REQUIRED // ADD PROJECT OR ROLE DETAILS');
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
    showToast('OPENING MAIL CLIENT WITH FORMATTED BRIEF...');
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

  return { copyEmail };
}
