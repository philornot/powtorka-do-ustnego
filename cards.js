/**
 * @fileoverview Card grid creation and revealed-question tracking.
 *
 * Previously revealed cards remain fully clickable so the user can revisit
 * questions they already answered. Card previews strip the trailing context
 * reminder; the full question text is always passed to onPick.
 *
 * Depends on: utils.js, QUESTIONS (questions.js)
 */

'use strict';

/** @type {string[]} Card background colors used in random assignment. */
const CARD_COLORS = [
  '#4f46e5','#0891b2','#059669','#e11d48','#7c3aed',
  '#d97706','#0f766e','#9333ea','#db2777','#0284c7',
  '#16a34a','#b45309',
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
 * Builds safe HTML for a card preview, bolding the work title.
 *
 * All plain text is run through escapeHtml first. Then a regex locates the
 * fragment starting with "na podstawie [znanych Ci fragmentów ]" and wraps
 * everything from that point to the end of the string in <strong> tags, so
 * the source/title is visually emphasised on the card face.
 *
 * Examples:
 *   "Omów … na podstawie Antygony Sofoklesa."
 *   → "Omów … na podstawie <strong>Antygony Sofoklesa.</strong>"
 *
 *   "Omów … na podstawie znanych Ci fragmentów Iliady Homera."
 *   → "Omów … na podstawie znanych Ci fragmentów <strong>Iliady Homera.</strong>"
 *
 * @param {string} question - Full question text (context reminder already stripped).
 * @returns {string} HTML string safe for use as innerHTML.
 */
function cardPreviewHtml(question) {
  const escaped = escapeHtml(question);

  // Match the optional "znanych Ci fragmentów " prefix, then capture the rest
  // (the actual work title + author) as group $2.
  return escaped.replace(
    /(na podstawie (?:znanych Ci fragmentów )?)([\s\S]+)$/,
    '$1<strong>$2</strong>'
  );
}

/**
 * Creates a single `.card-wrap` element.
 *
 * Pre-revealed cards start face-up but are still clickable so the user can
 * revisit them. The front face shows a shortened preview (context reminder
 * stripped). The full question is forwarded to onPick for the answer phase.
 *
 * @param {number}   index       - Card position in the grid (0-based).
 * @param {string}   question    - Full exam question assigned to this card.
 * @param {boolean}  preRevealed - If true, the card starts face-up.
 * @param {function(HTMLElement, string): void} onPick - Click callback.
 * @returns {HTMLElement}
 */
function createCard(index, question, preRevealed, onPick) {
  const color       = randomCardColor();
  const rot         = preRevealed ? '0' : (Math.random() * 14 - 7).toFixed(2);
  const label       = String(index + 1).padStart(2, '0');
  const previewText = stripContextReminder(question);

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
        <p class="q-preview">${cardPreviewHtml(previewText)}</p>
      </div>
    </div>
  `;

  wrap.addEventListener('click', () => onPick(wrap, question), { once: true });

  return wrap;
}

// ── Grid builder ─────────────────────────────────────────────────────────────

/**
 * Clears the grid and populates it with cards.
 *
 * @param {HTMLElement}                          gridEl
 * @param {function(HTMLElement, string): void}  onCardPick
 * @param {string[]|null}                        [existingDeck]
 * @returns {string[]}
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