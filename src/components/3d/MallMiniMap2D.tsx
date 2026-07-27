import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Pavilion, Company } from '../../types';
import {
  Compass,
  Minimize2,
  Maximize2,
  X,
  Eye,
  Footprints,
  MapPin,
  Sparkles,
  Navigation,
  Search,
  Zap,
  DoorOpen,
  Filter,
  Layers,
  Building2,
  ExternalLink,
  List,
  Info,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

interface MallMiniMap2DProps {
  pavilions: Pavilion[];
  selectedPavilion: Pavilion | null;
  playerX: number; // -15 to 290
  playerZ: number; // -4 to +4
  playerYaw: number; // in radians
  onTeleportToX: (xPos: number) => void;
  onSelectPavilion: (p: Pavilion) => void;
  companies?: Company[];
  onOpenExpoModal?: (p: Pavilion) => void;
}

export const MallMiniMap2D: React.FC<MallMiniMap2DProps> = ({
  pavilions,
  selectedPavilion,
  playerX,
  playerZ,
  playerYaw,
  onTeleportToX,
  onSelectPavilion,
  companies = [],
  onOpenExpoModal,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isFullscreenMap, setIsFullscreenMap] = useState<boolean>(false);
  const [hoveredPavId, setHoveredPavId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sideFilter, setSideFilter] = useState<'all' | 'left' | 'right'>('all');
  const [inspectedPavilion, setInspectedPavilion] = useState<Pavilion | null>(selectedPavilion);

  // Sync inspected Pavilion when selectedPavilion changes
  useEffect(() => {
    if (selectedPavilion) {
      setInspectedPavilion(selectedPavilion);
    }
  }, [selectedPavilion]);

  // Handle ESC key to close fullscreen map
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreenMap) {
        setIsFullscreenMap(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenMap]);

  // Corridor 3D range is X: -20 to 290 -> Total length 310
  // VERTICAL ORIENTATION: Start (-20m) at bottom, End (290m) at top
  const minX = -20;
  const maxX = 290;

  // Calculates Vertical Y percent along corridor length (X axis in 3D: -20 at bottom=92%, +290 at top=8%)
  const getPercentY = (x: number) => {
    const clamped = Math.max(minX, Math.min(maxX, x));
    const normalized = (clamped - minX) / (maxX - minX);
    return 92 - normalized * 84;
  };

  // Calculates Horizontal X percent across corridor width (Z axis in 3D: Left wall ~22%, Right wall ~78%)
  const getPercentX = (z: number) => {
    return 50 + (z / 18) * 35;
  };

  const playerPercentX = getPercentX(playerZ);
  const playerPercentY = getPercentY(playerX);
  // Yaw degrees: 0° points straight UP (+X direction along corridor)
  const yawDegrees = Math.round((playerYaw * 180) / Math.PI);

  // Filtered pavilions list for Directory / Fullscreen
  const filteredPavilions = pavilions.filter((pav) => {
    const matchesQuery =
      pav.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pav.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pav.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pav.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSide =
      sideFilter === 'all' ? true : sideFilter === 'left' ? pav.side === 'left' : pav.side === 'right';
    return matchesQuery && matchesSide;
  });

  // Calculate companies inside each pavilion
  const getCompaniesCountForPavilion = (pavId: string) => {
    return companies.filter((c) => c.categoryId === pavId).length;
  };

  // Click on vertical floorplan carpet to teleport
  const handleFloorplanClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickYPercent = (e.clientY - rect.top) / rect.height; // 0 (top) to 1 (bottom)
    const clampedYPercent = Math.max(0.08, Math.min(0.92, clickYPercent));
    // normalized: 0 at bottom (minX), 1 at top (maxX)
    const normalized = (0.92 - clampedYPercent) / 0.84;
    const target3DX = minX + normalized * (maxX - minX);
    onTeleportToX(target3DX);
  };

  return (
    <div className="relative z-30 select-none">
      {/* Collapsed Toggle Pill Button */}
      {!isExpanded && !isFullscreenMap && (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-black/90 hover:bg-amber-500 text-amber-300 hover:text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl border border-amber-500/60 shadow-[0_0_25px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all transform hover:scale-105"
        >
          <Compass className="w-4 h-4 animate-spin text-amber-400 shrink-0" style={{ animationDuration: '12s' }} />
          <span>🗺️ Planimetria Mappa 2D</span>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
        </button>
      )}

      {/* Expanded Mini-Map Widget Window */}
      {isExpanded && !isFullscreenMap && (
        <div className="w-56 sm:w-64 bg-zinc-950/95 border-2 border-amber-500/60 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.95)] backdrop-blur-xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-3 py-2 bg-black/90 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <Compass className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
              <span className="text-[11px] font-extrabold text-white uppercase tracking-wider truncate">
                {selectedPavilion ? `Sub-Corridoio: ${selectedPavilion.name}` : 'Mappa 2D Galleria'}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Button to enlarge map to FULLSCREEN */}
              <button
                onClick={() => setIsFullscreenMap(true)}
                className="p-1 text-amber-300 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/50 rounded-lg transition-all"
                title="Apri Mappa 2D a Schermo Intero"
              >
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              </button>

              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 text-white/70 hover:text-red-400 bg-white/5 hover:bg-red-500/20 rounded-lg transition-all"
                title="Nascondi / Chiudi Mappa 2D"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Subtitle location indicator */}
          <div className="px-3 py-1 bg-zinc-900/90 border-b border-white/10 text-[10px] text-amber-300/80 font-mono flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Footprints className="w-3 h-3 text-amber-400" />
              <span>X={Math.round(playerX)}m</span>
            </span>
            <span className="text-cyan-400 font-bold text-[9px] uppercase">
              ↑ Avanti (Avanti/Nord)
            </span>
          </div>

          {/* 2D Vertical Architectural Floorplan Map Graphic */}
          <div className="relative w-full h-72 sm:h-80 bg-zinc-900 overflow-hidden cursor-crosshair" onClick={handleFloorplanClick}>
            {/* Grid Blueprint Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:12px_12px] opacity-40 pointer-events-none" />

            {/* Architectural Corridor Walls & Carpet Path (Vertical) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <rect x="15" y="4" width="70" height="92" fill="none" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="0.8" strokeDasharray="2 2" />
              <line x1="50" y1="4" x2="50" y2="96" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.6" strokeDasharray="3 2" />
              <line x1="15" y1="8" x2="85" y2="8" stroke="#facc15" strokeWidth="1.5" />
              <line x1="15" y1="92" x2="85" y2="92" stroke="#facc15" strokeWidth="1.5" />
            </svg>

            {/* Labels overlay */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-amber-400/80 bg-black/70 px-1.5 py-0.5 rounded border border-amber-500/20 z-10 pointer-events-none">
              290m (Uscita) ▲
            </div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-amber-400/80 bg-black/70 px-1.5 py-0.5 rounded border border-amber-500/20 z-10 pointer-events-none">
              ▼ -20m (Ingresso)
            </div>
            <div className="absolute top-1/2 left-0.5 -translate-y-1/2 text-[7px] font-bold text-cyan-400/70 bg-black/60 px-1 py-0.5 rounded rotate-90 z-10 pointer-events-none whitespace-nowrap">
              PARETE NORD
            </div>
            <div className="absolute top-1/2 right-0.5 -translate-y-1/2 text-[7px] font-bold text-amber-400/70 bg-black/60 px-1 py-0.5 rounded -rotate-90 z-10 pointer-events-none whitespace-nowrap">
              PARETE SUD
            </div>

            {/* Pavilion Doors / Stands plotted along left and right walls */}
            {pavilions.map((pav, idx) => {
              const posY = getPercentY(pav.positionX);
              const posX = pav.side === 'left' ? 22 : 78;
              const isHovered = hoveredPavId === pav.id;

              return (
                <div
                  key={pav.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTeleportToX(pav.positionX);
                      onSelectPavilion(pav);
                      setInspectedPavilion(pav);
                    }}
                    onMouseEnter={() => setHoveredPavId(pav.id)}
                    onMouseLeave={() => setHoveredPavId(null)}
                    className="group relative flex items-center justify-center transition-all"
                    title={`Clicca per andare a ${pav.name}`}
                  >
                    <span
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg flex items-center justify-center font-extrabold text-[8px] sm:text-[9px] border shadow-lg transition-all transform group-hover:scale-125"
                      style={{
                        backgroundColor: pav.color,
                        borderColor: '#ffffff',
                        color: '#000000',
                      }}
                    >
                      🚪
                    </span>

                    <span
                      className={`absolute ${
                        pav.side === 'left' ? 'left-full ml-1' : 'right-full mr-1'
                      } top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase whitespace-nowrap border shadow-2xl transition-all pointer-events-none z-30 ${
                        isHovered
                          ? 'bg-black text-amber-300 border-amber-400 opacity-100 scale-100'
                          : 'bg-black/80 text-white/80 border-white/10 opacity-70 scale-95'
                      }`}
                    >
                      #{idx + 1} {pav.name.split(' ')[0]}
                    </span>
                  </button>
                </div>
              );
            })}

            {/* Field of View Cone SVG overlay centered at player percent location */}
            <div
              className="absolute pointer-events-none transition-all duration-75 z-20"
              style={{
                left: `${playerPercentX}%`,
                top: `${playerPercentY}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <svg className="w-24 h-24 overflow-visible" viewBox="-50 -50 100 100">
                <g transform={`rotate(${yawDegrees})`}>
                  <path d="M 0 0 L -25 -30 A 38 38 0 0 1 25 -30 Z" fill="url(#mallFovGradient)" className="opacity-80" />
                  <path d="M -25 -30 A 38 38 0 0 1 25 -30" fill="none" stroke="#facc15" strokeWidth="1.5" strokeDasharray="2 2" />
                </g>
                <defs>
                  <radialGradient id="mallFovGradient" cx="0%" cy="0%" r="100%">
                    <stop offset="0%" stopColor="#facc15" stopOpacity="0.9" />
                    <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#b45309" stopOpacity="0.0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>

            {/* Player Avatar Pin Pinpoint */}
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-25 pointer-events-none transition-all duration-75"
              style={{ left: `${playerPercentX}%`, top: `${playerPercentY}%` }}
            >
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400 border-2 border-white shadow-[0_0_12px_rgba(251,191,36,1)] flex items-center justify-center">
                  <Navigation className="w-2.5 h-2.5 text-black" style={{ transform: `rotate(${yawDegrees}deg)` }} />
                </span>
              </span>
            </div>
          </div>

          {/* Footer Bar with Quick Teleport & Fullscreen trigger */}
          <div className="px-2.5 py-1.5 bg-black/90 border-t border-white/10 text-[9px] text-white/70 flex items-center justify-between">
            <span className="truncate font-semibold text-amber-200">
              Clicca sulla mappa per spostarti
            </span>
            <button
              onClick={() => setIsFullscreenMap(true)}
              className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded text-[9px] uppercase tracking-wider shrink-0 transition-transform active:scale-95 flex items-center gap-1"
            >
              <Maximize2 className="w-2.5 h-2.5" />
              Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULLSCREEN 2D ARCHITECTURAL MAP MODAL FOR MAXIMUM LEGIBILITY & NAV        */}
      {/* ========================================================================= */}
      {isFullscreenMap &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col p-3 sm:p-6 text-white overflow-hidden animate-fadeIn select-text">
            {/* Top Fullscreen Control Bar */}
            <div className="bg-zinc-950/95 border-2 border-amber-500/60 rounded-2xl p-3 sm:p-4 mb-4 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-[0_0_50px_rgba(245,158,11,0.25)] shrink-0">
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
                  <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '20s' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/40">
                      Planimetria 2D Completa
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Posizione Avatar: X={Math.round(playerX)}m
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black text-white tracking-wide">
                    Mappa Padiglioni Espositivi Galleria Meta-TV
                  </h2>
                </div>
              </div>

              {/* Filter Controls & Close Button */}
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
                {/* Search Box */}
                <div className="relative flex-1 sm:w-72">
                  <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                  <input
                    type="text"
                    placeholder="Cerca padiglione o categoria..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border-2 border-amber-500/50 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white font-medium placeholder-slate-400 outline-none transition-all shadow-inner"
                  />
                </div>

                {/* Side Filter Buttons */}
                <div className="flex bg-black/80 p-1 rounded-xl border border-white/20 gap-1 text-xs">
                  <button
                    onClick={() => setSideFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-extrabold transition-all ${
                      sideFilter === 'all'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Tutti ({pavilions.length})
                  </button>
                  <button
                    onClick={() => setSideFilter('left')}
                    className={`px-3 py-1.5 rounded-lg font-extrabold transition-all ${
                      sideFilter === 'left'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Parete Nord (Sinistra)
                  </button>
                  <button
                    onClick={() => setSideFilter('right')}
                    className={`px-3 py-1.5 rounded-lg font-extrabold transition-all ${
                      sideFilter === 'right'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Parete Sud (Destra)
                  </button>
                </div>

                {/* Exit Fullscreen Button */}
                <button
                  onClick={() => setIsFullscreenMap(false)}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 transition-all transform active:scale-95 border border-red-400/50"
                  title="Chiudi Mappa Fullscreen (ESC)"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>Chiudi Mappa (ESC)</span>
                </button>
              </div>
            </div>

          {/* Main Content Area: Vertical Architectural Blueprint Map on Left, Grid Directory on Right */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: ARCHITECTURAL VERTICAL MAP BLUEPRINT */}
              <div className="lg:col-span-5 xl:col-span-4 bg-zinc-950 border-2 border-amber-500/40 rounded-3xl p-4 shadow-2xl relative flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-amber-300 uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>Planimetria Verticale Galleria</span>
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    X: -20m ➔ 290m
                  </span>
                </div>

                {/* Vertical Blueprint Floorplan Canvas */}
                <div
                  className="relative w-full h-[480px] sm:h-[520px] bg-slate-900/90 rounded-2xl border border-white/10 overflow-hidden cursor-crosshair select-none shadow-inner"
                  onClick={handleFloorplanClick}
                >
                  {/* Blueprint Texture */}
                  <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

                  {/* Corridor Outer Borders (Vertical) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <rect x="18" y="4" width="64" height="92" fill="none" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="0.8" strokeDasharray="2 2" />
                    <line x1="50" y1="4" x2="50" y2="96" stroke="#f59e0b" strokeWidth="2.5" strokeOpacity="0.7" strokeDasharray="4 2" />
                    <line x1="18" y1="8" x2="82" y2="8" stroke="#facc15" strokeWidth="2" />
                    <line x1="18" y1="92" x2="82" y2="92" stroke="#facc15" strokeWidth="2" />
                  </svg>

                  {/* Axis Ruler & Wall Labels */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-amber-300 bg-black/80 px-2 py-0.5 rounded border border-amber-500/30 z-10 pointer-events-none">
                    290m (Uscita) ▲
                  </div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-amber-300 bg-black/80 px-2 py-0.5 rounded border border-amber-500/30 z-10 pointer-events-none">
                    ▼ -20m (Ingresso)
                  </div>
                  <div className="absolute top-1/2 left-1 -translate-y-1/2 text-[9px] font-black uppercase tracking-wider text-cyan-400/80 bg-black/70 px-1.5 py-0.5 rounded rotate-90 z-10 pointer-events-none whitespace-nowrap">
                    PARETE NORD (SINISTRA)
                  </div>
                  <div className="absolute top-1/2 right-1 -translate-y-1/2 text-[9px] font-black uppercase tracking-wider text-amber-400/80 bg-black/70 px-1.5 py-0.5 rounded -rotate-90 z-10 pointer-events-none whitespace-nowrap">
                    PARETE SUD (DESTRA)
                  </div>

                  {/* Pavilion Doors / Stand Indicators Plotted */}
                  {pavilions.map((pav, idx) => {
                    const posY = getPercentY(pav.positionX);
                    const posX = pav.side === 'left' ? 24 : 76;
                    const isHovered = hoveredPavId === pav.id;
                    const isInspected = inspectedPavilion?.id === pav.id;
                    const standsCount = getCompaniesCountForPavilion(pav.id);

                    return (
                      <div
                        key={pav.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                        style={{ left: `${posX}%`, top: `${posY}%` }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectedPavilion(pav);
                            onSelectPavilion(pav);
                          }}
                          onMouseEnter={() => setHoveredPavId(pav.id)}
                          onMouseLeave={() => setHoveredPavId(null)}
                          className={`group relative flex items-center justify-center transition-all transform ${
                            isInspected ? 'scale-125 z-30' : 'hover:scale-110'
                          }`}
                        >
                          {/* Door / Badge Marker */}
                          <div
                            className={`px-2 py-1 rounded-xl font-black text-xs border shadow-2xl flex items-center gap-1 transition-all ${
                              isInspected
                                ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-black shadow-[0_0_20px_rgba(251,191,36,0.8)]'
                                : ''
                            }`}
                            style={{
                              backgroundColor: pav.color,
                              borderColor: '#ffffff',
                              color: '#000000',
                            }}
                          >
                            <span className="text-xs">🚪</span>
                            <span className="font-extrabold font-mono text-[10px]">#{idx + 1}</span>
                          </div>

                          {/* Floating Tooltip Label */}
                          <div
                            className={`absolute ${
                              pav.side === 'left' ? 'left-full ml-2' : 'right-full mr-2'
                            } top-1/2 -translate-y-1/2 bg-black/95 text-white border border-amber-400/80 p-2 rounded-xl text-center shadow-2xl transition-all whitespace-nowrap pointer-events-none z-40 ${
                              isHovered || isInspected ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                            }`}
                          >
                            <div className="font-black text-xs text-amber-300">
                              #{idx + 1} {pav.name}
                            </div>
                            <div className="text-[10px] text-slate-300">{pav.tagline}</div>
                            <div className="text-[9px] text-cyan-400 font-mono mt-0.5">
                              📍 Posizione: X = {pav.positionX}m • {standsCount} Stand
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}

                  {/* Avatar FOV Cone */}
                  <div
                    className="absolute pointer-events-none transition-all duration-75 z-25"
                    style={{
                      left: `${playerPercentX}%`,
                      top: `${playerPercentY}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <svg className="w-32 h-32 overflow-visible" viewBox="-50 -50 100 100">
                      <g transform={`rotate(${yawDegrees})`}>
                        <path d="M 0 0 L -30 -35 A 45 45 0 0 1 30 -35 Z" fill="url(#mallFovGradientFs)" className="opacity-90" />
                      </g>
                      <defs>
                        <radialGradient id="mallFovGradientFs" cx="0%" cy="0%" r="100%">
                          <stop offset="0%" stopColor="#facc15" stopOpacity="0.9" />
                          <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#b45309" stopOpacity="0.0" />
                        </radialGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Avatar Marker Pinpoint */}
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none transition-all duration-75"
                    style={{ left: `${playerPercentX}%`, top: `${playerPercentY}%` }}
                  >
                    <span className="relative flex h-6 w-6">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-6 w-6 bg-amber-400 border-2 border-white shadow-[0_0_20px_rgba(251,191,36,1)] flex items-center justify-center">
                        <Navigation className="w-3.5 h-3.5 text-black" style={{ transform: `rotate(${yawDegrees}deg)` }} />
                      </span>
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-300 gap-2 border-t border-white/10 pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-400 border border-white" />
                    <span className="font-bold text-amber-300">Avatar</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">🚪</span>
                    <span>Padiglione</span>
                  </div>
                  <div className="text-amber-400 font-bold text-[10px]">
                    ▲ Avanti = Nord
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: INSPECTED PAVILION & DIRECTORY */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6">

            {/* 2. INSPECTED PAVILION HIGHLIGHT PANEL (If any selected) */}
            {inspectedPavilion && (
              <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-amber-950/40 border-2 border-amber-500/60 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 animate-fadeIn">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shadow-xl border-2 border-white shrink-0"
                    style={{ backgroundColor: inspectedPavilion.color }}
                  >
                    🚪
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-500/30 border border-amber-400 text-amber-200 font-black text-xs uppercase">
                        {inspectedPavilion.id.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-300 font-mono">
                        {inspectedPavilion.side === 'left' ? 'Parete Nord (Sinistra)' : 'Parete Sud (Destra)'} • Posizione X = {inspectedPavilion.positionX}m
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">{inspectedPavilion.name}</h3>
                    <p className="text-cyan-300 text-xs sm:text-sm font-semibold">{inspectedPavilion.tagline}</p>
                    <p className="text-slate-300 text-xs mt-1 max-w-2xl">{inspectedPavilion.description}</p>
                  </div>
                </div>

                {/* Actions for Inspected Pavilion */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 justify-end">
                  <button
                    onClick={() => {
                      onTeleportToX(inspectedPavilion.positionX);
                      onSelectPavilion(inspectedPavilion);
                      setIsFullscreenMap(false);
                    }}
                    className="px-5 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 border border-yellow-300"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Teletrasportati Qui (3D)</span>
                  </button>

                  {onOpenExpoModal && (
                    <button
                      onClick={() => {
                        onSelectPavilion(inspectedPavilion);
                        onOpenExpoModal(inspectedPavilion);
                        setIsFullscreenMap(false);
                      }}
                      className="px-5 py-3 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 font-black text-xs uppercase tracking-wider rounded-xl border border-cyan-400/60 shadow-lg transition-all flex items-center gap-2"
                    >
                      <DoorOpen className="w-4 h-4 text-cyan-400" />
                      <span>Apri Espositori & Stand</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 3. COMPLETE PAVILIONS DIRECTORY GRID (HIGH LEGIBILITY READABLE CARDS) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  <span>Elenco Completo Padiglioni Espositivi ({filteredPavilions.length})</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Iscritti: {companies.length} Aziende
                </span>
              </div>

              {filteredPavilions.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 text-slate-400 text-sm">
                  Nessun padiglione trovato con i filtri inseriti.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredPavilions.map((pav, index) => {
                    const standsCount = getCompaniesCountForPavilion(pav.id);
                    const isSelected = inspectedPavilion?.id === pav.id;

                    return (
                      <div
                        key={pav.id}
                        onClick={() => {
                          setInspectedPavilion(pav);
                          onSelectPavilion(pav);
                        }}
                        className={`group relative bg-slate-900/90 border-2 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)] bg-amber-950/20'
                            : 'border-white/10 hover:border-amber-500/50 hover:bg-slate-800/80'
                        }`}
                      >
                        <div>
                          {/* Card Top Header */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm border shadow-md shrink-0"
                                style={{ backgroundColor: pav.color, color: '#000000' }}
                              >
                                🚪
                              </span>
                              <div>
                                <span className="text-[10px] font-black uppercase text-amber-400 font-mono">
                                  PADIGLIONE #{index + 1}
                                </span>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {pav.side === 'left' ? 'Parete Nord' : 'Parete Sud'} • X={pav.positionX}m
                                </div>
                              </div>
                            </div>

                            <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-bold">
                              {standsCount} Stand
                            </span>
                          </div>

                          {/* Pavilion Title & Tagline */}
                          <h4 className="text-base font-black text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                            {pav.name}
                          </h4>
                          <p className="text-cyan-300 text-xs font-semibold mt-0.5 line-clamp-1">{pav.tagline}</p>
                          <p className="text-slate-300 text-xs mt-2 line-clamp-2 leading-relaxed">
                            {pav.description}
                          </p>
                        </div>

                        {/* Card Footer Action Buttons */}
                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTeleportToX(pav.positionX);
                              onSelectPavilion(pav);
                              setIsFullscreenMap(false);
                            }}
                            className="flex-1 py-2 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-extrabold text-[11px] rounded-xl border border-amber-500/40 transition-all flex items-center justify-center gap-1"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Vai qui (3D)</span>
                          </button>

                          {onOpenExpoModal && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectPavilion(pav);
                                onOpenExpoModal(pav);
                                setIsFullscreenMap(false);
                              }}
                              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] rounded-xl border border-white/20 transition-all flex items-center justify-center gap-1"
                              title="Apri Fiera e Stand"
                            >
                              <DoorOpen className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Stand</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>,
    document.body
  )}
  </div>
  );
};
