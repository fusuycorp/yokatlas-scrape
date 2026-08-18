"""
Security & hardening regression tests for the fixes landed after the code/security review:

1. SPA catch-all path-traversal containment (LFI).
2. Reflected XSS / JSON-LD breakout escaping in the SEO pre-render.
3. Unknown /api/* paths return a JSON 404 instead of SPA HTML.
4. Query parameter bounds (limit/page/compare/wizard) reject pathological inputs.
5. Cache-Control headers on static endpoints.
"""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from server import app

client = TestClient(app)


class TestPathTraversalContainment:
    """The SPA catch-all must never serve files outside the build directory."""

    def test_absolute_etc_passwd_not_leaked(self):
        resp = client.get("//etc/passwd")
        assert resp.status_code == 200  # served as SPA shell, not the file
        assert "root:x:0:0" not in resp.text

    def test_dotdot_server_source_not_leaked(self):
        resp = client.get("/../../server.py")
        assert resp.status_code != 200 or "FastAPI Backend Engine" not in resp.text

    def test_dotdot_database_gz_not_leaked(self):
        resp = client.get("/../../output/unified_dashboard.db.gz")
        # The 34 MB database must never be served; any leak dwarfs the HTML shell.
        assert len(resp.content) < 100_000

    def test_unknown_api_path_is_404(self):
        resp = client.get("/api/nonexistent")
        assert resp.status_code == 404
        assert resp.headers["content-type"].startswith("application/json")


class TestSeoInjectionEscaping:
    """Attacker-controlled path segments must not inject markup into the SEO pre-render."""

    def test_xss_in_url_escaped(self):
        resp = client.get('/%22%3E%3Cscript%3Ealert(1)%3C/script%3E')
        assert resp.status_code == 200
        assert "<script>alert(1)</script>" not in resp.text

    def test_xss_in_program_code_escaped(self):
        resp = client.get('/program/999%22%3E%3Csvg%20onload=alert(1)%3E')
        assert resp.status_code == 200
        assert "<svg onload" not in resp.text

    def test_jsonld_script_tag_breakout_escaped(self):
        resp = client.get('/universite/istanbul-gelisim-universitesi/%3C/script%3E%3Cimg%20src=x')
        assert resp.status_code == 200
        assert "</script><img" not in resp.text


class TestParameterBounds:
    """/api/programs and /api/compare reject pathological pagination/limits."""

    def test_limit_zero_rejected(self):
        assert client.get("/api/programs?limit=0").status_code == 422

    def test_limit_negative_rejected(self):
        assert client.get("/api/programs?limit=-1").status_code == 422

    def test_page_zero_rejected(self):
        assert client.get("/api/programs?page=0").status_code == 422

    def test_compare_too_many_unis_rejected(self):
        unis = "&".join([f"unis=U{i}" for i in range(11)])
        assert client.get(f"/api/compare?{unis}").status_code == 422

    def test_compare_single_uni_400(self):
        assert client.get("/api/compare?unis=BOĞAZİÇİ ÜNİVERSİTESİ (İSTANBUL)").status_code == 400


class TestCacheControl:
    def test_api_stats_cache_control(self):
        resp = client.get("/api/stats")
        assert "max-age" in resp.headers.get("Cache-Control", "")


class TestSlugParity:
    """The SPA slugify (utils/slugs.js) and the server slugify (server.py) must agree for
    every university, otherwise deep-linked /universite/:slug pages 404. Mirrors the JS
    algorithm here so this can run in the Python test suite."""

    @staticmethod
    def _js_slug(name):
        import re as _re
        s = name.replace("\u0130", "i").replace("I", "\u0131").lower()
        for a, b in [("\u011f", "g"), ("\u00fc", "u"), ("\u015f", "s"), ("\u0131", "i"), ("\u00f6", "o"), ("\u00e7", "c")]:
            s = s.replace(a, b)
        s = _re.sub(r"[^a-z0-9]+", "-", s)
        return s.strip("-")

    def test_spa_slug_matches_server_slug_for_all_universities(self):
        import sqlite3
        from server import slugify_turkish
        db = PROJECT_ROOT / "output" / "unified_dashboard.db"
        conn = sqlite3.connect(str(db))
        names = [r[0] for r in conn.execute("SELECT DISTINCT universiteAdi FROM programs_2026")]
        conn.close()
        mismatch = [n for n in names if slugify_turkish(n) != self._js_slug(n)]
        assert not mismatch, f"Slug mismatch for: {mismatch[:5]}"


if __name__ == "__main__":
    pytest.main(["-v", __file__])
