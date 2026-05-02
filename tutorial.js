/**
 * @fileoverview Interactive tutorial/help overlay system.
 *
 * Renders a step-by-step guide with optional element spotlight.
 * On first visit the help button pulses to draw the user's attention.
 *
 * Depends on: nothing (standalone)
 */

'use strict';

/** @const {string} localStorage key – set after the user first opens the tutorial. */
const TUTORIAL_SEEN_KEY = 'pdu_tutorial_seen';

/**
 * @typedef {Object} TutorialStep
 * @property {string}      title  - Step heading.
 * @property {string}      body   - Step body HTML (strong tags allowed).
 * @property {string|null} target - CSS selector to spotlight, or null.
 */

/** @type {TutorialStep[]} */
const TUTORIAL_STEPS = [
  {
    title:  'Witaj w powtórce! 👋',
    body:   'To krótki przewodnik po aplikacji. Możesz go zamknąć w dowolnym momencie, klikając <strong>×</strong> lub <strong>Zakończ</strong>.',
    target: null,
  },
  {
    title:  'Wylosuj pytanie',
    body:   'Kliknij dowolną kartę, żeby wylosować pytanie maturalne. Karty wylosowane wcześniej są odwrócone i lekko wyszarzone – możesz w nie kliknąć, żeby wrócić do pytania.',
    target: '#cards-grid',
  },
  {
    title:  'Resetuj talię',
    body:   'Ten przycisk tasuje karty od nowa i resetuje historię wylosowanych pytań. Użyj go, gdy chcesz zacząć od początku.',
    target: '#btn-reset-deck',
  },
  {
    title:  'Przeciągaj karteczki',
    body:   'Złap karteczkę za <strong>zakreskowany pasek</strong> u góry i przeciągnij ją w dowolne miejsce. Najedź na puste pole – podświetli się na fioletowo – i puść, żeby zadokować karteczkę. Na urządzeniach dotykowych przeciąganie jest wyłączone.',
    target: null,
  },
  {
    title:  'Edytuj tytuły karteczek',
    body:   '<strong>Kliknij na tytuł karteczki</strong> (np. „teza"), żeby go zmienić. Dostosuj sekcje do struktury swojej wypowiedzi.',
    target: null,
  },
  {
    title:  'Dodawaj i usuwaj sekcje',
    body:   'Przycisk <strong>+ dodaj karteczkę</strong> dodaje nową sekcję w pierwszym wolnym miejscu. Przycisk <strong>×</strong> w prawym górnym rogu usuwa karteczkę i zostawia po niej puste pole.',
    target: null,
  },
  {
    title:  'Tryb „wypowiedź"',
    body:   'Przełącz na tryb <strong>wypowiedź</strong>, żeby pisać w jednym dużym polu tekstowym. Widać tam <strong>szacowany czas mówienia</strong>, liczbę słów i liczbę znaków.',
    target: null,
  },
  {
    title:  'Gotowe! 🎉',
    body:   'Notatki, tytuły karteczek i treść wypowiedzi są <strong>zapisywane automatycznie</strong> w przeglądarce per pytanie. Wróć do tego przewodnika w każdej chwili, klikając <strong>?</strong> w lewym dolnym rogu. Powodzenia!',
    target: null,
  },
];

// ── Module state ──────────────────────────────────────────────────────────────

/** @type {number} */
let currentStep = 0;

/** @type {HTMLElement|null} */
let overlayEl = null;

/** @type {HTMLElement|null} */
let spotlightEl = null;

// ── Spotlight ─────────────────────────────────────────────────────────────────

/**
 * Removes any existing spotlight element.
 */
function removeSpotlight() {
  if (spotlightEl) { spotlightEl.remove(); spotlightEl = null; }
}

/**
 * Creates a fixed spotlight frame around the given CSS selector.
 * Silently does nothing if the target is not in the DOM.
 *
 * @param {string|null} selector
 */
