# Architecture Decisions (ADRs)

## Record Format
### [YYYY-MM-DD] ADR-Title
- **Context**: Why was this decision necessary?
- **Decision**: What was chosen?
- **Consequences**: What trade-offs or constraints follow?

### [2026-08-18] ADR-Escape-At-Render-Sink-For-Scraper-Data
- **Context**: The scraper disables TLS verification (`verify=False`) to talk to YÖK ATLAS, and scraped names flow unescaped into the SEO `<noscript>` HTML and JSON-LD. A MITM could inject stored XSS. Removing `verify=False` risks breaking the scrape against the real site.
- **Decision**: Keep `verify=False` but treat all DB-derived values as untrusted and HTML-escape them at every render sink in `catch_all` (title/description/url, JSON-LD `<>&`, `<noscript>`). Escape at the boundary where values cross into HTML.
- **Consequences**: The stored-XSS chain is neutralized regardless of transport security, so scraping is not blocked on the cert issue. The cost is that every future interpolation into SEO HTML must be escaped — a searchable rule, not a gratuitous one. If the site's cert becomes trustworthy, remove `verify=False` as defense-in-depth but keep render escaping.

### [2026-08-18] ADR-Cross-Language-Slug-Contract
- **Context**: Two independent slugify implementations existed (Python `server.py` / JS `utils/slugs.js`) and diverged for 2/228 universities, breaking deep-linked `/universite/:slug` SEO pages between the sitemap (Python) and the SPA router (JS).
- **Decision**: A single canonical algorithm (lowercase → Turkish-char map → collapse `[^a-z0-9]+` to `-` → strip) implemented identically in Python and JS, enforced by `tests/test_security.py::TestSlugParity` over the full university set.
- **Consequences**: Only one slug source of truth; any change to slug behavior must update both implementations and pass the parity test. Prevents the silent SEO 404 class of bug.
