import React, { useState, useEffect } from 'react';
import { X, Award, Users, AlertTriangle, Building2, MapPin, Bookmark } from 'lucide-react';

export default function ProgramModal({ programCode, onClose, onToggleBookmark, isBookmarked }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!programCode) return;
    setLoading(true);
    fetch(`/api/trends/${programCode}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [programCode]);

  if (!programCode) return null;

  const p = data?.program;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
              Program Code: {programCode}
            </span>
            <h2 className="text-xl font-bold text-white mt-1">{p?.birimAdi || 'Program Details'}</h2>
            <p className="text-sm font-medium text-slate-300">{p?.universiteAdi} ({p?.ilAdi})</p>
          </div>

          <div className="flex items-center gap-2">
            {p && (
              <button
                onClick={() => onToggleBookmark(p)}
                className={`p-2 rounded-xl border transition ${isBookmarked ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
              >
                <Bookmark className="w-5 h-5 fill-current" />
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">
            <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p>Loading program specs...</p>
          </div>
        ) : p ? (
          <div className="space-y-5 text-xs text-slate-300">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-slate-400">2026 Min Rank</p>
                <p className="text-base font-bold text-indigo-400">{p.basariSirasi ? p.basariSirasi.toLocaleString() : '—'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-slate-400">2026 Min Score</p>
                <p className="text-base font-bold text-white">{p.minPuan ? p.minPuan.toFixed(2) : '—'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-slate-400">Quota (Kontenjan)</p>
                <p className="text-base font-bold text-white">{p.kontenjan || '—'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-slate-400">Score Field</p>
                <p className="text-base font-bold text-cyan-400">{p.puanTuru}</p>
              </div>
            </div>

            {/* Academic Staff */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Academic Staff Breakdown</span>
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center pt-1">
                <div className="p-2 rounded-lg bg-slate-800">
                  <span className="block font-bold text-white text-sm">{p.prof}</span>
                  <span className="text-[10px] text-slate-400">Professors</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800">
                  <span className="block font-bold text-white text-sm">{p.doc}</span>
                  <span className="text-[10px] text-slate-400">Assoc. Profs</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800">
                  <span className="block font-bold text-white text-sm">{p.dou}</span>
                  <span className="text-[10px] text-slate-400">Asst. Profs</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800">
                  <span className="block font-bold text-white text-sm">{p.arGor}</span>
                  <span className="text-[10px] text-slate-400">Research Asst</span>
                </div>
              </div>
            </div>

            {/* Accreditation & Threshold Conditions */}
            {p.minBasariSirasiKosul && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Official YÖK Threshold Requirement</span>
                </div>
                <p>{p.minBasariSirasiKosul}</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
