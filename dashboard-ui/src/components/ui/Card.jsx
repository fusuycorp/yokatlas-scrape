import React from 'react';

/**
 * Glassmorphism Card Container.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'panel'|'card'} [props.variant='panel']
 * @param {string} [props.className='']
 */
export function Card({ children, variant = 'panel', className = '', ...props }) {
  const baseStyle = variant === 'card' ? 'glass-card' : 'glass-panel';
  return (
    <div
      className={`${baseStyle} rounded-2xl border border-slate-800 p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
