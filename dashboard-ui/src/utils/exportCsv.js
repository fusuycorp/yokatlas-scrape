/**
 * Exports saved preference list to a UTF-8 CSV file.
 * @param {Array<Object>} programs
 */
export function exportPreferencesToCSV(programs) {
  if (!programs || programs.length === 0) return;

  const headers = [
    'Order',
    'Program Code',
    'University',
    'Department',
    'City',
    'Score Type',
    '2026 Min Rank',
    '2026 Min Score',
  ];

  const rows = programs.map((p, idx) => [
    idx + 1,
    p.kilavuzKodu,
    `"${p.universiteAdi}"`,
    `"${p.birimAdi}"`,
    `"${p.ilAdi}"`,
    p.puanTuru,
    p.basariSirasi || '',
    p.minPuan || '',
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'My_YKS_Tercih_Listesi_2026.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
