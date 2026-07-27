import React from 'react';
import { Badge, UserStats } from '../../types';
import { Award, Zap, Compass, Globe, Bot, Crown, X, CheckCircle2 } from 'lucide-react';

interface GamificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  badges: Badge[];
}

export const GamificationModal: React.FC<GamificationModalProps> = ({
  isOpen,
  onClose,
  stats,
  badges,
}) => {
  if (!isOpen) return null;

  const getBadgeIcon = (name: string) => {
    switch (name) {
      case 'Compass':
        return <Compass className="w-5 h-5 text-yellow-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'Globe':
        return <Globe className="w-5 h-5 text-yellow-400" />;
      case 'Bot':
        return <Bot className="w-5 h-5 text-yellow-400" />;
      default:
        return <Crown className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-[#080808] border border-yellow-500/30 p-6 rounded-3xl max-w-lg w-full shadow-[0_0_40px_rgba(0,0,0,0.9)] space-y-6 text-slate-100 relative animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center font-bold text-sm transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Level Banner */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-yellow-600 to-yellow-200 p-0.5 mx-auto shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            <div className="w-full h-full bg-black rounded-[22px] flex items-center justify-center">
              <Award className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <h2 className="text-xl font-light tracking-wide text-white uppercase">Profilo Esploratore <span className="font-bold text-yellow-500">VIP</span></h2>
          <p className="text-xs text-white/40">Guadagna punti XP e sblocca vantaggi esclusivi nei padiglioni</p>
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-4 bg-black/60 rounded-2xl border border-white/10">
            <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold block">Livello Esploratore</span>
            <span className="text-2xl font-black text-yellow-400">Livello {stats.level}</span>
          </div>

          <div className="p-4 bg-black/60 rounded-2xl border border-white/10">
            <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold block">Punti Power Cash</span>
            <span className="text-2xl font-black text-yellow-400">{stats.coins} PTS</span>
          </div>
        </div>

        {/* Badges List */}
        <div>
          <h3 className="text-yellow-500 font-bold text-xs uppercase tracking-widest mb-3">Distintivi & Traguardi</h3>
          <div className="space-y-2.5 max-h-56 overflow-y-auto">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                  b.unlocked
                    ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-200'
                    : 'bg-black/40 border-white/10 text-white/40 opacity-60'
                }`}
              >
                <div className="p-2 bg-black rounded-xl border border-white/10">{getBadgeIcon(b.icon)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-white">{b.title}</h4>
                    {b.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />}
                  </div>
                  <p className="text-[11px] text-white/50 truncate">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
