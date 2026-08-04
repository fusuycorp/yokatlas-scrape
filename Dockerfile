# Stage 1: Build React Frontend with Bun (No Node)
FROM oven/bun:1-alpine AS frontend-builder
WORKDIR /app/dashboard-ui
COPY dashboard-ui/package*.json ./
RUN bun install
COPY dashboard-ui/ ./
RUN bun run build

# Stage 2: Python Runtime
FROM python:3.12-slim

WORKDIR /app

# Set up non-root user first
RUN useradd -m -s /bin/bash appuser

# Install curl for health checks and lightweight runtime packages
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir fastapi uvicorn

# Copy minimal files with proper ownership to avoid chown layer bloat
COPY --chown=appuser:appuser server.py ./
COPY --chown=appuser:appuser output/unified_dashboard.db.gz ./output/
COPY --chown=appuser:appuser --from=frontend-builder /app/dashboard-ui/dist ./dashboard-ui/dist

USER appuser

EXPOSE 8000
ENV PORT=8000

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
