import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Table as TableIcon,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../../../hooks/useLanguage';
import { formatNumber, formatScore, formatRank } from '../../../utils/formatters';

export function YoYComparisonTable({ yoyComparisons }) {
  const { t } = useLanguage();

  if (!yoyComparisons || yoyComparisons.length === 0) return null;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TableIcon className="w-5 h-5 text-indigo-400" />
          <h4 className="font-bold text-sm text-white">{t('trends.yoyTableTitle')}</h4>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          2019 – 2026
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">{t('trends.colPeriod')}</th>
              <th className="py-3 px-4">{t('trends.cutoffRankLine')}</th>
              <th className="py-3 px-4">{t('trends.colRankDelta')}</th>
              <th className="py-3 px-4">{t('trends.colRankPct')}</th>
              <th className="py-3 px-4">{t('trends.colScoreDelta')}</th>
              <th className="py-3 px-4">{t('trends.colQuotaDelta')}</th>
              <th className="py-3 px-4">{t('trends.colEnrolledDelta')}</th>
              <th className="py-3 px-4">{t('trends.colStatus')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {yoyComparisons.map((row) => {
              const isBaseline = !row.prev_year;
              const periodLabel = isBaseline
                ? `${row.year}`
                : `${row.prev_year} → ${row.year}`;

              // Rank delta badge logic: lower numerical rank is BETTER (improved)
              const rankDelta = row.rank_delta;
              const rankPct = row.rank_pct_change;

              return (
                <tr key={row.year} className="hover:bg-slate-800/40 transition-colors">
                  {/* Period / Year */}
                  <td className="py-3 px-4 font-bold text-white whitespace-nowrap flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                      {periodLabel}
                    </span>
                  </td>

                  {/* Cutoff Rank */}
                  <td className="py-3 px-4 font-bold text-indigo-300 whitespace-nowrap">
                    {formatRank(row.rank)}
                  </td>

                  {/* Rank Movement (Numerical Delta) */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {isBaseline || rankDelta === null ? (
                      <span className="text-slate-500 font-mono">—</span>
                    ) : rankDelta < 0 ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <TrendingUp className="w-3 h-3" />
                        -{formatNumber(Math.abs(rankDelta))}
                      </span>
                    ) : rankDelta > 0 ? (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                        <TrendingDown className="w-3 h-3" />
                        +{formatNumber(rankDelta)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 font-medium">
                        <Minus className="w-3 h-3" /> 0
                      </span>
                    )}
                  </td>

                  {/* Rank % Change */}
                  <td className="py-3 px-4 whitespace-nowrap font-semibold">
                    {isBaseline || rankPct === null ? (
                      <span className="text-slate-500 font-mono">—</span>
                    ) : rankPct < 0 ? (
                      <span className="text-emerald-400">
                        {rankPct}%
                      </span>
                    ) : rankPct > 0 ? (
                      <span className="text-rose-400">
                        +{rankPct}%
                      </span>
                    ) : (
                      <span className="text-slate-400">0.0%</span>
                    )}
                  </td>

                  {/* Score & Score Delta */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-200">{formatScore(row.score)}</span>
                      {!isBaseline && row.score_delta !== null && (
                        <span
                          className={`text-[11px] font-semibold ${
                            row.score_delta > 0
                              ? 'text-emerald-400'
                              : row.score_delta < 0
                              ? 'text-rose-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {row.score_delta > 0 ? `+${formatScore(row.score_delta)}` : formatScore(row.score_delta)} {t('trends.ptsUnit')}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Quota & Quota Delta */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-200">{formatNumber(row.quota)}</span>
                      {!isBaseline && row.quota_delta !== null && (
                        <span
                          className={`text-[11px] font-semibold ${
                            row.quota_delta > 0
                              ? 'text-cyan-400'
                              : row.quota_delta < 0
                              ? 'text-amber-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {row.quota_delta > 0 ? `+${formatNumber(row.quota_delta)}` : formatNumber(row.quota_delta)} {t('trends.seatsUnit')}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Enrolled & Enrolled Delta */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-300">
                        {row.enrolled !== null ? formatNumber(row.enrolled) : '—'}
                      </span>
                      {!isBaseline && row.enrolled_delta !== null && (
                        <span
                          className={`text-[11px] font-medium ${
                            row.enrolled_delta > 0
                              ? 'text-emerald-400'
                              : row.enrolled_delta < 0
                              ? 'text-amber-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {row.enrolled_delta > 0 ? `+${formatNumber(row.enrolled_delta)}` : formatNumber(row.enrolled_delta)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Movement Status Badge */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {isBaseline ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                        {t('trends.baselineYear')}
                      </span>
                    ) : rankDelta < 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {t('trends.rankImproved')}
                      </span>
                    ) : rankDelta > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <TrendingDown className="w-3 h-3" />
                        {t('trends.rankDropped')}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                        {t('trends.rankUnchanged')}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
