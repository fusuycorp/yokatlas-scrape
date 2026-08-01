import React, { useState } from 'react';
import { useBookmarks } from './hooks/useBookmarks';
import { Navbar } from './components/features/common/Navbar';
import { Footer } from './components/features/common/Footer';
import { ProgramModal } from './components/features/common/ProgramModal';
import { UniversityDetailModal } from './components/features/university/UniversityDetailModal';
import { ProgramExplorerTab } from './components/features/explorer/ProgramExplorerTab';
import { UniComparatorTab } from './components/features/comparator/UniComparatorTab';
import { RankTrendsTab } from './components/features/trends/RankTrendsTab';
import { PreferenceWizardTab } from './components/features/wizard/PreferenceWizardTab';
import { PreferenceDrawer } from './components/features/bookmarks/PreferenceDrawer';

export default function App() {
  const [activeTab, setActiveTab] = useState('explorer');
  const [selectedProgramCode, setSelectedProgramCode] = useState(null);
  const [selectedUniName, setSelectedUniName] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    savedPrograms,
    bookmarkedIds,
    toggleBookmark,
    removeBookmark,
    clearAllBookmarks,
  } = useBookmarks();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedPrograms.length}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        {activeTab === 'explorer' && (
          <ProgramExplorerTab
            onSelectProgram={setSelectedProgramCode}
            onSelectUniversity={setSelectedUniName}
            onToggleBookmark={toggleBookmark}
            bookmarkedIds={bookmarkedIds}
          />
        )}

        {activeTab === 'compare' && (
          <UniComparatorTab onSelectUniversity={setSelectedUniName} />
        )}

        {activeTab === 'trends' && (
          <RankTrendsTab selectedProgramCode={selectedProgramCode} />
        )}

        {activeTab === 'wizard' && (
          <PreferenceWizardTab
            onSelectProgram={setSelectedProgramCode}
            onToggleBookmark={toggleBookmark}
            bookmarkedIds={bookmarkedIds}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Program Details Modal */}
      {selectedProgramCode && (
        <ProgramModal
          programCode={selectedProgramCode}
          onClose={() => setSelectedProgramCode(null)}
          onToggleBookmark={toggleBookmark}
          isBookmarked={bookmarkedIds.has(selectedProgramCode)}
        />
      )}

      {/* University Detail Modal showing all departments */}
      {selectedUniName && (
        <UniversityDetailModal
          uniName={selectedUniName}
          onClose={() => setSelectedUniName(null)}
          onSelectProgram={setSelectedProgramCode}
          onToggleBookmark={toggleBookmark}
          bookmarkedIds={bookmarkedIds}
        />
      )}

      {/* Preference List Drawer */}
      <PreferenceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        savedPrograms={savedPrograms}
        onRemoveBookmark={removeBookmark}
        onClearAll={clearAllBookmarks}
      />
    </div>
  );
}
