import React from 'react';
import { Search, Check } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { SCORE_TYPES, UNIVERSITY_TYPES } from '../../../constants/university';
import { useLanguage } from '../../../hooks/useLanguage';
import { formatNumber } from '../../../utils/formatters';

const TogglePill = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
      selected 
        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 light:bg-indigo-600 light:text-white light:border-indigo-600' 
        : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-800 hover:text-slate-300 light:bg-slate-100 light:border-slate-300 light:text-slate-700 hover:light:bg-slate-200'
    }`}
  >
    <div className={`w-3 h-3 rounded flex items-center justify-center border ${selected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-500'}`}>
      {selected && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
    </div>
    {label}
  </button>
);

export function ProgramFilterToolbar({
  search,
  onSearchChange,
  scoreType,
  onScoreTypeChange,
  uniType,
  onUniTypeChange,
  city,
  onCityChange,
  cities = [],
  limit,
  onLimitChange,
  totalCount,
}) {
  const { t } = useLanguage();

  const handleToggle = (currentValue, value, onChange) => {
    let currentArray = currentValue ? currentValue.split(',') : [];
    if (currentArray.includes(value)) {
      currentArray = currentArray.filter(v => v !== value);
    } else {
      currentArray.push(value);
    }
    onChange(currentArray.join(','));
  };

  const scoreTypesList = SCORE_TYPES.filter(opt => opt.value !== '');
  const uniTypesList = UNIVERSITY_TYPES.filter(opt => opt.value !== '');
  
  const scoreArray = scoreType ? scoreType.split(',') : [];
  const uniArray = uniType ? uniType.split(',') : [];

  const cityOptions = [
    { value: '', label: t('explorer.allCities') },
    ...cities.map((c) => ({ value: c, label: c })),
  ];

  return (
    <div className="glass-panel p-3.5 sm:p-5 rounded-2xl border border-slate-800 flex flex-col gap-3 sm:gap-4 shadow-lg">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input & City Select */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto flex-1">
          <div className="w-full sm:w-72 lg:w-80">
            <Input
              icon={Search}
              placeholder={t('explorer.searchPlaceholder')}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          {cities.length > 0 && (
            <Select
              options={cityOptions}
              value={city || ''}
              onChange={(e) => onCityChange?.(e.target.value)}
              className="w-full sm:w-44"
            />
          )}
        </div>

        {/* Per-Page & Total Count */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:ml-auto">
          <Select
            options={[
              { value: 10, label: t('explorer.perPage', { count: 10 }) },
              { value: 25, label: t('explorer.perPage', { count: 25 }) },
              { value: 50, label: t('explorer.perPage', { count: 50 }) },
              { value: 100, label: t('explorer.perPage', { count: 100 }) }
            ]}
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="w-32 sm:w-auto"
          />
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-800/80">
            {t('explorer.total')}: <strong className="text-white">{formatNumber(totalCount)}</strong>
          </span>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-800/60">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] text-slate-500 font-medium mr-1 hidden sm:inline">{t('universityModal.filterScoreType')}:</span>
          {scoreTypesList.map(opt => (
            <TogglePill
              key={opt.value}
              label={opt.label}
              selected={scoreArray.includes(opt.value)}
              onClick={() => handleToggle(scoreType, opt.value, onScoreTypeChange)}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] text-slate-500 font-medium mr-1 hidden sm:inline">{t('explorer.stateVsVakif')}:</span>
          {uniTypesList.map(opt => {
            let label = opt.label;
            if (opt.value === 'DEVLET') label = t('explorer.stateUni');
            else if (opt.value === 'VAKIF') label = t('explorer.foundationUni');
            else if (opt.value === 'KKTC') label = t('explorer.kktcUni');
            return (
              <TogglePill
                key={opt.value}
                label={label}
                selected={uniArray.includes(opt.value)}
                onClick={() => handleToggle(uniType, opt.value, onUniTypeChange)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

