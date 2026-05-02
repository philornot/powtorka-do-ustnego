/**
 * @fileoverview Answer-phase UI: mode toggle, free-form note boxes with
 * slot-based docking, and classic structured-textarea mode.
 *
 * Two modes:
 *   • "free"       – Note boxes in a fixed slot grid. Each slot is either
 *                    occupied by a box or shows an empty hatched placeholder.
 *                    Boxes can be dragged by their dedicated drag-handle strip
 *                    and docked into any empty slot by hovering + releasing.
 *                    Floating boxes (not docked) persist across mode switches.
 *                    State (content, titles, slot assignments) is auto-saved
 *                    to localStorage per question.
 *   • "structured" – A single large textarea with word/char/time counters.
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
 * @typedef {Object} BoxData
 * @property {string}      id      - Unique box identifier.
 * @property {string}      title   - Editable header text.
 * @property {string}      content - Textarea content.
 * @property {number|null} slot    - Grid slot index (0-based), or null if floating.
 */

/**
 * @typedef {Object} NotesState
 * @property {BoxData[]} boxes
 * @property {string}    structuredText - Content of the structured textarea.
 */

/**
 * Loads saved note state for a given question.
 * Handles migration from the legacy per-key format (no slot info).
 *
 * @param {string} question
 * @returns {NotesState|null}
 */
