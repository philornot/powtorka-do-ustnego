/**
 * @fileoverview Answer-phase UI: mode toggle, free-form note boxes,
 * and classic structured-textarea mode.
 *
 * Two modes:
 *   • "free"       – Six labelled note boxes (teza, argumenty, etc.) with
 *                    editable titles, editable content, and a list-format toggle.
 *                    Notes are auto-saved to localStorage per question.
 *   • "structured" – A single large textarea (the original experience).
 *
 * Depends on: utils.js
 */

'use strict';

/** @const {string} localStorage key prefix for per-question notes. */
const NOTE_PREFIX = 'pdu_notes_';

/**
 * Default box configuration. Each entry defines the localStorage key and
 * the placeholder shown when the user hasn't typed a custom title.
 *
 * @type {Array<{key: string, placeholder: string}>}
 */
const NOTE_BOXES_CONFIG = [
  { key: 'teza',        placeholder: 'teza'        },
  { key: 'argumenty',   placeholder: 'argumenty'   },
  { key: 'kontekst',    placeholder: 'kontekst'    },
  { key: 'wstep',       placeholder: 'wstęp'       },
  { key: 'rozwiniecie', placeholder: 'rozwinięcie' },
  { key: 'zakonczenie', placeholder: 'zakończenie' },
];

// ── Note persistence ─────────────────────────────────────────────────────────

/**
 * Derives a safe localStorage key from a question string.
 *
 * @param {string} question
 * @returns {string}
 */
function noteStorageKey(question) {
  return NOTE_PREFIX + question.slice(0, 60).replace(/\W+/g, '_');
}

/**
 * Loads saved note data for a given question.
 *
 * @param {string} question
 * @returns {Object.<string, {title: string, content: string, isList: boolean}>}
 */
function loadNotes(question) {
  try {
    return JSON.parse(localStorage.getItem(noteStorageKey(question)) || '{}');
  } catch {
    return {};
  }
}

/**
 * Persists note data for a given question.
 *
 * @param {string} question
 * @param {Object} notes
 */
function saveNotes(question, notes) {
  try {
    localStorage.setItem(noteStorageKey(question), JSON.stringify(notes));
  } catch { /* quota exceeded – silently ignore */ }
}

// ── List-format helpers ──────────────────────────────────────────────────────

/**
 * Converts plain text to a bullet list.
 * Non-empty lines get a "• " prefix; existing bullets/dashes are normalised first.
 *
 * @param {string} text
 * @returns {string}
 */
function toList(text) {
  return text
    .split('\n')
    .map(l => {
      const trimmed = l.trim();
      if (!trimmed) return l;
      return `• ${trimmed.replace(/^[•\-*]\s*/, '')}`;
    })
    .join('\n');
}

/**
 * Strips bullet-list prefixes ("• ") from each line.
 *
 * @param {string} text
 * @returns {string}
 */
function fromList(text) {
  return text
    .split('\n')
    .map(l => l.replace(/^•\s*/, ''))
    .join('\n');
}

// ── Note box component ───────────────────────────────────────────────────────

/**
 * Creates a single note-box element with an editable title, a list-toggle
 * button, and a content textarea.
 *
 * @param {{ key: string, placeholder: string }} config
 * @param {{ title?: string, content?: string, isList?: boolean }} savedBox
 * @param {function(): void} onchange - Called whenever anything inside changes.
 * @returns {HTMLElement}
 */
function createNoteBox(config, savedBox, onchange) {
  let isList = savedBox.isList || false;

  const box = document.createElement('div');
  box.className = 'note-box';
  box.dataset.key = config.key;

  box.innerHTML = `
    <div class="note-header">
      <input
        type="text"
        class="note-title"
        placeholder="${config.placeholder}"
        value="${escapeHtml(savedBox.title || '')}"
        aria-label="Tytuł sekcji"
      />
      <button
        class="note-list-btn${isList ? ' active' : ''}"
        title="Formatuj jako listę"
        aria-pressed="${isList}"
        type="button"
      ><i class="ti ${isList ? 'ti-list-check' : 'ti-list'}"></i></button>
    </div>
    <textarea
      class="note-content"
      placeholder="Wpisz notatki…"
      spellcheck="true"
      lang="pl"
    >${escapeHtml(savedBox.content || '')}</textarea>
  `;

  const titleInput  = /** @type {HTMLInputElement}     */ (box.querySelector('.note-title'));
  const contentArea = /** @type {HTMLTextAreaElement}  */ (box.querySelector('.note-content'));
  const listBtn     = /** @type {HTMLButtonElement}    */ (box.querySelector('.note-list-btn'));

  listBtn.addEventListener('click', () => {
    isList = !isList;
    listBtn.classList.toggle('active', isList);
    listBtn.setAttribute('aria-pressed', String(isList));
    listBtn.querySelector('i').className = `ti ${isList ? 'ti-list-check' : 'ti-list'}`;
    contentArea.value = isList ? toList(contentArea.value) : fromList(contentArea.value);
    onchange();
  });

  titleInput.addEventListener('input', onchange);
  contentArea.addEventListener('input', onchange);

  return box;
}

