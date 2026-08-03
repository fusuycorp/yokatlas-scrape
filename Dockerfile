# Stage 1: Build React Frontend with Bun (No Node)
FROM oven/bun:1-alpine AS frontend-builder
WORKDIR /app/dashboard-ui
COPY dashboard-ui/package*.json ./
RUN bun install
COPY dashboard-ui/ ./
RUN bun run build

# Stage 2: Python Runtime
FROM python:3.12-alpine

WORKDIR /app

# Install ONLY lightweight runtime packages
RUN pip install --no-cache-dir fastapi "uvicorn[standard]"

# Copy minimal files
COPY server.py ./
COPY output/unified_dashboard.db.gz ./output/
COPY --from=frontend-builder /app/dashboard-ui/dist ./dashboard-ui/dist

# Set up non-root user
RUN adduser -D appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
ENV PORT=8000

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
