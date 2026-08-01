# Coding Standards & Development Guidelines

This document outlines the coding standards, project layout rules, tool choices, and Git workflows for the **UniAtlas** repository.

---

## 1. Core Principles

- **No Guesses or Assumptions**: Always inspect source data or schema definitions before writing transformations.
- **Fail Fast & Explicit Error Handling**: Raise explicit HTTP exceptions or exit codes when errors occur rather than returning silent empty fallbacks.
- **Modular Component Isolation**: Keep backend endpoints, database engines, scraping rotators, and frontend UI components strictly decoupled.

---

## 2. Python Standards (`uv`, `FastAPI`, `httpx`)

- **Environment Management**: Use `uv` exclusively. Do not call `pip` directly.
  - Adding dependencies: `uv add <package>`
  - Running scripts: `uv run python <script.py>`
- **Formatting & Style**: Follow PEP 8 guidelines. Use 4-space indentation and type annotations where appropriate.
- **Async Execution**: Use non-blocking `asyncio` constructs for networking tasks (`httpx.AsyncClient`).
- **Resource Cleanup**: Always use context managers (`with` / `async with`) for files, database connections, and HTTP sessions.

---

## 3. Frontend Standards (`React`, `Vite`, `Tailwind CSS v4`)

- **Framework & Tooling**: React 18+ scaffolded via `create-vite`.
- **CSS Architecture**: Use Tailwind CSS v4 (`@import "tailwindcss";` in `index.css`). Use glassmorphism utilities (`glass-panel`, `glass-card`) for modern aesthetics.
- **Iconography**: Use `lucide-react` icons. Pass explicit size (`w-4 h-4`) and color classes.
- **State Management**: Keep transient state local to React components. Use `localStorage` cleanly for persistence (e.g., draft preference list).
- **Component File Structure**: Place reusable components under `dashboard-ui/src/components/`.

---

## 4. Database & SQL Guidelines

- **Parameter Binding**: Always use parameterized queries (`cursor.execute("... WHERE id = ?", (id,))`) to prevent SQL injection vulnerabilities.
- **Indexes**: Create indexes on any foreign keys or columns used in `WHERE`, `ORDER BY`, or `JOIN` clauses.
- **Row Factory**: Set `conn.row_factory = sqlite3.Row` in FastAPI handlers to return dict-like objects for JSON responses.

---

## 5. Git & Commit Conventions

Follow Conventional Commits format:
- `feat: ...` for new features (e.g., `feat: add YKS preference wizard API`)
- `fix: ...` for bug fixes (e.g., `fix: resolve null handling in min rank sorting`)
- `ci/cd: ...` for Docker, workflow, or deployment changes
- `docs: ...` for documentation updates

### Branching Strategy
- Main branch: `main` (Triggers automatic GitHub Actions build & Dokploy deployment).
- Feature branches: `feat/<feature-name>` or `fix/<fix-name>`.
