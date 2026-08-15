"""
UniAtlas Comprehensive API & Normalization Test Suite.
Tests:
1. Turkish String Normalization & Slugification Helpers (tr_lower, title_turkish, slugify_turkish, tr_normalize, get_uni_name_from_slug)
2. Global Statistics Endpoint (/api/stats)
3. Universities Search & Listing Endpoint (/api/universities)
4. Programs Filter Engine, Normalization, Pagination & Sorting (/api/programs)
5. University Comparison Engine & Edge Cases (/api/compare)
6. YKS Preference Wizard Bucket Allocation & Validation (/api/wizard)
7. Database Connection & Decompression Utilities
"""

import gzip
import sys
import unittest.mock as mock
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from server import (
    app,
    tr_lower,
    title_turkish,
    slugify_turkish,
    tr_normalize,
    get_uni_name_from_slug,
    decompress_db_if_needed,
    get_db,
)

client = TestClient(app)


# ==============================================================================
# 1. Turkish Normalization & Slugification Tests
# ==============================================================================
class TestTurkishNormalization:
    """Unit tests for Turkish character manipulation and text normalization routines."""

    def test_tr_lower_basic_and_turkish_chars(self):
        """Test lowercase conversion preserving Turkish dotted/dotless I correctly."""
        assert tr_lower("İSTANBUL") == "istanbul"
        assert tr_lower("IĞDIR") == "ığdır"
        assert tr_lower("ŞİŞLİ ÇANKAYA ÖĞRETMEN") == "şişli çankaya öğretmen"
        assert tr_lower("ABC") == "abc"
        assert tr_lower("") == ""
        assert tr_lower(None) == ""

    def test_title_turkish_words(self):
        """Test title-casing words considering Turkish 'i' -> 'İ' and 'ı' -> 'I' rules."""
        assert title_turkish("istanbul boğaziçi üniversitesi") == "İstanbul Boğaziçi Üniversitesi"
        assert title_turkish("ışık üniversitesi") == "Işık Üniversitesi"
        assert title_turkish("ANKARA ÜNİVERSİTESİ") == "Ankara Üniversitesi"
        assert title_turkish("iğdır üniversitesi") == "İğdır Üniversitesi"
        assert title_turkish("") == ""
        assert title_turkish(None) == ""

    def test_slugify_turkish(self):
        """Test URL slug generation removing Turkish special chars and non-alphanumerics."""
        assert slugify_turkish("Boğaziçi Üniversitesi (İSTANBUL)") == "bogazici-universitesi-istanbul"
        assert slugify_turkish("Orta Doğu Teknik Üniversitesi") == "orta-dogu-teknik-universitesi"
        assert slugify_turkish("Öğretmenlik & Mühendislik - Çeviri / 2026") == "ogretmenlik-muhendislik-ceviri-2026"
        assert slugify_turkish("   ---Çok---Özel--- ") == "cok-ozel"
        assert slugify_turkish("") == ""
        assert slugify_turkish(None) == ""

    def test_tr_normalize(self):
        """Test search normalization transliterating Turkish accents to ASCII."""
        assert tr_normalize("ÇÖŞĞÜIİ") == "cosguii"
        assert tr_normalize("İstanbul") == "istanbul"
        assert tr_normalize("Sağlık Bilimleri") == "saglik bilimleri"
        assert tr_normalize("") == ""
        assert tr_normalize(None) == ""

    def test_get_uni_name_from_slug(self):
        """Test university lookup from slug with and without city suffix in cache."""
        uni_name = get_uni_name_from_slug("bogazici-universitesi")
        assert uni_name is not None
        assert "BOĞAZİÇİ" in uni_name

        # Full slug with city
        uni_with_city = get_uni_name_from_slug("bogazici-universitesi-istanbul")
        assert uni_with_city is not None
        assert "BOĞAZİÇİ" in uni_with_city

        # Non-existent slug returns None
        assert get_uni_name_from_slug("non-existent-university-slug-12345") is None


