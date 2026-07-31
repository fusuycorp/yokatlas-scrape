import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import OverviewTab from './components/OverviewTab';
import ComparatorTab from './components/ComparatorTab';
import TrendsTab from './components/TrendsTab';
import WizardTab from './components/WizardTab';
import ProgramModal from './components/ProgramModal';
import PreferenceDrawer from './components/PreferenceDrawer';

export default function App() {
  const [activeTab, setActiveTab] = useState('explorer');
  const [selectedProgramCode, setSelectedProgramCode] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Saved preferences in localStorage
  const [savedPrograms, setSavedPrograms] = useState(() => {
    try {
      const saved = localStorage.getItem('yks_saved_preferences');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('yks_saved_preferences', JSON.stringify(savedPrograms));
  }, [savedPrograms]);

  const bookmarkedIds = new Set(savedPrograms.map((p) => p.kilavuzKodu));

  const handleToggleBookmark = (program) => {
    if (bookmarkedIds.has(program.kilavuzKodu)) {
      setSavedPrograms(savedPrograms.filter((p) => p.kilavuzKodu !== program.kilavuzKodu));
    } else {
      setSavedPrograms([...savedPrograms, program]);
    }
  };

  const handleRemoveBookmark = (code) => {
    setSavedPrograms(savedPrograms.filter((p) => p.kilavuzKodu !== code));
  };

  const handleClearAll = () => {
    setSavedPrograms([]);
  };

  const handleOpenProgramDetails = (code) => {
    setSelectedProgramCode(code);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedPrograms.length}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      {/* Main App Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        {activeTab === 'explorer' && (
          <OverviewTab
            onSelectProgram={handleOpenProgramDetails}
            onToggleBookmark={handleToggleBookmark}
            bookmarkedIds={bookmarkedIds}
          />
        )}

        {activeTab === 'compare' && <ComparatorTab />}

        {activeTab === 'trends' && <TrendsTab selectedProgramCode={selectedProgramCode} />}

        {activeTab === 'wizard' && (
          <WizardTab
            onSelectProgram={handleOpenProgramDetails}
            onToggleBookmark={handleToggleBookmark}
            bookmarkedIds={bookmarkedIds}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-800/80 py-4 px-8 text-center text-xs text-slate-500">
        <p>YÖK ATLAS + YKS Analytics Dashboard © 2026 • Powered by Scraped YÖK ATLAS API Data & Kaggle Admissions Intelligence</p>
      </footer>

      {/* Details Modal */}
      {selectedProgramCode && (
        <ProgramModal
          programCode={selectedProgramCode}
          onClose={() => setSelectedProgramCode(null)}
          onToggleBookmark={handleToggleBookmark}
          isBookmarked={bookmarkedIds.has(selectedProgramCode)}
        />
      )}

      {/* Preference Drawer */}
      <PreferenceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        savedPrograms={savedPrograms}
        onRemoveBookmark={handleRemoveBookmark}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
