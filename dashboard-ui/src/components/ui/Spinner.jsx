import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

export function Spinner({ message, size = 'md' }) {
  const { t } = useLanguage();
  const displayMessage = message !== undefined ? message : t('common.loading');

  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div className="py-12 text-center text-slate-500 space-y-2">
      <div
        className={`inline-block ${sizes[size] || sizes.md} border-indigo-500 border-t-transparent rounded-full animate-spin`}
      ></div>
      {displayMessage && <p className="text-xs font-medium">{displayMessage}</p>}
    </div>
  );
}

