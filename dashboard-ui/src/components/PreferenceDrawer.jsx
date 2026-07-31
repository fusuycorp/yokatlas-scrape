import React from 'react';
import { X, Trash2, Download, Bookmark } from 'lucide-react';

export default function PreferenceDrawer({ isOpen, onClose, savedPrograms, onRemoveBookmark, onClearAll }) {
  if (!isOpen) return null;

  const exportCSV = () => {
    if (savedPrograms.length === 0) return;
    const headers = ['Order', 'Program Code', 'University', 'Department', 'City', 'Score Type', '2026 Min Rank', '2026 Min Score'];
    const rows = savedPrograms.map((p, idx) => [
      idx + 1,
      p.kilavuzKodu,
      `"${p.universiteAdi}"`,
      `"${p.birimAdi}"`,
      `"${p.ilAdi}"`,
      p.puanTuru,
      p.basariSirasi || '',
      p.minPuan || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'My_YKS_Tercih_Listesi_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md h-full flex flex-col border-l border-slate-800 shadow-2xl p-6">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-400 fill-current" />
            <h3 className="font-bold text-base text-white">Draft Preference List</h3>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
              {savedPrograms.length}
            </span>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {savedPrograms.length === 0 ? (
            <div className="py-20 text-center text-slate-500 space-y-2">
              <Bookmark className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">No programs saved in your draft preference list yet.</p>
              <p className="text-[11px] text-slate-600">Click the bookmark icon on any program to save it here.</p>
            </div>
          ) : (
            savedPrograms.map((p, idx) => (
              <div key={p.kilavuzKodu} className="glass-card p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <h4 className="font-bold text-xs text-white truncate">{p.birimAdi}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{p.universiteAdi}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="font-semibold text-indigo-300">{p.puanTuru}</span>
                      <span>Rank: {p.basariSirasi ? p.basariSirasi.toLocaleString() : '—'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveBookmark(p.kilavuzKodu)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Actions */}
        {savedPrograms.length > 0 && (
          <div className="border-t border-slate-800 pt-4 flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onClearAll}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
