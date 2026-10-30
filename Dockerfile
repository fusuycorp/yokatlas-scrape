# Stage 1: Build React Frontend with Bun (No Node)
FROM --platform=$BUILDPLATFORM oven/bun:1.4.2-alpine AS frontend-builder
WORKDIR /app/dashboard-ui
COPY dashboard-ui/package.json dashboard-ui/bun.lock ./
RUN bun install --frozen-lockfile
COPY dashboard-ui/ ./
RUN bun run build

# Stage 2: Python Runtime
FROM python:3.12-slim-bookworm

WORKDIR /app

# Set up non-root user first
RUN useradd -m -s /bin/bash appuser

# Install curl for health checks and lightweight runtime packages
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir "fastapi==0.141.1" "uvicorn==0.52.0" "starlette==1.3.1" "pydantic==2.13.4"

# Copy minimal files with proper ownership to avoid chown layer bloat
RUN mkdir -p /app/output && chown -R appuser:appuser /app
COPY --chown=appuser:appuser server.py ./
COPY --chown=appuser:appuser output/unified_dashboard.db.gz ./output/
COPY --chown=appuser:appuser --from=frontend-builder /app/dashboard-ui/dist ./dashboard-ui/dist

USER appuser

EXPOSE 8000
ENV PORT=8000

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
