# Repository Map

Total mapped files: 110

- `.agents/activity.jsonl` (0 B)
- `.agents/decisions.md` (217 B)
- `.agents/memory.md` (288 B)
- `.dockerignore` (94 B)
- `.github/workflows/deploy.yml` (4709 B)
- `.gitignore` (525 B)
- `.python-version` (5 B)
- `Dockerfile` (1003 B)
- `README.md` (2462 B)
- `build_unified_db.py` (8280 B)
    * def tr_normalize()
    * def check_db_needs_decompression()
    * def decompress_db_if_needed()
    * def build_unified_database()
- `dashboard-ui/.gitignore` (253 B)
- `dashboard-ui/.oxlintrc.json` (231 B)
- `dashboard-ui/README.md` (1009 B)
- `dashboard-ui/bun.lock` (39205 B)
- `dashboard-ui/index.html` (1542 B)
- `dashboard-ui/package-lock.json` (80592 B)
- `dashboard-ui/package.json` (709 B)
- `dashboard-ui/public/favicon.svg` (9522 B)
- `dashboard-ui/public/icons.svg` (5031 B)
- `dashboard-ui/public/robots.txt` (71 B)
- `dashboard-ui/src/App.css` (2891 B)
- `dashboard-ui/src/App.jsx` (7942 B)
    * const UniversityPageWrapper
    * const location
    * const navigate
    * const found
    * const ProgramDetailWrapper
    * const navigate
- `dashboard-ui/src/api/client.js` (691 B)
    * const url
    * const response
    * const errorData
    * const message
- `dashboard-ui/src/api/uniatlasService.js` (2375 B)
    * export const uniatlasService
    * const params
    * const query
    * const query
    * const params
- `dashboard-ui/src/assets/hero.png` (13057 B)
- `dashboard-ui/src/assets/react.svg` (4126 B)
- `dashboard-ui/src/assets/vite.svg` (8709 B)
- `dashboard-ui/src/components/SeoHead.jsx` (1282 B)
    * export function SeoHead
- `dashboard-ui/src/components/features/bookmarks/PreferenceDrawer.jsx` (4258 B)
    * export function PreferenceDrawer
- `dashboard-ui/src/components/features/common/Footer.jsx` (666 B)
    * export function Footer
- `dashboard-ui/src/components/features/common/Navbar.jsx` (5002 B)
    * export function Navbar
    * const location
    * const tabs
    * const Icon
    * const isActive
- `dashboard-ui/src/components/features/common/ProgramModal.jsx` (8103 B)
    * export function ProgramModal
    * const p
    * const chartData
- `dashboard-ui/src/components/features/comparator/FacultyChart.jsx` (1537 B)
    * export function FacultyChart
- `dashboard-ui/src/components/features/comparator/UniComparatorTab.jsx` (3918 B)
    * export function UniComparatorTab
    * const filteredUniOptions
- `dashboard-ui/src/components/features/comparator/UniComparisonCards.jsx` (2984 B)
    * export function UniComparisonCards
- `dashboard-ui/src/components/features/explorer/ProgramExplorerTab.jsx` (2905 B)
    * export function ProgramExplorerTab
- `dashboard-ui/src/components/features/explorer/ProgramFilterToolbar.jsx` (4348 B)
    * const TogglePill
    * export function ProgramFilterToolbar
    * const handleToggle
    * let currentArray
    * const scoreTypesList
    * const uniTypesList
- `dashboard-ui/src/components/features/explorer/ProgramTable.jsx` (7355 B)
    * export function ProgramTable
    * const isBookmarked
- `dashboard-ui/src/components/features/trends/NetStatsTable.jsx` (1854 B)
    * export function NetStatsTable
- `dashboard-ui/src/components/features/trends/RankTrajectoryChart.jsx` (1679 B)
    * export function RankTrajectoryChart
- `dashboard-ui/src/components/features/trends/RankTrendsTab.jsx` (4577 B)
    * export function RankTrendsTab
    * const chartData
- `dashboard-ui/src/components/features/trends/YoYComparisonTable.jsx` (9372 B)
    * export function YoYComparisonTable
    * const isBaseline
    * const periodLabel
    * const rankDelta
    * const rankPct
- `dashboard-ui/src/components/features/trends/YoYDeltaCards.jsx` (9584 B)
    * export function YoYDeltaCards
    * const latest
    * const overall
    * const renderRankBadge
    * const absDelta
    * const renderScoreBadge
