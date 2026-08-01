import React from 'react';
import { GraduationCap, Zap } from 'lucide-react';
import { Select } from '../../ui/Select';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { useLanguage } from '../../../hooks/useLanguage';

export function WizardForm({ scoreType, onScoreTypeChange, targetRank, onTargetRankChange, onSubmit }) {
  const { t } = useLanguage();

  const options = [
    { value: 'SAY', label: 'SAY (Sayısal)' },
    { value: 'EA', label: 'EA (Eşit Ağırlık)' },
    { value: 'SÖZ', label: 'SÖZ (Sözel)' },
    { value: 'DİL', label: 'DİL (Dil)' },
  ];

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center gap-2">
        <GraduationCap className="w-6 h-6 text-indigo-400" />
        <h2 className="text-lg font-bold text-white">{t('wizard.title')}</h2>
      </div>
      <p className="text-xs text-slate-400">
        {t('wizard.description')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">{t('wizard.scoreTypeLabel')}</label>
          <Select options={options} value={scoreType} onChange={(e) => onScoreTypeChange(e.target.value)} className="w-full" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">{t('wizard.targetRankLabel')}</label>
          <Input
            type="number"
            placeholder="e.g. 25000"
            value={targetRank}
            onChange={(e) => onTargetRankChange(parseInt(e.target.value, 10) || 0)}
          />
        </div>

        <div className="flex items-end">
          <Button onClick={onSubmit} className="w-full">
            <Zap className="w-4 h-4" />
            <span>{t('wizard.generateBtn')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

