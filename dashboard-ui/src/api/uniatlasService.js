import { apiClient } from './client';

export const uniatlasService = {
  /**
   * Fetches global database overview stats.
   */
  getGlobalStats() {
    return apiClient('/stats');
  },

  /**
   * Fetches university list with faculty totals.
   * @param {string} [search]
   */
  getUniversities(search) {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient(`/universities${params}`);
  },

  /**
   * Fetches all departments/programs for a given university.
   * @param {string} uniName
   */
  getUniversityDepartments(uniName) {
    return apiClient(`/universities/${encodeURIComponent(uniName)}/departments`);
  },

  /**
   * Searches and filters 2026 scraped programs.
   * @param {Object} filters
   */
  getPrograms(filters = {}) {
    const query = new URLSearchParams();
    if (filters.page) query.append('page', filters.page);
    if (filters.limit) query.append('limit', filters.limit);
    if (filters.sort_by) query.append('sort_by', filters.sort_by);
    if (filters.sort_dir) query.append('sort_dir', filters.sort_dir);
    if (filters.search) query.append('search', filters.search);
    if (filters.score_type) query.append('score_type', filters.score_type);
    if (filters.uni_type) query.append('uni_type', filters.uni_type);
    if (filters.city) query.append('city', filters.city);

    return apiClient(`/programs?${query.toString()}`);
  },

  /**
   * Compares 2 to 4 universities side-by-side.
   * @param {string[]} universities
   */
  compareUniversities(universities = []) {
    const query = new URLSearchParams();
    universities.forEach((u) => query.append('unis', u));
    return apiClient(`/compare?${query.toString()}`);
  },

  /**
   * Gets historical rank trajectory and student net scores for a program.
   * @param {number} programCode
   */
  getProgramTrends(programCode) {
    return apiClient(`/trends/${programCode}`);
  },

  /**
   * Gets safe, target, and reach recommendations based on student rank.
   * @param {string} scoreType
   * @param {number} targetRank
   * @param {number} [limit=15]
   */
  getWizardRecommendations(scoreType, targetRank, limit = 15) {
    const params = new URLSearchParams({
      score_type: scoreType,
      target_rank: targetRank.toString(),
      limit: limit.toString(),
    });
    return apiClient(`/wizard?${params.toString()}`);
  },
};
