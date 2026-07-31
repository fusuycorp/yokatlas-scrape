import React, { useState, useEffect } from 'react';
import { GraduationCap, ShieldCheck, Target, Zap, AlertTriangle, ArrowRight, Bookmark } from 'lucide-react';

export default function WizardTab({ onSelectProgram, onToggleBookmark, bookmarkedIds }) {
  const [scoreType, setScoreType] = useState('SAY');
  const [targetRank, setTargetRank] = useState(25000);
  const [wizardData, setWizardData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRunWizard = () => {
    if (!targetRank || targetRank <= 0) return;
    setLoading(true);

    fetch(`/api/wizard?score_type=${scoreType}&target_rank=${targetRank}&limit=12`)
      .then((res) => res.json())
      .then((data) => {
        setWizardData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    handleRunWizard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Wizard Header Input Form */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Smart YKS Target & Preference Wizard</h2>
        </div>
        <p className="text-xs text-slate-400">
          Enter your target field and estimated success rank to automatically generate safe, target, and reach recommendations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Score Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Score Type (Puan Türü)</label>
            <select
              value={scoreType}
              onChange={(e) => setScoreType(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="SAY">SAY (Sayısal)</option>
              <option value="EA">EA (Eşit Ağırlık)</option>
              <option value="SÖZ">SÖZ (Sözel)</option>
              <option value="DİL">DİL (Dil)</option>
            </select>
          </div>

          {/* Target Rank */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Your Estimated Success Rank (Başarı Sırası)</label>
            <input
              type="number"
              placeholder="e.g. 25000"
              value={targetRank}
              onChange={(e) => setTargetRank(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Run Button */}
          <div className="flex items-end">
            <button
              onClick={handleRunWizard}
              className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs transition shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Generate Target List</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p>Analyzing matching programs across 21,493 options...</p>
        </div>
      ) : wizardData?.categories ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Reach Options */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Reach Options (Hayal)</h3>
                <p className="text-[11px] text-amber-300">Ranks: {wizardData.categories.reach.min_rank.toLocaleString()} – {wizardData.categories.reach.max_rank.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              {wizardData.categories.reach.programs.map((p) => (
                <WizardCard key={p.kilavuzKodu} program={p} onSelect={onSelectProgram} onToggleBookmark={onToggleBookmark} isBookmarked={bookmarkedIds.has(p.kilavuzKodu)} />
              ))}
            </div>
          </div>

          {/* Target Options */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Target Options (Hedef)</h3>
                <p className="text-[11px] text-indigo-300">Ranks: {wizardData.categories.target.min_rank.toLocaleString()} – {wizardData.categories.target.max_rank.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              {wizardData.categories.target.programs.map((p) => (
                <WizardCard key={p.kilavuzKodu} program={p} onSelect={onSelectProgram} onToggleBookmark={onToggleBookmark} isBookmarked={bookmarkedIds.has(p.kilavuzKodu)} />
              ))}
            </div>
          </div>

          {/* Safe Options */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Safe Options (Garanti)</h3>
                <p className="text-[11px] text-emerald-300">Ranks: {wizardData.categories.safe.min_rank.toLocaleString()} – {wizardData.categories.safe.max_rank.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              {wizardData.categories.safe.programs.map((p) => (
                <WizardCard key={p.kilavuzKodu} program={p} onSelect={onSelectProgram} onToggleBookmark={onToggleBookmark} isBookmarked={bookmarkedIds.has(p.kilavuzKodu)} />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function WizardCard({ program, onSelect, onToggleBookmark, isBookmarked }) {
  return (
    <div className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">{program.universiteTuru} • {program.ilAdi}</span>
          <h4 className="font-bold text-xs text-white line-clamp-1">{program.birimAdi}</h4>
          <p className="text-[11px] text-slate-300 font-medium line-clamp-1">{program.universiteAdi}</p>
        </div>

        <button
          onClick={() => onToggleBookmark(program)}
          className={`p-1.5 rounded-lg shrink-0 ${isBookmarked ? 'text-amber-400 bg-amber-400/10' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Bookmark className="w-3.5 h-3.5 fill-current" />
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] border-t border-slate-800/80 pt-2 mt-1">
        <div>
          <span className="text-slate-400">2026 Rank: </span>
          <strong className="text-indigo-300 font-bold">{program.basariSirasi ? program.basariSirasi.toLocaleString() : '—'}</strong>
        </div>

        <button
          onClick={() => onSelect(program.kilavuzKodu)}
          className="text-indigo-400 hover:text-white font-medium flex items-center gap-1 transition"
        >
          <span>Details</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