// ── Mode builders ────────────────────────────────────────────────────────────

/**
 * Builds the free-mode notes grid and wires up auto-save.
 *
 * @param {string} question - Used as the persistence key.
 * @returns {HTMLElement}
 */
function createFreeMode(question) {
  const saved = loadNotes(question);
  const grid  = document.createElement('div');
  grid.className = 'notes-grid';

  /** Reads all boxes and persists to localStorage. */
  function persist() {
    const notes = {};
    grid.querySelectorAll('.note-box').forEach(box => {
      const k = box.dataset.key;
      notes[k] = {
        title:   /** @type {HTMLInputElement}    */ (box.querySelector('.note-title')).value,
        content: /** @type {HTMLTextAreaElement} */ (box.querySelector('.note-content')).value,
        isList:  box.querySelector('.note-list-btn').classList.contains('active'),
      };
    });
    saveNotes(question, notes);
  }

  NOTE_BOXES_CONFIG.forEach(config => {
    grid.appendChild(createNoteBox(config, saved[config.key] || {}, persist));
  });

  return grid;
}

/**
 * Builds the structured (classic single-textarea) mode element.
 *
 * @returns {HTMLElement}
 */
function createStructuredMode() {
  const wrapper = document.createElement('div');
  wrapper.className = 'answer-area';

  wrapper.innerHTML = `
    <label for="answer-box-structured">twoja wypowiedź</label>
    <textarea
      id="answer-box-structured"
      placeholder="Zacznij pisać swoją odpowiedź…"
      spellcheck="true"
      lang="pl"
    ></textarea>
    <div class="answer-footer">
      <span class="char-count-el">0 znaków</span>
    </div>
  `;

  const textarea  = /** @type {HTMLTextAreaElement} */ (wrapper.querySelector('textarea'));
  const charCount = wrapper.querySelector('.char-count-el');

  textarea.addEventListener('input', () => {
    charCount.textContent = formatCharCount(textarea.value.length);
  });

  return wrapper;
}

// ── Phase renderer ───────────────────────────────────────────────────────────

/**
 * Renders the complete answer-phase UI into the given container.
 * Clears any previous content first.
 *
 * @param {HTMLElement}       container - The `#phase-answer` element.
 * @param {string}            question  - The drawn exam question.
 * @param {function(): void}  onReset   - Called when the user wants to draw again.
 */
function renderAnswerPhase(container, question, onReset) {
  container.innerHTML = '';

  // ── Question display card ──────────────────────────────────────────────────
  const qCard = document.createElement('div');
  qCard.className = 'question-card';
  qCard.innerHTML = `
    <span class="q-label">twoje pytanie</span>
    <p class="revealed-question">${escapeHtml(question)}</p>
  `;
  container.appendChild(qCard);

  // ── Mode toggle bar ────────────────────────────────────────────────────────
  const modeBar = document.createElement('div');
  modeBar.className = 'mode-bar';
  modeBar.innerHTML = `
    <button class="mode-btn active" data-mode="free" type="button">
      <i class="ti ti-notes"></i> swobodny
    </button>
    <button class="mode-btn" data-mode="structured" type="button">
      <i class="ti ti-align-left"></i> wypowiedź
    </button>
  `;
  container.appendChild(modeBar);

  // ── Mode content wrapper ───────────────────────────────────────────────────
  const modeContent = document.createElement('div');
  modeContent.className = 'mode-content';
  container.appendChild(modeContent);

  // Build both views once (so state survives mode switches).
  const freeEl       = createFreeMode(question);
  const structuredEl = createStructuredMode();
  let   currentMode  = /** @type {'free'|'structured'} */ ('free');

  /**
   * Switches visible mode without rebuilding the DOM nodes.
   *
   * @param {'free'|'structured'} mode
   */
  function switchMode(mode) {
    if (mode === currentMode) return;
    currentMode = mode;
    modeBar.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', /** @type {HTMLElement} */ (btn).dataset.mode === mode);
    });
    modeContent.innerHTML = '';
    modeContent.appendChild(mode === 'free' ? freeEl : structuredEl);
    if (mode === 'structured') {
      /** @type {HTMLTextAreaElement} */ (structuredEl.querySelector('textarea')).focus();
    }
  }

  modeBar.addEventListener('click', e => {
    const btn = /** @type {HTMLElement} */ (e.target.closest('.mode-btn'));
    if (btn && btn.dataset.mode) switchMode(/** @type {'free'|'structured'} */ (btn.dataset.mode));
  });

  // Default: free mode.
  modeContent.appendChild(freeEl);

  // ── Footer ─────────────────────────────────────────────────────────────────
  const footer = document.createElement('div');
  footer.className = 'phase-footer';
  footer.innerHTML = `
    <button class="btn-reset" type="button">
      <i class="ti ti-refresh"></i> losuj jeszcze raz
    </button>
  `;
  /** @type {HTMLButtonElement} */ (footer.querySelector('.btn-reset'))
    .addEventListener('click', onReset);
  container.appendChild(footer);
}