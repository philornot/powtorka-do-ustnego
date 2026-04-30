/**
 * @fileoverview Application logic for "Powtórka do ustnego".
 *
 * Renders a grid of face-down colored cards. The user picks one;
 * the rest fade out and the chosen card flips to reveal a randomly
 * assigned exam question. The user then types their answer below.
 *
 * Depends on: QUESTIONS (questions.js)
 */

'use strict';

/** @type {string[]} Card background colors, cycled by card index. */
const CARD_COLORS = [
  '#4f46e5', // indigo
  '#0891b2', // cyan
  '#059669', // emerald
  '#e11d48', // rose
  '#7c3aed', // violet
  '#d97706', // amber
  '#0f766e', // teal
  '#9333ea', // purple
];

// ── DOM refs ────────────────────────────────────────────────────────────────

const phasePick    = /** @type {HTMLElement} */ (document.getElementById('phase-pick'));
const phaseAnswer  = /** @type {HTMLElement} */ (document.getElementById('phase-answer'));
const cardsGrid    = /** @type {HTMLElement} */ (document.getElementById('cards-grid'));
const revealedQ    = /** @type {HTMLElement} */ (document.getElementById('revealed-question'));
const answerBox    = /** @type {HTMLTextAreaElement} */ (document.getElementById('answer-box'));
const charCount    = /** @type {HTMLElement} */ (document.getElementById('char-count'));
const btnReset     = /** @type {HTMLButtonElement} */ (document.getElementById('btn-reset'));

// ── Utilities ────────────────────────────────────────────────────────────────

/**
 * Returns a random integer in [min, max] inclusive.
 *
 * @param {number} min - Lower bound.
 * @param {number} max - Upper bound.
 * @returns {number}
 */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffles an array in-place using the Fisher-Yates algorithm.
 *
 * @template T
 * @param {T[]} arr - The array to shuffle.
 * @returns {T[]} The same array, shuffled.
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Escapes HTML special characters so text can safely be injected via innerHTML.
 *
 * @param {string} text - Raw string to escape.
 * @returns {string} HTML-safe string.
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Formats a character count as a Polish noun phrase
 * (handles singular / 2–4 / 5+ plural forms).
 *
 * @param {number} n - Number of characters.
 * @returns {string} e.g. "1 znak", "3 znaki", "15 znaków"
 */
function formatCharCount(n) {
  if (n === 1) return '1 znak';
  if (n >= 2 && n <= 4) return `${n} znaki`;
  return `${n} znaków`;
}

// ── Card creation ────────────────────────────────────────────────────────────

/**
 * Creates a single card DOM element, sets its color and rotation,
 * and attaches the click handler.
 *
 * @param {number} index      - Card index in the grid (0-based).
 * @param {string} question   - Exam question assigned to this card.
 * @returns {HTMLElement}     The `.card-wrap` element, ready to append.
 */
function createCard(index, question) {
  const color = CARD_COLORS[index % CARD_COLORS.length];
  const rot   = (Math.random() * 14 - 7).toFixed(2); // –7° … +7°
  const label = String(index + 1).padStart(2, '0');

  const wrap = document.createElement('div');
  wrap.className = 'card-wrap';
  wrap.style.setProperty('--rot',        `${rot}deg`);
  wrap.style.setProperty('--card-color', color);

  wrap.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-back">
        <span class="card-star">★</span>
        <span class="card-num">${label}</span>
      </div>
      <div class="card-face card-front">
        <p class="q-preview">${escapeHtml(question)}</p>
      </div>
    </div>
  `;

  wrap.addEventListener('click', () => onCardClick(wrap, question), { once: true });
  return wrap;
}

// ── Phase transitions ────────────────────────────────────────────────────────

/**
 * Builds a fresh card grid with a random card count (20–30).
 * Clears any previous grid contents first.
 */
function buildCardGrid() {
  cardsGrid.innerHTML = '';

  const count = randInt(20, 30);
  const pool  = shuffle([...QUESTIONS]);

  for (let i = 0; i < count; i++) {
    const question = pool[i % pool.length];
    cardsGrid.appendChild(createCard(i, question));
  }
}

/**
 * Handles a card click: fades all other cards, flips the chosen one,
 * then transitions to the answer phase after the animation completes.
 *
 * @param {HTMLElement} chosenWrap - The clicked `.card-wrap` element.
 * @param {string}      question   - The question revealed by this card.
 */
function onCardClick(chosenWrap, question) {
  document.querySelectorAll('.card-wrap').forEach(card => {
    if (card !== chosenWrap) card.classList.add('faded');
  });

  chosenWrap.classList.add('flipped');

  setTimeout(() => showAnswerPhase(question), 1050);
}

/**
 * Switches the UI to the answer phase, showing the question and
 * resetting the textarea.
 *
 * @param {string} question - The exam question to display.
 */
function showAnswerPhase(question) {
  phasePick.hidden  = true;
  phaseAnswer.hidden = false;

  revealedQ.textContent = question;
  answerBox.value       = '';
  charCount.textContent = formatCharCount(0);

  answerBox.focus();
}

/**
 * Resets the app back to the card-picking phase with a new random grid.
 */
function resetToPick() {
  phaseAnswer.hidden = true;
  phasePick.hidden   = false;
  buildCardGrid();
}

// ── Event listeners ──────────────────────────────────────────────────────────

btnReset.addEventListener('click', resetToPick);

answerBox.addEventListener('input', () => {
  charCount.textContent = formatCharCount(answerBox.value.length);
});

// ── Init ─────────────────────────────────────────────────────────────────────

buildCardGrid();