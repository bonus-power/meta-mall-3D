import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Company, Pavilion } from '../../types';
import {
  Search,
  RotateCcw,
  Building2,
  MapPin,
  ExternalLink,
  Sparkles,
  Layers,
  Home,
  Globe2,
  Navigation,
  Compass,
  Plus,
  Minus,
} from 'lucide-react';

interface GlobeMap3DProps {
  companies: Company[];
  pavilions: Pavilion[];
  onSelectCompany: (company: Company) => void;
}

type MapLayerType = 'osm' | 'topo' | 'satellite';

export const GlobeMap3D: React.FC<GlobeMap3DProps> = ({
  companies,
  pavilions,
  onSelectCompany,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCompanyPin, setSelectedCompanyPin] = useState<Company | null>(null);
  const [mapLayer, setMapLayer] = useState<MapLayerType>('osm');

  // Center on Meta-TV HQ / Central Italy coordinates: 42.46233258533609, 13.2293907509642
  const INITIAL_CENTER: [number, number] = [42.46233258533609, 13.2293907509642];
  const INITIAL_ZOOM = 6; // 1,000 km altitude overview look

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM,
        zoomControl: false, // Disable default tiny zoom control, we render custom controls
        attributionControl: false,
      });

      mapInstanceRef.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;

    // Remove old tile layer
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    // Set tile layer
    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let subdomains = 'abc';

    if (mapLayer === 'topo') {
      tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    } else if (mapLayer === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      subdomains = '';
    }

    const newTileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: subdomains ? subdomains.split('') : [],
    });

    newTileLayer.addTo(map);
    tileLayerRef.current = newTileLayer;

    return () => {
      // Cleanup handled when switching view
    };
  }, [mapLayer]);

  // 2. Filter companies and render 2D orange dot markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    const filtered = companies.filter((comp) => {
      const matchesSearch =
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || comp.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    filtered.forEach((comp) => {
      if (!comp.lat || !comp.lng) return;

      const pavilion = pavilions.find((p) => p.id === comp.categoryId);
      const dotColor = pavilion ? pavilion.color : '#f59e0b';

      // Custom 2D Orange Dot Marker with pulsing halo effect
      const customIcon = L.divIcon({
        className: 'custom-company-marker',
        html: `
          <div class="relative flex items-center justify-center w-7 h-7 cursor-pointer group">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style="background-color: ${dotColor};"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 border-2 border-white shadow-md transform group-hover:scale-125 transition-transform" style="background-color: ${dotColor};"></span>
            <div class="absolute -top-7 whitespace-nowrap hidden group-hover:block bg-slate-900/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/40 shadow-lg">
              ${comp.name}
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([comp.lat, comp.lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedCompanyPin(comp);
        mapInstanceRef.current?.flyTo([comp.lat, comp.lng], 9, {
          duration: 1.2,
        });
      });

      markersGroupRef.current?.addLayer(marker);
    });
  }, [companies, pavilions, searchQuery, selectedCategory]);

  // Reset Map View to initial coordinates and zoom
  const handleResetView = () => {
    setSelectedCompanyPin(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(INITIAL_CENTER, INITIAL_ZOOM, {
        duration: 1.0,
      });
    }
  };

  // Zoom In (+20%)
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn(0.6);
    }
  };

  // Zoom Out (-20%)
  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut(0.6);
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      {/* Interactive Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Header Overlay Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pointer-events-none">
        {/* Search Bar & Category Badges */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-800/80 shadow-2xl pointer-events-auto max-w-2xl flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
            <input
              type="text"
              placeholder="Cerca azienda, città, indirizzo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 text-xs text-slate-100 placeholder-slate-400 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-black shadow-md font-bold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
              }`}
            >
              Tutti
            </button>
            {pavilions.map((pav) => (
              <button
                key={pav.id}
                onClick={() => setSelectedCategory(pav.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === pav.id
                    ? 'bg-amber-500 text-black shadow-md font-bold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: pav.color }}
                />
                {pav.name}
              </button>
            ))}
          </div>
        </div>

        {/* Top-Right: Map Layer Selector & Home / Reset View Button */}
        <div className="flex items-center gap-2 pointer-events-auto justify-end">
          {/* Map Layer Selector (Stradale, Topo, Satellite) */}
          <div className="bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800/80 shadow-2xl flex items-center gap-1">
            <button
              onClick={() => setMapLayer('osm')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                mapLayer === 'osm'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Mappa Stradale"
            >
              <Compass className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Stradale</span>
            </button>
            <button
              onClick={() => setMapLayer('topo')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                mapLayer === 'topo'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Mappa Topografica"
            >
              <Navigation className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Topo</span>
            </button>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                mapLayer === 'satellite'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Vista Satellite"
            >
              <Globe2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Satellite</span>
            </button>
          </div>

          {/* Reset View Button */}
          <button
            onClick={handleResetView}
            className="p-3 bg-slate-900/90 hover:bg-amber-500 hover:text-black text-amber-400 backdrop-blur-md rounded-2xl border border-amber-500/30 shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider group shrink-0"
            title="Torna alla Mappa Iniziale (Italia 1000km)"
          >
            <Home className="w-5 h-5 text-amber-400 group-hover:text-black transition-colors" />
            <span className="hidden sm:inline">Ripristina</span>
          </button>
        </div>
      </div>

      {/* Floating Left Side Custom Zoom Controls (+ / - 20%) */}
      <div className="absolute top-24 sm:top-20 left-4 z-20 flex flex-col gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800/80 shadow-2xl">
        <button
          onClick={handleZoomIn}
          className="p-2.5 bg-slate-950 hover:bg-amber-500 hover:text-black text-amber-400 rounded-xl border border-slate-800 transition-all active:scale-95 shadow-md flex items-center justify-center cursor-pointer"
          title="Zoom Avanti (+20%)"
        >
          <Plus className="w-4 h-4 font-bold" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2.5 bg-slate-950 hover:bg-amber-500 hover:text-black text-amber-400 rounded-xl border border-slate-800 transition-all active:scale-95 shadow-md flex items-center justify-center cursor-pointer"
          title="Zoom Indietro (-20%)"
        >
          <Minus className="w-4 h-4 font-bold" />
        </button>
      </div>

      {/* Selected Company Preview Modal Card */}
      {selectedCompanyPin && (
        <div className="absolute bottom-6 left-6 z-30 w-full max-w-sm bg-slate-900/95 backdrop-blur-md border border-amber-500/40 rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header Image */}
          <div className="relative h-32 rounded-2xl overflow-hidden mb-3 border border-slate-800">
            <img
              src={
                selectedCompanyPin.headerImage ||
                selectedCompanyPin.logo ||
                'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80'
              }
              alt={selectedCompanyPin.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <span className="absolute top-2 left-2 px-2.5 py-1 bg-amber-500 text-black font-extrabold text-[10px] uppercase rounded-lg shadow-md">
              {pavilions.find((p) => p.id === selectedCompanyPin.categoryId)
                ?.name || 'Azienda Partner'}
            </span>
            <button
              onClick={handleResetView}
              className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white rounded-full flex items-center justify-center font-bold text-xs backdrop-blur-sm transition-all"
              title="Chiudi e Torna alla Mappa"
            >
              ✕
            </button>
          </div>

          {/* Company Details */}
          <h3 className="text-base font-black text-amber-400 leading-tight">
            {selectedCompanyPin.name}
          </h3>
          <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            {selectedCompanyPin.address}, {selectedCompanyPin.city}
          </p>
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {selectedCompanyPin.description}
          </p>

          {/* Action Buttons */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
            <button
              onClick={() => {
                const comp = selectedCompanyPin;
                handleResetView();
                onSelectCompany(comp);
              }}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-black" />
              Entra nello Stand 3D
            </button>

            {selectedCompanyPin.website && (
              <a
                href={selectedCompanyPin.website}
                target="_blank"
                rel="noreferrer"
                onClick={() => handleResetView()}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 text-amber-400 border border-amber-500/40 rounded-xl transition-all hover:scale-105 flex items-center justify-center"
                title="Sito Web Esterno (Apri in una nuova scheda)"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
