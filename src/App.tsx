import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { AuthModal } from './components/ui/AuthModal';
import { DeviceSelectorModal } from './components/ui/DeviceSelectorModal';
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
  PointsRuleConfig,
  SubCategory,
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
import { SUBCATEGORIES_BY_PAVILION } from './data/subcategoriesData';

// Main 3D Corridor Direct Renderer
import { MallCanvas3D } from './components/3d/MallCanvas3D';
import { NavigationOverlay } from './components/ui/NavigationOverlay';
import { MobileSimulatorFrame } from './components/ui/MobileSimulatorFrame';

// Lazy-loaded Secondary Views & Modals for Maximum Performance & Minimal Initial Weight
const GlobeMap3D = lazy(() => import('./components/3d/GlobeMap3D').then(m => ({ default: m.GlobeMap3D })));
const Demo360Viewer = lazy(() => import('./components/3d/Demo360Viewer').then(m => ({ default: m.Demo360Viewer })));
const AdminDashboard = lazy(() => import('./components/ui/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const BusinessDashboard = lazy(() => import('./components/ui/BusinessDashboard').then(m => ({ default: m.BusinessDashboard })));
const LiveEventStage = lazy(() => import('./components/ui/LiveEventStage').then(m => ({ default: m.LiveEventStage })));
const CompanyMiniSiteModal = lazy(() => import('./components/ui/CompanyMiniSiteModal').then(m => ({ default: m.CompanyMiniSiteModal })));
const ChatbotAssistant = lazy(() => import('./components/ui/ChatbotAssistant').then(m => ({ default: m.ChatbotAssistant })));
const GamificationModal = lazy(() => import('./components/ui/GamificationModal').then(m => ({ default: m.GamificationModal })));
const PavilionExpoModal = lazy(() => import('./components/ui/PavilionExpoModal').then(m => ({ default: m.PavilionExpoModal })));
const SponsorPanelModal = lazy(() => import('./components/ui/SponsorPanelModal').then(m => ({ default: m.SponsorPanelModal })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center w-full h-full min-h-[300px] bg-[#050505] text-amber-300 font-bold text-sm">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
      <span className="tracking-widest uppercase text-xs text-amber-400/80">Caricamento modulo...</span>
    </div>
  </div>
);

export default function App() {
  // Global State with URL query parameter support for direct links
  const [navMode, setNavMode] = useState<NavMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode') || params.get('panel');
      if (mode === 'admin' || params.has('admin')) return 'admin';
      if (mode === 'business' || params.has('business') || params.has('saas') || params.has('aziende')) return 'business';
      if (mode === 'globe') return 'globe';
      if (mode === 'panorama' || mode === 'demo360' || params.has('env') || params.has('demo360')) return 'panorama';
      if (mode === 'live' || mode === 'live-events') return 'live-events';
    }
    return 'corridor';
  });

  // Sync state if URL changes via back/forward or hash
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode') || params.get('panel');
      if (mode === 'admin' || params.has('admin')) setNavMode('admin');
      else if (mode === 'business' || params.has('business') || params.has('saas') || params.has('aziende')) setNavMode('business');
      else if (mode === 'globe') setNavMode('globe');
      else if (mode === 'panorama' || mode === 'demo360' || params.has('env') || params.has('demo360')) setNavMode('panorama');
      else if (mode === 'live' || mode === 'live-events') setNavMode('live-events');
      else setNavMode('corridor');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Authentication state for restricted areas
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('isAuthenticatedAdmin') === 'true';
  });
  const [isBusinessAuthenticated, setIsBusinessAuthenticated] = useState<boolean>(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('isAuthenticatedBusiness') === 'true';
  });

  const handleAdminLogout = () => {
    sessionStorage.removeItem('isAuthenticatedAdmin');
    setIsAdminAuthenticated(false);
    handleModeChange('corridor');
  };

  const handleBusinessLogout = () => {
    sessionStorage.removeItem('isAuthenticatedBusiness');
    setIsBusinessAuthenticated(false);
    handleModeChange('corridor');
  };

  const [pavilions] = useState<Pavilion[]>(INITIAL_PAVILIONS);
  const [companies, setCompanies] = useState<Company[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('meta_tv_companies');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error loading companies from localStorage', e);
        }
      }
    }
    return INITIAL_COMPANIES;
  });
  const [panoramas, setPanoramas] = useState<Panorama360[]>(INITIAL_PANORAMAS);
  const [events] = useState<LiveEvent[]>(INITIAL_LIVE_EVENTS);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [sponsorPanels, setSponsorPanels] = useState<SponsorPanel[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('meta_tv_sponsor_panels');
      if (saved) {
        try {
          const parsed: SponsorPanel[] = JSON.parse(saved);
          const hasGiftCardsOverhead = parsed.some((p) => p.id === 'sp-giftcards-overhead');
          if (!hasGiftCardsOverhead) {
            return [INITIAL_SPONSOR_PANELS[0], INITIAL_SPONSOR_PANELS[1], ...parsed.filter((p) => p.id !== 'sp-1')];
          }
          return parsed;
        } catch (e) {
          console.error('Error loading sponsorPanels from localStorage', e);
        }
      }
    }
    return INITIAL_SPONSOR_PANELS;
  });
  const [collaborators, setCollaborators] = useState<AdminCollaborator[]>(INITIAL_ADMIN_COLLABORATORS);
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, SubCategory[]>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('meta_tv_subcategories_map');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const merged: Record<string, SubCategory[]> = { ...SUBCATEGORIES_BY_PAVILION };
          Object.keys(parsed).forEach((key) => {
            const savedList: SubCategory[] = parsed[key] || [];
            const defaultList: SubCategory[] = SUBCATEGORIES_BY_PAVILION[key] || [];
            const existingIds = new Set(defaultList.map((s) => s.id));
            const existingNames = new Set(defaultList.map((s) => s.name.trim().toLowerCase()));
            const newFromSaved = savedList.filter(
              (s) => !existingIds.has(s.id) && !existingNames.has(s.name.trim().toLowerCase())
            );
            merged[key] = [...defaultList, ...newFromSaved];
          });
          return merged;
        } catch (e) {
          console.error('Error loading subcategories from localStorage', e);
        }
      }
    }
    return SUBCATEGORIES_BY_PAVILION;
  });

  // Sync state to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('meta_tv_sponsor_panels', JSON.stringify(sponsorPanels));
    } catch (e) {
      console.error('Error saving sponsorPanels to localStorage', e);
    }
  }, [sponsorPanels]);

  useEffect(() => {
    try {
      localStorage.setItem('meta_tv_companies', JSON.stringify(companies));
    } catch (e) {
      console.error('Error saving companies to localStorage', e);
    }
  }, [companies]);

  useEffect(() => {
    try {
      localStorage.setItem('meta_tv_subcategories_map', JSON.stringify(subcategoriesMap));
    } catch (e) {
      console.error('Error saving subcategories to localStorage', e);
    }
  }, [subcategoriesMap]);

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
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showChatbot, setShowChatbot] = useState<boolean>(false);
  const [showExpoModal, setShowExpoModal] = useState<boolean>(false);
  const [isMobilePreview, setIsMobilePreview] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('view') === 'mobile' || params.has('mobile');
    }
    return false;
  });
  const [simFovZoom, setSimFovZoom] = useState<number>(100);

  // Dedicated Mobile Lite partition & direct link support (?view=mobile or ?mode=mobile-lite)
  const [isMobileLite, setIsMobileLite] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'mobile' || params.get('mode') === 'mobile-lite' || params.has('mobile')) {
        return true;
      }
      const savedPref = localStorage.getItem('meta_tv_preferred_mode');
      if (savedPref === 'mobile-lite') return true;
      if (savedPref === 'desktop-full') return false;
      // Auto-detect mobile devices
      return /Mobi|Android|iPhone|iPad|iPod|Touch/i.test(navigator.userAgent) || window.innerWidth < 768;
    }
    return false;
  });

  const [showDeviceSelector, setShowDeviceSelector] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      // If direct mobile link or specific mode is requested, do not show popup
      if (params.has('view') || params.has('mode') || params.has('mobile') || params.has('admin') || params.has('business')) {
        return false;
      }
      // Check if user already remembered their choice
      const savedPref = localStorage.getItem('meta_tv_preferred_mode');
      if (savedPref) return false;
      // Show device choice on first visit
      return true;
    }
    return false;
  });

  // Admin Configurable Points Rules with localStorage persistence
  const [pointsRules, setPointsRules] = useState<PointsRuleConfig>(() => {
    try {
      const saved = localStorage.getItem('meta_tv_points_rules');
      return saved ? JSON.parse(saved) : {
        dailyLoginPoints: 100,
        favoriteCompanyPoints: 25,
        visitPavilionPoints: 50,
        surveyPoints: 150,
        viewPosterPoints: 30,
        watchVideoPoints: 60,
        listenMusicPoints: 40,
        centerCustomPoints: 80,
        centerCustomLabel: 'Interazione Centro Galleria 3D',
      };
    } catch (e) {
      return {
        dailyLoginPoints: 100,
        favoriteCompanyPoints: 25,
        visitPavilionPoints: 50,
        surveyPoints: 150,
        viewPosterPoints: 30,
        watchVideoPoints: 60,
        listenMusicPoints: 40,
        centerCustomPoints: 80,
        centerCustomLabel: 'Interazione Centro Galleria 3D',
      };
    }
  });

  // User Stats & Customer Profile with localStorage persistence (Default a 0 PTS per nuove prove)
  const [userStats, setUserStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('meta_tv_user_stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Assicuriamo il reset a 0 per iniziare le prove di accumulo punti
        return {
          ...parsed,
          coins: 0,
        };
      }
      return {
        level: 1,
        xp: 0,
        coins: 0,
        visitedPavilions: [],
        unlockedBadges: [],
        favoriteCompanyIds: [],
        profile: undefined,
        redeemedCoupons: [],
        activityHistory: [],
      };
    } catch (e) {
      return {
        level: 1,
        xp: 0,
        coins: 0,
        visitedPavilions: [],
        unlockedBadges: [],
        favoriteCompanyIds: [],
        profile: undefined,
        redeemedCoupons: [],
        activityHistory: [],
      };
    }
  });

  // Sync pointsRules and userStats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('meta_tv_points_rules', JSON.stringify(pointsRules));
    } catch (e) {
      console.error('Error saving pointsRules to localStorage', e);
    }
  }, [pointsRules]);

  useEffect(() => {
    try {
      localStorage.setItem('meta_tv_user_stats', JSON.stringify(userStats));
    } catch (e) {
      console.error('Error saving userStats to localStorage', e);
    }
  }, [userStats]);

  const handleCreditUserPoints = (email: string, points: number) => {
    setUserStats((prev) => {
      const newCoins = Math.max(0, prev.coins + points);
      return {
        ...prev,
        coins: newCoins,
        activityHistory: [
          {
            id: `act-${Date.now()}`,
            type: points >= 0 ? 'earn' : 'redeem',
            title: points >= 0 ? `Accredito Manuale Admin (${email})` : `Addebito/Modifica Manuale Admin (${email})`,
            pointsChange: points,
            timestamp: new Date().toLocaleDateString('it-IT', { hour: '2-digit', minute: '2-digit' }),
          },
          ...(prev.activityHistory || []),
        ],
      };
    });
  };

  const handleEarnPoints = (points: number, title: string) => {
    setUserStats((prev) => ({
      ...prev,
      coins: prev.coins + points,
      activityHistory: [
        {
          id: `act-${Date.now()}`,
          type: 'earn',
          title: title,
          pointsChange: points,
          timestamp: new Date().toLocaleDateString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        },
        ...(prev.activityHistory || []),
      ],
    }));
  };

  const handleToggleFavoriteCompany = (companyId: string) => {
    const currentFavs = userStats.favoriteCompanyIds || [];
    const isFav = currentFavs.includes(companyId);
    let updatedFavs: string[];
    let ptsBonus = 0;
    const companyObj = companies.find((c) => c.id === companyId);
    const companyName = companyObj ? companyObj.name : 'Azienda';

    if (isFav) {
      updatedFavs = currentFavs.filter((id) => id !== companyId);
    } else {
      updatedFavs = [...currentFavs, companyId];
      ptsBonus = pointsRules.favoriteCompanyPoints; // Dynamic admin-configured points rule
    }

    const newHistory = ptsBonus > 0 ? [
      {
        id: `act-${Date.now()}`,
        type: 'favorite' as const,
        title: `Salvata nei Preferiti: ${companyName}`,
        pointsChange: ptsBonus,
        timestamp: new Date().toLocaleDateString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      },
      ...(userStats.activityHistory || []),
    ] : (userStats.activityHistory || []);

    setUserStats({
      ...userStats,
      coins: userStats.coins + ptsBonus,
      favoriteCompanyIds: updatedFavs,
      activityHistory: newHistory,
    });
  };

  // Handle position updates from 3D corridor
  const handlePositionUpdate = useCallback((currentX: number, activePavilion: Pavilion | null) => {
    setPlayerXPosition((prev) => (Math.abs(prev - currentX) > 2.0 ? currentX : prev));
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
  }, [selectedPavilion?.id, userStats.visitedPavilions]);

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
    setSelectedSponsorPanel(null);
    setPlayerXPosition(0);
    setResetAvatarTrigger((prev) => prev + 1);
    window.dispatchEvent(new CustomEvent('recenter-visuale'));

    // Update URL query parameter seamlessly
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (newMode === 'admin') {
        url.searchParams.set('mode', 'admin');
      } else if (newMode === 'business') {
        url.searchParams.set('mode', 'business');
      } else if (newMode === 'corridor') {
        url.searchParams.delete('mode');
        url.searchParams.delete('panel');
        url.searchParams.delete('admin');
        url.searchParams.delete('business');
        url.searchParams.delete('saas');
        url.searchParams.delete('aziende');
      } else {
        url.searchParams.set('mode', newMode);
      }
      window.history.pushState({}, '', url.toString());
    }
  };

  const appContent = (
    <div className="relative w-full h-full overflow-hidden bg-[#050505] font-sans text-slate-100 select-none">
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
        onOpenGamification={() => {
          if (userStats.profile?.isLoggedIn) {
            setShowGamification(true);
          } else {
            setShowAuthModal(true);
          }
        }}
        onOpenAuth={() => setShowAuthModal(true)}
        onToggleChatbot={() => setShowChatbot(!showChatbot)}
        onToggleMobilePreview={() => setIsMobilePreview(!isMobilePreview)}
        isMobilePreview={isMobilePreview}
        userCoins={userStats.coins}
        currentUser={userStats.profile}
        pointsRules={pointsRules}
        onEarnPoints={handleEarnPoints}
      />

      {/* Main 3D Environment / Views Container */}
      <main className="w-full h-full">
        {navMode === 'corridor' && (
          <MallCanvas3D
            pavilions={pavilions}
            companies={companies}
            sponsorPanels={sponsorPanels}
            selectedPavilion={selectedPavilion}
            subcategoriesMap={subcategoriesMap}
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
            fovLevel={simFovZoom}
            isMobileLite={isMobileLite}
          />
        )}

        <Suspense fallback={<LoadingFallback />}>
          {navMode === 'globe' && (
            <GlobeMap3D
              companies={companies}
              pavilions={pavilions}
              onSelectCompany={(comp) => setSelectedCompany(comp)}
            />
          )}

          {navMode === 'panorama' && (
            <Demo360Viewer onBackToMall={() => handleModeChange('corridor')} />
          )}

          {navMode === 'live-events' && <LiveEventStage events={events} />}

          {navMode === 'admin' && (
            isAdminAuthenticated ? (
              <AdminDashboard
                companies={companies}
                pavilions={pavilions}
                panoramas={panoramas}
                sponsorPanels={sponsorPanels}
                collaborators={collaborators}
                pointsRules={pointsRules}
                subcategoriesMap={subcategoriesMap}
                onUpdateCompanies={setCompanies}
                onUpdatePanoramas={setPanoramas}
                onUpdateSponsorPanels={setSponsorPanels}
                onUpdateCollaborators={setCollaborators}
                onUpdatePointsRules={setPointsRules}
                onUpdateSubcategoriesMap={setSubcategoriesMap}
                onCreditUserPoints={handleCreditUserPoints}
              />
            ) : (
              <AuthModal
                targetMode="admin"
                onSuccess={() => setIsAdminAuthenticated(true)}
                onCancel={() => handleModeChange('corridor')}
              />
            )
          )}

          {navMode === 'business' && (
            isBusinessAuthenticated ? (
              <BusinessDashboard companies={companies} onUpdateCompany={handleUpdateCompany} />
            ) : (
              <AuthModal
                targetMode="business"
                onSuccess={() => setIsBusinessAuthenticated(true)}
                onCancel={() => handleModeChange('corridor')}
              />
            )
          )}
        </Suspense>
      </main>

      <Suspense fallback={null}>
        {/* Sponsor Panel Modal (Visualizza, Acquista o Modifica Manifesto 3D) */}
        {selectedSponsorPanel && (
          <SponsorPanelModal
            panel={selectedSponsorPanel}
            pavilions={pavilions}
            onClose={() => setSelectedSponsorPanel(null)}
            onStepBack={handleStepBackFromSponsorPanel}
            onUpdatePanel={(updated) => {
              setSponsorPanels((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
              setSelectedSponsorPanel(updated);
            }}
            pointsRules={pointsRules}
            onEarnPoints={handleEarnPoints}
          />
        )}

        {/* Trade Fair Pavilion Expo Modal (Padiglione Fiera con Sottocategorie & Espositori) */}
        {selectedPavilion && showExpoModal && !selectedCompany && (
          <PavilionExpoModal
            pavilion={selectedPavilion}
            pavilions={pavilions}
            companies={companies}
            subcategoriesMap={subcategoriesMap}
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
            isFavorite={(userStats.favoriteCompanyIds || []).includes(selectedCompany.id)}
            onToggleFavorite={handleToggleFavoriteCompany}
            pointsRules={pointsRules}
            onEarnPoints={handleEarnPoints}
          />
        )}

        {/* Gamification & Customer Profile Modal */}
        {showGamification && (
          <GamificationModal
            isOpen={showGamification}
            onClose={() => setShowGamification(false)}
            stats={userStats}
            badges={badges}
            companies={companies}
            onUpdateStats={setUserStats}
            onSelectCompany={(comp) => setSelectedCompany(comp)}
            onToggleFavoriteCompany={handleToggleFavoriteCompany}
            pointsRules={pointsRules}
          />
        )}
      </Suspense>

      {/* Customer VIP Auth Modal (Username, Email, Password - Privacy First) */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          currentUser={userStats.profile}
          onLogin={(profile, initialCoins) => {
            setUserStats((prev) => ({
              ...prev,
              profile,
              coins: initialCoins && initialCoins > prev.coins ? initialCoins : prev.coins,
              activityHistory: [
                {
                  id: `act-${Date.now()}`,
                  type: 'earn',
                  title: `Login Meta-TV (@${profile.username})`,
                  pointsChange: 50,
                  timestamp: new Date().toLocaleDateString('it-IT', { hour: '2-digit', minute: '2-digit' }),
                },
                ...(prev.activityHistory || []),
              ],
            }));
          }}
          onLogout={() => {
            setUserStats((prev) => ({ ...prev, profile: undefined }));
          }}
        />
      )}

      {/* Floating AI Chatbot Assistant Guide */}
      {showChatbot && (
        <Suspense fallback={null}>
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
        </Suspense>
      )}

      {/* First-Visit Device Selector Modal (Mobile Lite vs Desktop Full) */}
      <DeviceSelectorModal
        isOpen={showDeviceSelector}
        onSelectMode={(mode) => {
          setIsMobileLite(mode === 'mobile-lite');
          setShowDeviceSelector(false);
        }}
      />
    </div>
  );

  if (isMobilePreview) {
    return (
      <MobileSimulatorFrame
        onClose={() => setIsMobilePreview(false)}
        fovLevel={simFovZoom}
        onFovChange={setSimFovZoom}
      >
        {appContent}
      </MobileSimulatorFrame>
    );
  }

  return appContent;
}
