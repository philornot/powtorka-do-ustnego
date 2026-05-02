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
 *
 * @type {string[]|null}
 */
let currentDeck = null;

/**
 * Cleanup function returned by `renderAnswerPhase`.
 *
 * @type {(function(): void)|null}
 */
let currentAnswerCleanup = null;

// ── Phase transitions ─────────────────────────────────────────────────────────

/**
 * Handles a card pick. Pre-revealed cards skip the flip animation.
 *
 * @param {HTMLElement} chosenWrap - The `.card-wrap` element that was clicked.
 * @param {string}      question   - The question revealed by the card.
 */
function onCardPick(chosenWrap, question) {
  document.querySelectorAll('.card-wrap').forEach(card => {
    if (card !== chosenWrap) card.classList.add('faded');
  });

  const isPreRevealed = chosenWrap.classList.contains('pre-revealed');

  if (!isPreRevealed) {
    chosenWrap.classList.add('flipped');
    markQuestionRevealed(question);
  }

  const delay = isPreRevealed ? 0 : 1050;

  setTimeout(() => {
    phasePick.hidden   = true;
    phaseAnswer.hidden = false;
    currentAnswerCleanup = renderAnswerPhase(phaseAnswer, question, resetToPick);
  }, delay);
}

/**
 * Returns to the card-picking phase, preserving the current deck.
 */
function resetToPick() {
  if (currentAnswerCleanup) {
    currentAnswerCleanup();
    currentAnswerCleanup = null;
  }
  phaseAnswer.hidden = true;
  phasePick.hidden   = false;
  currentDeck = buildCardGrid(cardsGrid, onCardPick, currentDeck);
}

/**
 * Hard-resets the deck: clears all revealed history and rebuilds with a
 * fresh random question assignment and a new card count.
 */
function resetDeck() {
  clearRevealedQuestions();
  currentDeck = null;
  currentDeck = buildCardGrid(cardsGrid, onCardPick);
}

// ── Event wiring ──────────────────────────────────────────────────────────────

btnResetDeck.addEventListener('click', resetDeck);

// ── Init ──────────────────────────────────────────────────────────────────────

initCookieBanner();
initHelpButton();
currentDeck = buildCardGrid(cardsGrid, onCardPick);