function loadNotes(question) {
  try {
    const raw = localStorage.getItem(noteStorageKey(question));
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data) return null;

    // Current format.
    if (data.boxes && Array.isArray(data.boxes)) return data;

    // Legacy format migration: { teza: { title, content }, … }
    if (typeof data === 'object') {
      const boxes = NOTE_BOXES_CONFIG
        .filter(c => data[c.key] !== undefined)
        .map((c, i) => ({
          id:      c.key,
          title:   data[c.key]?.title   || c.label,
          content: data[c.key]?.content || '',
          slot:    i,
        }));
      return boxes.length ? { boxes, structuredText: '' } : null;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Returns the default notes state using NOTE_BOXES_CONFIG.
 * Each box is assigned to the slot matching its index.
 *
 * @returns {NotesState}
 */
function getDefaultNotes() {
  return {
    boxes: NOTE_BOXES_CONFIG.map((c, i) => ({
      id:      c.key,
      title:   c.label,
      content: '',
      slot:    i,
    })),
    structuredText: '',
  };
}

/**
 * Persists note state for a given question.
 *
 * @param {string}     question
 * @param {NotesState} notes
 */
function saveNotes(question, notes) {
  try {
    localStorage.setItem(noteStorageKey(question), JSON.stringify(notes));
  } catch { /* quota exceeded – silently ignore */ }
}

// ── Device detection ──────────────────────────────────────────────────────────

/**
 * Returns true when the primary input is touch / coarse (mobile / tablet).
 * Dragging is disabled on those devices.
 *
 * @returns {boolean}
 */
function isMobileDevice() {
  return window.matchMedia('(hover: none)').matches;
}

// ── Free mode ─────────────────────────────────────────────────────────────────

/**
 * Builds the free-mode notes panel.
 *
 * Layout model
 * ────────────
 * The grid contains a fixed array of `slots`. Each slot is either:
 *   - occupied: holds the `.note-box` element directly in the grid DOM, or
 *   - empty: shows a `.note-slot--empty` hatched placeholder div.
 *
 * A box can be dragged by its `.drag-handle` strip only. On drag-start the
 * box is "lifted": it is appended to document.body as position:absolute and
 * its slot becomes empty (showing the hatched placeholder). While dragging,
 * hovering over an empty slot highlights it. On drop:
 *   - If over a highlighted empty slot → the box docks into that slot.
 *   - Otherwise → the box remains floating (persists across mode switches).
 *
 * Adding a new box always fills the first available empty slot. A new slot is
 * only appended to the grid when all existing slots are occupied.
 *
 * Deleting a box leaves its slot empty (hatched); other boxes do not move.
 *
 * @param {string} question - Used as the persistence key.
 * @returns {{el: HTMLElement, cleanup: function(): void}}
 */
function createFreeMode(question) {
  /** @type {NotesState} */
  let notes = loadNotes(question) || getDefaultNotes();

  /**
   * Slot registry: parallel array to grid slot elements.
   * slots[i] === null  → slot i is empty (shows hatched placeholder).
   * slots[i] === id    → slot i is occupied by the box with that id.
   *
   * @type {Array<string|null>}
   */
  const slots = [];

  /**
   * Map from box id to its HTMLElement (whether docked or floating).
   *
   * @type {Map<string, HTMLElement>}
   */
  const boxEls = new Map();

  /** Floating boxes currently appended to document.body. @type {Set<HTMLElement>} */
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

  // ── Slot helpers ───────────────────────────────────────────────────────────

  /**
   * Returns the index of the first empty slot, or -1 if all are occupied.
   *
   * @returns {number}
   */
  function firstEmptySlot() {
    return slots.indexOf(null);
  }

  /**
   * Creates and appends a new empty (hatched) slot element to the grid.
   *
   * @returns {number} The index of the newly created slot.
   */
  function appendEmptySlot() {
    const idx = slots.length;
    slots.push(null);

    const ph = document.createElement('div');
    ph.className = 'note-slot--empty';
    ph.dataset.slot = String(idx);
    grid.appendChild(ph);

    return idx;
  }

  /**
   * Returns the DOM element for slot `idx`.
   *
   * @param {number} idx
   * @returns {HTMLElement|null}
   */
  function slotEl(idx) {
    return /** @type {HTMLElement|null} */ (
      grid.querySelector(`.note-slot--empty[data-slot="${idx}"], .note-box[data-slot="${idx}"]`)
    );
  }

  /**
   * Replaces the placeholder at `idx` with the given box element, marking the
   * slot as occupied.
   *
   * @param {number}      idx
   * @param {HTMLElement} boxEl
   * @param {string}      id
   */
  function dockBoxIntoSlot(idx, boxEl, id) {
    const ph = grid.querySelector(`.note-slot--empty[data-slot="${idx}"]`);
    if (ph) ph.remove();

    boxEl.classList.remove('is-floating', 'is-dragging');
    boxEl.style.left  = '';
    boxEl.style.top   = '';
    boxEl.style.width = '';
    boxEl.dataset.slot = String(idx);

    // Insert at correct grid position.
    const allSlotEls = Array.from(grid.children);
    const after = allSlotEls.find(el => {
      const s = parseInt(/** @type {HTMLElement} */ (el).dataset.slot || '-1', 10);
      return s > idx;
    });
    if (after) {
      grid.insertBefore(boxEl, after);
    } else {
      grid.appendChild(boxEl);
    }

    slots[idx] = id;
    floatingBoxes.delete(boxEl);
  }

  /**
   * Replaces the box element at `idx` with an empty placeholder, marking the
   * slot as empty.
   *
   * @param {number} idx
   */
  function emptySlot(idx) {
    const ph = document.createElement('div');
    ph.className = 'note-slot--empty';
    ph.dataset.slot = String(idx);

    const occupied = grid.querySelector(`.note-box[data-slot="${idx}"]`);
    if (occupied) {
      grid.insertBefore(ph, occupied);
      occupied.removeAttribute('data-slot');
    } else {
      // Insert at correct position.
      const allSlotEls = Array.from(grid.children);
      const after = allSlotEls.find(el => {
        const s = parseInt(/** @type {HTMLElement} */ (el).dataset.slot || '-1', 10);
        return s > idx;
      });
      if (after) grid.insertBefore(ph, after);
      else grid.appendChild(ph);
    }

    slots[idx] = null;
  }

  // ── Persist helper ─────────────────────────────────────────────────────────

  /**
   * Reads all note boxes and saves their current state (including slot index).
   */
  function persist() {
    notes.boxes = notes.boxes.reduce((acc, box) => {
      const el = boxEls.get(box.id);
      if (!el) return acc;
      acc.push({
        id:      box.id,
        title:   /** @type {HTMLInputElement}    */ (el.querySelector('.note-title')).value,
        content: /** @type {HTMLTextAreaElement} */ (el.querySelector('.note-content')).value,
        slot:    el.dataset.slot !== undefined ? parseInt(el.dataset.slot, 10) : null,
      });
      return acc;
    }, /** @type {BoxData[]} */ ([]));
    saveNotes(question, notes);
  }

  // ── Drag-and-drop ──────────────────────────────────────────────────────────

  /** @type {HTMLElement|null} Currently highlighted empty slot during drag. */
  let highlightedSlotEl = null;

  /**
   * Clears the drop-target highlight from whichever slot is currently lit.
   */
  function clearHighlight() {
    if (highlightedSlotEl) {
      highlightedSlotEl.classList.remove('note-slot--hover');
      highlightedSlotEl = null;
    }
  }

  /**
   * Attaches drag behaviour to a note box via its `.drag-handle` strip.
   * Only active on non-touch devices. Dragging lifts the box to
   * `document.body`; hovering over an empty slot highlights it; releasing
   * docks the box there (or leaves it floating).
   *
   * @param {HTMLElement} boxEl
   * @param {string}      id
   */
  function makeDraggable(boxEl, id) {
    if (isMobileDevice()) return;

    const handle = /** @type {HTMLElement} */ (boxEl.querySelector('.drag-handle'));

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

      // Detect empty slot under cursor.
      boxEl.style.pointerEvents = 'none';
      const under = document.elementFromPoint(e.clientX, e.clientY);
      boxEl.style.pointerEvents = '';

      const slotUnder = under
        ? /** @type {HTMLElement|null} */ (under.closest('.note-slot--empty'))
        : null;

      if (slotUnder && slotUnder !== highlightedSlotEl) {
        clearHighlight();
        slotUnder.classList.add('note-slot--hover');
        highlightedSlotEl = slotUnder;
      } else if (!slotUnder) {
        clearHighlight();
      }
    };

    const onMouseUp = () => {
      if (!dragging) return;
      dragging = false;
      handle.style.cursor = '';
      document.body.style.userSelect = '';
      boxEl.classList.remove('is-dragging');

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup',   onMouseUp);

      if (highlightedSlotEl) {
        const targetSlot = parseInt(highlightedSlotEl.dataset.slot || '-1', 10);
        clearHighlight();
        if (targetSlot >= 0 && slots[targetSlot] === null) {
          // Find if this box was occupying a slot before.
          const prevSlot = parseInt(boxEl.dataset.slot || '-1', 10);
          if (prevSlot >= 0 && slots[prevSlot] === id) {
            emptySlot(prevSlot);
          }
          dockBoxIntoSlot(targetSlot, boxEl, id);
          persist();
          return;
        }
      }

      persist();
    };

    handle.addEventListener('mousedown', e => {
      if (e.button !== 0) return;

      dragging = true;

      // Lift box out of its slot (if docked).
      const currentSlot = parseInt(boxEl.dataset.slot || '-1', 10);
      if (currentSlot >= 0 && slots[currentSlot] === id) {
        emptySlot(currentSlot);
      }

      // Position box at its current viewport location before reparenting.
      const rect    = boxEl.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;

      boxEl.classList.add('is-floating');
      boxEl.style.width = rect.width + 'px';
      boxEl.style.left  = (rect.left + scrollX) + 'px';
      boxEl.style.top   = (rect.top  + scrollY) + 'px';
      document.body.appendChild(boxEl);
      floatingBoxes.add(boxEl);

      originX   = e.clientX;
      originY   = e.clientY;
      startLeft = rect.left + scrollX;
      startTop  = rect.top  + scrollY;

      boxEl.classList.add('is-dragging');
      handle.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup',   onMouseUp);
      e.preventDefault();
    });
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  /**
   * Removes a note box. Its slot is replaced with a hatched placeholder;
   * other boxes do not shift.
   *
   * @param {string} id - Box data-id.
   */
  function removeBox(id) {
    const el = boxEls.get(id);
    if (!el) return;

    // If docked, leave an empty slot behind.
    const slotIdx = parseInt(el.dataset.slot || '-1', 10);
    if (slotIdx >= 0 && slots[slotIdx] === id) {
      emptySlot(slotIdx);
    }

    // If floating, just remove from body.
    floatingBoxes.delete(el);
    el.remove();
    boxEls.delete(id);

    notes.boxes = notes.boxes.filter(b => b.id !== id);
    saveNotes(question, notes);
  }

  // ── Render a single box ────────────────────────────────────────────────────

  /**
   * Creates and returns a `.note-box` element.
   *
   * @param {BoxData} boxData
   * @returns {HTMLElement}
   */
  function renderBox(boxData) {
    const boxEl = document.createElement('div');
    boxEl.className = 'note-box';
    boxEl.dataset.id = boxData.id;

    boxEl.innerHTML = `
      <div class="drag-handle" title="Przeciągnij karteczkę" aria-hidden="true">
        <i class="ti ti-grip-horizontal"></i>
      </div>
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

    boxEls.set(boxData.id, boxEl);
    makeDraggable(boxEl, boxData.id);

    return boxEl;
  }

  // ── Add box ────────────────────────────────────────────────────────────────

  /**
   * Adds a new blank note box. Places it in the first empty slot, or appends
   * a new slot if every existing slot is occupied.
   */
  function addBox() {
    const id      = 'custom_' + Date.now();
    const boxData = { id, title: 'notatka', content: '', slot: null };
    notes.boxes.push(boxData);

    const el = renderBox(boxData);

    let targetSlot = firstEmptySlot();
    if (targetSlot === -1) {
      targetSlot = appendEmptySlot();
    }

    dockBoxIntoSlot(targetSlot, el, id);
    persist();

    /** @type {HTMLTextAreaElement} */ (el.querySelector('.note-content')).focus();
  }

  // ── Initial render ─────────────────────────────────────────────────────────

  // Determine total slot count: max of saved slot indices + 1, or config length.
  const maxSlot = notes.boxes.reduce((m, b) => Math.max(m, b.slot ?? -1), -1);
  const slotCount = Math.max(NOTE_BOXES_CONFIG.length, maxSlot + 1);

  // Pre-create all slots as empty.
  for (let i = 0; i < slotCount; i++) {
    appendEmptySlot();
  }

  // Place each saved box into its slot (or leave floating if slot is null).
  notes.boxes.forEach(boxData => {
    const el = renderBox(boxData);
    if (boxData.slot !== null && boxData.slot < slots.length) {
      dockBoxIntoSlot(boxData.slot, el, boxData.id);
    } else {
      // Floating – restore position if we had it (we don't store absolute px,
      // so just leave it floating near top-left; user can re-dock).
      const rect = grid.getBoundingClientRect();
      el.classList.add('is-floating');
      el.style.width = '280px';
      el.style.left  = (rect.left + 20 + Math.random() * 40) + 'px';
      el.style.top   = (rect.top  + 20 + Math.random() * 40) + 'px';
      document.body.appendChild(el);
      floatingBoxes.add(el);
    }
  });

  toolbar.querySelector('.add-note-btn').addEventListener('click', addBox);

  // ── Cleanup ────────────────────────────────────────────────────────────────

  /**
   * Removes all floating boxes from `document.body`.
   * Called before leaving the answer phase.
   */
  function cleanup() {
    clearHighlight();
    floatingBoxes.forEach(el => el.remove());
    floatingBoxes.clear();
  }

  return { el: wrapper, cleanup };
}

// ── Structured mode ───────────────────────────────────────────────────────────

/**
 * Builds the structured (classic single-textarea) mode element.
 *
 * Displays speaking-time estimate, word count, and character count below the
 * textarea. The structured text is persisted per question in the shared notes
 * state so switching modes does not lose content.
 *
 * @param {string}                         question       - Used as the persistence key.
 * @param {function(): NotesState}         getNotesState  - Returns the current notes object.
 * @param {function(NotesState): void}     setNotesState  - Saves updated notes.
 * @returns {HTMLElement}
 */
function createStructuredMode(question, getNotesState, setNotesState) {
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
      <span class="speak-time-el"></span>
      <span class="word-count-el"></span>
      <span class="char-count-el"></span>
    </div>
  `;

  const textarea      = /** @type {HTMLTextAreaElement} */ (wrapper.querySelector('textarea'));
  const speakTimeEl   = wrapper.querySelector('.speak-time-el');
  const wordCountEl   = wrapper.querySelector('.word-count-el');
  const charCountEl   = wrapper.querySelector('.char-count-el');

  // Restore persisted text.
  const saved = getNotesState();
  textarea.value = saved.structuredText || '';

  /**
   * Updates all three counters and persists the current text.
   */
  function updateCounters() {
    const text  = textarea.value;
    const chars = text.length;
    const words = countWords(text);

    speakTimeEl.textContent = formatSpeakingTime(words);
    wordCountEl.textContent = formatWordCount(words);
    charCountEl.textContent = formatCharCount(chars);

    const state = getNotesState();
    state.structuredText = text;
    setNotesState(state);
  }

  textarea.addEventListener('input', updateCounters);
  updateCounters();

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

  // ── Shared notes-state accessors (for structured mode counter persistence) ─
  let notesState = loadNotes(question) || getDefaultNotes();

  /** @returns {NotesState} */
  function getNotesState() { return notesState; }

  /** @param {NotesState} s */
  function setNotesState(s) {
    notesState = s;
    saveNotes(question, notesState);
  }

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
  const structuredEl = createStructuredMode(question, getNotesState, setNotesState);
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
      <i class="ti ti-refresh"></i> wróć do losowania
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