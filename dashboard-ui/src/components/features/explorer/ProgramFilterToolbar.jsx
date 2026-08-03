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
        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
        : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-800 hover:text-slate-300'
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

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full md:w-80">
          <Input
            icon={Search}
            placeholder={t('explorer.searchPlaceholder')}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto md:ml-auto">
          <Select
            options={[
              { value: 10, label: t('explorer.perPage', { count: 10 }) },
              { value: 25, label: t('explorer.perPage', { count: 25 }) },
              { value: 50, label: t('explorer.perPage', { count: 50 }) },
              { value: 100, label: t('explorer.perPage', { count: 100 }) }
            ]}
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
          />
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
            {t('explorer.total')}: <strong className="text-white">{formatNumber(totalCount)}</strong>
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-3 border-t border-slate-800/50">
        <div className="flex flex-wrap items-center gap-2">
          {scoreTypesList.map(opt => (
            <TogglePill
              key={opt.value}
              label={opt.label}
              selected={scoreArray.includes(opt.value)}
              onClick={() => handleToggle(scoreType, opt.value, onScoreTypeChange)}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
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

