import { useState } from 'react';
import {
  NavMode,
  Pavilion,
  Company,
  Panorama360,
  LiveEvent,
  UserStats,
  Badge,
  SponsorPanel,
  AdminCollaborator,
} from './types';
import {
  INITIAL_PAVILIONS,
  INITIAL_COMPANIES,
  INITIAL_PANORAMAS,
  INITIAL_LIVE_EVENTS,
  INITIAL_BADGES,
  INITIAL_SPONSOR_PANELS,
  INITIAL_ADMIN_COLLABORATORS,
} from './data/initialData';

// 3D Renderers
import { MallCanvas3D } from './components/3d/MallCanvas3D';
import { GlobeMap3D } from './components/3d/GlobeMap3D';
import { Panorama3DViewer } from './components/3d/Panorama3DViewer';

// UI Overlays & Dashboards
import { NavigationOverlay } from './components/ui/NavigationOverlay';
import { CompanyMiniSiteModal } from './components/ui/CompanyMiniSiteModal';
import { ChatbotAssistant } from './components/ui/ChatbotAssistant';
import { AdminDashboard } from './components/ui/AdminDashboard';
import { BusinessDashboard } from './components/ui/BusinessDashboard';
import { GamificationModal } from './components/ui/GamificationModal';
import { LiveEventStage } from './components/ui/LiveEventStage';
import { PavilionExpoModal } from './components/ui/PavilionExpoModal';
import { SponsorPanelModal } from './components/ui/SponsorPanelModal';

