# UniAtlas Technical Documentation

Welcome to the technical documentation for **UniAtlas** (YÖK ATLAS Scraper & YKS University Analytics Platform).

## Documentation Sitemap

| Document | Description |
| :--- | :--- |
| 📘 [**Project Overview**](./project_overview.md) | High-level goals, core capabilities, problem statement, and dataset scope. |
| 🏗️ [**System Architecture**](./architecture.md) | Complete system layout, data flow diagrams, technology stack, and component interactions. |
| 🔄 [**Data Pipeline & Engine**](./data_pipeline.md) | Scraping algorithms, User-Agent rotation, Kaggle dataset integration, and SQLite relational schemas. |
| 🔌 [**API Reference**](./api_reference.md) | Full endpoint documentation for the FastAPI backend engine with sample requests & responses. |
| 🛠️ [**Coding Standards & Guidelines**](./coding_standards.md) | Code quality standards, styling conventions, project layout, Python (`uv`) and React practices. |
| 🚀 [**Deployment & Infrastructure**](./deployment.md) | Self-hosted deployment instructions for Docker Swarm, Dokploy, custom container registries, and Traefik. |

---

## Quick Navigation

- **Scraper Entrypoint**: [`main.py`](../main.py)
- **Scraper Engine**: [`scraper.py`](../scraper.py)
- **Header Rotator**: [`user_agents.py`](../user_agents.py)
- **Data Integration Script**: [`build_unified_db.py`](../build_unified_db.py)
- **FastAPI Backend Server**: [`server.py`](../server.py)
- **React Frontend**: [`dashboard-ui/`](../dashboard-ui/)
- **Docker Swarm Stack**: [`docker-stack.yml`](../docker-stack.yml)
