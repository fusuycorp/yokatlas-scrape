export function slugifyUniversity(uniName) {
  if (!uniName) return '';
  return uniName
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/i̇/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function unslugifyUniversity(slug, availableUnis) {
  if (!slug || !availableUnis) return null;
  return availableUnis.find(uni => slugifyUniversity(uni) === slug) || null;
}
