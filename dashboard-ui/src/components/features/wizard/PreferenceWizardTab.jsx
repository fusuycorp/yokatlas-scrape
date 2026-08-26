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
  const [mobileCategory, setMobileCategory] = React.useState('all');
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
    <div className="space-y-5 sm:space-y-6">
      <WizardForm
        scoreType={scoreType}
        onScoreTypeChange={setScoreType}
        targetRank={targetRank}
        onTargetRankChange={setTargetRank}
        onSubmit={fetchRecommendations}
      />

      {loading ? (
        <div className="py-12">
          <Spinner message={t('wizard.loading')} />
        </div>
      ) : wizardData?.categories ? (
        <div className="space-y-4">
          {/* Mobile Category Segment Filter (< md screens) */}
          <div className="md:hidden flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 gap-1">
            <button
              onClick={() => setMobileCategory('all')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
                mobileCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('explorer.allScoreTypes', 'Tümü')}
            </button>
            <button
              onClick={() => setMobileCategory('reach')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
                mobileCategory === 'reach'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('wizard.reachTitle')} ({wizardData.categories.reach.programs.length})
            </button>
            <button
              onClick={() => setMobileCategory('target')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
                mobileCategory === 'target'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('wizard.targetTitle')} ({wizardData.categories.target.programs.length})
            </button>
            <button
              onClick={() => setMobileCategory('safe')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
                mobileCategory === 'safe'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('wizard.safeTitle')} ({wizardData.categories.safe.programs.length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {/* Reach Options */}
            <div className={`space-y-4 ${mobileCategory !== 'all' && mobileCategory !== 'reach' ? 'hidden md:block' : ''}`}>
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
          <div className={`space-y-4 ${mobileCategory !== 'all' && mobileCategory !== 'target' ? 'hidden md:block' : ''}`}>
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
          <div className={`space-y-4 ${mobileCategory !== 'all' && mobileCategory !== 'safe' ? 'hidden md:block' : ''}`}>
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
      </div>
      ) : null}
    </div>
  );
}

