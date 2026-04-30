/**
 * @fileoverview Card grid creation and revealed-question tracking.
 *
 * Tracks which questions the user has already drawn so they can be shown
 * face-up on subsequent rounds. State is persisted in localStorage.
 *
 * Depends on: utils.js, QUESTIONS (questions.js)
 */

'use strict';

/** @type {string[]} Card background colors used in random assignment. */
const CARD_COLORS = [
  '#4f46e5', // indigo
  '#0891b2', // cyan
  '#059669', // emerald
  '#e11d48', // rose
  '#7c3aed', // violet
  '#d97706', // amber
  '#0f766e', // teal
  '#9333ea', // purple
  '#db2777', // pink
  '#0284c7', // sky
  '#16a34a', // green
  '#b45309', // orange-brown
];

/** @const {string} localStorage key for the set of revealed questions. */
const REVEALED_KEY = 'pdu_revealed_questions';

// ── Revealed-question state ──────────────────────────────────────────────────

/**
 * Returns the set of questions the user has already drawn.
 *
 * @returns {Set<string>}
 */
function getRevealedQuestions() {
  try {
    return new Set(JSON.parse(localStorage.getItem(REVEALED_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

/**
 * Adds a question to the revealed set and persists it.
 *
 * @param {string} question
 */
function markQuestionRevealed(question) {
  const revealed = getRevealedQuestions();
  revealed.add(question);
  try {
    localStorage.setItem(REVEALED_KEY, JSON.stringify([...revealed]));
  } catch { /* quota exceeded – silently ignore */ }
}

/**
 * Clears all revealed-question history from localStorage.
 */
function clearRevealedQuestions() {
  localStorage.removeItem(REVEALED_KEY);
}

// ── Card DOM creation ────────────────────────────────────────────────────────

/**
 * Picks a random color from CARD_COLORS.
 *
 * @returns {string} A CSS color string.
 */
function randomCardColor() {
  return CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];
}

/**
 * Creates a single `.card-wrap` element.
 *
 * @param {number}   index       - Card position in the grid (0-based).
 * @param {string}   question    - Exam question assigned to this card.
 * @param {boolean}  preRevealed - If true, the card starts face-up (already drawn).
 * @param {function(HTMLElement, string): void} onPick - Click callback.
 * @returns {HTMLElement}
 */
function createCard(index, question, preRevealed, onPick) {
  const color = randomCardColor();
  const rot   = preRevealed ? '0' : (Math.random() * 14 - 7).toFixed(2);
  const label = String(index + 1).padStart(2, '0');

  const wrap = document.createElement('div');
  wrap.className = 'card-wrap' + (preRevealed ? ' pre-revealed' : '');
  wrap.style.setProperty('--rot', `${rot}deg`);
  wrap.style.setProperty('--card-color', color);

  wrap.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-back">
        <i class="ti ti-star-filled card-star"></i>
        <span class="card-num">${label}</span>
      </div>
      <div class="card-face card-front">
        <p class="q-preview">${escapeHtml(question)}</p>
      </div>
    </div>
  `;

  if (!preRevealed) {
    wrap.addEventListener('click', () => onPick(wrap, question), { once: true });
  }

  return wrap;
}

// ── Grid builder ─────────────────────────────────────────────────────────────

/**
 * Clears the grid and populates it with cards.
 *
 * When `existingDeck` is supplied the same question order and count are
 * preserved (only the revealed-state highlighting is refreshed).  This lets
 * "losuj jeszcze raz" keep the deck identical while "resetuj talię" always
 * generates a fresh shuffle.
 *
 * @param {HTMLElement}                          gridEl       - The `#cards-grid` container.
 * @param {function(HTMLElement, string): void}  onCardPick   - Passed to each fresh card.
 * @param {string[]|null}                        [existingDeck] - Previously built deck to reuse.
 * @returns {string[]} The deck (question array) that was rendered.
 */
function buildCardGrid(gridEl, onCardPick, existingDeck) {
  gridEl.innerHTML = '';

  const revealed = getRevealedQuestions();
  const pool     = existingDeck
    ? existingDeck
    : shuffle([...QUESTIONS]).slice(0, randInt(20, 30));

  pool.forEach((question, i) => {
    const preRevealed = revealed.has(question);
    gridEl.appendChild(createCard(i, question, preRevealed, onCardPick));
  });

  return pool;
}