- `dashboard-ui/src/components/features/university/UniversityPage.jsx` (14851 B)
    * export function UniversityPage
    * const totalFaculty
    * const isBookmarked
- `dashboard-ui/src/components/features/wizard/PreferenceWizardTab.jsx` (4817 B)
    * export function PreferenceWizardTab
- `dashboard-ui/src/components/features/wizard/WizardCard.jsx` (2176 B)
    * export function WizardCard
- `dashboard-ui/src/components/features/wizard/WizardForm.jsx` (1950 B)
    * export function WizardForm
    * const options
- `dashboard-ui/src/components/ui/Badge.jsx` (977 B)
    * export function Badge
    * const variants
- `dashboard-ui/src/components/ui/Button.jsx` (1510 B)
    * export function Button
    * const baseStyles
    * const variants
    * const sizes
- `dashboard-ui/src/components/ui/Card.jsx` (545 B)
    * export function Card
    * const baseStyle
- `dashboard-ui/src/components/ui/Input.jsx` (573 B)
    * export function Input
- `dashboard-ui/src/components/ui/Select.jsx` (645 B)
    * export function Select
- `dashboard-ui/src/components/ui/Spinner.jsx` (684 B)
    * export function Spinner
    * const displayMessage
    * const sizes
- `dashboard-ui/src/components/ui/StatCard.jsx` (907 B)
    * export function StatCard
    * const colorMap
- `dashboard-ui/src/constants/config.js` (175 B)
    * export const API_BASE_URL
    * export const PAGINATION_DEFAULTS
    * export const STORAGE_KEYS
- `dashboard-ui/src/constants/university.js` (807 B)
    * export const SCORE_TYPES
    * export const UNIVERSITY_TYPES
    * export const DEFAULT_COMPARE_UNIVERSITIES
    * export const DEFAULT_TREND_PROGRAM_CODE
- `dashboard-ui/src/constants/version.js` (37 B)
    * export const APP_VERSION
- `dashboard-ui/src/hooks/useBookmarks.js` (1439 B)
    * export function useBookmarks
    * const saved
    * const bookmarkedIds
    * const toggleBookmark
    * const removeBookmark
    * const clearAllBookmarks
- `dashboard-ui/src/hooks/useCompare.js` (1811 B)
    * export function useCompare
    * let isMounted
    * const addUniversity
    * const removeUniversity
- `dashboard-ui/src/hooks/useLanguage.jsx` (1852 B)
    * const translations
    * const STORAGE_KEY
    * const LanguageContext
    * export function LanguageProvider
    * const saved
    * const setLanguage
- `dashboard-ui/src/hooks/usePrograms.js` (2997 B)
    * const globalFiltersCache
    * export function usePrograms
    * let isMounted
    * const toggleSort
- `dashboard-ui/src/hooks/useStats.js` (738 B)
    * export function useStats
    * let isMounted
- `dashboard-ui/src/hooks/useTheme.jsx` (1095 B)
    * const ThemeContext
    * export function ThemeProvider
    * const savedTheme
    * const toggleTheme
    * export function useTheme
    * const context
- `dashboard-ui/src/hooks/useTrends.js` (1027 B)
    * export function useTrends
    * let isMounted
- `dashboard-ui/src/hooks/useUniversityDepartments.js` (2660 B)
    * export function useUniversityDepartments
    * let isMounted
    * const filteredDepartments
    * let result
    * let valA
    * let valB
- `dashboard-ui/src/hooks/useWizard.js` (1143 B)
    * export function useWizard
    * const fetchRecommendations
- `dashboard-ui/src/index.css` (3247 B)
- `dashboard-ui/src/locales/en.js` (6551 B)
    * export const en
- `dashboard-ui/src/locales/tr.js` (6982 B)
    * export const tr
- `dashboard-ui/src/main.jsx` (640 B)
- `dashboard-ui/src/types/index.js` (1236 B)
- `dashboard-ui/src/utils/exportCsv.js` (1000 B)
    * export function exportPreferencesToCSV
    * const headers
    * const rows
    * const csvContent
    * const encodedUri
    * const link
- `dashboard-ui/src/utils/formatters.js` (762 B)
    * export function formatNumber
    * export function formatScore
    * export function formatRank
- `dashboard-ui/src/utils/slugs.js` (542 B)
    * export function slugifyUniversity
    * export function unslugifyUniversity
- `dashboard-ui/src/utils/turkish.js` (526 B)
    * export function trNormalize
    * const trMap
    * export function trIncludes
