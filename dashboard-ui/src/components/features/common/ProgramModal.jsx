import React from 'react';
import { X, Users, AlertTriangle, Bookmark, TrendingUp, LineChart, Table, Activity } from 'lucide-react';
import { useTrends } from '../../../hooks/useTrends';
import { useLanguage } from '../../../hooks/useLanguage';
import { formatRank, formatScore } from '../../../utils/formatters';
import { Spinner } from '../../ui/Spinner';
import { Badge } from '../../ui/Badge';
import { YoYDeltaCards } from '../trends/YoYDeltaCards';
import { YoYComparisonTable } from '../trends/YoYComparisonTable';
import { NetStatsTable } from '../trends/NetStatsTable';

const RankTrajectoryChart = React.lazy(() =>
  import('../trends/RankTrajectoryChart').then((m) => ({ default: m.RankTrajectoryChart }))
);

export function ProgramModal({ programCode, onClose, onToggleBookmark, isBookmarked }) {
  const { data, loading } = useTrends(programCode);
  const { t } = useLanguage();
  const p = data?.program;

  // Lock background scroll on mount to prevent mobile Safari bounce / scroll chaining
  React.useEffect(() => {
    if (!programCode) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [programCode]);

  // Handle ESC key
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md overscroll-none touch-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel w-full max-w-5xl max-h-[85dvh] sm:max-h-[88dvh] flex flex-col rounded-t-3xl sm:rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-slide-up sm:animate-none touch-auto"
      >
        {/* Modal Header (Docked at top, independent of scroll) */}
        <div className="shrink-0 bg-slate-900/95 backdrop-blur-md p-4 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-3 z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="indigo">{t('modal.programCode', { code: programCode })}</Badge>
              {p?.bursOraniAdi && (
                <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {p.bursOraniAdi}
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-xl font-bold text-white mt-1 line-clamp-1">{p?.birimAdi || t('modal.defaultTitle')}</h2>
            <p className="text-xs sm:text-sm font-medium text-slate-300 line-clamp-1">
              {p?.universiteAdi} ({p?.ilAdi})
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {p && (
              <button
                onClick={() => onToggleBookmark(p)}
                aria-label="Bookmark"
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  isBookmarked
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 sm:space-y-5 pb-safe">

        {loading ? (
          <div className="py-12">
            <Spinner message={t('modal.loading')} />
          </div>
        ) : p ? (
          <div className="space-y-5 text-xs text-slate-300">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-slate-400 text-[11px] sm:text-xs">{t('modal.minRank2026')}</p>
                <p className="text-sm sm:text-base font-bold text-indigo-400 mt-0.5">{formatRank(p.basariSirasi)}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-slate-400 text-[11px] sm:text-xs">{t('modal.minScore2026')}</p>
                <p className="text-sm sm:text-base font-bold text-white mt-0.5">{formatScore(p.minPuan)}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-slate-400 text-[11px] sm:text-xs">{t('modal.quota')}</p>
                <p className="text-sm sm:text-base font-bold text-white mt-0.5">{p.kontenjan || '—'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-slate-400 text-[11px] sm:text-xs">{t('modal.scoreField')}</p>
                <p className="text-sm sm:text-base font-bold text-cyan-400 mt-0.5">{p.puanTuru}</p>
              </div>
            </div>

            {/* Academic Staff */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-200 flex items-center gap-2 text-xs sm:text-sm">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>{t('modal.academicStaff')}</span>
              </h4>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center pt-1">
                <div className="p-2 rounded-lg bg-slate-800/80">
                  <span className="block font-bold text-white text-xs sm:text-sm">{p.prof}</span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 truncate block">{t('modal.professors')}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/80">
                  <span className="block font-bold text-white text-xs sm:text-sm">{p.doc}</span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 truncate block">{t('modal.assocProfs')}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/80">
                  <span className="block font-bold text-white text-xs sm:text-sm">{p.dou}</span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 truncate block">{t('modal.asstProfs')}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/80">
                  <span className="block font-bold text-white text-xs sm:text-sm">{p.arGor}</span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 truncate block">{t('modal.researchAsst')}</span>
                </div>
              </div>
            </div>

            {/* Accreditation & Threshold Conditions */}
            {p.minBasariSirasiKosul && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>{t('modal.thresholdTitle')}</span>
                </div>
                <p className="text-xs leading-relaxed">{p.minBasariSirasiKosul}</p>
              </div>
            )}

            {data.history?.length > 0 && (
              <div className="pt-4 sm:pt-6 space-y-5 sm:space-y-6 border-t border-slate-800 mt-4 sm:mt-6">
                <div className="space-y-2.5 sm:space-y-3">
                  <h4 className="font-bold text-slate-200 flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs sm:text-sm">{t('modal.rankTrends')}</span>
                  </h4>
                  <React.Suspense fallback={<Spinner />}>
                    <RankTrajectoryChart chartData={chartData} />
                  </React.Suspense>
                </div>
                
                <div className="space-y-2.5 sm:space-y-3">
                  <h4 className="font-bold text-slate-200 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs sm:text-sm">{t('modal.yoyChanges')}</span>
                  </h4>
                  <YoYDeltaCards yoyDeltas={data.yoy_deltas} />
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                  <h4 className="font-bold text-slate-200 flex items-center gap-2">
                    <Table className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs sm:text-sm">{t('modal.yoyTable')}</span>
                  </h4>
                  <YoYComparisonTable yoyComparisons={data.yoy_comparisons} />
                </div>
              </div>
            )}

            {data.net_stats?.length > 0 && (
              <div className="pt-4 sm:pt-6 space-y-2.5 sm:space-y-3 border-t border-slate-800 mt-4 sm:mt-6">
                <h4 className="font-bold text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-xs sm:text-sm">{t('modal.netStats')}</span>
                </h4>
                <NetStatsTable netStats={data.net_stats} />
              </div>
            )}
          </div>
        ) : null}
        </div>
      </div>
    </div>
  );
}

