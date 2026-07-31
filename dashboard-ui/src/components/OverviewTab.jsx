import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, Building2, MapPin, Award, Users, Bookmark, ChevronLeft, ChevronRight, Info } from 'lucide-react';

export default function OverviewTab({ onSelectProgram, onToggleBookmark, bookmarkedIds }) {
  const [stats, setStats] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters state
  const [search, setSearch] = useState('');
  const [scoreType, setScoreType] = useState('');
  const [uniType, setUniType] = useState('');
  const [sortBy, setSortBy] = useState('basariSirasi');
  const [sortDir, setSortDir] = useState('ASC');

  // Fetch global stats once
  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error('Error fetching stats:', err));
  }, []);

  // Fetch programs on filter change
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '15',
      sort_by: sortBy,
      sort_dir: sortDir,
    });
    if (search) params.append('search', search);
    if (scoreType) params.append('score_type', scoreType);
    if (uniType) params.append('uni_type', uniType);

    fetch(`/api/programs?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setPrograms(data.programs || []);
        setTotalCount(data.total || 0);
        setTotalPages(data.total_pages || 1);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching programs:', err);
        setLoading(false);
      });
  }, [page, search, scoreType, uniType, sortBy, sortDir]);

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(col);
      setSortDir('ASC');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Universities</p>
              <h3 className="text-xl font-bold text-white">{stats.total_universities.toLocaleString()}</h3>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Scraped Programs (2026)</p>
              <h3 className="text-xl font-bold text-white">{stats.total_programs.toLocaleString()}</h3>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Provinces Covered</p>
              <h3 className="text-xl font-bold text-white">{stats.total_cities}</h3>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">State vs Vakıf</p>
              <h3 className="text-xl font-bold text-white">
                {stats.university_types['DEVLET'] || 0} / {stats.university_types['VAKIF'] || 0}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search university, program..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700/70 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Score type */}
          <select
            value={scoreType}
            onChange={(e) => {
              setScoreType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/70 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Score Types</option>
            <option value="SAY">SAY (Sayısal)</option>
            <option value="EA">EA (Eşit Ağırlık)</option>
            <option value="SÖZ">SÖZ (Sözel)</option>
            <option value="DİL">DİL (Dil)</option>
          </select>

          {/* Uni type */}
          <select
            value={uniType}
            onChange={(e) => {
              setUniType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/70 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Uni Types</option>
            <option value="DEVLET">Devlet (State)</option>
            <option value="VAKIF">Vakıf (Foundation)</option>
          </select>

          <span className="text-xs text-slate-400 font-medium ml-auto">
            Total: <strong className="text-white">{totalCount.toLocaleString()}</strong>
          </span>
        </div>
      </div>

      {/* Program Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">Save</th>
                <th className="py-3.5 px-4">University & City</th>
                <th className="py-3.5 px-4">Program / Department</th>
                <th className="py-3.5 px-4 cursor-pointer" onClick={() => toggleSort('puanTuru')}>
                  <div className="flex items-center gap-1">
                    <span>Field</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer" onClick={() => toggleSort('basariSirasi')}>
                  <div className="flex items-center gap-1">
                    <span>2026 Min Rank</span>
                    <ArrowUpDown className="w-3 h-3 text-indigo-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer" onClick={() => toggleSort('minPuan')}>
                  <div className="flex items-center gap-1">
                    <span>2026 Min Score</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Quota</th>
                <th className="py-3.5 px-4">Prof/Assoc</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Loading programs...</p>
                  </td>
                </tr>
              ) : programs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No programs matched your filters.
                  </td>
                </tr>
              ) : (
                programs.map((p) => {
                  const isBookmarked = bookmarkedIds.has(p.kilavuzKodu);
                  return (
                    <tr key={p.kilavuzKodu} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onToggleBookmark(p)}
                          className={`p-1.5 rounded-lg transition ${
                            isBookmarked ? 'text-amber-400 bg-amber-400/10' : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{p.universiteAdi}</div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] ${p.universiteTuru === 'DEVLET' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'}`}>
                            {p.universiteTuru}
                          </span>
                          <span>{p.ilAdi}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">{p.birimAdi}</div>
                        {p.bursOraniAdi && (
                          <span className="text-[10px] text-indigo-400 font-medium">{p.bursOraniAdi}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-slate-800 text-indigo-300 border border-slate-700">
                          {p.puanTuru}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-indigo-300">
                          {p.basariSirasi ? p.basariSirasi.toLocaleString() : '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {p.minPuan ? p.minPuan.toFixed(2) : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">
                        {p.kontenjan || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {p.prof + p.doc} ({p.prof} Prof)
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectProgram(p.kilavuzKodu)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-[11px] transition"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