export default function App() {
  // Global State
  const [navMode, setNavMode] = useState<NavMode>('corridor');
  const [pavilions] = useState<Pavilion[]>(INITIAL_PAVILIONS);
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [panoramas, setPanoramas] = useState<Panorama360[]>(INITIAL_PANORAMAS);
  const [events] = useState<LiveEvent[]>(INITIAL_LIVE_EVENTS);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [sponsorPanels, setSponsorPanels] = useState<SponsorPanel[]>(INITIAL_SPONSOR_PANELS);
  const [collaborators, setCollaborators] = useState<AdminCollaborator[]>(INITIAL_ADMIN_COLLABORATORS);

  // Selected state
  const [selectedPavilion, setSelectedPavilion] = useState<Pavilion | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedSponsorPanel, setSelectedSponsorPanel] = useState<SponsorPanel | null>(null);

  // 3D Control state
  const [playerXPosition, setPlayerXPosition] = useState<number>(0);
  const [walkSpeed, setWalkSpeed] = useState<number>(1.0);
  const [isVRMode, setIsVRMode] = useState<boolean>(false);
  const [isAutoTour, setIsAutoTour] = useState<boolean>(false);
  const [resetAvatarTrigger, setResetAvatarTrigger] = useState<number>(0);

  const handleStepBackFromSponsorPanel = () => {
    setSelectedSponsorPanel(null);
    setResetAvatarTrigger((prev) => prev + 1);
  };

  // UI Modals
  const [showGamification, setShowGamification] = useState<boolean>(false);
  const [showChatbot, setShowChatbot] = useState<boolean>(true);
  const [showExpoModal, setShowExpoModal] = useState<boolean>(false);

  // User Stats
  const [userStats] = useState<UserStats>({
    level: 3,
    xp: 450,
    coins: 1250,
    visitedPavilions: ['shopping', 'food', 'tech'],
    unlockedBadges: ['b1'],
  });

  // Handle position updates from 3D corridor
  const handlePositionUpdate = (currentX: number, activePavilion: Pavilion | null) => {
    setPlayerXPosition(currentX);
    if (activePavilion && activePavilion.id !== selectedPavilion?.id) {
      // Mark pavilion visited if not already
      if (!userStats.visitedPavilions.includes(activePavilion.id)) {
        userStats.visitedPavilions.push(activePavilion.id);
        // Unlock badge if 5 pavilions visited
        if (userStats.visitedPavilions.length >= 5) {
          setBadges((prev) =>
            prev.map((b) => (b.id === 'b5' ? { ...b, unlocked: true } : b))
          );
        }
      }
    }
  };

  const handleUpdateCompany = (updated: Company) => {
    setCompanies((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    if (selectedCompany?.id === updated.id) {
      setSelectedCompany(updated);
    }
  };

  const handleModeChange = (newMode: NavMode) => {
    setNavMode(newMode);
    setSelectedPavilion(null);
    setSelectedCompany(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050505] font-sans text-slate-100 select-none">
      {/* Top Main Navigation Bar & Overlay Controls */}
      <NavigationOverlay
        currentMode={navMode}
        onModeChange={handleModeChange}
        pavilions={pavilions}
        selectedPavilion={selectedPavilion}
        onSelectPavilion={(pav) => {
          setSelectedPavilion(pav);
          setNavMode('corridor');
        }}
        onOpenExpoModal={(pav) => {
          setSelectedPavilion(pav);
          setShowExpoModal(true);
        }}
        playerXPosition={playerXPosition}
        walkSpeed={walkSpeed}
        onChangeWalkSpeed={setWalkSpeed}
        isVRMode={isVRMode}
        onToggleVR={() => setIsVRMode(!isVRMode)}
        isAutoTour={isAutoTour}
        onToggleAutoTour={() => setIsAutoTour(!isAutoTour)}
        onOpenGamification={() => setShowGamification(true)}
        onToggleChatbot={() => setShowChatbot(!showChatbot)}
      />

      {/* Main 3D Environment / Views Container */}
      <main className="w-full h-full">
        {navMode === 'corridor' && (
          <MallCanvas3D
            pavilions={pavilions}
            companies={companies}
            sponsorPanels={sponsorPanels}
            selectedPavilion={selectedPavilion}
            onSelectPavilion={(pav) => {
              setSelectedPavilion(pav);
            }}
            onSelectCompany={(comp) => setSelectedCompany(comp)}
            onSelectSponsorPanel={(panel) => setSelectedSponsorPanel(panel)}
            onOpenExpoModal={(pav) => {
              setSelectedPavilion(pav);
              setShowExpoModal(true);
            }}
            walkSpeed={walkSpeed}
            isVRMode={isVRMode}
            isAutoTour={isAutoTour}
            onPositionUpdate={handlePositionUpdate}
            resetAvatarTrigger={resetAvatarTrigger}
          />
        )}

        {navMode === 'globe' && (
          <GlobeMap3D
            companies={companies}
            pavilions={pavilions}
            onSelectCompany={(comp) => setSelectedCompany(comp)}
          />
        )}

        {navMode === 'panorama' && <Panorama3DViewer panoramas={panoramas} />}

        {navMode === 'live-events' && <LiveEventStage events={events} />}

        {navMode === 'admin' && (
          <AdminDashboard
            companies={companies}
            pavilions={pavilions}
            panoramas={panoramas}
            sponsorPanels={sponsorPanels}
            collaborators={collaborators}
            onUpdateCompanies={setCompanies}
            onUpdatePanoramas={setPanoramas}
            onUpdateSponsorPanels={setSponsorPanels}
            onUpdateCollaborators={setCollaborators}
          />
        )}

        {navMode === 'business' && (
          <BusinessDashboard companies={companies} onUpdateCompany={handleUpdateCompany} />
        )}
      </main>

      {/* Sponsor Panel Modal (Visualizza, Acquista o Modifica Manifesto 3D) */}
      {selectedSponsorPanel && (
        <SponsorPanelModal
          panel={selectedSponsorPanel}
          onClose={() => setSelectedSponsorPanel(null)}
          onStepBack={handleStepBackFromSponsorPanel}
          onUpdatePanel={(updated) => {
            setSponsorPanels((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setSelectedSponsorPanel(updated);
          }}
        />
      )}

      {/* Trade Fair Pavilion Expo Modal (Padiglione Fiera con Sottocategorie & Espositori) */}
      {selectedPavilion && showExpoModal && !selectedCompany && (
        <PavilionExpoModal
          pavilion={selectedPavilion}
          pavilions={pavilions}
          companies={companies}
          onClose={() => setShowExpoModal(false)}
          onSelectCompany={(comp) => setSelectedCompany(comp)}
          onSelectPavilion={(pav) => setSelectedPavilion(pav)}
          onOpenBusinessDashboard={() => {
            setSelectedPavilion(null);
            setShowExpoModal(false);
            setNavMode('business');
          }}
        />
      )}

      {/* Interactive 3D Company Showcase Mini-Site Modal */}
      {selectedCompany && (
        <CompanyMiniSiteModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onUpdateCompany={handleUpdateCompany}
        />
      )}

      {/* Gamification VIP Badges Modal */}
      <GamificationModal
        isOpen={showGamification}
        onClose={() => setShowGamification(false)}
        stats={userStats}
        badges={badges}
      />

      {/* Floating AI Chatbot Assistant Guide */}
      {showChatbot && (
        <ChatbotAssistant
          currentPavilion={selectedPavilion}
          pavilions={pavilions}
          companies={companies}
          onTeleportToPavilion={(p) => {
            setSelectedPavilion(p);
            setNavMode('corridor');
          }}
          onSelectCompany={(c) => setSelectedCompany(c)}
          onOpenGlobeMap={() => setNavMode('globe')}
          isAutoTour={isAutoTour}
          onToggleAutoTour={() => setIsAutoTour(!isAutoTour)}
        />
      )}
    </div>
  );
}
