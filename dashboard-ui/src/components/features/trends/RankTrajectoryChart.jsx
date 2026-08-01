import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useLanguage } from '../../../hooks/useLanguage';

export function RankTrajectoryChart({ chartData }) {
  const { t } = useLanguage();

  if (!chartData || chartData.length === 0) return null;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-sm text-white">{t('trends.chartTitle')}</h4>
        <span className="text-xs text-slate-400">{t('trends.chartNote')}</span>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="year" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" reversed domain={['dataMin - 1000', 'dataMax + 1000']} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
            <Line
              type="monotone"
              dataKey="rank"
              name={t('trends.cutoffRankLine')}
              stroke="#818cf8"
              strokeWidth={3}
              dot={{ r: 5, fill: '#818cf8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

