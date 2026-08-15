import pytest
from fastapi.testclient import TestClient
import os
from server import app

client = TestClient(app)

def setup_module(module):
    os.makedirs("dashboard-ui/dist", exist_ok=True)
    with open("dashboard-ui/dist/index.html", "w", encoding="utf-8") as f:
        f.write("<html><head><title>Vite App</title></head><body></body></html>")

def test_robots_txt():
    response = client.get("/robots.txt")
    assert response.status_code == 200
    assert "text/plain" in response.headers["content-type"]
    assert "Sitemap: https://atlas.bogazici.app/sitemap.xml" in response.text

def test_sitemaps():
    response = client.get("/sitemap.xml")
    assert response.status_code == 200
    assert "application/xml" in response.headers["content-type"]
    assert "sitemap-static.xml" in response.text

    response = client.get("/sitemap-universities.xml")
    assert response.status_code == 200
    assert "application/xml" in response.headers["content-type"]
    assert "<loc>" in response.text

    response = client.get("/sitemap-programs.xml")
    assert response.status_code == 200
    assert "application/xml" in response.headers["content-type"]
    assert "<loc>" in response.text

def test_dynamic_university_html():
    response = client.get("/universite/bogazici-universitesi")
    assert response.status_code == 200
    assert "boğaziçi üniversitesi" in response.text.lower()
    assert "og:title" in response.text
    assert 'href="https://atlas.bogazici.app/universite/bogazici-universitesi"' in response.text

def test_dynamic_program_html():
    response = client.get("/program/102210283")
    assert response.status_code == 200
    assert "og:title" in response.text
    assert 'href="https://atlas.bogazici.app/program/102210283"' in response.text

def test_root_seo_html():
    response = client.get("/")
    assert response.status_code == 200
    assert "2026 YKS taban puanları" in response.text
    assert 'href="https://atlas.bogazici.app/"' in response.text
    assert 'content="https://atlas.bogazici.app/"' in response.text
