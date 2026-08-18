// Matches Python's slugify_turkish (server.py) exactly so the SPA slug and the
// server/sitemap slug always agree for round-tripping.
// Python: tr_lower, map çğışöü, collapse runs of [^a-z0-9]+ to '-', strip trailing '-'.
export function slugifyUniversity(uniName) {
  if (!uniName) return '';
  return uniName
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function unslugifyUniversity(slug, availableUnis) {
  if (!slug || !availableUnis) return null;
  return availableUnis.find((uni) => slugifyUniversity(uni) === slug) || null;
}