# ==============================================================================
# 2. Global Statistics Endpoint Tests (/api/stats)
# ==============================================================================
class TestGlobalStatsAPI:
    """Integration tests for GET /api/stats."""

    def test_get_stats_response_status_and_schema(self):
        """Test /api/stats returns HTTP 200 with all required top-level schema keys."""
        response = client.get("/api/stats")
        assert response.status_code == 200

        data = response.json()
        assert "total_universities" in data
        assert "total_programs" in data
        assert "total_cities" in data
        assert "university_types" in data
        assert "score_types" in data

    def test_get_stats_counts_sanity_and_ranges(self):
        """Verify numeric stats are strictly positive non-zero quantities."""
        response = client.get("/api/stats")
        assert response.status_code == 200
        data = response.json()

        assert isinstance(data["total_universities"], int)
        assert data["total_universities"] > 100

        assert isinstance(data["total_programs"], int)
        assert data["total_programs"] > 10000

        assert isinstance(data["total_cities"], int)
        assert 70 <= data["total_cities"] <= 85

    def test_get_stats_university_and_score_type_distributions(self):
        """Verify presence of core Turkish university types and YKS score categories."""
        response = client.get("/api/stats")
        data = response.json()

        uni_types = data["university_types"]
        assert isinstance(uni_types, dict)
        assert "DEVLET" in uni_types or "Devlet" in uni_types
        assert "VAKIF" in uni_types or "Vakıf" in uni_types

        score_types = data["score_types"]
        assert isinstance(score_types, dict)
        assert "SAY" in score_types
        assert "EA" in score_types
        assert "SÖZ" in score_types
        assert "DİL" in score_types


# ==============================================================================
# 3. Universities Search & Listing Endpoint Tests (/api/universities)
# ==============================================================================
class TestUniversitiesAPI:
    """Integration tests for GET /api/universities."""

    def test_get_universities_all(self):
        """Test retrieving list of all universities without search query."""
        response = client.get("/api/universities")
        assert response.status_code == 200
        data = response.json()

        assert "universities" in data
        unis = data["universities"]
        assert isinstance(unis, list)
        assert len(unis) > 100

        # Check fields of university objects
        first = unis[0]
        expected_fields = [
            "universiteAdi", "universiteTuru", "ilAdi", "program_count",
            "total_prof", "total_doc", "total_dou", "total_argor"
        ]
        for field in expected_fields:
            assert field in first, f"Missing field in university row: {field}"

    def test_get_universities_default_order_by_program_count(self):
        """Verify universities are sorted in descending order of program_count."""
        response = client.get("/api/universities")
        unis = response.json()["universities"]
        counts = [u["program_count"] for u in unis]
        assert counts == sorted(counts, reverse=True)

    def test_get_universities_search_exact_and_partial(self):
        """Test searching universities with exact and partial keywords."""
        response = client.get("/api/universities?search=Boğaziçi")
        assert response.status_code == 200
        unis = response.json()["universities"]
        assert len(unis) >= 1
        assert any("BOĞAZİÇİ" in u["universiteAdi"].upper() for u in unis)

    def test_get_universities_search_turkish_normalization(self):
        """Verify search matches regardless of ASCII vs Turkish accents and casing."""
        # Query with ASCII lowercase 'bogazici'
        res_ascii = client.get("/api/universities?search=bogazici")
        # Query with Turkish uppercase 'BOĞAZİÇİ'
        res_tr = client.get("/api/universities?search=BO%C4%9EAZ%C4%B0%C3%87%C4%B0")
        assert res_ascii.status_code == 200
        assert res_tr.status_code == 200
        assert len(res_ascii.json()["universities"]) == len(res_tr.json()["universities"])

    def test_get_universities_search_no_results(self):
        """Verify search with non-existent query returns empty list with 200 OK."""
        response = client.get("/api/universities?search=NON_EXISTENT_UNI_QUERY_XYZ_123")
        assert response.status_code == 200
        data = response.json()
        assert data["universities"] == []

    def test_get_universities_search_empty_param(self):
        """Verify empty search query string behaves the same as omitting the parameter."""
        res_empty = client.get("/api/universities?search=")
        res_none = client.get("/api/universities")
        assert res_empty.status_code == 200
        assert len(res_empty.json()["universities"]) == len(res_none.json()["universities"])


