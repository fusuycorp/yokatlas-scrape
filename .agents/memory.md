# Project Memory

## Active Epics & Tasks
Current priority order (resume here in a fresh session):
1. **Trends fallback perf** — `/api/trends/{code}` full-scan fallback still ~470 ms for 14.4% of programs (256k `TR_NORM` UDF calls). Correctness is fixed (all_tags + tier); the structural fix is to persist `admissions_history.uni_norm`/`dept_norm` at build time + `idx_hist_norm`, or precompute the 2026→historical code map. Task tracked in memory as perf, not correctness.
2. **Frontend code-splitting** — recharts is 54% of the gzip bundle (112.5 KB) and loaded eagerly on `/` which renders no chart. `React.lazy` the four routes in `App.jsx` + `RankTrajectoryChart`/`FacultyChart`; `vite.config.js` is Vite 8 (rolldown) so `manualChunks` must be the function form.
3. **Search debounce/abort** — `usePrograms` refetches per keystroke; add ~250 ms debounce + `AbortController` in `apiClient`.
4. **Docker hardening (LOW)** — `Dockerfile:19` `pip install fastapi uvicorn` unpinned (ignores `uv.lock`); base images are floating tags.
5. **Scraper `verify=False` (LOW)** — `scraper.py:114,141`. Rendered harmless by noscript escaping, but remove `verify=False` if possible.
6. **`usePrograms` `city` filter is dead** — backend supports it, no hook state/UI exposes it.
7. **`useCompare` error not rendered** — `UniComparatorTab` only destructures `loading`; a failed compare shows an empty grid with no message.

## Core Invariants & Architecture Rules
- **Slug parity is a hard invariant**: `dashboard-ui/src/utils/slugs.js` `slugifyUniversity` MUST produce identical output to `server.py` `slugify_turkish`. The SPA deep-links (`/universite/:slug`) and the server sitemap/resolver both derive and match slugs; divergence breaks organic-search landing pages. Guarded by `tests/test_security.py::TestSlugParity`.
- **Never `SELECT *` from programs_2026** (92 columns, up to ~8.8 KB/row incl. `kosul_json`). Project the ~19 consumed fields only (`/api/trends`).
- **`/api/*` bound params are required**: `page/limit` (`ge=1`/`le=100`), wizard `limit le=100`, compare `max_length=10`. `limit=-1` means "no limit" in SQLite and `limit=0` divides by zero — both are input-validation bugs, not DB bugs.
- **SEO pre-render output is attacker-influenced**: every interpolated value in `catch_all` must pass `html.escape`; JSON-LD needs `<`/`>`/`&` escaped after `json.dumps`; `re.sub` replacements must be callables (not f-strings) to avoid backslash-injection 500s.
- **Catch-all file serving is constrained**: resolve + `is_relative_to(frontend_dist.resolve())`; `Path(base) / "/abs"` discards the base entirely, and `//etc/passwd` survives proxies.

## Domain Vocabulary & Gotchas
- `admissions_history.medium-of-instruction` lives in `all_tags`, NOT `department_name`. English-medium fallback filtering must match `TR_NORM(all_tags) LIKE '%ingilizce%'`.
- Historical scholarship tiers are in `admissions_history.scholarship_type`; 2026 `bursOraniAdi` maps 1:1 to it, and state unis (bursOraniAdi NULL) map to `'Ücretsiz'`. Bug: matching fallback trend history without the tier filter blends unrelated Burslu/Ücretli series.
- `programs_2026` rows average 3.7 KB → any `SCAN` touches ~80 MB. The landing `ORDER BY basariSirasi IS NULL, basariSirasi` needs expression indexes (`idx_p2026_*_sira_nulls`); `ANALYZE` must run after index creation.
- `title_turkish` capitalization must skip leading punctuation via `\w` (Turkish letters), not `[a-z]` — `w.capitalize()` only uppercases index 0.
- known data quirk: universities with programs in >1 city report `MIN(ilAdi)` (deterministic) via the GROUP BY queries.
