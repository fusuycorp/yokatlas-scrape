import React from 'react';
import { X, Users, AlertTriangle, Bookmark, TrendingUp, LineChart, Table, Activity } from 'lucide-react';
import { useTrends } from '../../../hooks/useTrends';
import { useLanguage } from '../../../hooks/useLanguage';
import { formatRank, formatScore } from '../../../utils/formatters';
import { Spinner } from '../../ui/Spinner';
import { Badge } from '../../ui/Badge';
import { RankTrajectoryChart } from '../trends/RankTrajectoryChart';
import { YoYDeltaCards } from '../trends/YoYDeltaCards';
import { YoYComparisonTable } from '../trends/YoYComparisonTable';
import { NetStatsTable } from '../trends/NetStatsTable';

export function ProgramModal({ programCode, onClose, onToggleBookmark, isBookmarked }) {
  const { data, loading } = useTrends(programCode);
  const { t } = useLanguage();
  const p = data?.program;

  const chartData = data?.history
    ? data.history.map((h) => ({
        year: h.year,
        rank: h.final_rank_012,
        score: h.final_score_012,
        quota: h.total_quota,
      }))
    : [];

  if (data?.program?.basariSirasi) {
    chartData.push({
      year: 2026,
      rank: data.program.basariSirasi,
      score: data.program.minPuan,
      quota: data.program.kontenjan,
    });
  }

  if (!programCode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <Badge variant="indigo">{t('modal.programCode', { code: programCode })}</Badge>
            <h2 className="text-xl font-bold text-white mt-1">{p?.birimAdi || t('modal.defaultTitle')}</h2>
            <p className="text-sm font-medium text-slate-300">
              {p?.universiteAdi} ({p?.ilAdi})
            </p>
          </div>

          <div className="flex items-center gap-2">
            {p && (
              <button
                onClick={() => onToggleBookmark(p)}
                className={`p-2 rounded-xl border transition ${
                  isBookmarked
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <Bookmark className="w-5 h-5 fill-current" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <Spinner message={t('modal.loading')} />
        ) : p ? (
          <div className="space-y-5 text-xs text-slate-300">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-slate-400">{t('modal.minRank2026')}</p>
                <p className="text-base font-bold text-indigo-400">{formatRank(p.basariSirasi)}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-slate-400">{t('modal.minScore2026')}</p>
                <p className="text-base font-bold text-white">{formatScore(p.minPuan)}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-slate-400">{t('modal.quota')}</p>
                <p className="text-base font-bold text-white">{p.kontenjan || '—'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-slate-400">{t('modal.scoreField')}</p>
                <p className="text-base font-bold text-cyan-400">{p.puanTuru}</p>
              </div>
            </div>

            {/* Academic Staff */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>{t('modal.academicStaff')}</span>
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center pt-1">
                <div className="p-2 rounded-lg bg-slate-800">
                  <span className="block font-bold text-white text-sm">{p.prof}</span>
                  <span className="text-[10px] text-slate-400">{t('modal.professors')}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800">
                  <span className="block font-bold text-white text-sm">{p.doc}</span>
                  <span className="text-[10px] text-slate-400">{t('modal.assocProfs')}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800">
                  <span className="block font-bold text-white text-sm">{p.dou}</span>
                  <span className="text-[10px] text-slate-400">{t('modal.asstProfs')}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800">
                  <span className="block font-bold text-white text-sm">{p.arGor}</span>
                  <span className="text-[10px] text-slate-400">{t('modal.researchAsst')}</span>
                </div>
              </div>
            </div>

            {/* Accreditation & Threshold Conditions */}
            {p.minBasariSirasiKosul && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>{t('modal.thresholdTitle')}</span>
                </div>
                <p>{p.minBasariSirasiKosul}</p>
              </div>
            )}

            {data.history?.length > 0 && (
              <div className="pt-6 space-y-6 border-t border-slate-800 mt-6">
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-200 flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm">{t('modal.rankTrends')}</span>
                  </h4>
                  <RankTrajectoryChart chartData={chartData} />
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-200 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm">{t('modal.yoyChanges')}</span>
                  </h4>
                  <YoYDeltaCards yoyDeltas={data.yoy_deltas} />
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-200 flex items-center gap-2">
                    <Table className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm">{t('modal.yoyTable')}</span>
                  </h4>
                  <YoYComparisonTable yoyComparisons={data.yoy_comparisons} />
                </div>
              </div>
            )}

            {data.net_stats?.length > 0 && (
              <div className="pt-6 space-y-3 border-t border-slate-800 mt-6">
                <h4 className="font-bold text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">{t('modal.netStats')}</span>
                </h4>
                <NetStatsTable netStats={data.net_stats} />
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

