import React, { useState, useEffect } from 'react';
import { LineChart as LineChartIcon, Search, CheckCircle2, AlertTriangle, Sparkles, BookOpen } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function TrendsTab({ selectedProgramCode }) {
  const [progCode, setProgCode] = useState(selectedProgramCode || 106510077); // Default AGÜ Bilgisayar Mühendisliği
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchCode, setSearchCode] = useState('');

  useEffect(() => {
    if (!progCode) return;
    setLoading(true);
    fetch(`/api/trends/${progCode}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [progCode]);

  // Format historical line chart data
  const chartData = data?.history ? data.history.map((h) => ({
    year: h.year,
    rank: h.final_rank_012,
    score: h.final_score_012,
    quota: h.total_quota
  })) : [];

  // Add 2026 scraped point if available
  if (data?.program?.basariSirasi) {
    chartData.push({
      year: 2026,
      rank: data.program.basariSirasi,
      score: data.program.minPuan,
      quota: data.program.kontenjan
    });
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LineChartIcon className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Program Historical Rank & Net Statistics</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">Multi-year cutoff rank trajectory (2019-2026) and student TYT/AYT net averages.</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Enter Program Code (e.g. 106510077)..."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 w-64 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => searchCode && setProgCode(parseInt(searchCode))}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
          >
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p>Loading historical data and net stats...</p>
        </div>
      ) : data?.program ? (
        <div className="space-y-6">
          {/* Program Banner */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  {data.program.universiteTuru} • {data.program.puanTuru}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{data.program.birimAdi}</h3>
                <p className="text-sm font-medium text-slate-300">{data.program.universiteAdi} ({data.program.ilAdi})</p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-400">2026 Cutoff Rank</p>
                <p className="text-2xl font-bold text-indigo-400">
                  {data.program.basariSirasi ? data.program.basariSirasi.toLocaleString() : '—'}
                </p>
              </div>
            </div>

            {/* Threshold condition alert */}
            {data.program.minBasariSirasiKosul && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Official YÖK Threshold:</strong> {data.program.minBasariSirasiKosul}</span>
              </div>
            )}
          </div>

          {/* Historical Line Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-sm text-white">Cutoff Success Rank Trajectory (2019 - 2026)</h4>
              <span className="text-xs text-slate-400">Lower rank number = Higher selectivity</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" reversed domain={['dataMin - 1000', 'dataMax + 1000']} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="rank" name="Cutoff Rank" stroke="#818cf8" strokeWidth={3} dot={{ r: 5, fill: '#818cf8' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Net Stats Table */}
          {data.net_stats && data.net_stats.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h4 className="font-bold text-sm text-white">Average Enrolled Student Net Scores by Subject</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Subject / Lesson</th>
                      <th className="py-2.5 px-3">Exam</th>
                      <th className="py-2.5 px-3">Year</th>
                      <th className="py-2.5 px-3">Avg Net Correct</th>
                      <th className="py-2.5 px-3">Max Questions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.net_stats.slice(0, 16).map((n, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-medium text-white">{n.lesson_name}</td>
                        <td className="py-2 px-3 text-slate-400">{n.exam_type}</td>
                        <td className="py-2 px-3 text-slate-400">{n.year}</td>
                        <td className="py-2 px-3 font-bold text-indigo-300">{n.average_net}</td>
                        <td className="py-2 px-3 text-slate-400">{n.max_questions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
