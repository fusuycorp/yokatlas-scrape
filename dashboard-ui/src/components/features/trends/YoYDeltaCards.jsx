import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Users,
  Calendar,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../../hooks/useLanguage';
import { formatNumber, formatScore, formatRank } from '../../../utils/formatters';

export function YoYDeltaCards({ yoyDeltas }) {
  const { t } = useLanguage();

  if (!yoyDeltas) return null;

  const latest = yoyDeltas.latest_comparison || {};
  const overall = yoyDeltas.overall_trajectory || {};

  // Rank delta helper
  // Lower rank number is BETTER (negative rank_delta = improvement [GREEN])
  const renderRankBadge = (rankDelta, rankPct) => {
    if (rankDelta === null || rankDelta === undefined) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
          <Minus className="w-3.5 h-3.5" /> —
        </span>
      );
    }

    if (rankDelta < 0) {
      // Improved (Green)
      const absDelta = Math.abs(rankDelta);
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <TrendingUp className="w-3.5 h-3.5" />
          -{formatNumber(absDelta)} ({rankPct}%)
        </span>
      );
    } else if (rankDelta > 0) {
      // Dropped (Red)
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <TrendingDown className="w-3.5 h-3.5" />
          +{formatNumber(rankDelta)} (+{rankPct}%)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
          <Minus className="w-3.5 h-3.5" /> 0
        </span>
      );
    }
  };

  // Score delta helper
  const renderScoreBadge = (scoreDelta, scorePct) => {
    if (scoreDelta === null || scoreDelta === undefined) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
          <Minus className="w-3.5 h-3.5" /> —
        </span>
      );
    }

    if (scoreDelta > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <TrendingUp className="w-3.5 h-3.5" />
          +{formatScore(scoreDelta)} {t('trends.ptsUnit')} (+{scorePct}%)
        </span>
      );
    } else if (scoreDelta < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <TrendingDown className="w-3.5 h-3.5" />
          {formatScore(scoreDelta)} {t('trends.ptsUnit')} ({scorePct}%)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
          <Minus className="w-3.5 h-3.5" /> 0.00 {t('trends.ptsUnit')}
        </span>
      );
    }
  };

  // Quota delta helper
  const renderQuotaBadge = (quotaDelta, quotaPct) => {
    if (quotaDelta === null || quotaDelta === undefined) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
          <Minus className="w-3.5 h-3.5" /> —
        </span>
      );
    }

    if (quotaDelta > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <TrendingUp className="w-3.5 h-3.5" />
          +{formatNumber(quotaDelta)} {t('trends.seatsUnit')} (+{quotaPct}%)
        </span>
      );
    } else if (quotaDelta < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <TrendingDown className="w-3.5 h-3.5" />
          {formatNumber(quotaDelta)} {t('trends.seatsUnit')} ({quotaPct}%)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
          <Minus className="w-3.5 h-3.5" /> {t('trends.unchanged')}
        </span>
      );
    }
  };

  const periodText = latest.prev_year && latest.year ? `${latest.prev_year} → ${latest.year}` : '';
  const overallPeriodText =
    overall.earliest_year && overall.latest_year ? `${overall.earliest_year} → ${overall.latest_year}` : '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400" />
          {t('trends.yoyCardsTitle')}
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Rank YoY Movement */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('trends.latestRankDelta')}</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div>
            <p className="text-2xl font-bold text-white tracking-tight">
              {formatRank(latest.rank)}
            </p>
            {periodText && (
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">{periodText}</p>
            )}
          </div>

          <div>{renderRankBadge(latest.rank_delta, latest.rank_pct_change)}</div>
        </div>

        {/* Card 2: Min Score YoY Delta */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('trends.latestScoreDelta')}</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>

          <div>
            <p className="text-2xl font-bold text-white tracking-tight">
              {formatScore(latest.score)}
            </p>
            {periodText && (
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">{periodText}</p>
            )}
          </div>

          <div>{renderScoreBadge(latest.score_delta, latest.score_pct_change)}</div>
        </div>

        {/* Card 3: Quota YoY Change */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('trends.latestQuotaDelta')}</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div>
            <p className="text-2xl font-bold text-white tracking-tight">
              {formatNumber(latest.quota)}
            </p>
            {periodText && (
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">{periodText}</p>
            )}
          </div>

          <div>{renderQuotaBadge(latest.quota_delta, latest.quota_pct_change)}</div>
        </div>

        {/* Card 4: Multi-Year Overall Trajectory */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('trends.multiYearTrajectory')}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-200">
              {overall.earliest_year ? `${overall.earliest_year}: ` : ''}
              <span className="text-slate-400">{formatRank(overall.earliest_rank)}</span>
              {' → '}
              {overall.latest_year ? `${overall.latest_year}: ` : ''}
              <span className="text-indigo-300 font-bold">{formatRank(overall.latest_rank)}</span>
            </p>
            {overallPeriodText && (
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">{overallPeriodText}</p>
            )}
          </div>

          <div>
            {renderRankBadge(overall.total_rank_delta, overall.total_rank_pct_change)}
          </div>
        </div>
      </div>
    </div>
  );
}
