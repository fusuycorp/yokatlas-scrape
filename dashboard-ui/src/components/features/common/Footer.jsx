import React from 'react';
import { useLanguage } from '../../../hooks/useLanguage';
import { APP_VERSION } from '../../../constants/version';

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="glass-panel border-t border-slate-800/80 py-4 px-8 text-center text-xs text-slate-500">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <p>{t('footer.copyright')} | UniAtlas</p>
        <span className="px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 font-medium text-[10px] border border-slate-700/50 shadow-sm">
          {APP_VERSION}
        </span>
      </div>
    </footer>
  );
}

