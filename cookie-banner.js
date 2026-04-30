/**
 * @fileoverview GDPR/UODO compliance notice.
 *
 * The app uses localStorage to store:
 *   – history of drawn questions (revealed cards)
 *   – per-question note content
 *
 * This is a functional/necessary use (no tracking, no third parties).
 * The banner is shown once; dismissal is persisted in localStorage.
 */

'use strict';

/** @const {string} Flag key stored after the user dismisses the notice. */
const CONSENT_KEY = 'pdu_storage_notice_dismissed';

/**
 * Injects and shows the storage-use notice if the user hasn't dismissed it yet.
 * Must be called after the DOM is ready.
 */
function initCookieBanner() {
  if (localStorage.getItem(CONSENT_KEY)) return;

  const banner = /** @type {HTMLElement} */ (document.getElementById('cookie-banner'));
  if (!banner) return;

  banner.innerHTML = `
    <p>Ta strona przechowuje Twoje notatki i historię wylosowanych pytań
    lokalnie w przeglądarce. Dane <strong>nie opuszczają urządzenia</strong>.</p>
    <button id="cookie-accept" type="button">
      <i class="ti ti-check"></i> rozumiem
    </button>
  `;
  banner.hidden = false;

  /** @type {HTMLButtonElement} */ (document.getElementById('cookie-accept'))
    .addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, '1');
      banner.hidden = true;
    });
}