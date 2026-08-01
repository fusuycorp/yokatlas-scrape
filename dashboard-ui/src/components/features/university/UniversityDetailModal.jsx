import React from 'react';
import {
  X,
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

export function UniversityDetailModal({
  uniName,
  onClose,
  onSelectProgram,
  onToggleBookmark,
  bookmarkedIds = new Set(),
}) {
  const { t } = useLanguage();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-900/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={university?.universiteTuru === 'DEVLET' ? 'emerald' : 'purple'}>
                {university?.universiteTuru === 'DEVLET'
                  ? t('explorer.stateUni')
                  : university?.universiteTuru === 'VAKIF'
                  ? t('explorer.foundationUni')
                  : university?.universiteTuru || 'Devlet'}
              </Badge>
              {university?.ilAdi && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {university.ilAdi}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 mt-1">
              <Building2 className="w-6 h-6 text-indigo-400 shrink-0" />
              <span>{uniName}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {t('universityModal.subtitle', {
                city: university?.ilAdi || '',
                type: university?.universiteTuru || '',
                total: university?.total_programs || departments.length,
              })}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-slate-200">
          {loading ? (
            <div className="py-16">
              <Spinner message={t('universityModal.loading')} />
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">
              <p className="font-semibold">{t('universityModal.error')}</p>
              <p className="text-xs text-slate-400 mt-1">{error}</p>
            </div>
          ) : (
            <>
              {/* Summary Stats Header */}
              {university && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span>{t('comparator.totalPrograms')}</span>
                      <GraduationCap className="w-4 h-4 text-indigo-400" />
                    </div>
                    <p className="text-xl font-bold text-white">{university.total_programs}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span>{t('universityModal.totalQuota')}</span>
                      <Award className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-xl font-bold text-cyan-300">
                      {formatNumber(university.total_quota)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span>{t('universityModal.avgRank')}</span>
                      <ArrowUpDown className="w-4 h-4 text-indigo-400" />
                    </div>
                    <p className="text-xl font-bold text-indigo-300">
                      {university.avg_basari_sirasi
                        ? formatNumber(Math.round(university.avg_basari_sirasi))
                        : '—'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span>{t('universityModal.academicStaff')}</span>
                      <Users className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-xl font-bold text-emerald-300">
                      {totalFaculty}{' '}
                      <span className="text-xs font-normal text-slate-400">
                        ({university.total_prof} Prof)
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Department Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('universityModal.searchPlaceholder')}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={scoreType}
                    onChange={(e) => setScoreType(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">{t('universityModal.allScoreTypes')}</option>
                    <option value="SAY">SAY</option>
                    <option value="EA">EA</option>
                    <option value="SÖZ">SÖZ</option>
                    <option value="DİL">DİL</option>
                  </select>

                  <span className="text-xs text-slate-400 shrink-0">
                    {departments.length} / {university?.total_programs || 0}
                  </span>
                </div>
              </div>

              {/* Departments Table */}
              <div className="rounded-xl border border-slate-800 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-3.5 w-10 text-center">#</th>
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
                        <th className="py-3 px-3.5 text-right">
                          {t('universityModal.colActions')}
                        </th>
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
                              className="hover:bg-slate-800/40 transition"
                            >
                              <td className="py-2.5 px-3.5 text-center">
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
                                <div className="font-medium text-slate-100">
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
                                      Akredite
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
                              <td className="py-2.5 px-3.5 text-right">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => onSelectProgram?.(dept.kilavuzKodu)}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
