import React from 'react';
import { X, Trash2, Download, Bookmark } from 'lucide-react';
import { exportPreferencesToCSV } from '../../../utils/exportCsv';
import { formatRank } from '../../../utils/formatters';
import { useLanguage } from '../../../hooks/useLanguage';
import { Button } from '../../ui/Button';

export function PreferenceDrawer({ isOpen, onClose, savedPrograms, onRemoveBookmark, onClearAll }) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md h-full flex flex-col border-l border-slate-800 shadow-2xl p-6">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-400 fill-current" />
            <h3 className="font-bold text-base text-white">{t('drawer.title')}</h3>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
              {savedPrograms.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {savedPrograms.length === 0 ? (
            <div className="py-20 text-center text-slate-500 space-y-2">
              <Bookmark className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">{t('drawer.emptyTitle')}</p>
              <p className="text-[11px] text-slate-600">{t('drawer.emptySubtitle')}</p>
            </div>
          ) : (
            savedPrograms.map((p, idx) => (
              <div
                key={p.kilavuzKodu}
                className="glass-card p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <h4 className="font-bold text-xs text-white truncate">{p.birimAdi}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{p.universiteAdi}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="font-semibold text-indigo-300">{p.puanTuru}</span>
                      <span>{t('drawer.rank', { rank: formatRank(p.basariSirasi) })}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveBookmark(p.kilavuzKodu)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Actions */}
        {savedPrograms.length > 0 && (
          <div className="border-t border-slate-800 pt-4 flex items-center gap-3">
            <Button
              className="flex-1"
              onClick={() => exportPreferencesToCSV(savedPrograms)}
            >
              <Download className="w-4 h-4" />
              <span>{t('drawer.exportCsv')}</span>
            </Button>

            <Button variant="ghost" onClick={onClearAll}>
              {t('drawer.clearAll')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

