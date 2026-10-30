import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Search,
  Users,
  ArrowUpDown,
  Bookmark,
  Info,
  GraduationCap,
  MapPin,
  Award,
} from 'lucide-react';
import { useUniversityDepartments } from '../../../hooks/useUniversityDepartments';
import { useLanguage } from '../../../hooks/useLanguage';
import { formatRank, formatScore, formatNumber } from '../../../utils/formatters';
import { Spinner } from '../../ui/Spinner';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

const ProgramModal = React.lazy(() =>
  import('../common/ProgramModal').then((m) => ({ default: m.ProgramModal }))
);

export function UniversityPage({
  uniName,
  onBack,
  onToggleBookmark,
  bookmarkedIds = new Set(),
}) {
  const { t } = useLanguage();
  const [inspectProgramCode, setInspectProgramCode] = useState(null);

  const {
    university,
    departments,
    loading,
    error,
    search,
    setSearch,
    scoreType,
    setScoreType,
    toggleSort,
  } = useUniversityDepartments(uniName);

  if (!uniName) return null;

  const totalFaculty = university
    ? (university.total_prof || 0) +
      (university.total_doc || 0) +
      (university.total_dou || 0) +
      (university.total_argor || 0)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>{t('universityModal.backToExplorer', 'Keşfet Sayfasına Dön')}</span>
        </Button>
      </div>

      {/* University Header Hero Card */}
      <div className="glass-panel p-4 sm:p-6 lg:p-8 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={university?.universiteTuru === 'DEVLET' ? 'emerald' : 'purple'}>
                {university?.universiteTuru === 'DEVLET'
                  ? t('explorer.stateUni')
                  : university?.universiteTuru === 'VAKIF'
                  ? t('explorer.foundationUni')
                  : university?.universiteTuru || t('explorer.stateUni')}
              </Badge>
              {university?.ilAdi && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 light:text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {university.ilAdi}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white light:text-slate-900 flex items-center gap-2.5 sm:gap-3">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400 shrink-0" />
              <span>{uniName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {t('universityModal.subtitle', {
                city: university?.ilAdi || '',
                type: university?.universiteTuru || '',
                total: university?.total_programs || departments.length,
              })}
            </p>
          </div>
        </div>

        {/* Quick Stat Cards */}
        {university && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 pt-2">
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 text-xs font-medium">
                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
                <span className="truncate">{t('universityModal.totalPrograms')}</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-white mt-1">
                {formatNumber(university.total_programs)}
              </p>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 text-xs font-medium">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                <span className="truncate">{t('universityModal.totalQuota')}</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-white mt-1">
                {formatNumber(university.total_quota)}
              </p>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 text-xs font-medium">
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                <span className="truncate">{t('universityModal.totalFaculty')}</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-white mt-1">
                {formatNumber(totalFaculty)}
              </p>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 text-xs font-medium">
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                <span className="truncate">{t('universityModal.avgRank')}</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-emerald-400 mt-1">
                {formatRank(university.avg_basari_sirasi)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800">
          <Spinner message={t('universityModal.loading')} />
        </div>
      ) : error ? (
        <div className="glass-panel p-6 text-center text-red-400 bg-red-500/10 rounded-2xl border border-red-500/20">
          {error}
        </div>
      ) : (
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4 sm:space-y-5 shadow-xl">
          {/* Department Search and Score Type Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="w-full sm:w-80">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={t('universityModal.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 sm:py-2 text-base sm:text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-slate-400 font-medium mr-1 whitespace-nowrap hidden sm:inline">
                {t('universityModal.filterScoreType')}:
              </span>
              {['', 'SAY', 'EA', 'SÖZ', 'DİL', 'TYT'].map((st) => (
                <button
                  key={st}
                  onClick={() => setScoreType(st)}
                  className={`px-3 py-1.5 sm:py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    scoreType === st
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === '' ? t('explorer.allScoreTypes') : st}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Department List Table (>= md screens) */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3.5 text-center w-10">★</th>
                  <th
                    className="py-3 px-3.5 cursor-pointer hover:text-white"
                    onClick={() => toggleSort('birimAdi')}
                  >
                    <div className="flex items-center gap-1">
                      <span>{t('universityModal.colDept')}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-3.5 cursor-pointer hover:text-white"
                    onClick={() => toggleSort('puanTuru')}
                  >
                    <div className="flex items-center gap-1">
                      <span>{t('universityModal.colField')}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-3.5 cursor-pointer hover:text-white"
                    onClick={() => toggleSort('basariSirasi')}
                  >
                    <div className="flex items-center gap-1">
                      <span>{t('universityModal.colRank')}</span>
                      <ArrowUpDown className="w-3 h-3 text-indigo-400" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-3.5 cursor-pointer hover:text-white"
                    onClick={() => toggleSort('minPuan')}
                  >
                    <div className="flex items-center gap-1">
                      <span>{t('universityModal.colScore')}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3 px-3.5">{t('universityModal.colQuota')}</th>
                  <th className="py-3 px-3.5">{t('universityModal.colFaculty')}</th>
                  <th className="py-3 px-3.5 text-right">{t('universityModal.colActions')}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500">
                      {t('universityModal.noDepartments')}
                    </td>
                  </tr>
                ) : (
                  departments.map((dept) => {
                    const isBookmarked = bookmarkedIds.has(dept.kilavuzKodu);
                    return (
                      <tr
                        key={dept.kilavuzKodu}
                        className="hover:bg-slate-800/40 transition cursor-pointer"
                        onClick={() => setInspectProgramCode(dept.kilavuzKodu)}
                      >
                        <td
                          className="py-2.5 px-3.5 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onToggleBookmark?.(dept)}
                            className={`p-1.5 rounded-lg transition ${
                              isBookmarked
                                ? 'text-amber-400 bg-amber-400/10'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            <Bookmark className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectProgramCode(dept.kilavuzKodu);
                            }}
                            className="font-medium text-slate-100 hover:text-indigo-400 hover:underline text-left transition cursor-pointer"
                          >
                            {dept.birimAdi}
                          </button>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="font-mono text-[10px] text-slate-500">
                              {dept.kilavuzKodu}
                            </span>
                            {dept.bursOraniAdi && (
                              <span className="text-[10px] text-indigo-400 font-medium">
                                {dept.bursOraniAdi}
                              </span>
                            )}
                            {dept.akreditasyon ? (
                              <span className="text-[10px] text-emerald-400 font-semibold px-1 rounded bg-emerald-500/10">
                                {t('common.accredited')}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <Badge variant="indigo">{dept.puanTuru}</Badge>
                        </td>
                        <td className="py-2.5 px-3.5 font-bold text-indigo-300">
                          {formatRank(dept.basariSirasi)}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-300">
                          {formatScore(dept.minPuan)}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-300 font-medium">
                          {dept.kontenjan || '—'}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-400">
                          {(dept.prof || 0) + (dept.doc || 0)} ({dept.prof || 0} Prof)
                        </td>
                        <td className="py-2.5 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setInspectProgramCode(dept.kilavuzKodu)}
                          >
                            <Info className="w-3.5 h-3.5" />
                            <span>{t('universityModal.viewDetails')}</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Department Card List (< md screens) */}
          <div className="md:hidden">
            {departments.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                {t('universityModal.noDepartments')}
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 -mx-4">
                {departments.map((dept) => {
                  const isBookmarked = bookmarkedIds.has(dept.kilavuzKodu);
                  return (
                    <div
                      key={dept.kilavuzKodu}
                      className="p-4 space-y-3 hover:bg-slate-800/20 transition cursor-pointer"
                      onClick={() => setInspectProgramCode(dept.kilavuzKodu)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-slate-100 hover:text-indigo-400 transition">
                            {dept.birimAdi}
                          </h3>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                            <span className="font-mono text-[10px] text-slate-500">
                              {dept.kilavuzKodu}
                            </span>
                            {dept.bursOraniAdi && (
                              <span className="text-[10px] text-indigo-400 font-medium">
                                {dept.bursOraniAdi}
                              </span>
                            )}
                            {dept.akreditasyon && (
                              <span className="text-[10px] text-emerald-400 font-semibold px-1 rounded bg-emerald-500/10">
                                {t('common.accredited')}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark?.(dept);
                          }}
                          className={`p-2 rounded-xl border transition shrink-0 ${
                            isBookmarked
                              ? 'text-amber-400 bg-amber-400/10 border-amber-400/30'
                              : 'text-slate-400 bg-slate-900/80 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                        </button>
                      </div>

                      {/* Metrics 3-Col Grid */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">{t('universityModal.colField')}</span>
                          <Badge variant="indigo" className="mt-0.5">{dept.puanTuru}</Badge>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">{t('universityModal.colRank')}</span>
                          <span className="font-bold text-indigo-300 text-xs block mt-0.5">
                            {formatRank(dept.basariSirasi)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">{t('universityModal.colScore')}</span>
                          <span className="font-semibold text-slate-200 text-xs block mt-0.5">
                            {formatScore(dept.minPuan)}
                          </span>
                        </div>
                      </div>

                      {/* Footer Info & Action */}
                      <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
                        <div>
                          <span>{t('universityModal.colQuota')}: <strong className="text-slate-200">{dept.kontenjan || '—'}</strong></span>
                          <span className="mx-1.5">•</span>
                          <span>{(dept.prof || 0) + (dept.doc || 0)} {t('comparator.assocAsst')}</span>
                        </div>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectProgramCode(dept.kilavuzKodu);
                          }}
                          className="shrink-0"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>{t('universityModal.viewDetails')}</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Program Inspection Modal (Opens over the University Page) */}
      {inspectProgramCode && (
        <React.Suspense fallback={null}>
          <ProgramModal
            programCode={inspectProgramCode}
            onClose={() => setInspectProgramCode(null)}
            onToggleBookmark={onToggleBookmark}
            isBookmarked={bookmarkedIds.has(inspectProgramCode)}
          />
        </React.Suspense>
      )}
    </div>
  );
}
