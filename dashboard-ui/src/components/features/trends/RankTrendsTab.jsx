import React, { useState } from 'react';
import { LineChart as LineChartIcon, AlertTriangle } from 'lucide-react';
import { useTrends } from '../../../hooks/useTrends';
import { useLanguage } from '../../../hooks/useLanguage';
import { formatRank } from '../../../utils/formatters';
import { Spinner } from '../../ui/Spinner';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { RankTrajectoryChart } from './RankTrajectoryChart';
import { NetStatsTable } from './NetStatsTable';
import { YoYDeltaCards } from './YoYDeltaCards';
import { YoYComparisonTable } from './YoYComparisonTable';

export function RankTrendsTab({ selectedProgramCode }) {
  const { setProgCode, data, loading } = useTrends(selectedProgramCode);
  const { t } = useLanguage();
  const [searchInput, setSearchInput] = useState('');

  // Format historical line chart data
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

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LineChartIcon className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">{t('trends.title')}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('trends.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={t('trends.inputPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-64"
          />
          <Button
            size="sm"
            onClick={() => searchInput && setProgCode(parseInt(searchInput, 10))}
          >
            {t('trends.searchBtn')}
          </Button>
        </div>
      </div>

      {loading ? (
        <Spinner message={t('trends.loading')} />
      ) : data?.program ? (
        <div className="space-y-6">
          {/* Program Banner */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <Badge variant="indigo">
                  {data.program.universiteTuru === 'DEVLET' ? t('explorer.stateUni') : data.program.universiteTuru === 'VAKIF' ? t('explorer.foundationUni') : data.program.universiteTuru} • {data.program.puanTuru}
                </Badge>
                <h3 className="text-xl font-bold text-white mt-1">{data.program.birimAdi}</h3>
                <p className="text-sm font-medium text-slate-300">
                  {data.program.universiteAdi} ({data.program.ilAdi})
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-400">{t('trends.cutoffRank2026')}</p>
                <p className="text-2xl font-bold text-indigo-400">
                  {formatRank(data.program.basariSirasi)}
                </p>
              </div>
            </div>

            {data.program.minBasariSirasiKosul && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>{t('trends.yokThreshold')}</strong> {data.program.minBasariSirasiKosul}
                </span>
              </div>
            )}
          </div>

          {/* YoY Delta Analysis Cards */}
          <YoYDeltaCards yoyDeltas={data.yoy_deltas} />

          {/* YoY Comparison Table across 2019-2026 */}
          <YoYComparisonTable yoyComparisons={data.yoy_comparisons} />

          {/* Cutoff Rank Trajectory Line Chart */}
          <RankTrajectoryChart chartData={chartData} />

          {/* Net Score Statistics Table */}
          <NetStatsTable netStats={data.net_stats} />
        </div>
      ) : null}
    </div>
  );
}

