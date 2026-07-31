import React from 'react';
import { GraduationCap, GitCompare, LineChart, Compass, Bookmark, Database } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, savedCount, onOpenDrawer }) {
  const tabs = [
    { id: 'explorer', label: 'Program Explorer', icon: Compass },
    { id: 'compare', label: 'Uni Comparator', icon: GitCompare },
    { id: 'trends', label: 'Rank Trends & Nets', icon: LineChart },
    { id: 'wizard', label: 'YKS Target Wizard', icon: GraduationCap },
  ];

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight">YÖK ATLAS + YKS Analytics</h1>
              <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                2019 - 2026
              </span>
            </div>
            <p className="text-xs text-slate-400">Turkish University Comparison & Preference Intelligence Platform</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Saved List Drawer Trigger */}
        <button
          onClick={onOpenDrawer}
          className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition"
        >
          <Bookmark className="w-4 h-4 text-indigo-400" />
          <span>My Preference Draft</span>
          {savedCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500 text-white">
              {savedCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