# ==============================================================================
# 4. Programs Endpoint Tests (/api/programs)
# ==============================================================================
class TestProgramsAPI:
    """Comprehensive tests for GET /api/programs: filtering, sorting, searching, pagination."""

    def test_get_programs_default_pagination_and_schema(self):
        """Test default page, limit, and schema of program rows."""
        response = client.get("/api/programs")
        assert response.status_code == 200
        data = response.json()

        assert "total" in data
        assert "page" in data
        assert "limit" in data
        assert "total_pages" in data
        assert "programs" in data

        assert data["page"] == 1
        assert data["limit"] == 20
        assert data["total"] > 10000
        assert len(data["programs"]) == 20

        sample = data["programs"][0]
        expected_fields = [
            "kilavuzKodu", "osymKilavuzId", "universiteAdi", "universiteTuru",
            "ilAdi", "fymkAdi", "birimAdi", "puanTuru", "bursOraniAdi",
            "kontenjan", "basariSirasi", "minPuan", "minBasariSirasiKosul",
            "kosul_ids_extracted", "prof", "doc", "dou", "arGor",
            "akreditasyon", "akreditasyonAck"
        ]
        for field in expected_fields:
            assert field in sample, f"Program missing required key: {field}"

    def test_get_programs_filter_score_type_single(self):
        """Filter by single score type (e.g. SAY)."""
        response = client.get("/api/programs?score_type=SAY&limit=50")
        assert response.status_code == 200
        programs = response.json()["programs"]
        assert len(programs) > 0
        for p in programs:
            assert p["puanTuru"] == "SAY"

    def test_get_programs_filter_score_type_multi(self):
        """Filter by multiple comma-separated score types (e.g. SAY,EA)."""
        response = client.get("/api/programs?score_type=SAY,EA&limit=50")
        assert response.status_code == 200
        programs = response.json()["programs"]
        assert len(programs) > 0
        for p in programs:
            assert p["puanTuru"] in ["SAY", "EA"]

    def test_get_programs_filter_uni_type_single(self):
        """Filter by single university type (e.g. DEVLET)."""
        response = client.get("/api/programs?uni_type=DEVLET&limit=50")
        assert response.status_code == 200
        programs = response.json()["programs"]
        assert len(programs) > 0
        for p in programs:
            assert p["universiteTuru"] == "DEVLET"

    def test_get_programs_filter_uni_type_multi(self):
        """Filter by multiple comma-separated university types (e.g. DEVLET,VAKIF)."""
        response = client.get("/api/programs?uni_type=DEVLET,VAKIF&limit=50")
        assert response.status_code == 200
        programs = response.json()["programs"]
        assert len(programs) > 0
        for p in programs:
            assert p["universiteTuru"] in ["DEVLET", "VAKIF"]

    def test_get_programs_filter_exact_university(self):
        """Filter by exact university name."""
        uni_name = "BOĞAZİÇİ ÜNİVERSİTESİ (İSTANBUL)"
        response = client.get(f"/api/programs?university={uni_name}&limit=50")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] > 0
        for p in data["programs"]:
            assert p["universiteAdi"] == uni_name

    def test_get_programs_filter_exact_city(self):
        """Filter by exact city name."""
        city = "İZMİR"
        response = client.get(f"/api/programs?city={city}&limit=50")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] > 0
        for p in data["programs"]:
            assert p["ilAdi"] == city

    def test_get_programs_filter_rank_range(self):
        """Filter by min_rank and max_rank boundaries."""
        min_r = 5000
        max_r = 15000
        response = client.get(f"/api/programs?min_rank={min_r}&max_rank={max_r}&limit=50")
        assert response.status_code == 200
        programs = response.json()["programs"]
        assert len(programs) > 0
        for p in programs:
            assert p["basariSirasi"] is not None
            assert min_r <= p["basariSirasi"] <= max_r

    def test_get_programs_filter_min_rank_only(self):
        """Filter programs with rank >= min_rank."""
        min_r = 100000
        response = client.get(f"/api/programs?min_rank={min_r}&limit=50")
        assert response.status_code == 200
        for p in response.json()["programs"]:
            assert p["basariSirasi"] >= min_r

    def test_get_programs_filter_max_rank_only(self):
        """Filter programs with rank <= max_rank."""
        max_r = 2000
        response = client.get(f"/api/programs?max_rank={max_r}&limit=50")
        assert response.status_code == 200
        for p in response.json()["programs"]:
            assert p["basariSirasi"] <= max_r

    def test_get_programs_filter_combined_multi_criteria(self):
        """Test combination of multiple filter parameters simultaneously."""
        params = {
            "score_type": "SAY",
            "uni_type": "DEVLET",
            "city": "ANKARA",
            "min_rank": 1000,
            "max_rank": 50000,
            "limit": 25,
        }
        response = client.get("/api/programs", params=params)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] > 0
        for p in data["programs"]:
            assert p["puanTuru"] == "SAY"
            assert p["universiteTuru"] == "DEVLET"
            assert p["ilAdi"] == "ANKARA"
            assert 1000 <= p["basariSirasi"] <= 50000

    def test_get_programs_search_normalized_query(self):
        """Search query matches across department names with Turkish character variations."""
        res1 = client.get("/api/programs?search=bilgisayar&limit=20")
        res2 = client.get("/api/programs?search=B%C4%B0LG%C4%B0SAYAR&limit=20")
        assert res1.status_code == 200
        assert res2.status_code == 200
        assert res1.json()["total"] == res2.json()["total"]
        assert res1.json()["total"] > 0

    def test_get_programs_pagination_limits_and_offsets(self):
        """Verify non-overlapping pages with correct pagination metadata."""
        res_p1 = client.get("/api/programs?page=1&limit=10")
        res_p2 = client.get("/api/programs?page=2&limit=10")

        assert res_p1.status_code == 200
        assert res_p2.status_code == 200

        data_p1 = res_p1.json()
        data_p2 = res_p2.json()

        assert data_p1["page"] == 1
        assert data_p2["page"] == 2
        assert len(data_p1["programs"]) == 10
        assert len(data_p2["programs"]) == 10

        p1_codes = [p["kilavuzKodu"] for p in data_p1["programs"]]
        p2_codes = [p["kilavuzKodu"] for p in data_p2["programs"]]
        # Non-overlapping items
        assert set(p1_codes).isdisjoint(set(p2_codes))

    def test_get_programs_pagination_out_of_bounds(self):
        """Requesting page far beyond total_pages returns empty programs list with total preserved."""
        response = client.get("/api/programs?page=999999&limit=20")
        assert response.status_code == 200
        data = response.json()
        assert data["programs"] == []
        assert data["total"] > 0

    def test_get_programs_sorting_rank_asc_and_desc(self):
        """Verify sorting by basariSirasi ASC (best/lowest first) and DESC (highest first)."""
        res_asc = client.get("/api/programs?sort_by=basariSirasi&sort_dir=ASC&limit=20")
        res_desc = client.get("/api/programs?sort_by=basariSirasi&sort_dir=DESC&limit=20")

        assert res_asc.status_code == 200
        assert res_desc.status_code == 200

        ranks_asc = [p["basariSirasi"] for p in res_asc.json()["programs"] if p["basariSirasi"] is not None]
        ranks_desc = [p["basariSirasi"] for p in res_desc.json()["programs"] if p["basariSirasi"] is not None]

        assert ranks_asc == sorted(ranks_asc)
        assert ranks_desc == sorted(ranks_desc, reverse=True)

    def test_get_programs_sorting_min_puan_desc(self):
        """Verify sorting by minPuan DESC puts highest scores first."""
        response = client.get("/api/programs?sort_by=minPuan&sort_dir=DESC&limit=20")
        assert response.status_code == 200
        scores = [p["minPuan"] for p in response.json()["programs"] if p["minPuan"] is not None]
        assert scores == sorted(scores, reverse=True)

    def test_get_programs_sorting_kontenjan(self):
        """Verify sorting by quota (kontenjan) DESC."""
        response = client.get("/api/programs?sort_by=kontenjan&sort_dir=DESC&limit=20")
        assert response.status_code == 200
        quotas = [p["kontenjan"] for p in response.json()["programs"] if p["kontenjan"] is not None]
        assert quotas == sorted(quotas, reverse=True)

    def test_get_programs_sorting_universite_adi(self):
        """Verify sorting alphabetically by universiteAdi."""
        response = client.get("/api/programs?sort_by=universiteAdi&sort_dir=ASC&limit=20")
        assert response.status_code == 200
        unis = [p["universiteAdi"] for p in response.json()["programs"] if p["universiteAdi"]]
        assert unis == sorted(unis)

    def test_get_programs_sorting_birim_adi(self):
        """Verify sorting alphabetically by birimAdi."""
        response = client.get("/api/programs?sort_by=birimAdi&sort_dir=ASC&limit=20")
        assert response.status_code == 200
        depts = [p["birimAdi"] for p in response.json()["programs"] if p["birimAdi"]]
        assert depts == sorted(depts)

    def test_get_programs_sorting_null_ranks_at_end_in_asc(self):
        """Verify non-null ranks appear before null ranks when sorting ASC."""
        response = client.get("/api/programs?sort_by=basariSirasi&sort_dir=ASC&limit=100")
        assert response.status_code == 200
        ranks = [p["basariSirasi"] for p in response.json()["programs"]]
        non_null_seen = False
        null_seen = False
        for r in ranks:
            if r is not None:
                assert not null_seen, "Non-null rank appeared after a null rank in ASC sort"
                non_null_seen = True
            else:
                null_seen = True

    def test_get_programs_empty_search_string(self):
        """Empty search string should return default list identical to omitting search."""
        res_empty = client.get("/api/programs?search=&limit=10")
        res_none = client.get("/api/programs?limit=10")
        assert res_empty.status_code == 200
        assert res_empty.json()["total"] == res_none.json()["total"]

    def test_get_programs_sorting_invalid_column_fallback(self):
        """Passing an unrecognized sort_by fallback gracefully to basariSirasi without crashing."""
        response = client.get("/api/programs?sort_by=invalid_non_existent_field&sort_dir=ASC&limit=10")
        assert response.status_code == 200
        ranks = [p["basariSirasi"] for p in response.json()["programs"] if p["basariSirasi"] is not None]
        assert ranks == sorted(ranks)


