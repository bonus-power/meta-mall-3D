import React, { useState } from 'react';
import { VirtualTourScene } from '../../types';
import {
  MapPin,
  Compass,
  Maximize2,
  Minimize2,
  X,
  Layers,
  Eye,
  Footprints,
  DoorOpen,
  Route,
} from 'lucide-react';

interface VirtualTourMiniMapProps {
  scenes: VirtualTourScene[];
  activeSceneId: string;
  currentYaw: number; // angle in degrees for camera rotation
  floorPlanUrl?: string;
  onSelectScene: (sceneId: string) => void;
}

export const VirtualTourMiniMap: React.FC<VirtualTourMiniMapProps> = ({
  scenes,
  activeSceneId,
  currentYaw,
  floorPlanUrl,
  onSelectScene,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<'all' | 'room' | 'corridor'>('all');
  const [hoveredSceneId, setHoveredSceneId] = useState<string | null>(null);

  const activeScene = scenes.find((s) => s.id === activeSceneId) || scenes[0];

  // Count rooms and corridors
  const roomsCount = scenes.filter((s) => s.type !== 'corridor').length;
  const corridorsCount = scenes.filter((s) => s.type === 'corridor').length;

  // Helper to resolve coordinates for scenes (default fallback if missing)
  const getCoords = (scene: VirtualTourScene, index: number, total: number) => {
    if (scene.mapCoords) {
      return scene.mapCoords;
    }
    // Spread evenly across 2D map area if mapCoords not defined
    if (total === 1) return { x: 50, y: 50 };
    if (total === 2) return index === 0 ? { x: 30, y: 70 } : { x: 70, y: 30 };
    if (total === 3) {
      const presets = [{ x: 25, y: 75 }, { x: 50, y: 48 }, { x: 78, y: 25 }];
      return presets[index] || { x: 30 + index * 20, y: 30 + index * 20 };
    }
    const angle = (index / total) * 2 * Math.PI;
    return {
      x: Math.round(50 + 35 * Math.cos(angle)),
      y: Math.round(50 + 35 * Math.sin(angle)),
    };
  };

  const activeIndex = scenes.findIndex((s) => s.id === activeSceneId);
  const activeCoords = getCoords(activeScene, activeIndex, scenes.length);

  return (
    <div className="relative z-40">
      {/* Collapsed Pill Button for Mobile & Small Screens */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 bg-black/95 hover:bg-yellow-500 text-yellow-400 hover:text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl border border-yellow-500/60 shadow-[0_0_25px_rgba(0,0,0,0.9)] backdrop-blur-md transition-all transform hover:scale-105"
        >
          <Compass className="w-4 h-4 animate-spin text-yellow-400" style={{ animationDuration: '10s' }} />
          <span>🗺️ Planimetria & Corridoi</span>
          <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-300 rounded-full text-[10px] font-bold">
            {scenes.length}
          </span>
        </button>
      )}

      {/* Expanded Mini-Map Window */}
      {isExpanded && (
        <div className="w-72 sm:w-80 bg-zinc-950/95 border-2 border-yellow-500/60 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.95)] backdrop-blur-xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-black/90 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span className="text-[11px] font-extrabold text-white uppercase tracking-wider">
                Planimetria 2D, Stanze & Corridoi
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 text-white/70 hover:text-red-400 bg-white/5 hover:bg-red-500/20 rounded-lg transition-all"
                title="Chiudi / Nascondi Mappa 2D"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Bar: Stanze vs Corridoi */}
          <div className="px-2.5 py-1.5 bg-zinc-900/90 border-b border-white/10 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2 py-1 rounded-lg font-bold uppercase transition-all ${
                  filterType === 'all'
                    ? 'bg-yellow-500 text-black shadow-sm font-extrabold'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Tutti ({scenes.length})
              </button>
              <button
                onClick={() => setFilterType('room')}
                className={`px-2 py-1 rounded-lg font-bold uppercase transition-all flex items-center gap-1 ${
                  filterType === 'room'
                    ? 'bg-yellow-500 text-black shadow-sm font-extrabold'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <DoorOpen className="w-3 h-3" />
                <span>Stanze ({roomsCount})</span>
              </button>
              {corridorsCount > 0 && (
                <button
                  onClick={() => setFilterType('corridor')}
                  className={`px-2 py-1 rounded-lg font-bold uppercase transition-all flex items-center gap-1 ${
                    filterType === 'corridor'
                      ? 'bg-amber-400 text-black shadow-sm font-extrabold'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Footprints className="w-3 h-3 text-amber-400" />
                  <span>Corridoi ({corridorsCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Map Graphic Canvas Container */}
          <div className="relative w-full h-48 bg-zinc-900 overflow-hidden select-none">
            {/* Custom Background Image or Blueprint Architectural Grid */}
            {floorPlanUrl ? (
              <img
                src={floorPlanUrl}
                alt="Planimetria con Corridoi"
                className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:12px_12px] opacity-40">
                {/* Architectural Blueprint Corridor Lines */}
                <svg className="absolute inset-0 w-full h-full opacity-20 stroke-yellow-500/30" strokeWidth="1">
                  <line x1="10%" y1="20%" x2="90%" y2="20%" strokeDasharray="4" />
                  <line x1="10%" y1="80%" x2="90%" y2="80%" strokeDasharray="4" />
                  <line x1="20%" y1="10%" x2="20%" y2="90%" strokeDasharray="4" />
                  <line x1="80%" y1="10%" x2="80%" y2="90%" strokeDasharray="4" />
                </svg>
              </div>
            )}

            {/* Connecting Corridor & Passage Pathway Lines between scenes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-yellow-500/60" strokeWidth="2.5">
              {scenes.map((sc, i) => {
                if (i === scenes.length - 1) return null;
                const c1 = getCoords(sc, i, scenes.length);
                const nextScene = scenes[i + 1];
                const c2 = getCoords(nextScene, i + 1, scenes.length);
                const isCorridorLine = sc.type === 'corridor' || nextScene.type === 'corridor';

                return (
                  <g key={`line-${sc.id}-${nextScene.id}`}>
                    <line
                      x1={`${c1.x}%`}
                      y1={`${c1.y}%`}
                      x2={`${c2.x}%`}
                      y2={`${c2.y}%`}
                      stroke={isCorridorLine ? '#f59e0b' : '#facc15'}
                      strokeDasharray={isCorridorLine ? '3 3' : '5 5'}
                      className={isCorridorLine ? 'animate-pulse' : ''}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Field of View Cone SVG overlay centered at activeCoords */}
            <div
              className="absolute pointer-events-none transition-all duration-75"
              style={{
                left: `${activeCoords.x}%`,
                top: `${activeCoords.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <svg className="w-32 h-32 overflow-visible" viewBox="-50 -50 100 100">
                <g transform={`rotate(${currentYaw})`}>
                  {/* 60-degree Field of View Wedge pointing upwards */}
                  <path
                    d="M 0 0 L -35 -40 A 50 50 0 0 1 35 -40 Z"
                    fill="url(#fovGradient)"
                    className="opacity-75"
                  />
                  {/* Outer sight arc */}
                  <path
                    d="M -35 -40 A 50 50 0 0 1 35 -40"
                    fill="none"
                    stroke="#facc15"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                </g>
                <defs>
                  <radialGradient id="fovGradient" cx="0%" cy="0%" r="100%">
                    <stop offset="0%" stopColor="#facc15" stopOpacity="0.85" />
                    <stop offset="60%" stopColor="#eab308" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ca8a04" stopOpacity="0.0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>

            {/* Room & Corridor Nodes Plotted on 2D Floorplan */}
            {scenes.map((scene, idx) => {
              if (filterType === 'room' && scene.type === 'corridor') return null;
              if (filterType === 'corridor' && scene.type !== 'corridor') return null;

              const coords = getCoords(scene, idx, scenes.length);
              const isActive = scene.id === activeSceneId;
              const isHovered = scene.id === hoveredSceneId;
              const isCorridor = scene.type === 'corridor';

              return (
                <div
                  key={scene.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                >
                  <button
                    onClick={() => onSelectScene(scene.id)}
                    onMouseEnter={() => setHoveredSceneId(scene.id)}
                    onMouseLeave={() => setHoveredSceneId(null)}
                    className="group relative flex items-center justify-center transition-all"
                  >
                    {/* Glowing outer pulse for active room or corridor */}
                    {isActive && (
                      <span className={`absolute -inset-2 rounded-full animate-ping pointer-events-none ${
                        isCorridor ? 'bg-amber-400/60' : 'bg-yellow-400/50'
                      }`} />
                    )}

                    {/* Pin Circle / Badge */}
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[10px] border shadow-lg transition-all ${
                        isActive
                          ? isCorridor
                            ? 'bg-amber-400 text-black border-white shadow-[0_0_15px_rgba(251,191,36,1)] scale-110 ring-2 ring-amber-300'
                            : 'bg-yellow-400 text-black border-white shadow-[0_0_15px_rgba(250,204,21,1)] scale-110 ring-2 ring-yellow-300'
                          : isCorridor
                          ? 'bg-zinc-950 text-amber-400 border-amber-500/80 hover:bg-amber-400 hover:text-black hover:scale-110'
                          : 'bg-zinc-950 text-white border-yellow-500/60 hover:bg-yellow-500 hover:text-black hover:scale-110'
                      }`}
                    >
                      {isCorridor ? (
                        <Footprints className="w-3.5 h-3.5" />
                      ) : (
                        idx + 1
                      )}
                    </span>

                    {/* Name Label Tag */}
                    <span
                      className={`absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase whitespace-nowrap border shadow-xl transition-all pointer-events-none flex items-center gap-1 ${
                        isActive || isHovered
                          ? isCorridor
                            ? 'bg-black/95 text-amber-300 border-amber-500 opacity-100 scale-100'
                            : 'bg-black/95 text-yellow-300 border-yellow-500 opacity-100 scale-100'
                          : 'bg-black/80 text-white/70 border-white/10 opacity-80 scale-95'
                      }`}
                    >
                      {isCorridor && <Footprints className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
                      <span>{scene.name}</span>
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer Bar with Active Scene Name and Instructions */}
          <div className="px-3 py-2 bg-black/90 border-t border-white/10 text-[10px] text-white/70 flex items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-hidden">
              {activeScene.type === 'corridor' ? (
                <Footprints className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              )}
              <span className={`truncate font-bold uppercase ${
                activeScene.type === 'corridor' ? 'text-amber-300' : 'text-yellow-300'
              }`}>
                {activeScene.name}
              </span>
            </div>
            <span className="text-[9px] font-mono text-white/40 shrink-0">
              {Math.round(currentYaw)}° Yaw
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
