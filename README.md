# UniAtlas (YÖK ATLAS Scraper & YKS University Analytics Platform)

[![Build & Deploy](https://github.com/fusuyfusuy/uniyok-atlas/actions/workflows/deploy.yml/badge.svg)](https://github.com/fusuyfusuy/uniyok-atlas/actions/workflows/deploy.yml)

**UniAtlas** (`atlas.bogazici.app`) is an intelligence platform and web dashboard combining real-time **2026 YÖK ATLAS scraped program data** (21,493 programs) with **2019–2024 Kaggle YKS university admissions analytics** (128,000+ historical entries & 1,000,000+ subject net stats).

---

## 📚 Technical Documentation

Complete documentation is organized in the [`docs/`](./docs/) directory:

- 📘 [**Project Overview**](./docs/project_overview.md) - Scope, goals, problem statement, features.
- 🏗️ [**System Architecture**](./docs/architecture.md) - Component design, tech stack rationale, container topology.
- 🔄 [**Data Pipeline & ETL**](./docs/data_pipeline.md) - Header rotators, asyncio scraper, Kaggle dataset integration, SQLite schema.
- 🔌 [**REST API Reference**](./docs/api_reference.md) - FastAPI endpoints, parameters, and response schemas.
- 🛠️ [**Coding Standards**](./docs/coding_standards.md) - Development guidelines, Python (`uv`), React, and Git conventions.
- 🚀 [**Production Deployment**](./docs/deployment.md) - Dokploy, Docker Swarm stack, custom registry, Traefik SSL.

---

## ⚡ Quick Start

### 1. Local Development Setup

Requirements: [uv](https://github.com/astral-sh/uv) (Python 3.12+) and Node.js 22+.

```bash
# Clone the repository
git clone git@github.com:fusuyfusuy/uniyok-atlas.git
cd uniyok-atlas

# Install Python dependencies
uv sync

# Run data scraper (fetches 2,150 pages with size 10)
uv run main.py --concurrency 20

# Construct unified database
uv run python build_unified_db.py

# Install & build frontend
cd dashboard-ui && npm install && npm run build && cd ..

# Run backend API server
uv run uvicorn server:app --host 0.0.0.0 --port 8000
```

Access the dashboard at `http://localhost:8000/`.

---

## 🐳 Docker Container Build

```bash
# Build production Docker image
docker build -t registry.bogazici.app/budok/uniatlas:latest .

# Run container locally
docker run -p 8000:8000 registry.bogazici.app/budok/uniatlas:latest
```

---

## 📄 License & Attribution

- Scraped Data: YÖK ATLAS Official Guide (`yokatlas.yok.gov.tr`)
- Historical Data: Kaggle Turkish University Admissions (`ramazanizci/turkish-university-admissions`)
