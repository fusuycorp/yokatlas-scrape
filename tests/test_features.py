"""
UniAtlas Test Suite for Features:
1. University Departments Endpoint (/api/universities/{uni_name}/departments)
2. Program Trends & YoY Delta Calculation Logic (/api/trends/{program_code})
3. i18n Language State & Locale Dictionaries Integrity (tr.js vs en.js key parity)
"""

import json
import re
import subprocess
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Import FastAPI app from server.py
from server import app

client = TestClient(app)

TR_LOCALE_PATH = PROJECT_ROOT / "dashboard-ui" / "src" / "locales" / "tr.js"
EN_LOCALE_PATH = PROJECT_ROOT / "dashboard-ui" / "src" / "locales" / "en.js"
USE_LANG_HOOK_PATH = PROJECT_ROOT / "dashboard-ui" / "src" / "hooks" / "useLanguage.jsx"


def parse_js_locale(file_path: Path) -> dict:
    """
    Parse a JS module file (e.g. export const tr = { ... };) into a Python dictionary.
    First attempts via Node.js execution, with regex JSON fallback.
    """
    assert file_path.exists(), f"Locale file does not exist: {file_path}"
    try:
        cmd = [
            "node",
            "-e",
            f'import("{file_path.resolve()}").then(m => console.log(JSON.stringify(m[Object.keys(m)[0]])))'
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return json.loads(res.stdout)
    except Exception:
        text = file_path.read_text("utf-8")
        text = re.sub(r"^export\s+const\s+\w+\s*=\s*", "", text.strip()).rstrip(";").rstrip()
        text = re.sub(r"([a-zA-Z0-9_]+)\s*:", r'"\1":', text)
        text = re.sub(r",\s*([\}\]])", r"\1", text)
        return json.loads(text)


def get_all_nested_keys(d: dict, prefix: str = "") -> dict:
    """
    Recursively extract all key paths and their types / placeholders.
    Returns a dict mapping key path -> (type_name, set_of_placeholders).
    """
    keys = {}
    for k, v in d.items():
        full_key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            keys.update(get_all_nested_keys(v, full_key))
        else:
            placeholders = set(re.findall(r"\{([a-zA-Z0-9_]+)\}", str(v)))
            keys[full_key] = (type(v).__name__, placeholders)
    return keys


# ==============================================================================
# FEATURE 1: University Departments API Tests
# ==============================================================================
class TestUniversityDepartmentsAPI:
    """
    Tests for GET /api/universities/{uni_name}/departments
    """

    def test_get_university_departments_exact_match(self):
        """Test fetching departments for an exact university name match."""
        uni_name = "ABDULLAH GÜL ÜNİVERSİTESİ (KAYSERİ)"
        response = client.get(f"/api/universities/{uni_name}/departments")
        assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"

        data = response.json()
        assert "university" in data
        assert "departments" in data
        assert "total" in data

        uni = data["university"]
        assert uni["universiteAdi"] == uni_name
        assert "universiteTuru" in uni
        assert "ilAdi" in uni
        assert uni["total_programs"] > 0
        assert uni["total_quota"] >= 0
        assert "total_prof" in uni
        assert "total_doc" in uni
        assert "total_dou" in uni
        assert "total_argor" in uni
        assert "avg_basari_sirasi" in uni

        depts = data["departments"]
        assert len(depts) == data["total"]
        assert len(depts) == uni["total_programs"]

        # Check department schema
        first_dept = depts[0]
        expected_fields = [
            "kilavuzKodu", "osymKilavuzId", "universiteAdi", "universiteTuru", "ilAdi",
            "fymkAdi", "birimAdi", "puanTuru", "bursOraniAdi", "kontenjan",
            "basariSirasi", "minPuan", "prof", "doc", "dou", "arGor"
        ]
        for field in expected_fields:
            assert field in first_dept, f"Missing department field: {field}"

    def test_get_university_departments_partial_match(self):
        """Test fetching departments with a partial/fuzzy university name."""
        response = client.get("/api/universities/BOĞAZİÇİ/departments")
        assert response.status_code == 200

        data = response.json()
        assert "BOĞAZİÇİ" in data["university"]["universiteAdi"].upper()
        assert data["total"] > 0
        assert len(data["departments"]) == data["total"]

    def test_get_university_departments_not_found(self):
        """Test HTTP 404 response for non-existent university."""
        response = client.get("/api/universities/NON_EXISTENT_UNIVERSITY_XYZ_999/departments")
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower()

    def test_university_departments_stats_aggregation(self):
        """Test that department summary stats correctly aggregate lower-level department data."""
        uni_name = "ORTA DOĞU"
        response = client.get(f"/api/universities/{uni_name}/departments")
        assert response.status_code == 200
        data = response.json()

        uni = data["university"]
        depts = data["departments"]

        calculated_quota = sum(d.get("kontenjan") or 0 for d in depts)
        assert uni["total_quota"] == calculated_quota, f"Quota mismatch: {uni['total_quota']} vs {calculated_quota}"

        calculated_prof = sum(d.get("prof") or 0 for d in depts)
        assert uni["total_prof"] == calculated_prof, f"Prof mismatch: {uni['total_prof']} vs {calculated_prof}"

        calculated_doc = sum(d.get("doc") or 0 for d in depts)
        assert uni["total_doc"] == calculated_doc, f"Doc mismatch: {uni['total_doc']} vs {calculated_doc}"


# ==============================================================================
# FEATURE 2: Program Trends API & YoY Delta Calculation Logic Tests
# ==============================================================================
class TestProgramTrendsAPI:
    """
    Tests for GET /api/trends/{program_code} and Year-over-Year (YoY) delta calculation logic.
    """

    PROGRAM_CODE = 100110027

    def test_get_program_trends_success(self):
        """Test GET /api/trends/{program_code} returns expected status and root keys."""
        response = client.get(f"/api/trends/{self.PROGRAM_CODE}")
        assert response.status_code == 200

        data = response.json()
        assert "program" in data
        assert "history" in data
        assert "net_stats" in data
        assert "yoy_comparisons" in data
        assert "yoy_deltas" in data

    def test_program_trends_schema_integrity(self):
        """Test structure and key schema of trends endpoint output."""
        response = client.get(f"/api/trends/{self.PROGRAM_CODE}")
        assert response.status_code == 200
        data = response.json()

        # Check program metadata
        prog = data["program"]
        assert prog["kilavuzKodu"] == self.PROGRAM_CODE
        assert "universiteAdi" in prog
        assert "birimAdi" in prog
        assert "puanTuru" in prog

        # Check admissions history schema
        history = data["history"]
        assert isinstance(history, list)
        if history:
            h_entry = history[0]
            assert "year" in h_entry
            assert "total_quota" in h_entry

        # Check net stats schema
        net_stats = data["net_stats"]
        assert isinstance(net_stats, list)
        if net_stats:
            ns_entry = net_stats[0]
            assert "year" in ns_entry
            assert "lesson_name" in ns_entry
            assert "average_net" in ns_entry

    def test_yoy_comparisons_delta_calculation_logic(self):
        """Test year-over-year delta arithmetic and percentage change calculations."""
        response = client.get(f"/api/trends/{self.PROGRAM_CODE}")
        assert response.status_code == 200
        data = response.json()

        yoy = data["yoy_comparisons"]
        assert isinstance(yoy, list)
        assert len(yoy) > 0

        # Baseline year check
        baseline = yoy[0]
        assert baseline["prev_year"] is None
        assert baseline["rank_delta"] is None

        # Subsequent years check
        for comp in yoy[1:]:
            assert comp["prev_year"] is not None
            r_curr = comp["rank"]
            r_prev = [y["rank"] for y in yoy if y["year"] == comp["prev_year"]][0]

            if r_curr is not None and r_prev is not None:
                expected_rank_delta = int(r_curr - r_prev)
                assert comp["rank_delta"] == expected_rank_delta, (
                    f"Rank delta mismatch for year {comp['year']}: expected {expected_rank_delta}, got {comp['rank_delta']}"
                )

                expected_rank_pct = round(((r_curr - r_prev) / r_prev) * 100, 2) if r_prev > 0 else 0.0
                assert comp["rank_pct_change"] == pytest.approx(expected_rank_pct, abs=0.01)

            s_curr = comp["score"]
            s_prev = [y["score"] for y in yoy if y["year"] == comp["prev_year"]][0]
            if s_curr is not None and s_prev is not None:
                expected_score_delta = round(s_curr - s_prev, 2)
                assert comp["score_delta"] == pytest.approx(expected_score_delta, abs=0.01)

    def test_yoy_deltas_summary_structure(self):
        """Test yoy_deltas summary object (latest comparison & overall trajectory)."""
        response = client.get(f"/api/trends/{self.PROGRAM_CODE}")
        assert response.status_code == 200
        data = response.json()

        yoy_deltas = data["yoy_deltas"]
        assert "latest_comparison" in yoy_deltas
        assert "overall_trajectory" in yoy_deltas

        traj = yoy_deltas["overall_trajectory"]
        assert "earliest_year" in traj
        assert "latest_year" in traj
        assert "total_rank_delta" in traj
        assert "total_score_delta" in traj
        assert "total_quota_delta" in traj

        if traj["earliest_rank"] is not None and traj["latest_rank"] is not None:
            expected_total_rank_delta = int(traj["latest_rank"] - traj["earliest_rank"])
            assert traj["total_rank_delta"] == expected_total_rank_delta

    def test_get_program_trends_not_found(self):
        """Test HTTP 404 response for non-existent program code."""
        response = client.get("/api/trends/999999999")
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data

    def test_trends_english_medium_fallback_uses_all_tags(self):
        """English-medium programs must resolve history via all_tags, not department_name.
        Regression for the ``(ingilizce)`` filter reading the wrong column (was returning empty history)."""
        response = client.get("/api/trends/102270217")  # Boğaziçi Tarih (İngilizce)
        assert response.status_code == 200
        data = response.json()
        assert len(data["history"]) > 0, "English-medium fallback resolved no history"

    def test_trends_fallback_filters_scholarship_tier(self):
        """Fallback must match within a single scholarship tier, not blend Burslu/Ücretli series.
        Regression for unrelated series being merged (Yeditepe Burslu case)."""
        response = client.get("/api/trends/206100360")
        assert response.status_code == 200
        data = response.json()
        assert len(data["history"]) > 0, "Tiered vakıf fallback resolved no history"


# ==============================================================================
# FEATURE 3: i18n Language State & Locale Dictionaries Integrity Tests
# ==============================================================================
class TestI18nLocaleIntegrity:
    """
    Tests for Language/i18n state and locale dictionaries integrity (tr.js, en.js).
    """

    @pytest.fixture(autouse=True)
    def setup_locales(self):
        self.tr_data = parse_js_locale(TR_LOCALE_PATH)
        self.en_data = parse_js_locale(EN_LOCALE_PATH)
        self.tr_keys = get_all_nested_keys(self.tr_data)
        self.en_keys = get_all_nested_keys(self.en_data)

    def test_locale_files_exist(self):
        """Verify tr.js, en.js, and useLanguage.jsx files exist in project."""
        assert TR_LOCALE_PATH.exists(), f"Missing {TR_LOCALE_PATH}"
        assert EN_LOCALE_PATH.exists(), f"Missing {EN_LOCALE_PATH}"
        assert USE_LANG_HOOK_PATH.exists(), f"Missing {USE_LANG_HOOK_PATH}"

    def test_top_level_sections_match(self):
        """Verify top-level section names in TR and EN locale dictionaries match exactly."""
        tr_sections = set(self.tr_data.keys())
        en_sections = set(self.en_data.keys())
        expected_sections = {
            "nav", "footer", "explorer", "comparator", "trends",
            "wizard", "drawer", "modal", "universityModal", "common"
        }
        assert tr_sections == expected_sections, f"TR missing/extra sections: {tr_sections ^ expected_sections}"
        assert en_sections == expected_sections, f"EN missing/extra sections: {en_sections ^ expected_sections}"

    def test_all_nested_keys_match_exactly(self):
        """Verify 100% key parity between TR and EN locale dictionaries (no missing translation keys)."""
        tr_key_set = set(self.tr_keys.keys())
        en_key_set = set(self.en_keys.keys())

        missing_in_en = tr_key_set - en_key_set
        missing_in_tr = en_key_set - tr_key_set

        assert not missing_in_en, f"Keys in TR but missing in EN: {missing_in_en}"
        assert not missing_in_tr, f"Keys in EN but missing in TR: {missing_in_tr}"

    def test_locale_value_types_match(self):
        """Verify value types (e.g. string vs dict) match for all keys in TR and EN."""
        for key, (tr_type, _) in self.tr_keys.items():
            en_type, _ = self.en_keys[key]
            assert tr_type == en_type, f"Type mismatch for key '{key}': TR={tr_type}, EN={en_type}"

    def test_placeholder_formatting_sync(self):
        """Verify placeholder format variables (e.g. {page}, {min}, {code}) are synchronized across languages."""
        mismatched_placeholders = []
        for key, (_, tr_placeholders) in self.tr_keys.items():
            _, en_placeholders = self.en_keys[key]
            if tr_placeholders != en_placeholders:
                mismatched_placeholders.append(
                    f"Key '{key}': TR placeholders {tr_placeholders} vs EN placeholders {en_placeholders}"
                )
        assert not mismatched_placeholders, "\n".join(mismatched_placeholders)

    def test_use_language_hook_integrates_locales(self):
        """Verify useLanguage.jsx imports and provides both tr and en dictionary resources."""
        content = USE_LANG_HOOK_PATH.read_text("utf-8")
        assert "tr" in content
        assert "en" in content
        assert "LanguageContext" in content or "useLanguage" in content


if __name__ == "__main__":
    pytest.main(["-v", __file__])
