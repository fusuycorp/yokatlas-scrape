import React, { useState, useEffect } from 'react';
import { GitCompare, Plus, X, Building2, Users, GraduationCap, Award, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function ComparatorTab() {
  const [allUnis, setAllUnis] = useState([]);
  const [selectedUnis, setSelectedUnis] = useState(['ORTA DOĞU TEKNİK ÜNİVERSİTESİ', 'BOĞAZİÇİ ÜNİVERSİTESİ', 'İSTANBUL TEKNİK ÜNİVERSİTESİ']);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load all university list
  useEffect(() => {
    fetch('/api/universities')
      .then((res) => res.json())
      .then((data) => setAllUnis(data.universities || []))
      .catch((err) => console.error(err));
  }, []);

  // Fetch comparison stats when selectedUnis changes
  useEffect(() => {
    if (selectedUnis.length < 2) return;
    setLoading(true);

    const params = new URLSearchParams();
    selectedUnis.forEach((u) => params.append('unis', u));

    fetch(`/api/compare?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setComparisonData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedUnis]);

  const addUni = (name) => {
    if (!selectedUnis.includes(name) && selectedUnis.length < 4) {
      setSelectedUnis([...selectedUnis, name]);
      setSearchTerm('');
    }
  };

  const removeUni = (name) => {
    if (selectedUnis.length > 2) {
      setSelectedUnis(selectedUnis.filter((u) => u !== name));
    }
  };

  const filteredUniOptions = allUnis.filter(
    (u) => !selectedUnis.includes(u.universiteAdi) && u.universiteAdi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">University Head-to-Head Comparator</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">Compare academic staff, program offerings, quotas, and rank averages side-by-side.</p>
        </div>

        {/* Selected Uni Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedUnis.map((uni) => (
            <span key={uni} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-xs font-semibold text-indigo-200">
              <span>{uni}</span>
              {selectedUnis.length > 2 && (
                <button onClick={() => removeUni(uni)} className="hover:text-red-400 transition">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
          ))}

          {/* Add Uni Dropdown */}
          {selectedUnis.length < 4 && (
            <div className="relative">
              <input
                type="text"
                placeholder="+ Add University..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44"
              />
              {searchTerm && filteredUniOptions.length > 0 && (
                <div className="absolute left-0 mt-1 w-64 max-h-48 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 py-1">
                  {filteredUniOptions.slice(0, 10).map((u) => (
                    <button
                      key={u.universiteAdi}
                      onClick={() => addUni(u.universiteAdi)}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-xs text-slate-200"
                    >
                      {u.universiteAdi} ({u.ilAdi})
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Comparison Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p>Calculating comparative metrics...</p>
        </div>
      ) : comparisonData ? (
        <div className="space-y-6">
          {/* Side-by-side Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparisonData.comparison.map((uni, idx) => (
              <div key={uni.universiteAdi} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {uni.universiteTuru}
                    </span>
                    <h3 className="font-bold text-base text-white mt-1">{uni.universiteAdi}</h3>
                    <p className="text-xs text-slate-400">{uni.ilAdi}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <p className="text-slate-400">Total Programs</p>
                    <p className="text-lg font-bold text-white">{uni.program_count}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <p className="text-slate-400">Total Quota</p>
                    <p className="text-lg font-bold text-white">{uni.total_quota?.toLocaleString() || '—'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <p className="text-slate-400">Professors</p>
                    <p className="text-lg font-bold text-indigo-400">{uni.total_prof || 0}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <p className="text-slate-400">Assoc / Asst</p>
                    <p className="text-lg font-bold text-cyan-400">{(uni.total_doc || 0) + (uni.total_dou || 0)}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-[11px] text-indigo-300 font-medium">Avg Admission Rank (All Fields)</p>
                  <p className="text-xl font-bold text-white mt-0.5">
                    {uni.avg_basari_sirasi ? Math.round(uni.avg_basari_sirasi).toLocaleString() : '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Academic Staff Bar Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Academic Faculty Strength Comparison</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData.comparison}>
                  <XAxis dataKey="universiteAdi" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Legend />
                  <Bar dataKey="total_prof" name="Professors" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total_doc" name="Assoc. Profs" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total_argor" name="Research Asst." fill="#34d399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
