/**
 * @fileoverview Answer-phase UI: mode toggle, free-form draggable note boxes,
 * and classic structured-textarea mode.
 *
 * Two modes:
 *   • "free"       – Draggable note boxes with editable titles, a delete
 *                    button, and an "add box" toolbar button.
 *                    Notes are auto-saved to localStorage per question.
 *                    Dragging is disabled on touch/mobile devices.
 *   • "structured" – A single large textarea (the original experience).
 *
 * Depends on: utils.js
 */

'use strict';

/** @const {string} localStorage key prefix for per-question notes. */
const NOTE_PREFIX = 'pdu_notes_';

/**
 * Default box configuration used when no saved state exists.
 *
 * @type {Array<{key: string, label: string}>}
 */
const NOTE_BOXES_CONFIG = [
  { key: 'teza',        label: 'teza'        },
  { key: 'argumenty',   label: 'argumenty'   },
  { key: 'kontekst',    label: 'kontekst'    },
  { key: 'wstep',       label: 'wstęp'       },
  { key: 'rozwiniecie', label: 'rozwinięcie' },
  { key: 'zakonczenie', label: 'zakończenie' },
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
 * Handles migration from the legacy per-key format.
 *
 * @param {string} question
 * @returns {{boxes: Array<{id: string, title: string, content: string}>}|null}
 */
function loadNotes(question) {
  try {
    const raw = localStorage.getItem(noteStorageKey(question));
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data) return null;

    // New format.
    if (data.boxes && Array.isArray(data.boxes)) return data;

    // Legacy format migration: { teza: { title, content, isList }, … }
    if (typeof data === 'object') {
      const boxes = NOTE_BOXES_CONFIG
        .filter(c => data[c.key] !== undefined)
        .map(c => ({
          id:      c.key,
          title:   data[c.key]?.title  || c.label,
          content: data[c.key]?.content || '',
        }));
      return boxes.length ? { boxes } : null;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Returns the default notes state using NOTE_BOXES_CONFIG.
 *
 * @returns {{boxes: Array<{id: string, title: string, content: string}>}}
 */
function getDefaultNotes() {
  return {
    boxes: NOTE_BOXES_CONFIG.map(c => ({
      id:      c.key,
      title:   c.label,
      content: '',
    })),
  };
}

/**
 * Persists note data for a given question.
 *
 * @param {string}                                                          question
 * @param {{boxes: Array<{id: string, title: string, content: string}>}}   notes
 */
function saveNotes(question, notes) {
  try {
    localStorage.setItem(noteStorageKey(question), JSON.stringify(notes));
  } catch { /* quota exceeded – silently ignore */ }
}

// ── Device detection ──────────────────────────────────────────────────────────

/**
 * Returns true when the primary input is touch / coarse (mobile / tablet).
 * Used to disable dragging on those devices.
 *
 * @returns {boolean}
 */
function isMobileDevice() {
  return window.matchMedia('(hover: none)').matches;
}

// ── Drag-and-drop ─────────────────────────────────────────────────────────────

/**
 * Makes a note box draggable by its header on desktop.
 * On first drag the box is "lifted" out of the grid: it is appended to
 * `document.body` as `position: absolute` and a placeholder div is left in
 * the grid to preserve layout.
 *
 * @param {HTMLElement}         boxEl            - The `.note-box` element.
 * @param {function(HTMLElement): void} onLift   - Called once when the box first leaves the grid.
 * @param {function(): void}    onPositionChange - Called after every drop.
 */
function makeDraggable(boxEl, onLift, onPositionChange) {
  if (isMobileDevice()) return;

  const header = /** @type {HTMLElement} */ (boxEl.querySelector('.note-header'));
  header.classList.add('drag-handle');

  let dragging  = false;
  let originX   = 0;
  let originY   = 0;
  let startLeft = 0;
  let startTop  = 0;

  /** @param {MouseEvent} e */
  const onMouseMove = e => {
    if (!dragging) return;
    const dx = e.clientX - originX;
    const dy = e.clientY - originY;
    boxEl.style.left = Math.max(0, startLeft + dx) + 'px';
    boxEl.style.top  = Math.max(0, startTop  + dy) + 'px';
  };

  const onMouseUp = () => {
    if (!dragging) return;
    dragging = false;
    header.style.cursor = 'grab';
    document.body.style.userSelect = '';
    boxEl.classList.remove('is-dragging');
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup',   onMouseUp);
    onPositionChange();
  };

  header.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    // Don't steal focus from inputs or buttons inside the header.
    if (/** @type {HTMLElement} */ (e.target).closest('input, button')) return;

    // Lift on first drag.
    if (!boxEl.classList.contains('is-floating')) {
      onLift(boxEl);
    }

    dragging  = true;
    originX   = e.clientX;
    originY   = e.clientY;
    startLeft = parseFloat(boxEl.style.left) || 0;
    startTop  = parseFloat(boxEl.style.top)  || 0;

    boxEl.classList.add('is-dragging');
    header.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup',   onMouseUp);
    e.preventDefault();
  });
}

// ── Free mode ─────────────────────────────────────────────────────────────────

/**
 * Builds the free-mode notes panel with draggable, deletable, addable boxes.
 *
 * @param {string} question - Used as the persistence key.
 * @returns {{el: HTMLElement, cleanup: function(): void}}
 */
function createFreeMode(question) {
  let notes = loadNotes(question) || getDefaultNotes();

  /** Tracks boxes currently floating on `document.body`. @type {Set<HTMLElement>} */
  const floatingBoxes = new Set();

  // ── Wrapper & grid ─────────────────────────────────────────────────────────

  const wrapper = document.createElement('div');
  wrapper.className = 'free-mode-wrapper';

  const grid = document.createElement('div');
  grid.className = 'notes-grid';
  wrapper.appendChild(grid);

  const toolbar = document.createElement('div');
  toolbar.className = 'notes-toolbar';
  toolbar.innerHTML = `
    <button class="add-note-btn" type="button">
      <i class="ti ti-plus"></i> dodaj karteczkę
    </button>
  `;
  wrapper.appendChild(toolbar);

  // ── Persist helper ─────────────────────────────────────────────────────────

  /**
   * Reads all note boxes (grid + floating) and saves their state.
   */
  function persist() {
    notes.boxes = notes.boxes.reduce((acc, box) => {
      const el = /** @type {HTMLElement|null} */ (
        document.querySelector(`.note-box[data-id="${box.id}"]`)
      );
      if (!el) return acc; // box was deleted
      acc.push({
        id:      box.id,
        title:   /** @type {HTMLInputElement}    */ (el.querySelector('.note-title')).value,
        content: /** @type {HTMLTextAreaElement} */ (el.querySelector('.note-content')).value,
      });
      return acc;
    }, /** @type {typeof notes.boxes} */ ([]));
    saveNotes(question, notes);
  }

  // ── Lift (detach from grid) ────────────────────────────────────────────────

  /**
   * Detaches a box from the grid, replaces it with a ghost placeholder,
   * and appends the box to `document.body` at its current viewport position.
   *
   * @param {HTMLElement} boxEl
   */
  function liftBox(boxEl) {
    const rect    = boxEl.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // Placeholder occupies the vacated grid cell.
    const ph = document.createElement('div');
    ph.className = 'note-placeholder';
    ph.style.width  = rect.width  + 'px';
    ph.style.height = rect.height + 'px';
    boxEl.insertAdjacentElement('beforebegin', ph);
    boxEl._placeholder = ph; // non-standard property – OK for internal use

    // Make floating.
    boxEl.classList.add('is-floating');
    boxEl.style.width = rect.width + 'px';
    boxEl.style.left  = (rect.left + scrollX) + 'px';
    boxEl.style.top   = (rect.top  + scrollY) + 'px';
    document.body.appendChild(boxEl);
    floatingBoxes.add(boxEl);
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  /**
   * Removes a note box from the DOM (and from floatingBoxes if applicable)
   * and updates persisted state.
   *
   * @param {string} id - Box data-id.
   */
  function removeBox(id) {
    notes.boxes = notes.boxes.filter(b => b.id !== id);

    const el = /** @type {HTMLElement|null} */ (
      document.querySelector(`.note-box[data-id="${id}"]`)
    );
    if (el) {
      if (el._placeholder) el._placeholder.remove();
      el.remove();
      floatingBoxes.delete(el);
    }

    saveNotes(question, notes);
  }

  // ── Render a single box ────────────────────────────────────────────────────

  /**
   * Creates a `.note-box` element for the given data.
   *
   * @param {{id: string, title: string, content: string}} boxData
   * @returns {HTMLElement}
   */
  function renderBox(boxData) {
    const boxEl = document.createElement('div');
    boxEl.className = 'note-box';
    boxEl.dataset.id = boxData.id;

    boxEl.innerHTML = `
      <div class="note-header">
        <input
          type="text"
          class="note-title"
          value="${escapeHtml(boxData.title)}"
          aria-label="Tytuł sekcji"
        />
        <button
          class="note-delete-btn"
          title="Usuń karteczkę"
          aria-label="Usuń karteczkę"
          type="button"
        ><i class="ti ti-x"></i></button>
      </div>
      <textarea
        class="note-content"
        placeholder="Wpisz notatki…"
        spellcheck="true"
        lang="pl"
      >${escapeHtml(boxData.content)}</textarea>
    `;

    /** @type {HTMLInputElement}    */ (boxEl.querySelector('.note-title')).addEventListener('input', persist);
    /** @type {HTMLTextAreaElement} */ (boxEl.querySelector('.note-content')).addEventListener('input', persist);
    boxEl.querySelector('.note-delete-btn').addEventListener('click', () => removeBox(boxData.id));

    makeDraggable(boxEl, liftBox, persist);
    return boxEl;
  }

  // ── Add box ────────────────────────────────────────────────────────────────

  /**
   * Appends a blank note box to the grid and persists the updated state.
   */
  function addBox() {
    const id      = 'custom_' + Date.now();
    const boxData = { id, title: 'notatka', content: '' };
    notes.boxes.push(boxData);
    const el = renderBox(boxData);
    grid.appendChild(el);
    persist();
    /** @type {HTMLTextAreaElement} */ (el.querySelector('.note-content')).focus();
  }

  // ── Initial render ─────────────────────────────────────────────────────────

  notes.boxes.forEach(b => grid.appendChild(renderBox(b)));
  toolbar.querySelector('.add-note-btn').addEventListener('click', addBox);

  // ── Cleanup ────────────────────────────────────────────────────────────────

  /**
   * Removes all floating boxes from `document.body` (called before leaving
   * the answer phase so no orphaned elements remain).
   */
  function cleanup() {
    floatingBoxes.forEach(el => {
      if (el._placeholder) el._placeholder.remove();
      el.remove();
    });
    floatingBoxes.clear();
  }

  return { el: wrapper, cleanup };
}

// ── Structured mode ───────────────────────────────────────────────────────────

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

// ── Phase renderer ────────────────────────────────────────────────────────────

/**
 * Renders the complete answer-phase UI into the given container.
 * Returns a cleanup function that must be called before leaving the phase.
 *
 * @param {HTMLElement}       container - The `#phase-answer` element.
 * @param {string}            question  - The drawn exam question.
 * @param {function(): void}  onReset   - Called when the user wants to draw again.
 * @returns {function(): void} Cleanup callback.
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

  // Build both views once so state survives mode switches.
  const { el: freeEl, cleanup: freeCleanup } = createFreeMode(question);
  const structuredEl = createStructuredMode();
  let currentMode = /** @type {'free'|'structured'} */ ('free');

  /**
   * Switches the visible mode without rebuilding DOM nodes.
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
    const btn = /** @type {HTMLElement} */ (e.target).closest('.mode-btn');
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
    .addEventListener('click', () => {
      freeCleanup();
      onReset();
    });
  container.appendChild(footer);

  return freeCleanup;
}