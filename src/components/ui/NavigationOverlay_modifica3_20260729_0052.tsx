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
  List,
  UserCheck,
  UserPlus,
  Music,
  Volume2,
  VolumeX,
  Radio,
  ChevronDown,
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
  userCoins?: number;
  currentUser?: UserProfile;
  pointsRules?: PointsRuleConfig;
  onEarnPoints?: (points: number, title: string) => void;
}

export const NavigationOverlay: React.FC<NavigationOverlayProps> = ({
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

      // Attempt native browser fullscreen on first user touch/tap
      const attemptNativeFSOnTouch = () => {
        const docEl = document.documentElement as any;
        const requestFS =
          docEl.requestFullscreen ||
          docEl.webkitRequestFullscreen ||
          docEl.mozRequestFullScreen ||
          docEl.msRequestFullscreen;
        if (requestFS && !document.fullscreenElement) {
          requestFS.call(docEl).catch(() => {});
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
        requestFS.call(docEl).catch((err: any) => {
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

  // Calculate percentage along corridor for minimap
  const minimapPercent = Math.min(100, Math.max(0, ((playerXPosition + 10) / 300) * 100));

  return (
    <>
      {/* Fullscreen Mode Minimalist HUD Bar - ONLY controls shown in Fullscreen */}
      {isFullscreen ? (
        <div className="fixed top-3 left-3 sm:left-6 z-[99999] flex items-center gap-2 sm:gap-3 bg-slate-950/90 backdrop-blur-xl p-2 sm:p-2.5 rounded-2xl border-2 border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.35)] select-none max-w-[calc(100vw-120px)] overflow-x-auto no-scrollbar">
          {/* 1. Schermo Intero / Esci Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all border border-amber-300 cursor-pointer shrink-0"
            title="Esci da Schermo Intero"
          >
            <Minimize2 className="w-4 h-4 text-slate-950" />
            <span className="hidden xs:inline">Esci Fullscreen</span>
            <span className="xs:hidden">Esci</span>
          </button>

          <div className="h-5 w-px bg-white/20 shrink-0" />

          {/* 2. Teletrasporto */}
          <button
            onClick={() => setShowTeleportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-black/60 hover:bg-white/10 text-amber-300 font-bold rounded-xl text-xs sm:text-sm uppercase tracking-wider border border-amber-500/40 hover:border-amber-400 transition-all active:scale-95 cursor-pointer shrink-0"
            title="Teletrasporto Rapido Padiglioni"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Teletrasporto</span>
          </button>

          <div className="h-5 w-px bg-white/20 shrink-0" />

          {/* 3. Velocità */}
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

          {/* 4. Recentra Visuale */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('recenter-visuale'))}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-black/60 hover:bg-white/10 text-amber-300 font-bold rounded-xl text-xs sm:text-sm uppercase tracking-wider border border-amber-500/40 hover:border-amber-400 transition-all active:scale-95 cursor-pointer shrink-0"
            title="Centra la visuale al centro del corridoio"
          >
            <span className="text-sm">🎯</span>
            <span className="hidden sm:inline">Recentra Visuale</span>
            <span className="sm:hidden">Recentra</span>
          </button>
        </div>
      ) : (
        /* Standard Header in Normal View Mode */
        <header className="absolute top-0 left-0 right-0 z-[9999] bg-black/95 backdrop-blur-md border-b border-white/10 px-2.5 py-1.5 sm:px-6 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 max-w-full overflow-visible shadow-xl">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3.5 cursor-pointer shrink-0" onClick={() => onModeChange('corridor')}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-tr from-yellow-600 via-yellow-400 to-yellow-200 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              <span className="text-black font-black text-base sm:text-xl italic font-serif">M</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-white font-light text-xs sm:text-base tracking-[0.15em] sm:tracking-[0.2em] uppercase">
                  META<span className="font-bold text-yellow-500">TV</span> <span className="text-white/40 font-extralight hidden md:inline">| IMMERSIVE MALL</span>
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold tracking-widest uppercase bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hidden xs:inline">
                  GLOBAL 3D
                </span>
              </div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest hidden sm:block">Centro Commerciale Virtuale Immersivo</p>
            </div>
          </div>

          {/* View Mode Dropdown Menu */}
          <div className="relative flex items-center">
            <select
              value={currentMode}
              onChange={(e) => onModeChange(e.target.value as NavMode)}
              className="bg-slate-900/90 text-yellow-400 font-extrabold text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border-2 border-yellow-500/60 shadow-[0_0_15px_rgba(255,215,0,0.25)] focus:outline-none focus:border-yellow-400 cursor-pointer appearance-none pr-8 tracking-wider uppercase transition-all hover:bg-slate-800"
              title="Seleziona la modalità di navigazione"
            >
              <option value="corridor" className="bg-slate-900 text-yellow-400 font-bold">
                📍 Corridoi 3D (Galleria)
              </option>
              <option value="globe" className="bg-slate-900 text-yellow-400 font-bold">
                🌍 Mappa Globale 3D
              </option>
              <option value="panorama" className="bg-slate-900 text-yellow-400 font-bold">
                🖼️ Panorami 360°
              </option>
              <option value="live-events" className="bg-slate-900 text-yellow-400 font-bold">
                📺 Eventi Live & TV
              </option>
              {currentMode === 'business' && (
                <option value="business" className="bg-slate-900 text-amber-400 font-bold">
                  🏢 Area Aziende
                </option>
              )}
              {currentMode === 'admin' && (
                <option value="admin" className="bg-slate-900 text-red-400 font-bold">
                  🛡️ Area Admin
                </option>
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-yellow-400 absolute right-2.5 pointer-events-none" />
          </div>

          {/* Right Tools - Unified Master Dropdown for PC & Mobile */}
          <div className="flex items-center gap-2 shrink-0">
            {mediaFeedback && (
              <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100000] bg-yellow-500 text-black border-2 border-amber-300 px-4 py-2 rounded-2xl font-black text-xs shadow-2xl animate-bounce flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-black" />
                <span>{mediaFeedback}</span>
              </div>
            )}

            {/* Schermo Intero (Fullscreen Direct Button) */}
            <button
              onClick={toggleFullscreen}
              className={`flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs uppercase tracking-wider font-extrabold shadow-md transition-all border ${
                isFullscreen
                  ? 'bg-yellow-500 text-black border-yellow-300 shadow-[0_0_15px_rgba(212,175,55,0.5)]'
                  : 'bg-slate-900/90 border-yellow-500/40 text-yellow-400 hover:bg-slate-800'
              }`}
              title="Schermo Intero Immersivo"
            >
              <Maximize2 className="w-3.5 h-3.5 text-yellow-400" />
              <span className="inline">Schermo Intero</span>
            </button>

            {/* Master Merged VIP & Tools Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMainMenu(!showMainMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-amber-950/90 via-zinc-900 to-black hover:from-amber-900 hover:to-zinc-800 text-amber-300 font-extrabold text-xs sm:text-sm rounded-xl border-2 border-yellow-500/70 shadow-[0_0_20px_rgba(255,215,0,0.3)] tracking-wider uppercase transition-all"
                title="Apri Menu VIP, Strumenti e Navigazione 3D"
              >
                <Award className="w-4 h-4 text-yellow-400" />
                <span>
                  {currentUser?.isLoggedIn ? currentUser.username : 'Menu VIP'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-yellow-500 text-black text-[10px] sm:text-[11px] font-black shadow-md border border-amber-300">
                  {userCoins} PTS
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-yellow-400 transition-transform duration-200 ${showMainMenu ? 'rotate-180' : ''}`} />
              </button>

              {showMainMenu && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-slate-950/98 backdrop-blur-2xl border-2 border-yellow-500/70 rounded-2xl p-3 shadow-[0_0_50px_rgba(0,0,0,0.95)] z-[99999] flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 max-h-[85vh] overflow-y-auto">
                  
                  {/* SECTION 1: PROFILO & AREA VIP */}
                  <div className="px-3 py-1.5 bg-yellow-500/10 rounded-xl border border-yellow-500/30 flex items-center justify-between text-xs font-black uppercase tracking-wider text-yellow-300">
                    <div className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span>Area VIP Meta-TV</span>
                    </div>
                    <span className="bg-yellow-500 text-black px-2 py-0.5 rounded-full font-mono text-[11px]">
                      {userCoins} PTS
                    </span>
                  </div>

                  {/* Area VIP / Saldo & Coupon */}
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
                    <span className="text-[10px] text-yellow-400 font-extrabold uppercase">APRI</span>
                  </button>

                  {/* Login / VIP Account */}
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

                  {/* SECTION 2: STRUMENTI & NAVIGAZIONE 3D */}
                  <div className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-yellow-400/80">
                    ⚡ Strumenti & Navigazione 3D
                  </div>

                  {/* Teletrasporto */}
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
                        setMediaFeedback(`+${pts} PTS Musica Riscattai!`);
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
                    {!claimedMusicPoints ? (
                      <span className="text-[9px] bg-yellow-500 text-black px-1.5 py-0.5 rounded font-black">+{pointsRules?.listenMusicPoints || 40} PTS</span>
                    ) : (
                      <span className="text-[9px] text-green-400 font-mono">ON</span>
                    )}
                  </button>

                  {/* Centro Galleria 3D */}
                  <button
                    onClick={() => {
                      if (!claimedCenterPoints) {
                        const pts = pointsRules?.centerCustomPoints || 80;
                        const label = pointsRules?.centerCustomLabel || 'Interazione Centro Galleria 3D';
                        if (onEarnPoints) onEarnPoints(pts, label);
                        setClaimedCenterPoints(true);
                        setMediaFeedback(`+${pts} PTS per ${label}!`);
                        setTimeout(() => setMediaFeedback(null), 3500);
                      } else {
                        setMediaFeedback(`Punti Centro già riscattati!`);
                        setTimeout(() => setMediaFeedback(null), 2500);
                      }
                      setShowMainMenu(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 bg-black/40 hover:bg-amber-500/20 text-amber-300 font-bold text-xs rounded-xl border border-white/10 hover:border-amber-500/40 transition-all text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-amber-400" />
                      <span>📻 Centro Galleria 3D</span>
                    </div>
                    {!claimedCenterPoints && (
                      <span className="text-[9px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-black">+{pointsRules?.centerCustomPoints || 80} PTS</span>
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

                  {/* Chatbot Assistente AI */}
                  <button
                    onClick={() => {
                      onToggleChatbot();
                      setShowMainMenu(false);
                    }}
                    className="flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-extrabold text-xs rounded-xl hover:scale-102 transition-all text-left shadow-md mt-1"
                  >
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-black" />
                      <span>🤖 Chatbot Assistente Meta-TV</span>
                    </div>
                    <span className="text-[10px] bg-black/80 text-yellow-300 px-1.5 py-0.5 rounded font-bold">AI</span>
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

      {/* Corridor Floating Toolbar & Minimap (Only active in Corridor 3D view when not in fullscreen) */}
      {!isFullscreen && currentMode === 'corridor' && (
        <>
          {/* Top Control Bar Below Header */}
          <div className="absolute top-16 sm:top-20 left-2 sm:left-6 z-20 flex items-center gap-2 sm:gap-3 bg-black/85 backdrop-blur-md p-1.5 sm:p-2 rounded-xl border border-white/10 shadow-2xl max-w-[calc(100vw-1rem)] overflow-x-auto whitespace-nowrap">
            {/* Walk Speed */}
            <div className="flex items-center gap-1.5 px-1.5 text-xs text-yellow-400 font-medium shrink-0">
              <FastForward className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden sm:inline uppercase text-[10px] tracking-wider text-white/50">Velocità:</span>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.25"
                value={walkSpeed}
                onChange={(e) => onChangeWalkSpeed(parseFloat(e.target.value))}
                className="w-14 sm:w-20 accent-yellow-500 cursor-pointer"
              />
              <span className="font-mono text-yellow-400 font-bold text-[11px] sm:text-xs">{walkSpeed}x</span>
            </div>

            <div className="h-4 w-px bg-white/10 shrink-0" />

            {/* VR Toggle */}
            <button
              onClick={onToggleVR}
              className={`flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold tracking-wider uppercase transition-all border shrink-0 ${
                isVRMode
                  ? 'bg-cyan-500 text-black border-cyan-300 font-bold shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                  : 'bg-black/40 text-white/70 border-white/10 hover:border-cyan-500/50 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>VR</span>
            </button>

            {/* Auto-Tour Guide Toggle */}
            <button
              onClick={onToggleAutoTour}
              className={`flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold tracking-wider uppercase transition-all border shrink-0 ${
                isAutoTour
                  ? 'bg-yellow-500 text-black border-yellow-300 font-bold animate-pulse shadow-[0_0_12px_rgba(212,175,55,0.5)]'
                  : 'bg-black/40 text-white/70 border-white/10 hover:border-yellow-500/50 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Tour Automatico</span>
              <span className="xs:hidden">Tour</span>
            </button>
          </div>

          {/* Note: Full interactive 2D Mini-Map with rooms, corridors, and vision cone is rendered by MallCanvas3D */}
        </>
      )}

      {/* Teleport Modal */}
      {showTeleportModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pavilions.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectPavilion(p);
                    onModeChange('corridor');
                    setShowTeleportModal(false);
                  }}
                  className="p-3.5 bg-black/60 hover:bg-yellow-500/10 border border-white/10 hover:border-yellow-500/50 rounded-2xl flex items-center gap-3 text-left transition-all group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-black text-xs shadow-md"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.name.substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white group-hover:text-yellow-400 font-bold text-xs uppercase tracking-wider truncate">
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-white/50 truncate">{p.tagline}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
