import React from 'react';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLanguage } from '../../../hooks/useLanguage';

export function FacultyChart({ comparisonData }) {
  const { t } = useLanguage();

  if (!comparisonData || !comparisonData.comparison) return null;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-indigo-400" />
        <h3 className="font-bold text-sm text-white">{t('comparator.facultyStrengthTitle')}</h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparisonData.comparison}>
            <XAxis dataKey="universiteAdi" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
            <Legend />
            <Bar dataKey="total_prof" name={t('comparator.professorsLegend')} fill="#818cf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="total_doc" name={t('comparator.assocProfsLegend')} fill="#38bdf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="total_argor" name={t('comparator.researchAsstLegend')} fill="#34d399" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

