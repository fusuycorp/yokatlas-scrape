/**
 * @typedef {Object} Program
 * @property {number} kilavuzKodu
 * @property {number} osymKilavuzId
 * @property {string} universiteAdi
 * @property {string} universiteTuru
 * @property {string} ilAdi
 * @property {string} birimAdi
 * @property {string} puanTuru
 * @property {string} [bursOraniAdi]
 * @property {number} kontenjan
 * @property {number|null} basariSirasi
 * @property {number|null} minPuan
 * @property {string|null} minBasariSirasiKosul
 * @property {number} prof
 * @property {number} doc
 * @property {number} dou
 * @property {number} arGor
 */

/**
 * @typedef {Object} GlobalStats
 * @property {number} total_universities
 * @property {number} total_programs
 * @property {number} total_cities
 * @property {Record<string, number>} university_types
 * @property {Record<string, number>} score_types
 */

/**
 * @typedef {Object} UniComparisonItem
 * @property {string} universiteAdi
 * @property {string} universiteTuru
 * @property {string} ilAdi
 * @property {number} program_count
 * @property {number} total_quota
 * @property {number} total_prof
 * @property {number} total_doc
 * @property {number} total_dou
 * @property {number} total_argor
 * @property {number|null} avg_basari_sirasi
 */

export {};
