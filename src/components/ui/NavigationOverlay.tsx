import React, { useState, useEffect } from 'react';
import { NavMode, Pavilion, UserProfile } from '../../types';
import {
  Compass,
  Globe,
  Image as ImageIcon,
  Tv,
  Shield,
  Store,
  Award,
  Zap,
  FastForward,
  Eye,
  Bot,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  ArrowLeft,
  ArrowRight,
  List,
  UserCheck,
  UserPlus,
  Music,
  Volume2,
  VolumeX,
  Radio,
  ChevronDown,
  LogOut,
  Smartphone,
  Menu,
} from 'lucide-react';
import { PointsRuleConfig } from '../../types';

interface NavigationOverlayProps {
  currentMode: NavMode;
  onModeChange: (mode: NavMode) => void;
  pavilions: Pavilion[];
  selectedPavilion: Pavilion | null;
  onSelectPavilion: (pavilion: Pavilion | null) => void;
  onOpenExpoModal?: (pavilion: Pavilion) => void;
  playerXPosition: number;
  walkSpeed: number;
  onChangeWalkSpeed: (speed: number) => void;
  isVRMode: boolean;
  onToggleVR: () => void;
  isAutoTour: boolean;
  onToggleAutoTour: () => void;
  onOpenGamification: () => void;
  onOpenAuth?: () => void;
  onToggleChatbot: () => void;
  onToggleMobilePreview?: () => void;
  isMobilePreview?: boolean;
  userCoins?: number;
  currentUser?: UserProfile;
  pointsRules?: PointsRuleConfig;
  onEarnPoints?: (points: number, title: string) => void;
}

