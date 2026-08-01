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

## Environment & Registry Secrets

To configure CI/CD deployment, add the following Repository Secrets in GitHub (**Settings > Secrets and variables > Actions**):

| Secret Name | Value / Description | Required |
| :--- | :--- | :---: |
| `REGISTRY_USERNAME` | Username for `registry.bogazici.app` | **Yes** |
| `REGISTRY_PASSWORD` | Access token / Password for `registry.bogazici.app` | **Yes** |
| `DOKPLOY_API_KEY` | API Key generated in Dokploy Settings | **Yes** |
| `DOKPLOY_URL` | `https://dokploy.bogazici.app` | Optional |
| `DOKPLOY_COMPOSE_ID` | Compose Stack ID created in Dokploy for `uniatlas` | **Yes** |

---

## Docker Swarm Service Specification (`docker-stack.yml`)

```yaml
version: '3.8'

services:
  uniatlas:
    image: ${IMAGE_TAG:-registry.bogazici.app/budok/uniatlas:latest}
    environment:
      PORT: 8000
    networks:
      - dokploy-network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://127.0.0.1:8000/api/stats || exit 1"]
      interval: 20s
      timeout: 5s
      retries: 3
      start_period: 15s
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      restart_policy:
        condition: on-failure
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
        - "traefik.enable=true"
        - "traefik.http.routers.uniatlas.rule=Host(`atlas.bogazici.app`)"
        - "traefik.http.routers.uniatlas.entrypoints=websecure"
        - "traefik.http.routers.uniatlas.tls.certresolver=letsencrypt"
        - "traefik.http.services.uniatlas.loadbalancer.server.port=8000"

networks:
  dokploy-network:
    external: true
```

---

## GitHub Actions Automated Deployment Workflow

The workflow file [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) automatically triggers upon pushes to `main`:

```yaml
name: Build, Push and Deploy UniAtlas (YÖK Atlas & YKS Analytics)

on:
  push:
    branches:
      - main
    paths-ignore:
      - '**.md'
      - '.gitignore'
  workflow_dispatch:

jobs:
  build-and-push:
    name: Build & Push Container Image
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Custom Registry
        uses: docker/login-action@v3
        with:
          registry: registry.bogazici.app
          username: ${{ secrets.REGISTRY_USERNAME }}
          password: ${{ secrets.REGISTRY_PASSWORD }}

      - name: Extract Metadata for Image
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: registry.bogazici.app/budok/uniatlas
          tags: |
            type=raw,value=latest
            type=sha,format=long

      - name: Build and Push Docker Image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    name: Trigger Dokploy Redeployment
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Dokploy Stack Redeployment
        env:
          DOKPLOY_URL: ${{ secrets.DOKPLOY_URL || 'https://dokploy.bogazici.app' }}
          DOKPLOY_API_KEY: ${{ secrets.DOKPLOY_API_KEY }}
          DOKPLOY_COMPOSE_ID: ${{ secrets.DOKPLOY_COMPOSE_ID }}
        run: |
          curl -f -s -S -X POST "$DOKPLOY_URL/api/compose.redeploy" \
            -H "x-api-key: $DOKPLOY_API_KEY" \
            -H "Content-Type: application/json" \
            -d "{\"composeId\": \"$DOKPLOY_COMPOSE_ID\"}"
```

---

## Verification & Troubleshooting

- **Check Container Health**: `docker service ps uniatlas`
- **View Container Logs**: `docker service logs uniatlas`
- **Verify API Health**: `curl https://atlas.bogazici.app/api/stats`
