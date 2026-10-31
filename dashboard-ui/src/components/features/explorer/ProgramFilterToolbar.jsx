import React, { useState, useRef, useEffect } from 'react';
import { Search, Check, MapPin, ChevronDown, X } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { SCORE_TYPES, UNIVERSITY_TYPES } from '../../../constants/university';
import { useLanguage } from '../../../hooks/useLanguage';
import { formatNumber } from '../../../utils/formatters';
import { trIncludes } from '../../../utils/turkish';

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
  const [cityOpen, setCityOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState('');
  const comboboxRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target)) {
        setCityOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setCityOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
  const cityArray = city ? city.split(',').filter(Boolean) : [];

  const filteredCities = cityQuery
    ? cities.filter((c) => trIncludes(c, cityQuery))
    : cities;

  const cityButtonLabel =
    cityArray.length === 0
      ? t('explorer.allCities')
      : cityArray.length === 1
      ? cityArray[0]
      : t('explorer.citiesSelected', { count: cityArray.length });

  return (
    <div className="glass-panel p-3.5 sm:p-5 rounded-2xl border border-slate-800 flex flex-col gap-3 sm:gap-4 shadow-lg">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input & Multi-City Combobox */}
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
            <div ref={comboboxRef} className="relative w-full sm:w-52">
              <div
                className={`w-full flex items-center justify-between gap-1 px-3 py-2.5 sm:py-2 rounded-xl border text-xs font-medium transition ${
                  cityArray.length > 0
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-200 light:bg-indigo-50 light:border-indigo-400 light:text-indigo-800'
                    : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-600 light:bg-white light:border-slate-300 light:text-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setCityOpen((prev) => !prev)}
                  className="flex-1 flex items-center gap-1.5 truncate text-left cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{cityButtonLabel}</span>
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  {cityArray.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onCityChange?.('')}
                      className="p-0.5 rounded hover:bg-slate-700/60 text-slate-400 hover:text-white cursor-pointer"
                      aria-label={t('explorer.clearCities')}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setCityOpen((prev) => !prev)}
                    aria-label={t('explorer.allCities')}
                    className="p-0.5 cursor-pointer"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${cityOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {cityOpen && (
                <div className="absolute left-0 mt-1.5 w-full sm:w-64 bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-2 border-b border-slate-800 light:border-slate-200 flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                    <input
                      type="text"
                      autoFocus
                      placeholder={t('explorer.citySearchPlaceholder')}
                      value={cityQuery}
                      onChange={(e) => setCityQuery(e.target.value)}
                      className="w-full bg-transparent text-xs text-white light:text-slate-900 placeholder-slate-500 focus:outline-none py-1"
                    />
                    {cityArray.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onCityChange?.('')}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium whitespace-nowrap px-1.5 py-0.5 rounded hover:bg-slate-800 light:hover:bg-slate-100 cursor-pointer"
                      >
                        {t('explorer.clearCities')}
                      </button>
                    )}
                  </div>
                  <div className="max-h-56 overflow-y-auto py-1 divide-y divide-slate-800/40 light:divide-slate-100">
                    {filteredCities.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500">
                        {t('explorer.empty')}
                      </div>
                    ) : (
                      filteredCities.map((c) => {
                        const isSelected = cityArray.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => handleToggle(city, c, onCityChange)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600/20 text-indigo-200 font-semibold light:bg-indigo-50 light:text-indigo-700'
                                : 'text-slate-300 hover:bg-slate-800 light:text-slate-700 light:hover:bg-slate-100'
                            }`}
                          >
                            <span className="truncate">{c}</span>
                            <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-600'}`}>
                              {isSelected && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
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
        {cityArray.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {cityArray.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 light:bg-indigo-100 light:text-indigo-800 light:border-indigo-300"
              >
                <MapPin className="w-3 h-3 text-indigo-400" />
                <span>{c}</span>
                <button
                  type="button"
                  onClick={() => handleToggle(city, c, onCityChange)}
                  aria-label={`Remove ${c}`}
                  className="ml-0.5 hover:text-white light:hover:text-indigo-950 transition cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
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

