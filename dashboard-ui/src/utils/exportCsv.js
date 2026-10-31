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

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = programs.map((p, idx) => [
    idx + 1,
    p.kilavuzKodu,
    escapeCell(p.universiteAdi),
    escapeCell(p.birimAdi),
    escapeCell(p.ilAdi),
    p.puanTuru,
    p.basariSirasi || '',
    p.minPuan || '',
  ]);

  const csvString = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'My_YKS_Tercih_Listesi_2026.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
