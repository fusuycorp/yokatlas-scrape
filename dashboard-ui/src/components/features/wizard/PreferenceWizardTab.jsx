import React from 'react';
import { Zap, Target, ShieldCheck } from 'lucide-react';
import { useWizard } from '../../../hooks/useWizard';
import { useLanguage } from '../../../hooks/useLanguage';
import { formatNumber } from '../../../utils/formatters';
import { Spinner } from '../../ui/Spinner';
import { WizardForm } from './WizardForm';
import { WizardCard } from './WizardCard';

export function PreferenceWizardTab({ onSelectProgram, onToggleBookmark, bookmarkedIds }) {
  const { t } = useLanguage();
  const {
    scoreType,
    setScoreType,
    targetRank,
    setTargetRank,
    wizardData,
    loading,
    fetchRecommendations,
  } = useWizard();

  return (
    <div className="space-y-6">
      <WizardForm
        scoreType={scoreType}
        onScoreTypeChange={setScoreType}
        targetRank={targetRank}
        onTargetRankChange={setTargetRank}
        onSubmit={fetchRecommendations}
      />

      {loading ? (
        <Spinner message={t('wizard.loading')} />
      ) : wizardData?.categories ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Reach Options */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">{t('wizard.reachTitle')}</h3>
                <p className="text-[11px] text-amber-300">
                  {t('wizard.reachRanks', {
                    min: formatNumber(wizardData.categories.reach.min_rank),
                    max: formatNumber(wizardData.categories.reach.max_rank),
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {wizardData.categories.reach.programs.map((p) => (
                <WizardCard
                  key={p.kilavuzKodu}
                  program={p}
                  onSelect={onSelectProgram}
                  onToggleBookmark={onToggleBookmark}
                  isBookmarked={bookmarkedIds.has(p.kilavuzKodu)}
                />
              ))}
            </div>
          </div>

          {/* Target Options */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">{t('wizard.targetTitle')}</h3>
                <p className="text-[11px] text-indigo-300">
                  {t('wizard.targetRanks', {
                    min: formatNumber(wizardData.categories.target.min_rank),
                    max: formatNumber(wizardData.categories.target.max_rank),
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {wizardData.categories.target.programs.map((p) => (
                <WizardCard
                  key={p.kilavuzKodu}
                  program={p}
                  onSelect={onSelectProgram}
                  onToggleBookmark={onToggleBookmark}
                  isBookmarked={bookmarkedIds.has(p.kilavuzKodu)}
                />
              ))}
            </div>
          </div>

          {/* Safe Options */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">{t('wizard.safeTitle')}</h3>
                <p className="text-[11px] text-emerald-300">
                  {t('wizard.safeRanks', {
                    min: formatNumber(wizardData.categories.safe.min_rank),
                    max: formatNumber(wizardData.categories.safe.max_rank),
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {wizardData.categories.safe.programs.map((p) => (
                <WizardCard
                  key={p.kilavuzKodu}
                  program={p}
                  onSelect={onSelectProgram}
                  onToggleBookmark={onToggleBookmark}
                  isBookmarked={bookmarkedIds.has(p.kilavuzKodu)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

