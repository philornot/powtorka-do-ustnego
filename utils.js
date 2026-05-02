/**
 * @fileoverview Shared utility functions used across the application.
 */

'use strict';

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

/**
 * Formats a word count as a Polish noun phrase.
 *
 * @param {number} n - Number of words.
 * @returns {string} e.g. "1 słowo", "3 słowa", "15 słów"
 */
function formatWordCount(n) {
  if (n === 1) return '1 słowo';
  if (n >= 2 && n <= 4) return `${n} słowa`;
  return `${n} słów`;
}

/**
 * Counts words in a string (whitespace-separated tokens, ignoring empty ones).
 *
 * @param {string} text
 * @returns {number}
 */
function countWords(text) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

/**
 * Estimates speaking duration for Polish text.
 * Assumes ~130 words per minute (comfortable oral exam pace).
 *
 * @param {number} wordCount
 * @returns {string} e.g. "~2 min 15 s", "~45 s", "0 s"
 */
function formatSpeakingTime(wordCount) {
  if (wordCount === 0) return '0 s';
  const totalSeconds = Math.round((wordCount / 130) * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `~${seconds} s`;
  if (seconds === 0) return `~${minutes} min`;
  return `~${minutes} min ${seconds} s`;
}

/**
 * Strips the trailing context reminder sentence appended to every CKE question.
 * Removes the fragment: "W swojej odpowiedzi uwzględnij również wybrany kontekst."
 * Used only in card previews; the full question is shown in the answer phase.
 *
 * @param {string} question - Full question text.
 * @returns {string} Shortened question without the trailing reminder.
 */
function stripContextReminder(question) {
  return question
    .replace(/\s*W swojej odpowiedzi uwzględnij również wybrany kontekst\.?/g, '')
    .trim();
}