function showSpotlight(selector) {
  removeSpotlight();
  if (!selector) return;

  const target = document.querySelector(selector);
  if (!target) return;

  const pad = 10;
  const r   = target.getBoundingClientRect();

  spotlightEl = document.createElement('div');
  spotlightEl.className = 'tutorial-spotlight';
  Object.assign(spotlightEl.style, {
    left:   (r.left   - pad) + 'px',
    top:    (r.top    - pad) + 'px',
    width:  (r.width  + pad * 2) + 'px',
    height: (r.height + pad * 2) + 'px',
  });
  document.body.appendChild(spotlightEl);

  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ── Tutorial lifecycle ────────────────────────────────────────────────────────

/**
 * Closes and tears down the tutorial overlay.
 */
function closeTutorial() {
  if (overlayEl) { overlayEl.remove(); overlayEl = null; }
  removeSpotlight();
  document.removeEventListener('keydown', handleTutorialKey);
}

/**
 * Navigates to a specific step index.
 * Closes the tutorial if `index` is out of bounds.
 *
 * @param {number} index
 */
function goToStep(index) {
  if (!overlayEl) return;
  if (index < 0) return;
  if (index >= TUTORIAL_STEPS.length) { closeTutorial(); return; }

  currentStep = index;
  const step   = TUTORIAL_STEPS[index];
  const isLast = index === TUTORIAL_STEPS.length - 1;

  showSpotlight(step.target);

  overlayEl.querySelector('.tut-title').textContent   = step.title;
  overlayEl.querySelector('.tut-body').innerHTML      = step.body;
  overlayEl.querySelector('.tut-counter').textContent = `${index + 1} / ${TUTORIAL_STEPS.length}`;

  const prevBtn = /** @type {HTMLButtonElement} */ (overlayEl.querySelector('.tut-prev'));
  const nextBtn = /** @type {HTMLButtonElement} */ (overlayEl.querySelector('.tut-next'));

  prevBtn.disabled    = index === 0;
  nextBtn.textContent = isLast ? 'Zakończ' : 'Dalej →';
}

/**
 * Keyboard handler active while the tutorial is open.
 *
 * @param {KeyboardEvent} e
 */
function handleTutorialKey(e) {
  if (e.key === 'Escape')                           closeTutorial();
  if (e.key === 'ArrowRight' || e.key === 'Enter') goToStep(currentStep + 1);
  if (e.key === 'ArrowLeft')                        goToStep(currentStep - 1);
}

/**
 * Opens the tutorial overlay from step 0.
 */
function openTutorial() {
  if (overlayEl) closeTutorial();

  overlayEl = document.createElement('div');
  overlayEl.className = 'tutorial-overlay';
  overlayEl.innerHTML = `
    <div class="tutorial-card" role="dialog" aria-modal="true" aria-labelledby="tut-title-el">
      <button class="tut-close" type="button" aria-label="Zamknij tutorial">
        <i class="ti ti-x"></i>
      </button>
      <div class="tut-icon-wrap"><i class="ti ti-school"></i></div>
      <h2 class="tut-title" id="tut-title-el"></h2>
      <p  class="tut-body"></p>
      <div class="tut-footer">
        <span class="tut-counter"></span>
        <div class="tut-actions">
          <button class="tut-prev tut-btn" type="button">← Wstecz</button>
          <button class="tut-next tut-btn tut-btn--primary" type="button">Dalej →</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlayEl);

  overlayEl.querySelector('.tut-close').addEventListener('click', closeTutorial);
  overlayEl.querySelector('.tut-prev').addEventListener('click', () => goToStep(currentStep - 1));
  overlayEl.querySelector('.tut-next').addEventListener('click', () => goToStep(currentStep + 1));

  overlayEl.addEventListener('click', e => {
    if (e.target === overlayEl) closeTutorial();
  });

  document.addEventListener('keydown', handleTutorialKey);
  goToStep(0);
}

// ── Init ──────────────────────────────────────────────────────────────────────

/**
 * Wires up the help button and adds a pulse class on first visit.
 * Must be called after the DOM is ready.
 */
function initHelpButton() {
  const btn = document.getElementById('help-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    btn.classList.remove('pulse');
    localStorage.setItem(TUTORIAL_SEEN_KEY, '1');
    openTutorial();
  });

  if (!localStorage.getItem(TUTORIAL_SEEN_KEY)) {
    btn.classList.add('pulse');
  }
}