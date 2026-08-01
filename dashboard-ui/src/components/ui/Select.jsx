import React from 'react';

/**
 * Reusable Select Dropdown Primitive.
 * @param {Object} props
 * @param {Array<{value: string, label: string}>} props.options
 * @param {string} [props.className='']
 */
export function Select({ options = [], className = '', ...props }) {
  return (
    <select
      className={`px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/70 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
