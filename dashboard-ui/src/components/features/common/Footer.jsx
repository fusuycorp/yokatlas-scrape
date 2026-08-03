import React from 'react';
import { useLanguage } from '../../../hooks/useLanguage';
import { APP_VERSION } from '../../../constants/version';

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="glass-panel border-t border-slate-800/80 py-4 px-8 text-center text-xs text-slate-500">
      <p>{t('footer.copyright')} | UniAtlas Platform {APP_VERSION}</p>
    </footer>
  );
}

