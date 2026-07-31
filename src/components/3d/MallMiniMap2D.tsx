import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Pavilion, Company } from '../../types';
import { getSubcategoriesForPavilion, SubCategory } from '../../data/subcategoriesData';
import {
  Compass,
  Minimize2,
  Maximize2,
  X,
  Footprints,
  Navigation,
  Search,
  Zap,
  DoorOpen,
  Building2,
  ArrowLeft,
  Store,
} from 'lucide-react';

export interface MiniMapDoorItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  side: 'left' | 'right';
  positionX: number;
  companiesCount: number;
  isSubCategory: boolean;
  pavilionRef?: Pavilion;
  subCategoryRef?: SubCategory;
}

interface MallMiniMap2DProps {
  pavilions: Pavilion[];
  selectedPavilion: Pavilion | null;
  subcategoriesMap?: Record<string, SubCategory[]>;
  playerX: number; // -15 to 290
  playerZ: number; // -4 to +4
  playerYaw: number; // in radians
  onTeleportToX: (xPos: number) => void;
  onSelectPavilion: (p: Pavilion | null) => void;
  companies?: Company[];
  onOpenExpoModal?: (p: Pavilion) => void;
}

export const MallMiniMap2D: React.FC<MallMiniMap2DProps> = ({
  pavilions,
  selectedPavilion,
  subcategoriesMap,
  playerX,
  playerZ,
  playerYaw,
  onTeleportToX,
  onSelectPavilion,
  companies = [],
  onOpenExpoModal,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isFullscreenMap, setIsFullscreenMap] = useState<boolean>(false);
  const [hoveredDoorId, setHoveredDoorId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sideFilter, setSideFilter] = useState<'all' | 'left' | 'right'>('all');

  const isCategoryCorridor = !!selectedPavilion;

  // Retrieve subcategories if inside a category corridor
  const subcategories = isCategoryCorridor
    ? (subcategoriesMap && subcategoriesMap[selectedPavilion.id]) ||
      getSubcategoriesForPavilion(selectedPavilion, companies)
    : [];

  // Build unified list of door items to display on the 2D floorplan map
  const doorItems: MiniMapDoorItem[] = isCategoryCorridor
    ? subcategories.map((sub, idx) => {
        const side: 'left' | 'right' = idx % 2 === 0 ? 'left' : 'right';
        const positionX = idx * 30;
        const count = companies.filter(
          (c) =>
            c.categoryId === selectedPavilion.id &&
            (c.subCategory?.toLowerCase().includes(sub.name.toLowerCase()) ||
              sub.name.toLowerCase().includes(c.subCategory?.toLowerCase() || ''))
        ).length;

        return {
          id: sub.id,
          name: sub.name,
          tagline: sub.tagline || `Sottocategoria 3D #${idx + 1}`,
          description: sub.description || 'Spazio espositivo specializzato in 3D',
          color: sub.color || selectedPavilion.color || '#FFD700',
          side,
          positionX,
          companiesCount: count,
          isSubCategory: true,
          subCategoryRef: sub,
          pavilionRef: selectedPavilion,
        };
      })
    : pavilions.map((pav) => ({
        id: pav.id,
        name: pav.name,
        tagline: pav.tagline,
        description: pav.description,
        color: pav.color,
        side: pav.side,
        positionX: pav.positionX,
        companiesCount: companies.filter((c) => c.categoryId === pav.id).length,
        isSubCategory: false,
        pavilionRef: pav,
      }));

  const [inspectedDoorId, setInspectedDoorId] = useState<string | null>(null);

  // Sync inspected door when corridor or items change
  useEffect(() => {
    if (doorItems.length > 0) {
      if (!inspectedDoorId || !doorItems.some((d) => d.id === inspectedDoorId)) {
        setInspectedDoorId(doorItems[0].id);
      }
    } else {
      setInspectedDoorId(null);
    }
  }, [selectedPavilion, doorItems.length]);

  const inspectedDoor = doorItems.find((d) => d.id === inspectedDoorId) || doorItems[0] || null;

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

  // Dynamic Corridor 3D bounds based on actual door positions for maximum vertical spacing and legibility
  const maxDoorX = doorItems.length > 0 ? Math.max(...doorItems.map((d) => d.positionX)) : 210;
  const minX = -15;
  const maxX = Math.max(maxDoorX + 25, 60);

  // Calculates Vertical Y percent along corridor length (from ~88% at bottom to ~12% at top)
  const getPercentY = (x: number) => {
    const clamped = Math.max(minX, Math.min(maxX, x));
    const normalized = (clamped - minX) / (maxX - minX);
    return 88 - normalized * 76;
  };

  // Calculates Horizontal X percent across corridor width
  const getPercentX = (z: number) => {
    return 50 + (z / 18) * 32;
  };

  const playerPercentX = getPercentX(playerZ);
  const playerPercentY = getPercentY(playerX);
  const yawDegrees = Math.round((playerYaw * 180) / Math.PI);

  // Unique list of meter markers along the central corridor for scale ticks
  const meterTicks = Array.from(
    new Set(doorItems.map((d) => d.positionX))
  ).sort((a, b) => a - b);

  // Filtered doors list for Directory / Fullscreen
  const filteredDoors = doorItems.filter((item) => {
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSide =
      sideFilter === 'all' ? true : sideFilter === 'left' ? item.side === 'left' : item.side === 'right';
    return matchesQuery && matchesSide;
  });

  // Click on vertical floorplan carpet to teleport
  const handleFloorplanClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickYPercent = (e.clientY - rect.top) / rect.height; // 0 (top) to 1 (bottom)
    const clampedYPercent = Math.max(0.08, Math.min(0.92, clickYPercent));
    const normalized = (0.88 - clampedYPercent) / 0.76;
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
          <Compass className="w-4 h-4 text-amber-400 shrink-0" />
          <span>🗺️ Planimetria 2D: {selectedPavilion ? selectedPavilion.name : 'Galleria'}</span>
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
        </button>
      )}

      {/* Expanded Mini-Map Widget Window */}
      {isExpanded && !isFullscreenMap && (
        <div className="w-60 sm:w-72 bg-zinc-950/95 border-2 border-amber-500/60 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.95)] backdrop-blur-xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-3 py-2 bg-black/90 border-b border-white/10 flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 truncate">
              <Compass className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider truncate">
                {selectedPavilion ? `Corridoio: ${selectedPavilion.name}` : 'Mappa Galleria'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {isCategoryCorridor && (
                <button
                  onClick={() => {
                    onSelectPavilion(null);
                    onTeleportToX(0);
                  }}
                  className="px-1.5 py-0.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-[9px] rounded border border-amber-400/40 transition-all flex items-center gap-0.5"
                  title="Torna alla Galleria Principale"
                >
                  <ArrowLeft className="w-2.5 h-2.5" />
                  Galleria
                </button>
              )}
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                title="Riduci Mappa"
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
              ↑ Avanti ({doorItems.length} Porte)
            </span>
          </div>

          {/* 2D Vertical Architectural Floorplan Map Graphic */}
          <div className="relative w-full h-80 sm:h-96 bg-zinc-950 overflow-hidden cursor-crosshair border-b border-white/10" onClick={handleFloorplanClick}>
            {/* Grid Blueprint Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:12px_12px] opacity-50 pointer-events-none" />

            {/* Architectural Corridor Walls & Carpet Path */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Central Walking Corridor */}
              <rect x="36" y="6" width="28" height="88" rx="4" fill="rgba(245, 158, 11, 0.08)" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="0.8" />
              <line x1="50" y1="6" x2="50" y2="94" stroke="#f59e0b" strokeWidth="1.8" strokeOpacity="0.8" strokeDasharray="3 2" />
              <line x1="32" y1="12" x2="68" y2="12" stroke="#facc15" strokeWidth="1.5" />
              <line x1="32" y1="88" x2="68" y2="88" stroke="#facc15" strokeWidth="1.5" />

              {/* Connector Hallways to each Door/Section */}
              {doorItems.map((item) => {
                const posY = getPercentY(item.positionX);
                const isLeft = item.side === 'left';
                return (
                  <g key={`bridge-widget-${item.id}`}>
                    <line
                      x1="50"
                      y1={posY}
                      x2={isLeft ? 20 : 80}
                      y2={posY}
                      stroke={item.color || '#f59e0b'}
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                      strokeOpacity="0.8"
                    />
                    <circle cx="50" cy={posY} r="1.5" fill="#facc15" />
                  </g>
                );
              })}

              {/* Meter Distance Ticks along Central Path */}
              {meterTicks.map((meter) => {
                const posY = getPercentY(meter);
                return (
                  <line key={`tick-w-${meter}`} x1="47" y1={posY} x2="53" y2={posY} stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.5" />
                );
              })}
            </svg>

            {/* Labels overlay */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold text-amber-300 bg-black/80 px-2 py-0.5 rounded border border-amber-500/30 z-10 pointer-events-none">
              Uscita Corridoio ▲
            </div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold text-amber-300 bg-black/80 px-2 py-0.5 rounded border border-amber-500/30 z-10 pointer-events-none">
              ▼ Ingresso (0m)
            </div>
            <div className="absolute top-1/2 left-0.5 -translate-y-1/2 text-[7px] font-black uppercase text-cyan-400/80 bg-black/70 px-1 py-0.5 rounded rotate-90 z-10 pointer-events-none whitespace-nowrap">
              PARETE NORD
            </div>
            <div className="absolute top-1/2 right-0.5 -translate-y-1/2 text-[7px] font-black uppercase text-amber-400/80 bg-black/70 px-1 py-0.5 rounded -rotate-90 z-10 pointer-events-none whitespace-nowrap">
              PARETE SUD
            </div>

            {/* Meter Distance Labels on Central Axis */}
            {meterTicks.map((meter) => {
              const posY = getPercentY(meter);
              return (
                <div
                  key={`meter-label-${meter}`}
                  className="absolute left-1/2 -translate-x-1/2 text-[7px] font-mono font-bold text-slate-300 bg-black/80 px-1 rounded pointer-events-none z-10"
                  style={{ top: `${posY}%` }}
                >
                  {meter}m
                </div>
              );
            })}

            {/* Door Items plotted along left and right walls */}
            {doorItems.map((item, idx) => {
              const posY = getPercentY(item.positionX);
              const isLeft = item.side === 'left';
              const posX = isLeft ? 18 : 82;
              const isHovered = hoveredDoorId === item.id;
              const isInspected = inspectedDoorId === item.id;

              return (
                <div
                  key={item.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTeleportToX(item.positionX);
                      setInspectedDoorId(item.id);
                      if (!isCategoryCorridor && item.pavilionRef) {
                        onSelectPavilion(item.pavilionRef);
                      }
                    }}
                    onMouseEnter={() => setHoveredDoorId(item.id)}
                    onMouseLeave={() => setHoveredDoorId(null)}
                    className="group relative flex items-center transition-all"
                    title={`Clicca per andare a ${item.name}`}
                  >
                    <div
                      className={`px-1.5 py-0.5 rounded-lg flex items-center gap-1 font-extrabold text-[9px] border shadow-lg transition-all transform group-hover:scale-110 ${
                        isInspected ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-black scale-105 shadow-[0_0_15px_rgba(251,191,36,0.8)]' : ''
                      }`}
                      style={{
                        backgroundColor: item.color,
                        borderColor: '#ffffff',
                        color: '#000000',
                      }}
                    >
                      <span>🚪</span>
                      <span className="font-mono text-[9px] font-black">#{idx + 1}</span>
                    </div>

                    <span
                      className={`absolute ${
                        isLeft ? 'left-full ml-1.5' : 'right-full mr-1.5'
                      } top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase whitespace-nowrap border shadow-2xl transition-all pointer-events-none z-30 ${
                        isHovered || isInspected
                          ? 'bg-black text-amber-300 border-amber-400 opacity-100 scale-100'
                          : 'bg-black/90 text-white/90 border-white/20 opacity-80 scale-95'
                      }`}
                    >
                      {item.name.split(' ')[0]}
                    </span>
                  </button>
                </div>
              );
            })}

            {/* Field of View Cone SVG overlay */}
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
      {/* FULLSCREEN 2D ARCHITECTURAL MAP MODAL                                      */}
      {/* ========================================================================= */}
      {isFullscreenMap &&
        createPortal(
          <div className="fixed inset-0 z-[999999] bg-slate-950 flex flex-col p-3 sm:p-6 text-white overflow-hidden animate-fadeIn select-text">
            {/* Top Fullscreen Control Bar */}
            <div className="bg-zinc-950/95 border-2 border-amber-500/60 rounded-2xl p-3 sm:p-4 mb-4 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-[0_0_50px_rgba(245,158,11,0.25)] shrink-0">
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
                  <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '20s' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/40">
                      Planimetria 2D {isCategoryCorridor ? `Sub-Corridoio: ${selectedPavilion.name}` : 'Galleria Principale'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Posizione Avatar: X={Math.round(playerX)}m
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black text-white tracking-wide">
                    {isCategoryCorridor
                      ? `Sottocategorie Espositive — ${selectedPavilion.name}`
                      : 'Mappa Padiglioni Espositivi Galleria Meta-TV'}
                  </h2>
                </div>
              </div>

              {/* Filter Controls & Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
                {isCategoryCorridor && (
                  <button
                    onClick={() => {
                      onSelectPavilion(null);
                      onTeleportToX(0);
                    }}
                    className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl border border-amber-400/60 shadow-lg flex items-center gap-1.5 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Galleria Principale</span>
                  </button>
                )}

                {/* Search Box */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                  <input
                    type="text"
                    placeholder="Cerca porta o sottocategoria..."
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
                    Tutti ({doorItems.length})
                  </button>
                  <button
                    onClick={() => setSideFilter('left')}
                    className={`px-3 py-1.5 rounded-lg font-extrabold transition-all ${
                      sideFilter === 'left'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Nord (Sinistra)
                  </button>
                  <button
                    onClick={() => setSideFilter('right')}
                    className={`px-3 py-1.5 rounded-lg font-extrabold transition-all ${
                      sideFilter === 'right'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Sud (Destra)
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

            {/* Main Content Area: Vertical Blueprint Map on Left, Grid Directory on Right */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT COLUMN: ARCHITECTURAL VERTICAL MAP BLUEPRINT */}
                <div className="lg:col-span-5 xl:col-span-4 bg-zinc-950 border-2 border-amber-500/40 rounded-3xl p-4 shadow-2xl relative flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3 text-xs font-bold text-amber-300 uppercase tracking-wider">
                    <span className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-amber-400" />
                      <span>Planimetria {isCategoryCorridor ? selectedPavilion.name : 'Galleria'}</span>
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {doorItems.length} Porte
                    </span>
                  </div>

                  {/* Vertical Blueprint Floorplan Canvas */}
                  <div
                    className="relative w-full h-[540px] sm:h-[600px] bg-slate-950 rounded-2xl border-2 border-amber-500/30 overflow-hidden cursor-crosshair select-none shadow-inner"
                    onClick={handleFloorplanClick}
                  >
                    {/* Blueprint Texture */}
                    <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] opacity-50 pointer-events-none" />

                    {/* Corridor Outer Borders & Connector Bridges */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Central Walking Corridor Track */}
                      <rect x="35" y="4" width="30" height="92" rx="4" fill="rgba(245, 158, 11, 0.08)" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="0.8" />
                      <line x1="50" y1="4" x2="50" y2="96" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.8" strokeDasharray="3 2" />
                      <line x1="30" y1="8" x2="70" y2="8" stroke="#facc15" strokeWidth="2" />
                      <line x1="30" y1="92" x2="70" y2="92" stroke="#facc15" strokeWidth="2" />

                      {/* Connector Hallways to each Door/Section */}
                      {doorItems.map((item) => {
                        const posY = getPercentY(item.positionX);
                        const isLeft = item.side === 'left';
                        return (
                          <g key={`bridge-fs-${item.id}`}>
                            <line
                              x1="50"
                              y1={posY}
                              x2={isLeft ? 22 : 78}
                              y2={posY}
                              stroke={item.color || '#f59e0b'}
                              strokeWidth="1.8"
                              strokeDasharray="2 2"
                              strokeOpacity="0.85"
                            />
                            <circle cx="50" cy={posY} r="2" fill="#facc15" />
                          </g>
                        );
                      })}

                      {/* Meter Distance Scale Ticks along Central Path */}
                      {meterTicks.map((meter) => {
                        const posY = getPercentY(meter);
                        return (
                          <line key={`tick-fs-${meter}`} x1="46" y1={posY} x2="54" y2={posY} stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.6" />
                        );
                      })}
                    </svg>

                    {/* Axis Ruler & Wall Labels */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] font-mono font-bold text-amber-300 bg-black/90 px-2.5 py-0.5 rounded-full border border-amber-500/40 z-10 pointer-events-none shadow-md">
                      Uscita Corridoio ▲
                    </div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] font-mono font-bold text-amber-300 bg-black/90 px-2.5 py-0.5 rounded-full border border-amber-500/40 z-10 pointer-events-none shadow-md">
                      ▼ Ingresso (0m)
                    </div>
                    <div className="absolute top-1/2 left-1 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-cyan-400 bg-black/80 px-2 py-0.5 rounded-md border border-cyan-500/30 rotate-90 z-10 pointer-events-none whitespace-nowrap shadow-lg">
                      PARETE NORD (SINISTRA)
                    </div>
                    <div className="absolute top-1/2 right-1 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-amber-400 bg-black/80 px-2 py-0.5 rounded-md border border-amber-500/30 -rotate-90 z-10 pointer-events-none whitespace-nowrap shadow-lg">
                      PARETE SUD (DESTRA)
                    </div>

                    {/* Distance Meter Badges along Central Axis */}
                    {meterTicks.map((meter) => {
                      const posY = getPercentY(meter);
                      return (
                        <div
                          key={`meter-badge-fs-${meter}`}
                          className="absolute left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold text-amber-200 bg-black/90 px-1.5 py-0.2 rounded border border-amber-500/30 pointer-events-none z-10"
                          style={{ top: `${posY}%` }}
                        >
                          {meter}m
                        </div>
                      );
                    })}

                    {/* Doors Plotted as Spacious Room Cards */}
                    {doorItems.map((item, idx) => {
                      const posY = getPercentY(item.positionX);
                      const isLeft = item.side === 'left';
                      const posX = isLeft ? 22 : 78;
                      const isHovered = hoveredDoorId === item.id;
                      const isInspected = inspectedDoorId === item.id;

                      return (
                        <div
                          key={item.id}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                          style={{ left: `${posX}%`, top: `${posY}%` }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectedDoorId(item.id);
                              onTeleportToX(item.positionX);
                              if (!isCategoryCorridor && item.pavilionRef) {
                                onSelectPavilion(item.pavilionRef);
                              }
                            }}
                            onMouseEnter={() => setHoveredDoorId(item.id)}
                            onMouseLeave={() => setHoveredDoorId(null)}
                            className={`group relative flex items-center justify-center transition-all transform ${
                              isInspected ? 'scale-110 z-30' : 'hover:scale-105'
                            }`}
                          >
                            <div
                              className={`px-2.5 py-1.5 rounded-xl font-black text-xs border-2 shadow-2xl flex items-center gap-1.5 transition-all ${
                                isInspected
                                  ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-black shadow-[0_0_25px_rgba(251,191,36,0.9)]'
                                  : 'hover:border-amber-400'
                              }`}
                              style={{
                                backgroundColor: item.color,
                                borderColor: isInspected ? '#facc15' : '#ffffff',
                                color: '#000000',
                              }}
                            >
                              <span className="text-sm">🚪</span>
                              <div className="flex flex-col text-left leading-tight">
                                <span className="font-mono text-[8px] font-black uppercase tracking-wider opacity-90">
                                  SEZIONE #{idx + 1}
                                </span>
                                <span className="font-black text-[10px] sm:text-[11px] truncate max-w-[80px] sm:max-w-[120px]">
                                  {item.name}
                                </span>
                              </div>
                            </div>

                            {/* Floating Tooltip Label */}
                            <div
                              className={`absolute ${
                                isLeft ? 'left-full ml-3' : 'right-full mr-3'
                              } top-1/2 -translate-y-1/2 bg-black/95 text-white border-2 border-amber-400/90 p-2.5 rounded-2xl text-left shadow-2xl transition-all whitespace-nowrap pointer-events-none z-40 ${
                                isHovered || isInspected ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                              }`}
                            >
                              <div className="font-black text-xs text-amber-300 flex items-center gap-1.5">
                                <span>🚪</span> #{idx + 1} {item.name}
                              </div>
                              <div className="text-[10px] text-cyan-200 font-semibold">{item.tagline}</div>
                              <div className="text-[9px] text-slate-300 font-mono mt-1 flex items-center gap-2">
                                <span>📍 X = {item.positionX}m</span>
                                <span>•</span>
                                <span className="text-amber-400 font-bold">{item.companiesCount} Stand</span>
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
                      <span>{isCategoryCorridor ? 'Porta Sottocategoria' : 'Padiglione'}</span>
                    </div>
                    <div className="text-amber-400 font-bold text-[10px]">
                      ▲ Avanti = Nord
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: INSPECTED ITEM & DIRECTORY */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                  {/* INSPECTED DOOR HIGHLIGHT PANEL */}
                  {inspectedDoor && (
                    <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-amber-950/40 border-2 border-amber-500/60 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 animate-fadeIn">
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shadow-xl border-2 border-white shrink-0"
                          style={{ backgroundColor: inspectedDoor.color }}
                        >
                          🚪
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/30 border border-amber-400 text-amber-200 font-black text-xs uppercase">
                              {inspectedDoor.id.toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-300 font-mono">
                              {inspectedDoor.side === 'left' ? 'Parete Nord (Sinistra)' : 'Parete Sud (Destra)'} • Posizione X = {inspectedDoor.positionX}m
                            </span>
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black text-white">{inspectedDoor.name}</h3>
                          <p className="text-cyan-300 text-xs sm:text-sm font-semibold">{inspectedDoor.tagline}</p>
                          <p className="text-slate-300 text-xs mt-1 max-w-2xl">{inspectedDoor.description}</p>
                        </div>
                      </div>

                      {/* Actions for Inspected Door */}
                      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 justify-end">
                        <button
                          onClick={() => {
                            onTeleportToX(inspectedDoor.positionX);
                            if (!isCategoryCorridor && inspectedDoor.pavilionRef) {
                              onSelectPavilion(inspectedDoor.pavilionRef);
                            }
                            setIsFullscreenMap(false);
                          }}
                          className="px-5 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 border border-yellow-300"
                        >
                          <Zap className="w-4 h-4 fill-current" />
                          <span>Teletrasportati Qui (3D)</span>
                        </button>

                        {onOpenExpoModal && inspectedDoor.pavilionRef && (
                          <button
                            onClick={() => {
                              if (inspectedDoor.pavilionRef) {
                                onSelectPavilion(inspectedDoor.pavilionRef);
                                onOpenExpoModal(inspectedDoor.pavilionRef);
                              }
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

                  {/* DIRECTORY GRID */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-amber-400" />
                        <span>
                          {isCategoryCorridor
                            ? `Sottocategorie di ${selectedPavilion.name} (${filteredDoors.length})`
                            : `Padiglioni Galleria Principale (${filteredDoors.length})`}
                        </span>
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">
                        Aziende Totali: {companies.length}
                      </span>
                    </div>

                    {filteredDoors.length === 0 ? (
                      <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 text-slate-400 text-sm">
                        Nessun elemento trovato con i filtri inseriti.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredDoors.map((item, index) => {
                          const isSelected = inspectedDoorId === item.id;

                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                setInspectedDoorId(item.id);
                              }}
                              className={`group relative bg-slate-900/90 border-2 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? 'border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)] bg-amber-950/20'
                                  : 'border-white/10 hover:border-amber-500/50 hover:bg-slate-800/80'
                              }`}
                            >
                              <div>
                                {/* Card Header */}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm border shadow-md shrink-0"
                                      style={{ backgroundColor: item.color, color: '#000000' }}
                                    >
                                      🚪
                                    </span>
                                    <div>
                                      <span className="text-[10px] font-black uppercase text-amber-400 font-mono">
                                        PORTA #{index + 1}
                                      </span>
                                      <div className="text-[10px] text-slate-400 font-mono">
                                        {item.side === 'left' ? 'Parete Nord' : 'Parete Sud'} • X={item.positionX}m
                                      </div>
                                    </div>
                                  </div>

                                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-bold">
                                    {item.companiesCount} Stand
                                  </span>
                                </div>

                                {/* Title & Tagline */}
                                <h4 className="text-base font-black text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                                  {item.name}
                                </h4>
                                <p className="text-cyan-300 text-xs font-semibold mt-0.5 line-clamp-1">{item.tagline}</p>
                                <p className="text-slate-300 text-xs mt-2 line-clamp-2 leading-relaxed">
                                  {item.description}
                                </p>
                              </div>

                              {/* Card Footer Action Buttons */}
                              <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onTeleportToX(item.positionX);
                                    if (!isCategoryCorridor && item.pavilionRef) {
                                      onSelectPavilion(item.pavilionRef);
                                    }
                                    setIsFullscreenMap(false);
                                  }}
                                  className="flex-1 py-2 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-extrabold text-[11px] rounded-xl border border-amber-500/40 transition-all flex items-center justify-center gap-1"
                                >
                                  <Zap className="w-3.5 h-3.5" />
                                  <span>Vai qui (3D)</span>
                                </button>

                                {onOpenExpoModal && item.pavilionRef && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (item.pavilionRef) {
                                        onSelectPavilion(item.pavilionRef);
                                        onOpenExpoModal(item.pavilionRef);
                                      }
                                      setIsFullscreenMap(false);
                                    }}
                                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] rounded-xl border border-white/20 transition-all flex items-center justify-center gap-1"
                                    title="Apri Stand"
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
