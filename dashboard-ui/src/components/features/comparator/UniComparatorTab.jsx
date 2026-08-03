import React, { useState } from 'react';
import { GitCompare, X } from 'lucide-react';
import { useCompare } from '../../../hooks/useCompare';
import { useLanguage } from '../../../hooks/useLanguage';
import { Spinner } from '../../ui/Spinner';
import { UniComparisonCards } from './UniComparisonCards';
import { FacultyChart } from './FacultyChart';
import { trIncludes } from '../../../utils/turkish';

export function UniComparatorTab({ onSelectUniversity }) {
  const { allUnis, selectedUnis, comparisonData, loading, addUniversity, removeUniversity } = useCompare();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUniOptions = allUnis.filter(
    (u) => !selectedUnis.includes(u.universiteAdi) && trIncludes(u.universiteAdi, searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">{t('comparator.title')}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">{t('comparator.subtitle')}</p>
        </div>

        {/* Selected Uni Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedUnis.map((uni) => (
            <span key={uni} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-xs font-semibold text-indigo-200">
              <button
                onClick={() => onSelectUniversity?.(uni)}
                className="hover:text-white hover:underline cursor-pointer transition text-left"
              >
                {uni}
              </button>
              {selectedUnis.length > 2 && (
                <button onClick={() => removeUniversity(uni)} className="hover:text-red-400 transition ml-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
          ))}

          {/* Add Uni Dropdown */}
          {selectedUnis.length < 4 && (
            <div className="relative">
              <input
                type="text"
                placeholder={t('comparator.addPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44"
              />
              {searchTerm && filteredUniOptions.length > 0 && (
                <div className="absolute left-0 mt-1 w-64 max-h-48 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 py-1">
                  {filteredUniOptions.slice(0, 10).map((u) => (
                    <button
                      key={u.universiteAdi}
                      onClick={() => {
                        addUniversity(u.universiteAdi);
                        setSearchTerm('');
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-xs text-slate-200"
                    >
                      {u.universiteAdi} ({u.ilAdi})
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Comparison Grid */}
      {loading ? (
        <Spinner message={t('comparator.loading')} />
      ) : (
        <div className="space-y-6">
          <UniComparisonCards comparisonData={comparisonData} onSelectUniversity={onSelectUniversity} />
          <FacultyChart comparisonData={comparisonData} />
        </div>
      )}
    </div>
  );
}

