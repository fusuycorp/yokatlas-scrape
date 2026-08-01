import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { SCORE_TYPES, UNIVERSITY_TYPES } from '../../../constants/university';
import { useLanguage } from '../../../hooks/useLanguage';
import { formatNumber } from '../../../utils/formatters';

export function ProgramFilterToolbar({
  search,
  onSearchChange,
  scoreType,
  onScoreTypeChange,
  uniType,
  onUniTypeChange,
  totalCount,
}) {
  const { t } = useLanguage();

  const localizedScoreTypes = SCORE_TYPES.map((opt) => ({
    ...opt,
    label: opt.value === '' ? t('explorer.allScoreTypes') : opt.label,
  }));

  const localizedUniTypes = UNIVERSITY_TYPES.map((opt) => {
    let label = opt.label;
    if (opt.value === '') label = t('explorer.allUniTypes');
    else if (opt.value === 'DEVLET') label = t('explorer.stateUni');
    else if (opt.value === 'VAKIF') label = t('explorer.foundationUni');
    else if (opt.value === 'KKTC') label = t('explorer.kktcUni');
    return { ...opt, label };
  });

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Search */}
      <div className="w-full md:w-80">
        <Input
          icon={Search}
          placeholder={t('explorer.searchPlaceholder')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <Select
          options={localizedScoreTypes}
          value={scoreType}
          onChange={(e) => onScoreTypeChange(e.target.value)}
        />

        <Select
          options={localizedUniTypes}
          value={uniType}
          onChange={(e) => onUniTypeChange(e.target.value)}
        />

        <span className="text-xs text-slate-400 font-medium ml-auto">
          {t('explorer.total')}: <strong className="text-white">{formatNumber(totalCount)}</strong>
        </span>
      </div>
    </div>
  );
}

