import React from 'react';

export function Input({ className = '', icon: Icon, ...props }) {
  return (
    <div className="relative w-full">
      {Icon && (
        <Icon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      )}
      <input
        className={`w-full ${Icon ? 'pl-10' : 'pl-3.5'} pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700/70 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition ${className}`}
        {...props}
      />
    </div>
  );
}
