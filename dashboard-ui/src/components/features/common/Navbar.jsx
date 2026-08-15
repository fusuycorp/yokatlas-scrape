import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { GraduationCap, GitCompare, LineChart, Compass, Bookmark, Sun, Moon } from 'lucide-react';
import { useLanguage } from '../../../hooks/useLanguage';
import { useTheme } from '../../../hooks/useTheme';

export function Navbar({ savedCount, onOpenDrawer }) {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const tabs = [
    { id: 'explorer', path: '/', label: t('nav.explorer'), icon: Compass },
    { id: 'compare', path: '/karsilastir', label: t('nav.compare'), icon: GitCompare },
    { id: 'trends', path: '/trendler', label: t('nav.trends'), icon: LineChart },
    { id: 'wizard', path: '/tercih-sihirbazi', label: t('nav.wizard'), icon: GraduationCap },
  ];

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="font-bold text-lg text-white tracking-tight">{t('nav.brandTitle')}</div>
              <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                2019 - 2026
              </span>
            </div>
            <p className="text-xs text-slate-400">{t('nav.brandSubtitle')}</p>
          </div>
        </NavLink>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            return (
              <NavLink
                key={tab.id}
                to={tab.path}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all flex items-center justify-center shadow-sm"
            title="Toggle Theme"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setLanguage('tr')}
              aria-label="Türkçe"
              className={`px-2.5 py-1 rounded-lg transition-all ${
                language === 'tr'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              TR
            </button>
            <button
              onClick={() => setLanguage('en')}
              aria-label="English"
              className={`px-2.5 py-1 rounded-lg transition-all ${
                language === 'en'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
          </div>

          {/* Preference Drawer Trigger */}
          <button
            onClick={onOpenDrawer}
            aria-label="My Draft"
            className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition"
          >
            <Bookmark className="w-4 h-4 text-indigo-400" />
            <span>{t('nav.myDraft')}</span>
            {savedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500 text-white">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
