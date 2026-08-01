import React from 'react';
import { BookOpen } from 'lucide-react';
import { useLanguage } from '../../../hooks/useLanguage';

export function NetStatsTable({ netStats }) {
  const { t } = useLanguage();

  if (!netStats || netStats.length === 0) return null;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-indigo-400" />
        <h4 className="font-bold text-sm text-white">{t('trends.netStatsTitle')}</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">{t('trends.colSubject')}</th>
              <th className="py-2.5 px-3">{t('trends.colExam')}</th>
              <th className="py-2.5 px-3">{t('trends.colYear')}</th>
              <th className="py-2.5 px-3">{t('trends.colAvgNet')}</th>
              <th className="py-2.5 px-3">{t('trends.colMaxQuestions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {netStats.slice(0, 16).map((n, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40">
                <td className="py-2 px-3 font-medium text-white">{n.lesson_name}</td>
                <td className="py-2 px-3 text-slate-400">{n.exam_type}</td>
                <td className="py-2 px-3 text-slate-400">{n.year}</td>
                <td className="py-2 px-3 font-bold text-indigo-300">{n.average_net}</td>
                <td className="py-2 px-3 text-slate-400">{n.max_questions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

