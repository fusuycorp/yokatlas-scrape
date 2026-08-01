# Stage 1: Build React Frontend with Bun (No Node)
FROM oven/bun:1-alpine AS frontend-builder
WORKDIR /app/dashboard-ui
COPY dashboard-ui/package*.json ./
RUN bun install
COPY dashboard-ui/ ./
RUN bun run build

# Stage 2: Python Runtime with uv
FROM python:3.12-slim

WORKDIR /app

# Install uv package manager and curl for health checks
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Copy dependencies manifest and sync virtualenv
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-cache --no-dev

# Copy application source code & data generator scripts
COPY server.py user_agents.py build_unified_db.py scraper.py exporter.py ./
COPY output/ /app/output/
COPY kaggle_data/ /app/kaggle_data/

# Ensure unified SQLite database exists
RUN uv run python build_unified_db.py

# Copy built static frontend assets from stage 1
COPY --from=frontend-builder /app/dashboard-ui/dist /app/dashboard-ui/dist

EXPOSE 8000

ENV PORT=8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/api/stats || exit 1

CMD ["uv", "run", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
