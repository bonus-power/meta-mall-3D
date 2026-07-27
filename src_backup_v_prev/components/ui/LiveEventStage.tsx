import React from 'react';
import { LiveEvent } from '../../types';
import { Tv, Play, Radio, Calendar } from 'lucide-react';

interface LiveEventStageProps {
  events: LiveEvent[];
}

export const LiveEventStage: React.FC<LiveEventStageProps> = ({ events }) => {
  const activeLive = events.find((e) => e.isLive) || events[0];

  const getYouTubeEmbedUrl = (idOrUrl: string) => {
    if (!idOrUrl) return null;
    if (idOrUrl.includes('youtube.com') || idOrUrl.includes('youtu.be')) {
      const match = idOrUrl.match(/(?:v=|\/)([\w-]{11})/);
      return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
    }
    return `https://www.youtube.com/embed/${idOrUrl}?autoplay=1`;
  };

  const embedUrl = getYouTubeEmbedUrl(activeLive.youtubeId);

  return (
    <div className="w-full h-full bg-[#050505] text-slate-100 p-6 overflow-y-auto pt-32 sm:pt-36 space-y-6">
      {/* Title Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-white/10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-amber-500 to-yellow-400 p-0.5 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
          <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
            <Tv className="w-6 h-6 text-red-500" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-light text-white tracking-[0.15em] uppercase">
              PALCO EVENTI <span className="font-bold text-yellow-500">LIVE META-TV</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-red-600 text-white animate-pulse flex items-center gap-1 uppercase">
              <Radio className="w-3 h-3" /> LIVE 3D
            </span>
          </div>
          <p className="text-xs text-white/40 uppercase tracking-widest">
            Concerti dal vivo, dirette TV, sfilate di moda e presentazioni prodotti in tempo reale
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Live Stream Screen Frame */}
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video w-full rounded-3xl overflow-hidden border-2 border-yellow-500/40 shadow-[0_0_40px_rgba(0,0,0,0.8)] bg-black relative">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={activeLive.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/40 space-y-2">
                <Play className="w-12 h-12 text-yellow-500" />
                <span className="text-xs uppercase tracking-wider">Seleziona un evento per trasmettere in streaming</span>
              </div>
            )}
          </div>

          <div className="p-6 bg-[#080808] border border-white/10 rounded-3xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                {activeLive.category}
              </span>
              <span className="text-xs text-red-400 font-bold flex items-center gap-1">
                <Radio className="w-3.5 h-3.5" /> {activeLive.time}
              </span>
            </div>
            <h3 className="text-xl font-light tracking-wide text-white uppercase">{activeLive.title}</h3>
            <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider">Artista / Presentatore: {activeLive.performer}</p>
            <p className="text-xs text-white/70 leading-relaxed pt-2 border-t border-white/10">
              {activeLive.description}
            </p>
          </div>
        </div>

        {/* Upcoming Live Events Schedule */}
        <div className="bg-[#080808] border border-white/10 p-6 rounded-3xl space-y-4">
          <h3 className="text-yellow-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-4 h-4 text-yellow-500" />
            <span>Programmazione Eventi Meta-TV</span>
          </h3>

          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className={`p-4 rounded-2xl border transition-all ${
                  ev.id === activeLive.id
                    ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-200 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                    : 'bg-black/60 border-white/10 hover:border-white/20 text-white/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest">{ev.category}</span>
                  {ev.isLive ? (
                    <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-red-600 text-white animate-pulse">
                      IN ONDA
                    </span>
                  ) : (
                    <span className="text-[10px] text-white/40">{ev.time}</span>
                  )}
                </div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-white">{ev.title}</h4>
                <p className="text-[11px] text-white/50 mt-1">{ev.performer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