# ==============================================================================
# 5. Compare API Tests (/api/compare)
# ==============================================================================
class TestCompareAPI:
    """Integration and validation tests for GET /api/compare."""

    UNI_A = "BOĞAZİÇİ ÜNİVERSİTESİ (İSTANBUL)"
    UNI_B = "ORTA DOĞU TEKNİK ÜNİVERSİTESİ (ANKARA)"
    UNI_C = "İSTANBUL TEKNİK ÜNİVERSİTESİ"

    def test_compare_two_universities_success_and_schema(self):
        """Test valid comparison request with 2 universities."""
        response = client.get(f"/api/compare?unis={self.UNI_A}&unis={self.UNI_B}")
        assert response.status_code == 200
        data = response.json()

        assert "comparison" in data
        assert "score_type_breakdown" in data
        assert "scholarship_breakdown" in data

        comp = data["comparison"]
        assert len(comp) == 2
        uni_names = {u["universiteAdi"] for u in comp}
        assert self.UNI_A in uni_names
        assert self.UNI_B in uni_names

        # Verify comparison fields
        expected_fields = [
            "universiteAdi", "universiteTuru", "ilAdi", "program_count",
            "total_quota", "total_prof", "total_doc", "total_dou", "total_argor",
            "avg_basari_sirasi"
        ]
        for field in expected_fields:
            assert field in comp[0]

    def test_compare_three_universities_success(self):
        """Test comparison request with 3 universities."""
        response = client.get(f"/api/compare?unis={self.UNI_A}&unis={self.UNI_B}&unis={self.UNI_C}")
        assert response.status_code == 200
        data = response.json()
        assert len(data["comparison"]) == 3

    def test_compare_single_university_returns_400(self):
        """Providing fewer than 2 universities returns HTTP 400."""
        response = client.get(f"/api/compare?unis={self.UNI_A}")
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "at least 2 universities" in data["detail"].lower()

    def test_compare_missing_unis_param_returns_422(self):
        """Omitting unis query parameter returns HTTP 422 Unprocessable Entity."""
        response = client.get("/api/compare")
        assert response.status_code == 422

    def test_compare_nonexistent_universities_returns_empty_breakdowns(self):
        """Comparing non-existent university names returns 200 with empty arrays."""
        response = client.get("/api/compare?unis=FAKE_UNI_ALPHA_999&unis=FAKE_UNI_BETA_888")
        assert response.status_code == 200
        data = response.json()
        assert data["comparison"] == []
        assert data["score_type_breakdown"] == []
        assert data["scholarship_breakdown"] == []

    def test_compare_score_and_scholarship_breakdown_schema(self):
        """Verify breakdown lists have expected schema attributes."""
        response = client.get(f"/api/compare?unis={self.UNI_A}&unis={self.UNI_B}")
        data = response.json()

        st_breakdown = data["score_type_breakdown"]
        assert len(st_breakdown) > 0
        assert "puanTuru" in st_breakdown[0]
        assert "count" in st_breakdown[0]

        sch_breakdown = data["scholarship_breakdown"]
        assert len(sch_breakdown) > 0
        assert "burs" in sch_breakdown[0]
        assert "count" in sch_breakdown[0]


