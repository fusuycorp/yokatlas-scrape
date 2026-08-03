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
import { ProgramModal } from '../common/ProgramModal';

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
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
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
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {university.ilAdi}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-indigo-400 shrink-0" />
              <span>{uniName}</span>
            </h1>
            <p className="text-sm text-slate-400">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>{t('universityModal.totalPrograms')}</span>
              </div>
              <p className="text-lg font-bold text-white mt-1">
                {formatNumber(university.total_programs)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>{t('universityModal.totalQuota')}</span>
              </div>
              <p className="text-lg font-bold text-white mt-1">
                {formatNumber(university.total_quota)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Award className="w-4 h-4 text-purple-400" />
                <span>{t('universityModal.totalFaculty')}</span>
              </div>
              <p className="text-lg font-bold text-white mt-1">
                {formatNumber(totalFaculty)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>{t('universityModal.avgRank')}</span>
              </div>
              <p className="text-lg font-bold text-emerald-400 mt-1">
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
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          {/* Department Search and Score Type Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="w-full md:w-80">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('universityModal.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <span className="text-xs text-slate-400 font-medium mr-1">
                {t('universityModal.filterScoreType')}:
              </span>
              {['', 'SAY', 'EA', 'SÖZ', 'DİL', 'TYT'].map((st) => (
                <button
                  key={st}
                  onClick={() => setScoreType(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
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

          {/* Department List Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
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
                          <div className="font-medium text-slate-100 hover:text-indigo-300 transition">
                            {dept.birimAdi}
                          </div>
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
        </div>
      )}

      {/* Program Inspection Modal (Opens over the University Page) */}
      {inspectProgramCode && (
        <ProgramModal
          programCode={inspectProgramCode}
          onClose={() => setInspectProgramCode(null)}
          onToggleBookmark={onToggleBookmark}
          isBookmarked={bookmarkedIds.has(inspectProgramCode)}
        />
      )}
    </div>
  );
}
