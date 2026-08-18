# Project Memory

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
