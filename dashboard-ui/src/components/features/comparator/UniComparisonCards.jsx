import React from 'react';
import { formatNumber } from '../../../utils/formatters';
import { useLanguage } from '../../../hooks/useLanguage';

export function UniComparisonCards({ comparisonData, onSelectUniversity }) {
  const { t } = useLanguage();

  if (!comparisonData || !comparisonData.comparison) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      {comparisonData.comparison.map((uni) => (
        <div key={uni.universiteAdi} className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3.5 sm:space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                {uni.universiteTuru === 'DEVLET' ? t('explorer.stateUni') : uni.universiteTuru === 'VAKIF' ? t('explorer.foundationUni') : uni.universiteTuru}
              </span>
              <h3
                onClick={() => onSelectUniversity?.(uni.universiteAdi)}
                className="font-bold text-sm sm:text-base text-white hover:text-indigo-400 cursor-pointer hover:underline mt-1 transition"
              >
                {uni.universiteAdi}
              </h3>
              <p className="text-xs text-slate-400">{uni.ilAdi}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-xs">
            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-slate-400 text-[11px] sm:text-xs">{t('comparator.totalPrograms')}</p>
              <p className="text-base sm:text-lg font-bold text-white mt-0.5">{uni.program_count}</p>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-slate-400 text-[11px] sm:text-xs">{t('comparator.totalQuota')}</p>
              <p className="text-base sm:text-lg font-bold text-white mt-0.5">{formatNumber(uni.total_quota)}</p>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-slate-400 text-[11px] sm:text-xs">{t('comparator.professors')}</p>
              <p className="text-base sm:text-lg font-bold text-indigo-400 mt-0.5">{uni.total_prof || 0}</p>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-slate-400 text-[11px] sm:text-xs">{t('comparator.assocAsst')}</p>
              <p className="text-base sm:text-lg font-bold text-cyan-400 mt-0.5">{(uni.total_doc || 0) + (uni.total_dou || 0)}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <p className="text-[11px] text-indigo-300 font-medium">{t('comparator.avgAdmissionRank')}</p>
            <p className="text-lg sm:text-xl font-bold text-white mt-0.5">
              {uni.avg_basari_sirasi ? formatNumber(Math.round(uni.avg_basari_sirasi)) : '—'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

