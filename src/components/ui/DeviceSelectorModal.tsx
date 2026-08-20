import React, { useState } from 'react';
import { Smartphone, Monitor, Zap, Sparkles, Check, ArrowRight } from 'lucide-react';

interface DeviceSelectorModalProps {
  isOpen: boolean;
  onSelectMode: (mode: 'mobile-lite' | 'desktop-full') => void;
}

export const DeviceSelectorModal: React.FC<DeviceSelectorModalProps> = ({
  isOpen,
  onSelectMode,
}) => {
  const [rememberChoice, setRememberChoice] = useState(true);

  if (!isOpen) return null;

  const handleSelect = (mode: 'mobile-lite' | 'desktop-full') => {
    if (rememberChoice && typeof window !== 'undefined') {
      try {
        localStorage.setItem('meta_tv_preferred_mode', mode);
      } catch (e) {
        console.error('Error saving device preference', e);
      }
    }
    onSelectMode(mode);
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="max-w-md w-full bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-white text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-300 text-xs font-black tracking-wider uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Meta-TV 3D Mall Experience</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide mb-2">
          Come desideri navigare?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
          Seleziona il tuo dispositivo per ottimizzare la fluidità 3D e i tempi di caricamento.
        </p>

        {/* 2 Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          
          {/* Mobile Lite Option */}
          <button
            onClick={() => handleSelect('mobile-lite')}
            className="group relative p-4 bg-slate-900/90 hover:bg-amber-950/40 border-2 border-amber-500/40 hover:border-amber-400 rounded-2xl flex flex-col items-center text-center transition-all duration-200 hover:scale-[1.02] shadow-lg"
          >
            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-green-500/20 border border-green-500/40 text-green-400 text-[9px] font-black rounded-full uppercase flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" />
              Ultra-Fast
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mb-3 group-hover:bg-amber-400 group-hover:text-black transition-all">
              <Smartphone className="w-6 h-6" />
            </div>
            <span className="text-sm font-black text-white group-hover:text-amber-300 mb-1">
              📱 Smartphone
            </span>
            <span className="text-[11px] text-slate-400 line-clamp-2">
              Modalità ultra-leggera, massima fluidità 60 FPS e comandi touch
            </span>
          </button>

          {/* Desktop Full Option */}
          <button
            onClick={() => handleSelect('desktop-full')}
            className="group p-4 bg-slate-900/90 hover:bg-slate-800 border-2 border-slate-700 hover:border-slate-500 rounded-2xl flex flex-col items-center text-center transition-all duration-200 hover:scale-[1.02] shadow-lg"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center mb-3 group-hover:bg-slate-700 group-hover:text-white transition-all">
              <Monitor className="w-6 h-6" />
            </div>
            <span className="text-sm font-black text-white group-hover:text-amber-300 mb-1">
              💻 PC & Desktop
            </span>
            <span className="text-[11px] text-slate-400 line-clamp-2">
              Massima grafica ad alta risoluzione, visuale profonda e dettagli HD
            </span>
          </button>

        </div>

        {/* Remember choice checkbox */}
        <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-300 transition-colors mb-2">
          <input
            type="checkbox"
            checked={rememberChoice}
            onChange={(e) => setRememberChoice(e.target.checked)}
            className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
          />
          <span>Ricorda la mia scelta per i prossimi accessi</span>
        </label>

      </div>
    </div>
  );
};
