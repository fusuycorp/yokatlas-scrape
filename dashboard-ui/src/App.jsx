import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useBookmarks } from './hooks/useBookmarks';
import { useLanguage } from './hooks/useLanguage';
import { Navbar } from './components/features/common/Navbar';
import { Footer } from './components/features/common/Footer';
import { ProgramModal } from './components/features/common/ProgramModal';
import { UniversityPage } from './components/features/university/UniversityPage';
import { ProgramExplorerTab } from './components/features/explorer/ProgramExplorerTab';
import { UniComparatorTab } from './components/features/comparator/UniComparatorTab';
import { RankTrendsTab } from './components/features/trends/RankTrendsTab';
import { PreferenceWizardTab } from './components/features/wizard/PreferenceWizardTab';
import { PreferenceDrawer } from './components/features/bookmarks/PreferenceDrawer';
import { slugifyUniversity, unslugifyUniversity } from './utils/slugs';
import { SeoHead } from './components/SeoHead';
import { uniatlasService } from './api/uniatlasService';
import { Spinner } from './components/ui/Spinner';

const UniversityPageWrapper = ({ onToggleBookmark, bookmarkedIds }) => {
  const { uniSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [uniName, setUniName] = useState(location.state?.uniName || null);
  const [loading, setLoading] = useState(!uniName);

  useEffect(() => {
    if (!uniName && uniSlug) {
      setLoading(true);
      uniatlasService
        .getUniversities()
        .then((data) => {
          const found = unslugifyUniversity(uniSlug, (data.universities || []).map((u) => u.universiteAdi));
          if (found) setUniName(found);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [uniSlug, uniName]);

  if (loading) return <div className="p-12"><Spinner /></div>;
  if (!uniName) return <div className="p-12 text-center text-white">{t('explorer.uniNotFound')}</div>;

  return (
    <>
      <SeoHead
        title={`${uniName} Taban Puanları, Kontenjan ve Bölümleri | UniAtlas`}
        description={`${uniName} 2026 yılı güncel taban puanları, başarı sıralamaları ve kontenjanları.`}
        canonical={`https://atlas.bogazici.app/universite/${uniSlug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          "name": uniName
        }}
      />
      <UniversityPage
        uniName={uniName}
        onBack={() => navigate(-1)}
        onToggleBookmark={onToggleBookmark}
        bookmarkedIds={bookmarkedIds}
      />
    </>
  );
};

const ProgramDetailWrapper = ({ onToggleBookmark, bookmarkedIds }) => {
  const { programCode } = useParams();
  const navigate = useNavigate();
  
  return (
    <>
      <SeoHead
        title={`${programCode} YKS Sıralama ve Taban Puanları | UniAtlas`}
        description={`${programCode} kodlu programın YKS sıralama ve taban puanı detayları.`}
        canonical={`https://atlas.bogazici.app/program/${programCode}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "EducationalOccupationalProgram",
          "identifier": programCode
        }}
      />
      <div className="bg-slate-900 min-h-screen">
        <ProgramModal
          programCode={programCode}
          onClose={() => navigate(-1)}
          onToggleBookmark={onToggleBookmark}
          isBookmarked={bookmarkedIds.has(Number(programCode))}
        />
      </div>
    </>
  );
};

export default function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const {
    savedPrograms,
    bookmarkedIds,
    toggleBookmark,
    removeBookmark,
    clearAllBookmarks,
  } = useBookmarks();

  const handleSelectUniversity = (uniName) => {
    navigate(`/universite/${slugifyUniversity(uniName)}`, { state: { uniName } });
  };

  const handleSelectProgram = (code) => {
    navigate(`/program/${code}`);
  };

  return (
    <div className="min-h-screen app-root flex flex-col font-sans">
      <Navbar
        savedCount={savedPrograms.length}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        <Routes>
          <Route path="/" element={
            <>
              <SeoHead
                title="UniAtlas | YKS Üniversite Tercih & Taban Puanları Analiz Platformu"
                description="YKS tercih dönemi için üniversite taban puanları, başarı sıralamaları ve kontenjan verilerini analiz edin."
                canonical="https://atlas.bogazici.app"
                jsonLd={{
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  "name": "UniAtlas",
                  "url": "https://atlas.bogazici.app",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://atlas.bogazici.app/?search={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                }}
              />
              <h1 className="sr-only">Program Explorer - YKS Üniversite Tercih</h1>
              <ProgramExplorerTab
                onSelectProgram={handleSelectProgram}
                onSelectUniversity={handleSelectUniversity}
                onToggleBookmark={toggleBookmark}
                bookmarkedIds={bookmarkedIds}
              />
            </>
          } />

          <Route path="/universite/:uniSlug" element={
            <UniversityPageWrapper
              onToggleBookmark={toggleBookmark}
              bookmarkedIds={bookmarkedIds}
            />
          } />

          <Route path="/program/:programCode" element={
            <ProgramDetailWrapper
              onToggleBookmark={toggleBookmark}
              bookmarkedIds={bookmarkedIds}
            />
          } />

          <Route path="/karsilastir" element={
            <>
              <SeoHead
                title="Üniversite Karşılaştırma | UniAtlas"
                description="Birden fazla üniversiteyi ve bölümü yan yana karşılaştırın."
                canonical="https://atlas.bogazici.app/karsilastir"
              />
              <h1 className="sr-only">Üniversite Karşılaştırma</h1>
              <UniComparatorTab onSelectUniversity={handleSelectUniversity} />
            </>
          } />

          <Route path="/trendler" element={
            <>
              <SeoHead
                title="Sıralama Trendleri | UniAtlas"
                description="Üniversite bölümlerinin yıllara göre başarı sıralaması trendlerini inceleyin."
                canonical="https://atlas.bogazici.app/trendler"
              />
              <h1 className="sr-only">Sıralama Trendleri</h1>
              <RankTrendsTab />
            </>
          } />

          <Route path="/tercih-sihirbazi" element={
            <>
              <SeoHead
                title="Tercih Sihirbazı | UniAtlas"
                description="YKS sıralamanıza göre size en uygun üniversite ve bölümleri bulun."
                canonical="https://atlas.bogazici.app/tercih-sihirbazi"
              />
              <h1 className="sr-only">Tercih Sihirbazı</h1>
              <PreferenceWizardTab
                onSelectProgram={handleSelectProgram}
                onToggleBookmark={toggleBookmark}
                bookmarkedIds={bookmarkedIds}
              />
            </>
          } />
        </Routes>
      </main>

      <Footer />

      <PreferenceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        savedPrograms={savedPrograms}
        onRemoveBookmark={removeBookmark}
        onClearAll={clearAllBookmarks}
        onSelectProgram={handleSelectProgram}
      />
    </div>
  );
}
