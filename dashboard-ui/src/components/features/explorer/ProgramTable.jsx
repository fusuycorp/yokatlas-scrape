import React from 'react';
import { ArrowUpDown, Bookmark, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { formatRank, formatScore } from '../../../utils/formatters';
import { useLanguage } from '../../../hooks/useLanguage';
import { Spinner } from '../../ui/Spinner';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

export function ProgramTable({
  programs,
  loading,
  page,
  totalPages,
  onPageChange,
  toggleSort,
  onSelectProgram,
  onSelectUniversity,
  onToggleBookmark,
  bookmarkedIds,
}) {
  const { t } = useLanguage();

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4 w-12 text-center">{t('explorer.colSave')}</th>
              <th className="py-3.5 px-4">{t('explorer.colUniCity')}</th>
              <th className="py-3.5 px-4">{t('explorer.colProgramDept')}</th>
              <th className="py-3.5 px-4 cursor-pointer" onClick={() => toggleSort('puanTuru')}>
                <div className="flex items-center gap-1">
                  <span>{t('explorer.colField')}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer" onClick={() => toggleSort('basariSirasi')}>
                <div className="flex items-center gap-1">
                  <span>{t('explorer.colRank2026')}</span>
                  <ArrowUpDown className="w-3 h-3 text-indigo-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer" onClick={() => toggleSort('minPuan')}>
                <div className="flex items-center gap-1">
                  <span>{t('explorer.colScore2026')}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3.5 px-4">{t('explorer.colQuota')}</th>
              <th className="py-3.5 px-4">{t('explorer.colFaculty')}</th>
              <th className="py-3.5 px-4 text-right">{t('explorer.colActions')}</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={9}>
                  <Spinner message={t('explorer.loading')} />
                </td>
              </tr>
            ) : programs.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  {t('explorer.empty')}
                </td>
              </tr>
            ) : (
              programs.map((p) => {
                const isBookmarked = bookmarkedIds.has(p.kilavuzKodu);
                return (
                  <tr key={p.kilavuzKodu} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onToggleBookmark(p)}
                        className={`p-1.5 rounded-lg transition ${
                          isBookmarked
                            ? 'text-amber-400 bg-amber-400/10'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onSelectUniversity?.(p.universiteAdi)}
                        className="font-semibold text-white hover:text-indigo-400 hover:underline text-left transition cursor-pointer"
                      >
                        {p.universiteAdi}
                      </button>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <Badge variant={p.universiteTuru === 'DEVLET' ? 'emerald' : 'purple'}>
                          {p.universiteTuru === 'DEVLET' ? t('explorer.stateUni') : p.universiteTuru === 'VAKIF' ? t('explorer.foundationUni') : p.universiteTuru}
                        </Badge>
                        <span>{p.ilAdi}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{p.birimAdi}</div>
                      {p.bursOraniAdi && (
                        <span className="text-[10px] text-indigo-400 font-medium">
                          {p.bursOraniAdi}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="indigo">{p.puanTuru}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-indigo-300">
                        {formatRank(p.basariSirasi)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{formatScore(p.minPuan)}</td>
                    <td className="py-3 px-4 text-slate-300 font-medium">{p.kontenjan || '—'}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {p.prof + p.doc} ({p.prof} Prof)
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onSelectProgram(p.kilavuzKodu)}
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>{t('explorer.detailsBtn')}</span>
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {t('explorer.pageInfo', { page, totalPages })}
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

