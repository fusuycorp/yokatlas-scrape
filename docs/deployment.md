# Production Deployment Guide: Docker Swarm & Dokploy

This document details the production deployment pipeline for **UniAtlas** (`atlas.bogazici.app`) using Dokploy, Docker Swarm stacks, custom container registries, and GitHub Actions.

---

## Infrastructure Topology

```
[Internet Users]
      │
      ▼
[Traefik Reverse Proxy (Dokploy Node: tanri)]
      │
      ▼ (Port 8000 overlay network)
[UniAtlas Swarm Replicas (FastAPI + Embedded React Frontend + SQLite)]
```

---

## Domain & Registry Configuration

- **Domain**: `atlas.bogazici.app`
- **Port**: `8000`
- **Service Name**: `uniyok-atlas`
- **Container Image**: `registry.bogazici.app/budok/uniyok-atlas:latest`
- **Dokploy Stack ID**: `XDOIv2PdTkrsjfzu5eSRH`

---

## ⚡ Deployment Guidelines & Best Practices

1. **Cloudflare 413 Payload Too Large Prevention**:
   - Keep production Docker container images **< 25MB** and layer sizes **< 15MB**.
   - Do **NOT** include heavy development/ETL dependencies (`pandas`, `pyarrow`, `openpyxl`) in production Docker runtime images.
   - Store only the compressed database asset (`output/unified_dashboard.db.gz`, ~15MB) in the container layer. `server.py` auto-decompresses it in **0.1s** on initial container boot.

2. **Container Healthcheck Safety**:
   - `python:3.12-slim` base image does not include `curl` by default.
   - Always install `curl` in `Dockerfile` AND use a Python standard library `urllib` fallback test in `docker-stack.yml`:
     ```yaml
     healthcheck:
       test: ["CMD-SHELL", "python3 -c \"import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/stats')\" || curl -f http://127.0.0.1:8000/api/stats || exit 1"]
     ```

3. **Dokploy Compose Domain Rules**:
   - When modifying domains in the Dokploy UI, a **Redeploy / Sync** of the Compose stack is required so Dokploy injects updated Traefik labels into the running container tasks.

---

## Docker Swarm Service Specification (`docker-stack.yml`)

```yaml
version: '3.8'

services:
  uniyok-atlas:
    image: ${IMAGE_TAG:-registry.bogazici.app/budok/uniyok-atlas:latest}
    environment:
      PORT: 8000
    networks:
      - dokploy-network
    healthcheck:
      test: ["CMD-SHELL", "python3 -c \"import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/stats')\" || curl -f http://127.0.0.1:8000/api/stats || exit 1"]
    deploy:
      replicas: 2
      update_config:
        order: start-first
      placement:
        constraints:
          - node.labels.type == tanri
      resources:
        reservations:
          cpus: '0.50'
          memory: 512M
        limits:
          cpus: '2.0'
          memory: 2G
      labels:
        - traefik.enable=true
        - traefik.http.routers.uniyok-atlas.rule=Host("atlas.bogazici.app")
        - traefik.http.routers.uniyok-atlas.entrypoints=websecure
        - traefik.http.routers.uniyok-atlas.tls.certresolver=letsencrypt
        - traefik.http.services.uniyok-atlas.loadbalancer.server.port=8000

networks:
  dokploy-network:
    external: true
```
