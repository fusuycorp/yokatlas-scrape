import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useLanguage } from '../../../hooks/useLanguage';

export function RankTrajectoryChart({ chartData }) {
  const { t } = useLanguage();

  if (!chartData || chartData.length === 0) return null;

  return (
    <div className="glass-panel p-3.5 sm:p-6 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h4 className="font-bold text-xs sm:text-sm text-white">{t('trends.chartTitle')}</h4>
        <span className="text-[11px] sm:text-xs text-slate-400">{t('trends.chartNote')}</span>
      </div>
      <div className="h-56 sm:h-72 -ml-2 sm:ml-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <YAxis
              stroke="#94a3b8"
              domain={[0, 'auto']}
              tick={{ fontSize: 10 }}
              width={50}
              tickFormatter={(val) => (val === 0 ? '0' : val >= 1000 ? `${Math.round(val / 1000)}k` : val)}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              formatter={(value) => [value ? value.toLocaleString('tr-TR') : '—', t('trends.cutoffRankLine')]}
            />
            <Line
              type="monotone"
              dataKey="rank"
              name={t('trends.cutoffRankLine')}
              stroke="#818cf8"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#818cf8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

