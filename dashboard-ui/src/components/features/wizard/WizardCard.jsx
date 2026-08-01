import React from 'react';
import { Bookmark, ArrowRight } from 'lucide-react';
import { formatRank } from '../../../utils/formatters';
import { useLanguage } from '../../../hooks/useLanguage';

export function WizardCard({ program, onSelect, onToggleBookmark, isBookmarked }) {
  const { t } = useLanguage();

  return (
    <div className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            {program.universiteTuru === 'DEVLET' ? t('explorer.stateUni') : program.universiteTuru === 'VAKIF' ? t('explorer.foundationUni') : program.universiteTuru} • {program.ilAdi}
          </span>
          <h4 className="font-bold text-xs text-white line-clamp-1">{program.birimAdi}</h4>
          <p className="text-[11px] text-slate-300 font-medium line-clamp-1">{program.universiteAdi}</p>
        </div>

        <button
          onClick={() => onToggleBookmark(program)}
          className={`p-1.5 rounded-lg shrink-0 ${
            isBookmarked ? 'text-amber-400 bg-amber-400/10' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 fill-current" />
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] border-t border-slate-800/80 pt-2 mt-1">
        <div>
          <span className="text-slate-400">{t('wizard.rank2026')} </span>
          <strong className="text-indigo-300 font-bold">{formatRank(program.basariSirasi)}</strong>
        </div>

        <button
          onClick={() => onSelect(program.kilavuzKodu)}
          className="text-indigo-400 hover:text-white font-medium flex items-center gap-1 transition"
        >
          <span>{t('wizard.detailsBtn')}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

