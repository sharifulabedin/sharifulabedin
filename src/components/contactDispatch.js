/* ==========================================================================
   DIRECT CONTACT DISPATCH (1-Click Copy Email + Real Mailto/WhatsApp Brief)
   ========================================================================== */

import { PROFILE } from '../data/profile.js';

export function initContactDispatch(showToast) {
  const copyBtns = document.querySelectorAll('[data-copy-email]');
  const form = document.getElementById('brief-dispatch-form');
  const whatsappBtn = document.getElementById('brief-whatsapp-btn');

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      showToast(`COPIED TO CLIPBOARD // ${PROFILE.email}`);
    } catch {
      // Fallback textarea copy
      const ta = document.createElement('textarea');
      ta.value = PROFILE.email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      showToast(`COPIED // ${PROFILE.email}`);
    }
  }

  copyBtns.forEach((btn) => {
    btn.addEventListener('click', copyEmail);
  });

  function readBriefFields() {
    const name = document.getElementById('brief-name')?.value.trim() || '';
    const org = document.getElementById('brief-org')?.value.trim() || '';
    const scope = document.getElementById('brief-scope')?.value || 'Senior XR / Technical Artist Engagement';
    const message = document.getElementById('brief-message')?.value.trim() || '';
    return { name, org, scope, message };
  }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
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
