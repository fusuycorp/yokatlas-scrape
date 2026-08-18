import pytest
from fastapi.testclient import TestClient
import os
from server import app

client = TestClient(app)

def setup_module(module):
    os.makedirs("dashboard-ui/dist", exist_ok=True)
    index_file = "dashboard-ui/dist/index.html"
    if not os.path.exists(index_file):
        with open(index_file, "w", encoding="utf-8") as f:
            f.write("<html><head><title>Vite App</title></head><body><div id=\"root\"></div></body></html>")

def test_robots_txt():
    response = client.get("/robots.txt")
    assert response.status_code == 200
    assert "text/plain" in response.headers["content-type"]
    assert "Cache-Control" in response.headers
    assert "Sitemap: https://atlas.bogazici.app/sitemap.xml" in response.text

def test_sitemaps():
    response = client.get("/sitemap.xml")
    assert response.status_code == 200
    assert "application/xml" in response.headers["content-type"]
    assert "Cache-Control" in response.headers
    assert "sitemap-static.xml" in response.text

    response = client.get("/sitemap-universities.xml")
    assert response.status_code == 200
    assert "application/xml" in response.headers["content-type"]
    assert "Cache-Control" in response.headers
    assert "<loc>" in response.text

    response = client.get("/sitemap-programs.xml")
    assert response.status_code == 200
    assert "application/xml" in response.headers["content-type"]
    assert "Cache-Control" in response.headers
    assert "<loc>" in response.text

def test_dynamic_university_html():
    response = client.get("/universite/bogazici-universitesi")
    assert response.status_code == 200
    assert "boğaziçi üniversitesi" in response.text.lower()
    assert "og:title" in response.text
    assert "og:image" in response.text
    assert "application/ld+json" in response.text
    assert "CollegeOrUniversity" in response.text
    assert "<noscript>" in response.text
    assert 'href="https://atlas.bogazici.app/universite/bogazici-universitesi"' in response.text

def test_dynamic_program_html():
    response = client.get("/program/203110477")
    assert response.status_code == 200
    assert "og:title" in response.text
    assert "og:image" in response.text
    assert "application/ld+json" in response.text
    assert "EducationalOccupationalProgram" in response.text
    assert "<noscript>" in response.text
    assert 'href="https://atlas.bogazici.app/program/203110477"' in response.text

def test_root_seo_html():
    response = client.get("/")
    assert response.status_code == 200
    assert "2026 YKS taban puanları" in response.text
    assert "og:image" in response.text
    assert "application/ld+json" in response.text
    assert "SearchAction" in response.text
    assert "<noscript>" in response.text
    assert 'href="https://atlas.bogazici.app/"' in response.text
    assert 'content="https://atlas.bogazici.app/"' in response.text

def test_static_routes_seo_html():
    for route, expected_word in [
        ("/karsilastir", "Karşılaştırma"),
        ("/trendler", "Trendleri"),
        ("/tercih-sihirbazi", "Sihirbazı")
    ]:
        response = client.get(route)
        assert response.status_code == 200
        assert expected_word.lower() in response.text.lower()
        assert "application/ld+json" in response.text
        assert "<noscript>" in response.text
