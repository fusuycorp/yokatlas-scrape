/**
 * Formats a number with comma thousand separators.
 * @param {number|null|undefined} num
 * @returns {string}
 */
export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return num.toLocaleString('tr-TR');
}

/**
 * Formats a score value to 2 decimal places.
 * @param {number|null|undefined} score
 * @returns {string}
 */
export function formatScore(score) {
  if (score === null || score === undefined || isNaN(score)) return '—';
  return Number(score).toFixed(2);
}

/**
 * Formats success rank with optional fallback.
 * @param {number|null|undefined} rank
 * @returns {string}
 */
export function formatRank(rank) {
  if (!rank || rank <= 0) return '—';
  return rank.toLocaleString('tr-TR');
}