export const NavigationOverlay: React.FC<NavigationOverlayProps> = React.memo(({
  currentMode,
  onModeChange,
  pavilions,
  selectedPavilion,
  onSelectPavilion,
  onOpenExpoModal,
  playerXPosition,
  walkSpeed,
  onChangeWalkSpeed,
  isVRMode,
  onToggleVR,
  isAutoTour,
  onToggleAutoTour,
  onOpenGamification,
  onOpenAuth,
  onToggleChatbot,
  onToggleMobilePreview,
  isMobilePreview = false,
  userCoins = 1250,
  currentUser,
  pointsRules = {
    listenMusicPoints: 40,
    centerCustomPoints: 80,
    centerCustomLabel: 'Interazione Centro Galleria 3D',
  },
  onEarnPoints,
}) => {
  const [showTeleportModal, setShowTeleportModal] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [claimedMusicPoints, setClaimedMusicPoints] = useState(false);
  const [claimedCenterPoints, setClaimedCenterPoints] = useState(false);
  const [mediaFeedback, setMediaFeedback] = useState<string | null>(null);

  const triggerResizeEvents = () => {
    const fire = () => window.dispatchEvent(new Event('resize'));
    fire();
    setTimeout(fire, 50);
    setTimeout(fire, 150);
    setTimeout(fire, 300);
    setTimeout(fire, 600);
  };

  useEffect(() => {
    // Automatically enable immersive fullscreen mode by default on mobile devices
    const isMobileDevice =
      window.innerWidth <= 1024 ||
      'ontouchstart' in window ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobileDevice) {
      document.body.classList.add('fullscreen-mode');
      setIsFullscreen(true);
      triggerResizeEvents();

      // Attempt native browser fullscreen on first user touch/tap with navigation UI hidden on mobile
      const attemptNativeFSOnTouch = () => {
        const docEl = document.documentElement as any;
        const requestFS =
          docEl.requestFullscreen ||
          docEl.webkitRequestFullscreen ||
          docEl.mozRequestFullScreen ||
          docEl.msRequestFullscreen;
        if (requestFS && !document.fullscreenElement) {
          requestFS.call(docEl, { navigationUI: 'hide' }).catch(() => {});
        }
      };
      window.addEventListener('touchstart', attemptNativeFSOnTouch, { once: true });
      window.addEventListener('click', attemptNativeFSOnTouch, { once: true });
    }

    const syncFSState = () => {
      const isNativeFS = !!document.fullscreenElement;
      const isClassFS = document.body.classList.contains('fullscreen-mode');
      setIsFullscreen(isNativeFS || isClassFS);
      triggerResizeEvents();
    };

    document.addEventListener('fullscreenchange', syncFSState);
    document.addEventListener('webkitfullscreenchange', syncFSState);
    document.addEventListener('mozfullscreenchange', syncFSState);
    document.addEventListener('MSFullscreenChange', syncFSState);

    const handleWindowResize = () => {
      triggerResizeEvents();
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      document.removeEventListener('fullscreenchange', syncFSState);
      document.removeEventListener('webkitfullscreenchange', syncFSState);
      document.removeEventListener('mozfullscreenchange', syncFSState);
      document.removeEventListener('MSFullscreenChange', syncFSState);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  const toggleFullscreen = () => {
    const isCurrentlyFS =
      isFullscreen ||
      !!document.fullscreenElement ||
      document.body.classList.contains('fullscreen-mode');

    const nextFS = !isCurrentlyFS;
    setIsFullscreen(nextFS);

    if (nextFS) {
      document.body.classList.add('fullscreen-mode');
      const docEl = document.documentElement as any;
      const requestFS =
        docEl.requestFullscreen ||
        docEl.webkitRequestFullscreen ||
        docEl.mozRequestFullScreen ||
        docEl.msRequestFullscreen;

      if (requestFS) {
        requestFS.call(docEl, { navigationUI: 'hide' }).catch((err: any) => {
          console.warn('Native fullscreen policy fallback to CSS immersive viewport:', err);
        });
      }
    } else {
      document.body.classList.remove('fullscreen-mode');
      const doc = document as any;
      const exitFS =
        doc.exitFullscreen ||
        doc.webkitExitFullscreen ||
        doc.mozCancelFullScreen ||
        doc.msExitFullscreen;

      if (exitFS && document.fullscreenElement) {
        exitFS.call(doc).catch(() => {});
      }
    }

    triggerResizeEvents();
  };

  const handleExitApp = () => {
    // 1. Exit fullscreen mode
    document.body.classList.remove('fullscreen-mode');
    setIsFullscreen(false);

    const doc = document as any;
    const exitFS =
      doc.exitFullscreen ||
      doc.webkitExitFullscreen ||
      doc.mozCancelFullScreen ||
      doc.msExitFullscreen;

    if (exitFS && document.fullscreenElement) {
      exitFS.call(doc).catch(() => {});
    }

    // 2. Unlock orientation if locked
    if (screen.orientation && (screen.orientation as any).unlock) {
      try {
        (screen.orientation as any).unlock();
      } catch (e) {}
    }

    // 3. Recenter avatar/camera
    window.dispatchEvent(new CustomEvent('recenter-visuale'));

    // 4. Close browser tab / go back if supported
    if (window.history.length > 1) {
      try {
        window.history.back();
      } catch (e) {}
    } else {
      try {
        window.close();
      } catch (e) {}
    }
  };

  // Calculate percentage along corridor for minimap
  const minimapPercent = Math.min(100, Math.max(0, ((playerXPosition + 10) / 300) * 100));

  return (
    <>
      {/* Fullscreen Mode Minimalist HUD Bar - ONLY controls shown in Fullscreen */}
      {isFullscreen ? (
        <div className="fixed top-3 left-3 sm:left-6 z-[99999] flex items-center gap-2 sm:gap-3 bg-slate-950/90 backdrop-blur-xl p-2 sm:p-2.5 rounded-2xl border-2 border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.35)] select-none max-w-[calc(100vw-24px)] overflow-x-auto no-scrollbar">
          {/* 1. Esci Fullscreen (Solo icona) */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center justify-center p-2 sm:p-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all border border-amber-300 cursor-pointer shrink-0"
            title="Esci da Schermo Intero"
          >
            <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
          </button>

          {/* 2. Chiudi App / Torna al Cellulare */}
          <button
            onClick={handleExitApp}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-red-600/90 hover:bg-red-500 text-white font-extrabold rounded-xl text-xs sm:text-sm uppercase tracking-wider border border-red-400 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Chiudi l'app e torna al cellulare"
          >
            <LogOut className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Chiudi App</span>
            <span className="sm:hidden">Chiudi</span>
          </button>

          <div className="h-5 w-px bg-white/20 shrink-0" />

          {/* 3. Teletrasporto */}
          <button
            onClick={() => setShowTeleportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-black/60 hover:bg-white/10 text-amber-300 font-bold rounded-xl text-xs sm:text-sm uppercase tracking-wider border border-amber-500/40 hover:border-amber-400 transition-all active:scale-95 cursor-pointer shrink-0"
            title="Teletrasporto Rapido Padiglioni"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Teletrasporto</span>
          </button>

          <div className="h-5 w-px bg-white/20 shrink-0" />

          {/* 4. Velocità */}
          <div className="flex items-center gap-2 px-1 sm:px-2 text-xs text-amber-300 font-bold shrink-0">
            <FastForward className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="hidden md:inline uppercase tracking-wider text-[11px] text-white/70">Velocità:</span>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.25"
              value={walkSpeed}
              onChange={(e) => onChangeWalkSpeed(parseFloat(e.target.value))}
              className="w-16 sm:w-24 accent-amber-400 cursor-pointer"
            />
            <span className="font-mono text-amber-300 font-extrabold text-xs">{walkSpeed}x</span>
          </div>

          <div className="h-5 w-px bg-white/20 shrink-0" />

          {/* 5. Recentra Visuale */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('recenter-visuale'))}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-black/60 hover:bg-white/10 text-amber-300 font-bold rounded-xl text-xs sm:text-sm uppercase tracking-wider border border-amber-500/40 hover:border-amber-400 transition-all active:scale-95 cursor-pointer shrink-0"
            title="Centra la visuale al centro del corridoio"
          >
            <span className="text-sm">🎯</span>
            <span className="hidden sm:inline">Recentra Visuale</span>
            <span className="sm:hidden">Recentra</span>
          </button>

          {/* 6. Indicatore Padiglione Attivo in Fullscreen + Torna ad Atrio */}
          {selectedPavilion && (
            <>
              <div className="h-5 w-px bg-white/20 shrink-0" />
              <div className="flex items-center gap-1.5 shrink-0 bg-yellow-500/20 border border-yellow-500/50 rounded-xl px-2.5 py-1 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedPavilion.color }} />
                <span className="font-bold text-yellow-300 max-w-[120px] truncate">{selectedPavilion.name}</span>
                <button
                  onClick={() => onSelectPavilion(null)}
                  className="ml-1 px-1.5 py-0.5 bg-yellow-500 hover:bg-yellow-400 text-black text-[10px] font-black rounded uppercase cursor-pointer"
                  title="Torna all'Atrio con tutte le 20 Categorie"
                >
                  Esci
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Standard Header in Normal View Mode */
        <header className="absolute top-0 left-0 right-0 z-[9999] bg-black/95 backdrop-blur-md border-b border-white/10 px-3 py-2 sm:px-6 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 max-w-full overflow-visible shadow-xl">
          {/* Brand Logo & Name (Mobile: Icon only | PC: Full Brand Text) */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer shrink-0 hover:opacity-90 transition-opacity" 
            onClick={() => onModeChange('corridor')}
            title="Torna al corridoio iniziale (Home)"
          >
            {/* Logo Icon (Immagine 1) */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-yellow-600 via-yellow-400 to-yellow-200 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)] shrink-0">
              <span className="text-black font-black text-lg sm:text-xl italic font-serif">M</span>
            </div>
            {/* Brand Text for PC / Tablet (Immagine 2) */}
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="text-white font-light text-sm sm:text-base tracking-[0.15em] uppercase">
                  META<span className="font-bold text-yellow-500">TV</span> <span className="text-white/40 font-extralight">| IMMERSIVE MALL</span>
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                  GLOBAL 3D
                </span>
              </div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Centro Commerciale Virtuale Immersivo</p>
            </div>
          </div>

          {/* Right Header Buttons: Schermo Intero (Icona Soltanto - Immagine 3) & Menu Hamburger */}
          <div className="flex items-center gap-2 shrink-0">
            {mediaFeedback && (
              <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100000] bg-yellow-500 text-black border-2 border-amber-300 px-4 py-2 rounded-2xl font-black text-xs shadow-2xl animate-bounce flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-black" />
                <span>{mediaFeedback}</span>
              </div>
            )}

            {/* Schermo Intero (Icon Only Button - Immagine 3) */}
            <button
              onClick={toggleFullscreen}
              className={`p-2 sm:p-2.5 rounded-xl shadow-md transition-all border cursor-pointer flex items-center justify-center ${
                isFullscreen
                  ? 'bg-yellow-500 text-black border-yellow-300 shadow-[0_0_15px_rgba(212,175,55,0.5)]'
                  : 'bg-slate-900/90 border-yellow-500/50 text-yellow-400 hover:bg-slate-800'
              }`}
              title="Schermo Intero Immersivo"
              aria-label="Schermo Intero Immersivo"
            >
              <Maximize2 className="w-5 h-5 text-yellow-400" />
            </button>

            {/* Hamburger Menu Button (3 Parallel Lines Icon) */}
            <div className="relative">
              <button
                onClick={() => setShowMainMenu(!showMainMenu)}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-amber-950/90 via-zinc-900 to-black hover:from-amber-900 hover:to-zinc-800 text-amber-300 font-extrabold text-xs sm:text-sm rounded-xl border-2 border-yellow-500/70 shadow-[0_0_20px_rgba(255,215,0,0.3)] tracking-wider uppercase transition-all cursor-pointer"
                title="Apri Menu Navigazione e Strumenti"
              >
                <Menu className="w-5 h-5 text-yellow-400" />
                <span className="hidden sm:inline">Menu</span>
                <ChevronDown className={`w-3.5 h-3.5 text-yellow-400 transition-transform duration-200 hidden sm:inline ${showMainMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Master Dropdown Menu */}
              {showMainMenu && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-slate-950/98 backdrop-blur-2xl border-2 border-yellow-500/70 rounded-2xl p-3 shadow-[0_0_50px_rgba(0,0,0,0.95)] z-[99999] flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 max-h-[85vh] overflow-y-auto">
                  
                  {/* SEZIONE 1: MODALITÀ DI NAVIGAZIONE */}
                  <div className="px-3 py-1.5 bg-yellow-500/10 rounded-xl border border-yellow-500/30 text-xs font-black uppercase tracking-wider text-yellow-300">
                    📍 Modalità Navigazione
                  </div>

                  <div className="grid grid-cols-1 gap-1">
                    <button
                      onClick={() => {
                        onModeChange('corridor');
                        setShowMainMenu(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        currentMode === 'corridor' ? 'bg-yellow-500 text-black font-black' : 'bg-black/40 hover:bg-white/10 text-white'
                      }`}
                    >
                      <span>📍 Corridoi 3D (Galleria)</span>
                    </button>

                    <button
                      onClick={() => {
                        onModeChange('globe');
                        setShowMainMenu(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        currentMode === 'globe' ? 'bg-yellow-500 text-black font-black' : 'bg-black/40 hover:bg-white/10 text-white'
                      }`}
                    >
                      <span>🌍 Mappa Globale 3D</span>
                    </button>

                    <button
                      onClick={() => {
                        onModeChange('panorama');
                        setShowMainMenu(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        currentMode === 'panorama' ? 'bg-yellow-500 text-black font-black' : 'bg-black/40 hover:bg-white/10 text-white'
                      }`}
                    >
                      <span>🖼️ Demo Panorami 360° (Ambienti)</span>
                    </button>

                    <button
                      onClick={() => {
                        onModeChange('live-events');
                        setShowMainMenu(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        currentMode === 'live-events' ? 'bg-yellow-500 text-black font-black' : 'bg-black/40 hover:bg-white/10 text-white'
                      }`}
                    >
                      <span>📺 Eventi Live & TV</span>
                    </button>
                  </div>

                  <div className="h-px bg-white/10 my-0.5" />

                  {/* SEZIONE 2: PROFILO & AREA VIP */}
                  <div className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-yellow-400/80">
                    👑 Area VIP & Saldo
                  </div>

                  <button
                    onClick={() => {
                      onOpenGamification();
                      setShowMainMenu(false);
                    }}
                    className="flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-amber-500/25 to-yellow-500/15 hover:from-amber-500/40 text-amber-200 font-extrabold text-xs rounded-xl border border-amber-500/50 transition-all text-left shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span>👑 Saldo Punti & Riscatta Coupon</span>
                    </div>
                    <span className="bg-yellow-500 text-black px-2 py-0.5 rounded-full font-mono text-[10px] font-black">
                      {userCoins} PTS
                    </span>
                  </button>

                  {onOpenAuth && (
                    <button
                      onClick={() => {
                        onOpenAuth();
                        setShowMainMenu(false);
                      }}
                      className="flex items-center justify-between px-3 py-2.5 bg-black/60 hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/15 transition-all text-left"
                    >
                      <div className="flex items-center gap-2">
                        {currentUser?.isLoggedIn ? (
                          <>
                            <UserCheck className="w-4 h-4 text-yellow-400" />
                            <span>Account: <strong className="text-yellow-300">{currentUser.username}</strong></span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 text-yellow-400" />
                            <span>Accedi / Registrati VIP</span>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-1.5 py-0.5 rounded font-mono font-bold">
                        {currentUser?.isLoggedIn ? 'ONLINE' : 'LOGIN'}
                      </span>
                    </button>
                  )}

                  <div className="h-px bg-white/10 my-0.5" />

                  {/* SEZIONE 3: CONTROLLI & VELOCITÀ 3D */}
                  <div className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-yellow-400/80">
                    ⚡ Controlli & Velocità 3D
                  </div>

                  {/* Slider Velocità */}
                  <div className="px-3 py-2 bg-black/50 rounded-xl border border-white/10 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                      <span className="flex items-center gap-1">
                        <FastForward className="w-3.5 h-3.5 text-amber-400" />
                        <span>Velocità Camminata:</span>
                      </span>
                      <span className="font-mono text-amber-400 font-extrabold">{walkSpeed}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.5"
                      step="0.25"
                      value={walkSpeed}
                      onChange={(e) => onChangeWalkSpeed(parseFloat(e.target.value))}
                      className="w-full accent-yellow-400 cursor-pointer"
                    />
                  </div>

                  {/* Teletrasporto Padiglioni */}
                  <button
                    onClick={() => {
                      setShowTeleportModal(true);
                      setShowMainMenu(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 bg-black/40 hover:bg-yellow-500/20 text-yellow-300 font-bold text-xs rounded-xl border border-white/10 hover:border-yellow-500/40 transition-all text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-yellow-400" />
                      <span>⚡ Teletrasporto Padiglioni</span>
                    </div>
                    <span className="text-[10px] text-white/50">MAPPA</span>
                  </button>

                  {/* Recentra Visuale */}
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('recenter-visuale'));
                      setShowMainMenu(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 bg-black/40 hover:bg-yellow-500/20 text-yellow-300 font-bold text-xs rounded-xl border border-white/10 hover:border-yellow-500/40 transition-all text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🎯</span>
                      <span>Recentra Visuale 3D</span>
                    </div>
                  </button>

                  {/* Anteprima Smartphone Simulator */}
                  {onToggleMobilePreview && (
                    <button
                      onClick={() => {
                        onToggleMobilePreview();
                        setShowMainMenu(false);
                      }}
                      className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-400/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/50 transition-all text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-amber-400" />
                        <span>📱 Anteprima Smartphone</span>
                      </div>
                      <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-black uppercase">
                        {isMobilePreview ? 'ON' : 'TEST CELL'}
                      </span>
                    </button>
                  )}

                  {/* VR Mode */}
                  <button
                    onClick={() => {
                      onToggleVR();
                      setShowMainMenu(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 font-bold text-xs rounded-xl border transition-all text-left ${
                      isVRMode
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                        : 'bg-black/40 hover:bg-cyan-500/10 text-white/90 border-white/10 hover:border-cyan-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-cyan-400" />
                      <span>🕶️ Visore 3D / VR</span>
                    </div>
                    {isVRMode && <span className="text-[9px] bg-cyan-400 text-black px-1.5 py-0.5 rounded font-black">ATTIVA</span>}
                  </button>

                  {/* Radio Galleria */}
                  <button
                    onClick={() => {
                      const nextPlaying = !isPlayingMusic;
                      setIsPlayingMusic(nextPlaying);
                      if (nextPlaying && !claimedMusicPoints) {
                        const pts = pointsRules?.listenMusicPoints || 40;
                        if (onEarnPoints) onEarnPoints(pts, 'Ascolto Musica / Radio Galleria 3D');
                        setClaimedMusicPoints(true);
                        setMediaFeedback(`+${pts} PTS Musica Riscattati!`);
                        setTimeout(() => setMediaFeedback(null), 3500);
                      }
                      setShowMainMenu(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 bg-black/40 hover:bg-yellow-500/20 text-white/90 font-bold text-xs rounded-xl border border-white/10 hover:border-yellow-500/40 transition-all text-left"
                  >
                    <div className="flex items-center gap-2">
                      {isPlayingMusic ? <Volume2 className="w-4 h-4 text-yellow-400 animate-pulse" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                      <span>🎧 Radio Galleria 3D</span>
                    </div>
                    {!claimedMusicPoints && (
                      <span className="text-[9px] bg-yellow-500 text-black px-1.5 py-0.5 rounded font-black">+{pointsRules?.listenMusicPoints || 40} PTS</span>
                    )}
                  </button>

                  {/* Tour Automatico */}
                  <button
                    onClick={() => {
                      onToggleAutoTour();
                      setShowMainMenu(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 font-bold text-xs rounded-xl border transition-all text-left ${
                      isAutoTour
                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400'
                        : 'bg-black/40 hover:bg-yellow-500/10 text-white/90 border-white/10 hover:border-yellow-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span>💬 Tour Automatico Guide</span>
                    </div>
                  </button>

                  <div className="h-px bg-white/10 my-0.5" />

                  {/* SEZIONE 4: ASSISTENZA & ESCI */}
                  <button
                    onClick={() => {
                      onToggleChatbot();
                      setShowMainMenu(false);
                    }}
                    className="flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-extrabold text-xs rounded-xl hover:scale-102 transition-all text-left shadow-md"
                  >
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-black" />
                      <span>🤖 Chatbot Assistente AI</span>
                    </div>
                    <span className="text-[10px] bg-black/80 text-yellow-300 px-1.5 py-0.5 rounded font-bold">AI</span>
                  </button>

                  <button
                    onClick={() => {
                      handleExitApp();
                      setShowMainMenu(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 bg-red-950/80 hover:bg-red-900 text-red-300 font-bold text-xs rounded-xl border border-red-500/40 transition-all text-left mt-1"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>Chiudi App / Esci</span>
                    </div>
                  </button>

                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Category Sub-Corridor Floating Header Breadcrumb - ONLY in normal mode */}
      {!isFullscreen && currentMode === 'corridor' && selectedPavilion && (
        <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-3 bg-black/90 backdrop-blur-xl px-3 sm:px-5 py-2 rounded-full border border-yellow-500/60 shadow-[0_0_35px_rgba(255,215,0,0.4)] max-w-[95vw] overflow-x-auto whitespace-nowrap animate-in fade-in slide-in-from-top-4 duration-300">
          <button
            onClick={() => onSelectPavilion(null)}
            className="flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold rounded-full text-[11px] sm:text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            title="Torna al corridoio con tutte le 20 categorie"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Corridoio 3D</span>
          </button>

          <div className="h-4 sm:h-5 w-px bg-white/20 shrink-0" />

          <div className="flex items-center gap-1.5 text-xs font-bold shrink-0">
            <span className="text-white/60 uppercase tracking-widest text-[9px] sm:text-[10px] hidden md:inline">CATEGORIA:</span>
            <span
              className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-black font-black text-[11px] sm:text-xs uppercase shadow-md flex items-center gap-1"
              style={{ backgroundColor: selectedPavilion.color }}
            >
              <span>{selectedPavilion.name}</span>
            </span>
          </div>

          {onOpenExpoModal && (
            <>
              <div className="h-4 sm:h-5 w-px bg-white/20 shrink-0" />
              <button
                onClick={() => onOpenExpoModal(selectedPavilion)}
                className="flex items-center gap-1 px-2.5 py-1 sm:px-3.5 sm:py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full text-[11px] sm:text-xs uppercase tracking-wider transition-all border border-white/20 hover:border-yellow-400 shrink-0"
                title="Mostra tutti gli espositori e marchi in questa categoria"
              >
                <List className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400" />
                <span className="hidden xs:inline">Espositori</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Teleport Modal */}
      {showTeleportModal && (
        <div className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#080808] border border-yellow-500/30 p-6 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-bold text-lg shadow-[0_0_12px_rgba(212,175,55,0.2)]">
                  ⚡
                </div>
                <div>
                  <h3 className="text-white font-light text-lg tracking-[0.15em] uppercase">Teletrasporto <span className="font-bold text-yellow-500">Rapido 3D</span></h3>
                  <p className="text-xs text-white/40">Seleziona un padiglione per spostarti all'istante nei corridoi</p>
                </div>
              </div>
              <button
                onClick={() => setShowTeleportModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white flex items-center justify-center text-sm font-bold transition-all"
              >
                ✕
              </button>
            </div>

            {/* Pulsante rapido per Corridoio Generale / Atrio Principale */}
            <div className="mb-4">
              <button
                onClick={() => {
                  onSelectPavilion(null);
                  setShowTeleportModal(false);
                }}
                className={`w-full p-3.5 rounded-2xl flex items-center justify-between transition-all border ${
                  !selectedPavilion
                    ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.2)]'
                    : 'bg-black/80 hover:bg-yellow-500/10 border-white/15 text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-black flex items-center justify-center font-black text-sm shadow-md">
                    🏛️
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                      <span>Atrio Principale (Tutte le 20 Categorie)</span>
                      {!selectedPavilion && (
                        <span className="bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full">
                          ATTUALE
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-white/50">Visualizza tutte le 20 porte delle categorie del centro</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-yellow-400 shrink-0" />
              </button>
            </div>

            <div className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2">
              Oppure entra direttamente in un Padiglione specifico:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pavilions.map((p) => {
                const isCurrent = selectedPavilion?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPavilion(p);
                      setShowTeleportModal(false);
                    }}
                    className={`p-3.5 border rounded-2xl flex items-center gap-3 text-left transition-all group ${
                      isCurrent
                        ? 'bg-yellow-500/20 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]'
                        : 'bg-black/60 hover:bg-yellow-500/10 border-white/10 hover:border-yellow-500/50'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-black text-xs shadow-md shrink-0"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.name.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={`font-bold text-xs uppercase tracking-wider truncate ${isCurrent ? 'text-yellow-300 font-black' : 'text-white group-hover:text-yellow-400'}`}>
                          {p.name}
                        </h4>
                        {isCurrent && (
                          <span className="bg-yellow-400 text-black text-[8px] font-black px-1.5 py-0.5 rounded shrink-0">
                            QUI
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/50 truncate">{p.tagline}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
});
