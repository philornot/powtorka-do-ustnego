/**
 * @fileoverview Application bootstrap: wires together card grid, phase
 * transitions, and the deck-reset control.
 *
 * Depends on: utils.js, cards.js, answer-phase.js, cookie-banner.js,
 *             questions.js
 */

'use strict';

// ── DOM refs ──────────────────────────────────────────────────────────────────

const phasePick    = /** @type {HTMLElement}       */ (document.getElementById('phase-pick'));
const phaseAnswer  = /** @type {HTMLElement}       */ (document.getElementById('phase-answer'));
const cardsGrid    = /** @type {HTMLElement}       */ (document.getElementById('cards-grid'));
const btnResetDeck = /** @type {HTMLButtonElement} */ (document.getElementById('btn-reset-deck'));

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
    phasePick.hidden   = true;
    phaseAnswer.hidden = false;
    renderAnswerPhase(phaseAnswer, question, resetToPick);
  }, 1050);
}

/**
 * Returns to the card-picking phase, preserving the revealed-question history
 * so previously drawn cards stay face-up.
 */
function resetToPick() {
  phaseAnswer.hidden = true;
  phasePick.hidden   = false;
  buildCardGrid(cardsGrid, onCardPick);
}

/**
 * Hard-resets the deck: clears all revealed history and rebuilds the grid
 * with fresh question assignments and all cards face-down.
 */
function resetDeck() {
  clearRevealedQuestions();
  buildCardGrid(cardsGrid, onCardPick);
}

// ── Event wiring ──────────────────────────────────────────────────────────────

btnResetDeck.addEventListener('click', resetDeck);

// ── Init ──────────────────────────────────────────────────────────────────────

initCookieBanner();
buildCardGrid(cardsGrid, onCardPick);