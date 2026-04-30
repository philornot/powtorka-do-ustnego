/**
 * @fileoverview Card grid creation and revealed-question tracking.
 *
 * Tracks which questions the user has already drawn so they can be shown
 * face-up on subsequent rounds. State is persisted in localStorage.
 *
 * Depends on: utils.js, QUESTIONS (questions.js)
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
 * Creates a single `.card-wrap` element.
 *
 * @param {number}   index       - Card position in the grid (0-based).
 * @param {string}   question    - Exam question assigned to this card.
 * @param {boolean}  preRevealed - If true, the card starts face-up (already drawn).
 * @param {function(HTMLElement, string): void} onPick - Click callback.
 * @returns {HTMLElement}
 */
function createCard(index, question, preRevealed, onPick) {
  const color = CARD_COLORS[index % CARD_COLORS.length];
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
 * Clears the grid element and populates it with a fresh random set of cards.
 * Cards whose questions are in the revealed set start face-up.
 *
 * @param {HTMLElement} gridEl     - The `#cards-grid` container.
 * @param {function(HTMLElement, string): void} onCardPick - Passed to each fresh card.
 */
function buildCardGrid(gridEl, onCardPick) {
  gridEl.innerHTML = '';

  const revealed = getRevealedQuestions();
  const count    = randInt(20, 30);
  const pool     = shuffle([...QUESTIONS]);

  for (let i = 0; i < count; i++) {
    const question    = pool[i % pool.length];
    const preRevealed = revealed.has(question);
    gridEl.appendChild(createCard(i, question, preRevealed, onCardPick));
  }
}