- `dashboard-ui/vite.config.js` (364 B)
- `deployment/README.md` (2172 B)
- `deployment/docker-stack.yml` (1063 B)
- `docker-stack.yml` (1063 B)
- `docs/README.md` (1594 B)
- `docs/api_reference.md` (4723 B)
- `docs/architecture.md` (3276 B)
- `docs/coding_standards.md` (2759 B)
- `docs/data_pipeline.md` (4691 B)
- `docs/deployment.md` (3044 B)
- `docs/project_overview.md` (2694 B)
- `exporter.py` (5772 B)
    * def process_items()
    * def save_to_sqlite()
    * def export_all()
- `kaggle_data/.gitkeep` (61 B)
- `kaggle_data/department_names.csv` (23138 B)
- `kaggle_data/department_tags.csv` (363535 B)
- `kaggle_data/faculty_names.csv` (46406 B)
- `kaggle_data/lessons.csv` (486 B)
- `kaggle_data/scholarship_types.csv` (192 B)
- `kaggle_data/score_types.csv` (62 B)
- `kaggle_data/tags.csv` (381 B)
- `kaggle_data/universities_normalized.csv` (10854 B)
- `kaggle_data/university_cities.csv` (1035 B)
- `kaggle_data/university_types.csv` (76 B)
- `kaggle_data/years.csv` (62 B)
- `main.py` (3986 B)
    * def parse_original_request()
    * def main()
- `original-request.txt` (975 B)
- `output/.gitkeep` (0 B)
- `pyproject.toml` (363 B)
- `scraper.py` (6062 B)
    * class YokAtlasScraper (__init__, _get_page_cache_path, fetch_page, get_initial_info, scrape_all)
- `server.py` (31158 B)
    * def tr_lower()
    * def title_turkish()
    * def slugify_turkish()
    * def get_uni_name_from_slug()
    * def tr_normalize()
    * def decompress_db_if_needed()
- `tests/test_api_endpoints.py` (30310 B)
    * class TestTurkishNormalization (test_tr_lower_basic_and_turkish_chars, test_title_turkish_words, test_slugify_turkish, test_tr_normalize, test_get_uni_name_from_slug)
    * class TestGlobalStatsAPI (test_get_stats_response_status_and_schema, test_get_stats_counts_sanity_and_ranges, test_get_stats_university_and_score_type_distributions)
    * class TestUniversitiesAPI (test_get_universities_all, test_get_universities_default_order_by_program_count, test_get_universities_search_exact_and_partial, test_get_universities_search_turkish_normalization, test_get_universities_search_no_results...)
    * class TestProgramsAPI (test_get_programs_default_pagination_and_schema, test_get_programs_filter_score_type_single, test_get_programs_filter_score_type_multi, test_get_programs_filter_uni_type_single, test_get_programs_filter_uni_type_multi...)
    * class TestCompareAPI (test_compare_two_universities_success_and_schema, test_compare_three_universities_success, test_compare_single_university_returns_400, test_compare_missing_unis_param_returns_422, test_compare_nonexistent_universities_returns_empty_breakdowns...)
    * class TestWizardAPI (test_wizard_valid_request_and_schema, test_wizard_bucket_allocation_math, test_wizard_bucket_programs_integrity, test_wizard_custom_limit_enforced, test_wizard_all_score_types_supported...)
- `tests/test_features.py` (14159 B)
    * def parse_js_locale()
    * def get_all_nested_keys()
    * class TestUniversityDepartmentsAPI (test_get_university_departments_exact_match, test_get_university_departments_partial_match, test_get_university_departments_not_found, test_university_departments_stats_aggregation)
    * class TestProgramTrendsAPI (test_get_program_trends_success, test_program_trends_schema_integrity, test_yoy_comparisons_delta_calculation_logic, test_yoy_deltas_summary_structure, test_get_program_trends_not_found)
    * class TestI18nLocaleIntegrity (setup_locales, test_locale_files_exist, test_top_level_sections_match, test_all_nested_keys_match_exactly, test_locale_value_types_match...)
- `tests/test_seo.py` (2063 B)
    * def setup_module()
    * def test_robots_txt()
    * def test_sitemaps()
    * def test_dynamic_university_html()
    * def test_dynamic_program_html()
    * def test_root_seo_html()
- `user_agents.py` (3737 B)
    * def get_random_headers()
- `uv.lock` (80258 B)