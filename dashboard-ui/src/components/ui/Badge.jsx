import React from 'react';

/**
 * Reusable Badge component.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'indigo'|'emerald'|'purple'|'amber'|'cyan'|'slate'} [props.variant='indigo']
 * @param {string} [props.className='']
 */
export function Badge({ children, variant = 'indigo', className = '' }) {
  const variants = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${variants[variant] || variants.indigo} ${className}`}
    >
      {children}
    </span>
  );
}
