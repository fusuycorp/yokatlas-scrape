export function trNormalize(text) {
  if (typeof text !== 'string') return '';
  const trMap = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i', 'İ': 'i', 'i': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u'
  };
  return text.replace(/[çÇğĞıIİiöÖşŞüÜ]/g, match => trMap[match]).toLowerCase();
}

export function trIncludes(haystack, needle) {
  if (!haystack || !needle) return false;
  return trNormalize(haystack).includes(trNormalize(needle));
}