# ==============================================================================
# 6. YKS Preference Wizard Tests (/api/wizard)
# ==============================================================================
class TestWizardAPI:
    """Integration and math logic tests for GET /api/wizard."""

    def test_wizard_valid_request_and_schema(self):
        """Test wizard with valid score_type and target_rank returns complete schema."""
        response = client.get("/api/wizard?score_type=SAY&target_rank=50000&limit=10")
        assert response.status_code == 200
        data = response.json()

        assert "student_target_rank" in data
        assert "score_type" in data
        assert "categories" in data

        assert data["student_target_rank"] == 50000
        assert data["score_type"] == "SAY"

        cats = data["categories"]
        assert "reach" in cats
        assert "target" in cats
        assert "safe" in cats

    def test_wizard_bucket_allocation_math(self):
        """Verify bucket rank boundary formulas."""
        target_rank = 50000
        response = client.get(f"/api/wizard?score_type=SAY&target_rank={target_rank}&limit=10")
        cats = response.json()["categories"]

        # Reach: 0.4 * target to 0.8 * target
        expected_reach_min = max(1, int(target_rank * 0.4))
        expected_reach_max = int(target_rank * 0.8)
        assert cats["reach"]["min_rank"] == expected_reach_min
        assert cats["reach"]["max_rank"] == expected_reach_max

        # Target: 0.8 * target to 1.2 * target
        expected_target_min = int(target_rank * 0.8)
        expected_target_max = int(target_rank * 1.2)
        assert cats["target"]["min_rank"] == expected_target_min
        assert cats["target"]["max_rank"] == expected_target_max

        # Safe: 1.2 * target to 2.5 * target
        expected_safe_min = int(target_rank * 1.2)
        expected_safe_max = int(target_rank * 2.5)
        assert cats["safe"]["min_rank"] == expected_safe_min
        assert cats["safe"]["max_rank"] == expected_safe_max

    def test_wizard_bucket_programs_integrity(self):
        """Verify all returned programs in each bucket strictly satisfy score_type and rank bounds."""
        target_rank = 30000
        response = client.get(f"/api/wizard?score_type=SAY&target_rank={target_rank}&limit=15")
        cats = response.json()["categories"]

        for bucket_name in ["reach", "target", "safe"]:
            bucket = cats[bucket_name]
            b_min = bucket["min_rank"]
            b_max = bucket["max_rank"]
            for prog in bucket["programs"]:
                assert prog["puanTuru"] == "SAY"
                assert prog["basariSirasi"] is not None
                assert b_min <= prog["basariSirasi"] <= b_max, (
                    f"Program rank {prog['basariSirasi']} out of {bucket_name} range [{b_min}, {b_max}]"
                )

    def test_wizard_custom_limit_enforced(self):
        """Verify bucket program count does not exceed custom limit."""
        response = client.get("/api/wizard?score_type=SAY&target_rank=50000&limit=5")
        cats = response.json()["categories"]
        for cat in cats.values():
            assert len(cat["programs"]) <= 5

    @pytest.mark.parametrize("score_type", ["SAY", "EA", "SÖZ", "DİL"])
    def test_wizard_all_score_types_supported(self, score_type):
        """Test wizard for all standard YKS score types."""
        response = client.get(f"/api/wizard?score_type={score_type}&target_rank=40000&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert data["score_type"] == score_type

    def test_wizard_small_target_rank_reach_floor(self):
        """When student rank is very small (e.g. 1 or 2), reach min_rank floors at 1."""
        response = client.get("/api/wizard?score_type=SAY&target_rank=1&limit=5")
        assert response.status_code == 200
        cats = response.json()["categories"]
        assert cats["reach"]["min_rank"] == 1

    def test_wizard_missing_score_type_returns_422(self):
        """Missing score_type param returns HTTP 422."""
        response = client.get("/api/wizard?target_rank=50000")
        assert response.status_code == 422

    def test_wizard_missing_target_rank_returns_422(self):
        """Missing target_rank param returns HTTP 422."""
        response = client.get("/api/wizard?score_type=SAY")
        assert response.status_code == 422

    def test_wizard_invalid_target_rank_type_returns_422(self):
        """Invalid non-integer target_rank returns HTTP 422."""
        response = client.get("/api/wizard?score_type=SAY&target_rank=invalid_string")
        assert response.status_code == 422


# ==============================================================================
# 7. Database Connection & Decompress Helper Utilities
# ==============================================================================
class TestDatabaseAndHelperUtilities:
    """Unit and edge case tests for DB connection and decompression routines."""

    def test_decompress_db_if_needed_when_target_missing(self, tmp_path):
        """Decompress unzips .db.gz if target .db does not exist."""
        test_dir = tmp_path / "db_test"
        test_dir.mkdir()
        gz_file = test_dir / "test.db.gz"
        db_file = test_dir / "test.db"

        content = b"TEST_SQLITE_DATABASE_BYTES"
        with gzip.open(gz_file, "wb") as f_out:
            f_out.write(content)

        decompress_db_if_needed(db_file, gz_file)
        assert db_file.exists()
        assert db_file.read_bytes() == content

    def test_decompress_db_if_needed_when_target_already_exists(self, tmp_path):
        """Decompress is a no-op if non-empty .db file already exists."""
        test_dir = tmp_path / "db_test_existing"
        test_dir.mkdir()
        gz_file = test_dir / "test.db.gz"
        db_file = test_dir / "test.db"

        db_file.write_bytes(b"EXISTING_DATA")
        gz_file.write_bytes(b"GZ_DATA")

        decompress_db_if_needed(db_file, gz_file)
        assert db_file.read_bytes() == b"EXISTING_DATA"

    def test_get_db_raises_500_when_no_db_and_no_gz(self):
        """get_db raises HTTP 500 when neither .db nor .db.gz are found."""
        with mock.patch("server.DB_PATH", Path("/tmp/non_existent_path_xyz_123.db")):
            with mock.patch("server.Path.exists", return_value=False):
                with pytest.raises(Exception) as exc_info:
                    get_db()
                assert "500" in str(exc_info.value) or "not found" in str(exc_info.value).lower()
