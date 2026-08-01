import React from 'react';

/**
 * Metric card primitive with icon and value.
 */
export function StatCard({ title, value, icon: Icon, color = 'indigo' }) {
  const colorMap = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
      {Icon && (
        <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.indigo}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div>
        <p className="text-xs text-slate-400 font-medium">{title}</p>
        <h3 className="text-xl font-bold text-white">{value}</h3>
      </div>
    </div>
  );
}
