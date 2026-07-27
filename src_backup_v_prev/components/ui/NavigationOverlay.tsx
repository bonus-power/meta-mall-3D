import React, { useState, useEffect } from 'react';
import { NavMode, Pavilion } from '../../types';
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
} from 'lucide-react';

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
  onToggleChatbot: () => void;
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
  onToggleChatbot,
}) => {
  const [showTeleportModal, setShowTeleportModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const triggerResizeEvents = () => {
    const fire = () => window.dispatchEvent(new Event('resize'));
    fire();
    setTimeout(fire, 50);
    setTimeout(fire, 150);
    setTimeout(fire, 300);
    setTimeout(fire, 600);
  };

  useEffect(() => {
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
        <header className="absolute top-0 left-0 right-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/10 px-2.5 py-1.5 sm:px-6 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 max-w-full overflow-hidden">
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

          {/* View Mode Switcher Buttons */}
          <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md overflow-x-auto max-w-2xl no-scrollbar">
            <button
              onClick={() => onModeChange('corridor')}
              className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs tracking-wider uppercase transition-all whitespace-nowrap ${
                currentMode === 'corridor'
                  ? 'bg-yellow-500 text-black font-bold shadow-[0_0_12px_rgba(212,175,55,0.35)]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Corridoi</span>
            </button>

            <button
              onClick={() => onModeChange('globe')}
              className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs tracking-wider uppercase transition-all whitespace-nowrap ${
                currentMode === 'globe'
                  ? 'bg-yellow-500 text-black font-bold shadow-[0_0_12px_rgba(212,175,55,0.35)]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">Mappa Globale</span>
              <span className="xs:hidden">Globale</span>
            </button>

            <button
              onClick={() => onModeChange('panorama')}
              className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs tracking-wider uppercase transition-all whitespace-nowrap ${
                currentMode === 'panorama'
                  ? 'bg-yellow-500 text-black font-bold shadow-[0_0_12px_rgba(212,175,55,0.35)]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>360°</span>
            </button>

            <button
              onClick={() => onModeChange('live-events')}
              className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs tracking-wider uppercase transition-all whitespace-nowrap ${
                currentMode === 'live-events'
                  ? 'bg-yellow-500 text-black font-bold shadow-[0_0_12px_rgba(212,175,55,0.35)]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Tv className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400" />
              <span>Live</span>
            </button>

            {/* Business & Admin indicators shown only when accessing those modes via dedicated URL */}
            {currentMode === 'business' && (
              <button
                onClick={() => onModeChange('business')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs tracking-wider uppercase bg-amber-500 text-black font-extrabold shadow-[0_0_12px_rgba(245,158,11,0.4)] whitespace-nowrap"
              >
                <Store className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Area Aziende</span>
              </button>
            )}

            {currentMode === 'admin' && (
              <button
                onClick={() => onModeChange('admin')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs tracking-wider uppercase bg-red-600 text-white font-extrabold shadow-[0_0_12px_rgba(220,38,38,0.4)] whitespace-nowrap"
              >
                <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Area Admin</span>
              </button>
            )}
          </nav>

          {/* Right Tools (Teleport, VR, Fullscreen, Gamification, Chatbot) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={toggleFullscreen}
              className={`flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-[10px] sm:text-xs uppercase tracking-wider font-semibold shadow-md transition-all border ${
                isFullscreen
                  ? 'bg-yellow-500 text-black border-yellow-300 font-bold shadow-[0_0_15px_rgba(212,175,55,0.5)]'
                  : 'bg-black/50 border-white/20 hover:border-yellow-500/60 text-white/90 hover:text-white'
              }`}
              title="Schermo Intero"
            >
              <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400" />
              <span className="hidden sm:inline">Schermo Intero</span>
            </button>

            <button
              onClick={() => setShowTeleportModal(true)}
              className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-black/50 border border-white/20 hover:border-yellow-500/60 text-yellow-400 rounded-lg text-[10px] sm:text-xs uppercase tracking-wider font-semibold shadow-md transition-all"
              title="Teletrasporto Rapido Padiglioni"
            >
              <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400" />
              <span className="hidden lg:inline">Teletrasporto</span>
            </button>

            <button
              onClick={onOpenGamification}
              className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-r from-zinc-900 to-black border border-amber-500/30 hover:border-amber-400 text-amber-300 rounded-lg text-[10px] sm:text-xs uppercase tracking-wider font-semibold shadow-md transition-all"
              title="Livelli & Premi Gamification"
            >
              <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400" />
              <span className="hidden lg:inline">Premi VIP</span>
            </button>

            <button
              onClick={onToggleChatbot}
              className="flex items-center gap-1 px-2 py-1.5 sm:px-3.5 sm:py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all hover:scale-105"
              title="Chatbot Assistente Meta-TV"
            >
              <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden md:inline">Assistente</span>
            </button>
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
