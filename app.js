/**
 * @fileoverview Application bootstrap: wires together card grid, phase
 * transitions, and the deck-reset control.
 *
 * Depends on: utils.js, cards.js, answer-phase.js, cookie-banner.js,
 *             tutorial.js, questions.js
 */

'use strict';

// ── DOM refs ──────────────────────────────────────────────────────────────────

const phasePick    = /** @type {HTMLElement}       */ (document.getElementById('phase-pick'));
const phaseAnswer  = /** @type {HTMLElement}       */ (document.getElementById('phase-answer'));
const cardsGrid    = /** @type {HTMLElement}       */ (document.getElementById('cards-grid'));
const btnResetDeck = /** @type {HTMLButtonElement} */ (document.getElementById('btn-reset-deck'));

// ── Application state ─────────────────────────────────────────────────────────

/**
 * The currently rendered deck (question array).
 * Preserved across "losuj jeszcze raz" so the card positions never change;
 * only cleared on an explicit "resetuj talię".
 *
 * @type {string[]|null}
 */
let currentDeck = null;

/**
 * Cleanup function returned by `renderAnswerPhase`.
 * Must be called before returning to the pick phase to remove any floating
 * note boxes from `document.body`.
 *
 * @type {(function(): void)|null}
 */
let currentAnswerCleanup = null;

// ── Phase transitions ─────────────────────────────────────────────────────────

/**
 * Handles a card pick: fades siblings, flips chosen card, then switches
 * to the answer phase after the flip animation completes.
 *
 * @param {HTMLElement} chosenWrap - The `.card-wrap` element that was clicked.
 * @param {string}      question   - The question revealed by the card.
 */
function onCardPick(chosenWrap, question) {
  document.querySelectorAll('.card-wrap').forEach(card => {
    if (card !== chosenWrap) card.classList.add('faded');
  });

  chosenWrap.classList.add('flipped');
  markQuestionRevealed(question);

  setTimeout(() => {
    phasePick.hidden  = true;
    phaseAnswer.hidden = false;
    currentAnswerCleanup = renderAnswerPhase(phaseAnswer, question, resetToPick);
  }, 1050);
}

/**
 * Returns to the card-picking phase, preserving the current deck and
 * revealed-question history so the layout stays identical.
 */
function resetToPick() {
  if (currentAnswerCleanup) {
    currentAnswerCleanup();
    currentAnswerCleanup = null;
  }
  phaseAnswer.hidden = true;
  phasePick.hidden   = false;
  // Pass currentDeck to reuse the same cards – layout and count unchanged.
  currentDeck = buildCardGrid(cardsGrid, onCardPick, currentDeck);
}

/**
 * Hard-resets the deck: clears all revealed history and rebuilds the grid
 * with a fresh random question assignment and a new card count.
 */
function resetDeck() {
  clearRevealedQuestions();
  currentDeck = null; // force a fresh shuffle in buildCardGrid
  currentDeck = buildCardGrid(cardsGrid, onCardPick);
}

// ── Event wiring ──────────────────────────────────────────────────────────────

btnResetDeck.addEventListener('click', resetDeck);

// ── Init ──────────────────────────────────────────────────────────────────────

initCookieBanner();
initHelpButton();
currentDeck = buildCardGrid(cardsGrid, onCardPick);