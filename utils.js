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