import React, { useState, useMemo } from 'react';
import { LiveEvent } from '../../types';
import {
  Tv,
  Play,
  Radio,
  Calendar,
  ExternalLink,
  Search,
  Filter,
  Layers,
  Sparkles,
  Share2,
  Check,
  Film,
  Info,
  Maximize2,
  Volume2,
} from 'lucide-react';

interface LiveEventStageProps {
  events: LiveEvent[];
}

export const LiveEventStage: React.FC<LiveEventStageProps> = ({ events }) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [viewMode, setViewMode] = useState<'stage' | 'grid'>('stage');

  const categories = useMemo(() => {
    const set = new Set<string>();
    events.forEach((ev) => {
      if (ev.category) set.add(ev.category);
    });
    return Array.from(set);
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchCategory = selectedCategory === 'all' || ev.category === selectedCategory;
      const matchSearch =
        searchQuery === '' ||
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.performer && ev.performer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (ev.description && ev.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [events, selectedCategory, searchQuery]);

  const activeLive =
    (selectedEventId ? events.find((e) => e.id === selectedEventId) : null) ||
    filteredEvents.find((e) => e.isLive) ||
    filteredEvents[0] ||
    events[0];

  const getCleanPlayerUrl = (rawUrl?: string): string | null => {
    if (!rawUrl) return null;
    let url = rawUrl.trim();
    // If it's an iframe embed snippet: <iframe src="..." ...>
    if (url.startsWith('<iframe') || url.includes('src=')) {
      const match = url.match(/src=["']([^"']+)["']/);
      if (match && match[1]) url = match[1];
    }
    // If it used the old gestione/player format, convert to jwplayer.php
    if (url.includes('/gestione/player')) {
      url = url.replace('/gestione/player', '/jwplayer.php');
    }
    return url;
  };

  const getEmbedUrl = (event?: LiveEvent) => {
    if (!event) return null;
    if (event.playerUrl) {
      return getCleanPlayerUrl(event.playerUrl);
    }
    if (event.youtubeId) {
      const idOrUrl = event.youtubeId;
      if (idOrUrl.includes('youtube.com') || idOrUrl.includes('youtu.be')) {
        const match = idOrUrl.match(/(?:v=|\/)([\w-]{11})/);
        return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
      }
      return `https://www.youtube.com/embed/${idOrUrl}?autoplay=1`;
    }
    return null;
  };

  const embedUrl = activeLive ? getEmbedUrl(activeLive) : null;

  const getEmbedIframeCode = (event?: LiveEvent) => {
    const url = getEmbedUrl(event);
    if (!url) return '';
    return `<iframe src="${url}" title="ItaliaOnline.tv Player" frameborder="0" scrolling="no"></iframe>`;
  };

  const handleCopyShare = () => {
    if (!activeLive) return;
    const url = getCleanPlayerUrl(activeLive.playerUrl) || (activeLive.youtubeId ? `https://youtube.com/watch?v=${activeLive.youtubeId}` : window.location.href);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyEmbed = () => {
    if (!activeLive) return;
    const code = getEmbedIframeCode(activeLive);
    navigator.clipboard.writeText(code);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2500);
  };

  return (
    <div className="w-full h-full bg-[#050505] text-slate-100 p-4 sm:p-6 overflow-y-auto pt-32 sm:pt-36 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-amber-500 to-yellow-400 p-0.5 shadow-[0_0_20px_rgba(212,175,55,0.3)] shrink-0">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
              <Tv className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-light text-white tracking-[0.15em] uppercase">
                PALCO EVENTI <span className="font-bold text-yellow-500">LIVE META-TV</span>
              </h2>
              {activeLive?.isLive && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-red-600 text-white animate-pulse flex items-center gap-1 uppercase">
                  <Radio className="w-3 h-3" /> LIVE 3D
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 uppercase">
                {events.length} Canali & Rubriche
              </span>
            </div>
            <p className="text-xs text-white/50 uppercase tracking-widest mt-0.5">
              Player Ufficiale Meta-TV • Notizie, Sport, Motori, Musica, Cinema e Spettacolo
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setViewMode('stage')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'stage'
                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Palco Live</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tutti i Canali ({events.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-[#0a0a0a] p-3 rounded-2xl border border-white/10">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca rubrica, canale o genere (es. Amici Animali, Sport, Musica, Meteo)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-yellow-500/60"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                : 'bg-white/5 hover:bg-white/10 text-white/60 border border-white/5'
            }`}
          >
            Tutte ({events.length})
          </button>
          {categories.map((cat) => {
            const count = events.filter((e) => e.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                    : 'bg-white/5 hover:bg-white/10 text-white/60 border border-white/5'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {viewMode === 'stage' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Live Stream Screen Frame */}
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-video w-full rounded-3xl overflow-hidden border-2 border-yellow-500/40 shadow-[0_0_40px_rgba(0,0,0,0.8)] bg-black relative">
              {embedUrl ? (
                <iframe
                  key={embedUrl}
                  src={embedUrl}
                  title="ItaliaOnline.tv Player"
                  frameBorder={0}
                  scrolling="no"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/40 space-y-2">
                  <Play className="w-12 h-12 text-yellow-500" />
                  <span className="text-xs uppercase tracking-wider">Nessuna rubrica selezionata</span>
                </div>
              )}
            </div>

            {activeLive && (
              <div className="p-6 bg-[#080808] border border-white/10 rounded-3xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                      {activeLive.category}
                    </span>
                    {activeLive.isLive ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-600 text-white animate-pulse flex items-center gap-1">
                        <Radio className="w-3 h-3" /> In Onda
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {activeLive.status === 'suspended' ? 'Sospesa' : 'Attiva'}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {embedUrl && (
                      <a
                        href={embedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-yellow-500 hover:bg-yellow-400 text-black flex items-center gap-1.5 shadow-lg shadow-yellow-500/20 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Apri Player Ufficiale</span>
                      </a>
                    )}
                    <button
                      onClick={handleCopyEmbed}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Copia codice HTML embed <iframe>"
                    >
                      {copiedEmbed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5 text-yellow-400" />}
                      <span>{copiedEmbed ? 'Embed Copiato!' : 'Copia Embed'}</span>
                    </button>
                    <button
                      onClick={handleCopyShare}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 transition-all cursor-pointer"
                      title="Copia link diretto player"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-light tracking-wide text-white uppercase">{activeLive.title}</h3>
                  <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider mt-1">
                    {activeLive.performer || 'Canale Ufficiale Meta-TV'} • <span className="text-white/40">{activeLive.time}</span>
                  </p>
                </div>

                <p className="text-xs text-white/70 leading-relaxed pt-3 border-t border-white/10">
                  {activeLive.description}
                </p>
              </div>
            )}
          </div>

          {/* Channels & Schedule List */}
          <div className="bg-[#080808] border border-white/10 p-5 rounded-3xl space-y-4 flex flex-col max-h-[750px]">
            <div className="flex items-center justify-between">
              <h3 className="text-yellow-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-500" />
                <span>Rubriche & Canali Meta-TV</span>
              </h3>
              <span className="text-[10px] text-white/40 font-mono">
                {filteredEvents.length} di {events.length}
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 scrollbar-thin">
              {filteredEvents.map((ev) => {
                const isSelected = activeLive && ev.id === activeLive.id;
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEventId(ev.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 group ${
                      isSelected
                        ? 'bg-yellow-500/15 border-yellow-500/60 text-yellow-200 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                        : 'bg-black/60 border-white/10 hover:border-white/30 text-white/80'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-14 rounded-xl overflow-hidden bg-black/80 shrink-0 border border-white/10 relative group-hover:border-yellow-500/50 transition-colors">
                      {ev.thumbnailUrl ? (
                        <img
                          src={ev.thumbnailUrl}
                          alt={ev.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-black">
                          <Film className="w-5 h-5 text-yellow-500/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-wider truncate">
                          {ev.category}
                        </span>
                        {ev.isLive && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-red-600 text-white animate-pulse">
                            ON AIR
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs uppercase tracking-wide text-white truncate group-hover:text-yellow-300 transition-colors">
                        {ev.title}
                      </h4>
                      <p className="text-[10px] text-white/50 truncate mt-0.5">
                        {ev.performer || ev.description}
                      </p>
                    </div>
                  </div>
                );
              })}

              {filteredEvents.length === 0 && (
                <div className="text-center py-10 text-white/40 text-xs">
                  Nessuna rubrica trovata con questi filtri.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Grid View Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredEvents.map((ev) => {
            const isSelected = activeLive && ev.id === activeLive.id;
            return (
              <div
                key={ev.id}
                className={`p-4 rounded-3xl border transition-all flex flex-col justify-between group bg-[#080808] ${
                  isSelected
                    ? 'border-yellow-500 shadow-[0_0_25px_rgba(212,175,55,0.2)]'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <div>
                  {/* Thumbnail / Header */}
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black relative border border-white/10 mb-3">
                    {ev.thumbnailUrl ? (
                      <img
                        src={ev.thumbnailUrl}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-black">
                        <Tv className="w-8 h-8 text-yellow-500/40" />
                      </div>
                    )}
                    {ev.isLive && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase bg-red-600 text-white animate-pulse">
                          LIVE
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 rounded-md text-[8px] font-bold uppercase bg-black/70 text-yellow-400 border border-yellow-500/30">
                        {ev.category}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-yellow-400 transition-colors">
                    {ev.title}
                  </h4>
                  <p className="text-xs text-yellow-500/80 font-medium mt-0.5">{ev.performer}</p>
                  <p className="text-[11px] text-white/60 line-clamp-2 mt-2 leading-relaxed">
                    {ev.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedEventId(ev.id);
                      setViewMode('stage');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-yellow-500/20 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Guarda nel Palco</span>
                  </button>

                  {ev.playerUrl && (
                    <a
                      href={ev.playerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 border border-white/10 transition-all"
                      title="Apri nel player esterno"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
