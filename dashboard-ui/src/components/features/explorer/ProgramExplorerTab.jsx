import React from 'react';
import { Building2, Award, MapPin, Users } from 'lucide-react';
import { useStats } from '../../../hooks/useStats';
import { usePrograms } from '../../../hooks/usePrograms';
import { useLanguage } from '../../../hooks/useLanguage';
import { formatNumber } from '../../../utils/formatters';
import { StatCard } from '../../ui/StatCard';
import { ProgramFilterToolbar } from './ProgramFilterToolbar';
import { ProgramTable } from './ProgramTable';

export function ProgramExplorerTab({ onSelectProgram, onSelectUniversity, onToggleBookmark, bookmarkedIds }) {
  const { stats } = useStats();
  const { t } = useLanguage();
  const {
    programs,
    totalCount,
    totalPages,
    loading,
    page,
    setPage,
    search,
    setSearch,
    scoreType,
    setScoreType,
    uniType,
    setUniType,
    toggleSort,
    limit,
    setLimit,
  } = usePrograms();

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title={t('explorer.totalUniversities')}
            value={formatNumber(stats.total_universities)}
            icon={Building2}
            color="indigo"
          />
          <StatCard
            title={t('explorer.scrapedPrograms')}
            value={formatNumber(stats.total_programs)}
            icon={Award}
            color="cyan"
          />
          <StatCard
            title={t('explorer.provincesCovered')}
            value={stats.total_cities}
            icon={MapPin}
            color="emerald"
          />
          <StatCard
            title={t('explorer.stateVsVakif')}
            value={`${formatNumber(stats.university_types['DEVLET'] || 0)} / ${formatNumber(stats.university_types['VAKIF'] || 0)}`}
            icon={Users}
            color="amber"
          />
        </div>
      )}

      {/* Filter Toolbar */}
      <ProgramFilterToolbar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        scoreType={scoreType}
        onScoreTypeChange={(val) => {
          setScoreType(val);
          setPage(1);
        }}
        uniType={uniType}
        onUniTypeChange={(val) => {
          setUniType(val);
          setPage(1);
        }}
        limit={limit}
        onLimitChange={(val) => {
          setLimit(val);
          setPage(1);
        }}
        totalCount={totalCount}
      />

      {/* Program Table */}
      <ProgramTable
        programs={programs}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        toggleSort={toggleSort}
        onSelectProgram={onSelectProgram}
        onSelectUniversity={onSelectUniversity}
        onToggleBookmark={onToggleBookmark}
        bookmarkedIds={bookmarkedIds}
      />
    </div>
  );
}

