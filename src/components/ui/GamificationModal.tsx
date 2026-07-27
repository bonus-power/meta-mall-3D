import React, { useState } from 'react';
import { Badge, UserStats, Company, RedeemedCoupon, ActivityLogItem } from '../../types';
import {
  Award,
  Zap,
  Compass,
  Globe,
  Bot,
  Crown,
  X,
  CheckCircle2,
  Heart,
  Tag,
  History,
  Gift,
  Ticket,
  ExternalLink,
  Copy,
  Plus,
  Trash2,
  Star,
  Building2,
  Sparkles,
} from 'lucide-react';

interface GamificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  badges: Badge[];
  companies?: Company[];
  onUpdateStats?: (updatedStats: UserStats) => void;
  onSelectCompany?: (company: Company) => void;
  onToggleFavoriteCompany?: (companyId: string) => void;
}

const AVAILABLE_COUPONS = [
  {
    id: 'cat-coupon-1',
    title: 'Sconto 20% E-Commerce Tech & Visori',
    discount: '20% OFF',
    pointsCost: 300,
    category: 'Tech & Gaming',
    description: 'Valido su visori VR, smartphone e accessori domotici.',
  },
  {
    id: 'cat-coupon-2',
    title: 'Buono Food Court 10€ MetaTV Mall',
    discount: '10€ GRATIS',
    pointsCost: 500,
    category: 'Food & Ristorazione',
    description: 'Utilizzabile nei bar e ristoranti convenzionati della Food Court.',
  },
  {
    id: 'cat-coupon-3',
    title: 'Pass VIP Backstage Live Concerts 3D',
    discount: 'PASS VIP',
    pointsCost: 800,
    category: 'Live Events',
    description: 'Accesso esclusivo ai palchi e posti riservati durante i concerti live.',
  },
  {
    id: 'cat-coupon-4',
    title: 'Sconto 50% Collezione Fashion & Sartoria',
    discount: '50% OFF',
    pointsCost: 400,
    category: 'Moda & Lusso',
    description: 'Risparmia il 50% sui capi sartoriali e calzature artigianali.',
  },
  {
    id: 'cat-coupon-5',
    title: 'Consulenza B2B Pro 1 Ora Omaggio',
    discount: 'FREE 1h',
    pointsCost: 1000,
    category: 'Servizi B2B',
    description: '1 ora di consulenza legale o marketing con partner verificati.',
  },
];

export const GamificationModal: React.FC<GamificationModalProps> = ({
  isOpen,
  onClose,
  stats,
  badges,
  companies = [],
  onUpdateStats,
  onSelectCompany,
  onToggleFavoriteCompany,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'catalog' | 'coupons' | 'history' | 'badges'>('profile');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  const favoriteIds = stats.favoriteCompanyIds || [];
  const favoriteCompanies = companies.filter((c) => favoriteIds.includes(c.id));
  const redeemedCoupons = stats.redeemedCoupons || [];
  const activityHistory = stats.activityHistory || [];

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

  // Claim daily bonus points
  const handleClaimDailyBonus = () => {
    if (!onUpdateStats) return;
    const bonusAmount = 100;
    const newLogItem: ActivityLogItem = {
      id: `act-${Date.now()}`,
      type: 'earn',
      title: 'Bonus Login Giornaliero Riscatto',
      pointsChange: bonusAmount,
      timestamp: new Date().toLocaleDateString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    };

    onUpdateStats({
      ...stats,
      coins: stats.coins + bonusAmount,
      xp: stats.xp + 50,
      activityHistory: [newLogItem, ...activityHistory],
    });

    setClaimSuccess(`+${bonusAmount} Punti Bonus-Power riscattati con successo!`);
    setTimeout(() => setClaimSuccess(null), 3000);
  };

  // Redeem a coupon using Bonus-Power points
  const handleRedeemCoupon = (couponItem: typeof AVAILABLE_COUPONS[0]) => {
    if (!onUpdateStats) return;
    if (stats.coins < couponItem.pointsCost) {
      alert(`Punti insufficienti! Servono ${couponItem.pointsCost} PTS Bonus-Power, ne possiedi ${stats.coins}.`);
      return;
    }

    const uniqueCode = `BONUS-POWER-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRedeemed: RedeemedCoupon = {
      id: `red-${Date.now()}`,
      title: couponItem.title,
      code: uniqueCode,
      pointsCost: couponItem.pointsCost,
      redeemedAt: new Date().toLocaleDateString('it-IT'),
      discount: couponItem.discount,
      category: couponItem.category,
    };

    const newLogItem: ActivityLogItem = {
      id: `act-${Date.now()}`,
      type: 'redeem',
      title: `Riscatto Coupon: ${couponItem.title}`,
      pointsChange: -couponItem.pointsCost,
      timestamp: new Date().toLocaleDateString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    };

    onUpdateStats({
      ...stats,
      coins: stats.coins - couponItem.pointsCost,
      redeemedCoupons: [newRedeemed, ...redeemedCoupons],
      activityHistory: [newLogItem, ...activityHistory],
    });

    setClaimSuccess(`Coupon "${couponItem.title}" riscattato! Codice: ${uniqueCode}`);
    setTimeout(() => setClaimSuccess(null), 4000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#080808] border border-yellow-500/40 p-5 sm:p-7 rounded-3xl max-w-3xl w-full my-6 shadow-[0_0_50px_rgba(245,158,11,0.2)] text-slate-100 relative animate-in zoom-in-95 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center font-bold text-sm transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Level & VIP Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-yellow-600 via-amber-400 to-yellow-200 p-0.5 shadow-[0_0_25px_rgba(212,175,55,0.3)] shrink-0">
              <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                <Award className="w-7 h-7 text-yellow-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-light tracking-wide text-white uppercase">
                  Area Cliente <span className="font-bold text-yellow-500">Bonus-Power VIP</span>
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 uppercase">
                  Livello {stats.level}
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Gestisci saldo punti, coupon riscattati, aziende preferite e storico transazioni.
              </p>
            </div>
          </div>

          <div className="bg-black/80 px-4 py-2.5 rounded-2xl border border-amber-500/40 text-center shrink-0 shadow-inner">
            <span className="text-[10px] text-amber-300/70 uppercase tracking-widest font-extrabold block">
              Saldo Punti Bonus-Power
            </span>
            <span className="text-2xl font-black text-yellow-400 flex items-center justify-center gap-1.5">
              <Zap className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              {stats.coins} <span className="text-xs text-yellow-500 font-semibold">PTS</span>
            </span>
          </div>
        </div>

        {/* Global Success Notification */}
        {claimSuccess && (
          <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-2xl text-yellow-300 text-xs font-bold flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              {claimSuccess}
            </span>
            <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
          </div>
        )}

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-white/10">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-yellow-500 text-black shadow-md font-extrabold'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Saldo & Profilo</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'favorites'
                ? 'bg-yellow-500 text-black shadow-md font-extrabold'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-red-400 fill-current" />
            <span>Preferiti ({favoriteIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'bg-yellow-500 text-black shadow-md font-extrabold'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Catalogo Coupon</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'coupons'
                ? 'bg-yellow-500 text-black shadow-md font-extrabold'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-amber-300" />
            <span>I Miei Coupon ({redeemedCoupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-yellow-500 text-black shadow-md font-extrabold'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Storico Attività</span>
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'badges'
                ? 'bg-yellow-500 text-black shadow-md font-extrabold'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Badges</span>
          </button>
        </div>

        {/* TAB 1: PROFILE & SALDO */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-4 bg-black/60 rounded-2xl border border-white/10">
                <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold block mb-1">Livello Esploratore</span>
                <span className="text-2xl font-black text-yellow-400">Livello {stats.level}</span>
                <span className="text-[10px] text-slate-400 block mt-1">{stats.xp} / 1000 XP per Livello {stats.level + 1}</span>
              </div>

              <div className="p-4 bg-black/60 rounded-2xl border border-white/10">
                <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold block mb-1">Saldo Bonus-Power</span>
                <span className="text-2xl font-black text-yellow-400">{stats.coins} PTS</span>
                <span className="text-[10px] text-slate-400 block mt-1">Utilizzabili per coupon & sconti</span>
              </div>

              <div className="p-4 bg-black/60 rounded-2xl border border-white/10">
                <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold block mb-1">Padiglioni Esplorati</span>
                <span className="text-2xl font-black text-yellow-400">{stats.visitedPavilions.length} / 10</span>
                <span className="text-[10px] text-slate-400 block mt-1">Avanzamento fiera 3D</span>
              </div>
            </div>

            {/* Daily Reward Card */}
            <div className="bg-gradient-to-r from-amber-950/60 via-zinc-900 to-black p-5 rounded-2xl border border-yellow-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-500/20 rounded-2xl border border-yellow-500/40 text-yellow-400">
                  <Zap className="w-6 h-6 fill-yellow-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">Riscatta Bonus Giornaliero</h3>
                  <p className="text-xs text-slate-300">Ottieni +100 Punti Bonus-Power ogni giorno visitando la fiera virtuale.</p>
                </div>
              </div>
              <button
                onClick={handleClaimDailyBonus}
                className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all shrink-0 hover:scale-105 active:scale-95"
              >
                ⚡ Riscatta +100 PTS
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: AZIENDE PREFERITE */}
        {activeTab === 'favorites' && (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                Aziende Salvate nei Preferiti ({favoriteCompanies.length})
              </h3>
            </div>

            {favoriteCompanies.length === 0 ? (
              <div className="text-center py-10 bg-black/40 rounded-2xl border border-white/10 space-y-3">
                <Heart className="w-10 h-10 text-white/20 mx-auto" />
                <p className="text-xs text-white/60">Non hai ancora salvato nessuna azienda nei preferiti.</p>
                <p className="text-[11px] text-slate-400">
                  Esplora i padiglioni 3D e clicca sull'icona del cuore ❤️ nella scheda di qualsiasi azienda per salvarla qui!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {favoriteCompanies.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 bg-zinc-950 rounded-2xl border border-white/10 hover:border-yellow-500/50 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={c.logo}
                        alt={c.name}
                        className="w-12 h-12 rounded-xl object-cover border border-yellow-500/40 bg-black shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-white truncate">{c.name}</h4>
                        <p className="text-[10px] text-amber-400 uppercase font-semibold">{c.subCategory}</p>
                        <p className="text-[10px] text-slate-400 truncate">{c.city}, {c.country}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {onSelectCompany && (
                        <button
                          onClick={() => {
                            onSelectCompany(c);
                            onClose();
                          }}
                          className="p-2 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 rounded-xl text-xs font-bold transition-all border border-yellow-500/30"
                          title="Apri Mini-Sito 3D"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onToggleFavoriteCompany && (
                        <button
                          onClick={() => onToggleFavoriteCompany(c.id)}
                          className="p-2 bg-red-950/80 hover:bg-red-900 text-red-300 rounded-xl text-xs font-bold transition-all border border-red-500/40"
                          title="Rimuovi dai Preferiti"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CATALOGO COUPON */}
        {activeTab === 'catalog' && (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            <p className="text-xs text-slate-300">
              Riscatta i tuoi punti Bonus-Power accumulati per ottenere codici sconto e pass esclusivi.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {AVAILABLE_COUPONS.map((cp) => {
                const canAfford = stats.coins >= cp.pointsCost;
                return (
                  <div
                    key={cp.id}
                    className="p-4 bg-gradient-to-br from-zinc-950 to-black rounded-2xl border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          {cp.category}
                        </span>
                        <h4 className="text-xs font-bold text-white mt-1.5">{cp.title}</h4>
                      </div>
                      <span className="px-2.5 py-1 bg-yellow-500 text-black font-black text-xs rounded-xl shadow-md shrink-0">
                        {cp.discount}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">{cp.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-xs font-extrabold text-yellow-400 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-yellow-400" />
                        {cp.pointsCost} PTS
                      </span>

                      <button
                        onClick={() => handleRedeemCoupon(cp)}
                        disabled={!canAfford}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1 ${
                          canAfford
                            ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-md cursor-pointer'
                            : 'bg-white/10 text-white/30 cursor-not-allowed'
                        }`}
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>{canAfford ? 'Riscatta' : 'Punti Insufficienti'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: I MIEI COUPON ATTIVI */}
        {activeTab === 'coupons' && (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-amber-400" />
              I Miei Coupon Riscattati ({redeemedCoupons.length})
            </h3>

            {redeemedCoupons.length === 0 ? (
              <div className="text-center py-10 bg-black/40 rounded-2xl border border-white/10 space-y-2">
                <Ticket className="w-10 h-10 text-white/20 mx-auto" />
                <p className="text-xs text-white/60">Non hai ancora riscattato nessun coupon.</p>
                <p className="text-[11px] text-slate-400">
                  Sfoglia il <button onClick={() => setActiveTab('catalog')} className="text-yellow-400 underline font-bold">Catalogo Coupon</button> per convertire i tuoi punti!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {redeemedCoupons.map((rc) => (
                  <div
                    key={rc.id}
                    className="p-4 bg-zinc-950 rounded-2xl border border-yellow-500/30 flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-yellow-500/20 text-yellow-400 uppercase">
                          {rc.discount}
                        </span>
                        <h4 className="text-xs font-bold text-white">{rc.title}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Riscattato il: {rc.redeemedAt} • Costo: {rc.pointsCost} PTS</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <div className="px-3 py-1.5 bg-black rounded-xl border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold tracking-wider">
                        {rc.code}
                      </div>

                      <button
                        onClick={() => handleCopyCode(rc.code)}
                        className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedCode === rc.code ? 'Copiato!' : 'Copia'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: STORICO ATTIVITÀ */}
        {activeTab === 'history' && (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
              <History className="w-4 h-4 text-yellow-400" />
              Cronologia Transazioni & Punti ({activityHistory.length})
            </h3>

            {activityHistory.length === 0 ? (
              <div className="text-center py-10 bg-black/40 rounded-2xl border border-white/10 space-y-2">
                <p className="text-xs text-white/60">Nessuna attività registrata di recente.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activityHistory.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 bg-zinc-950 rounded-xl border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg font-bold ${
                        h.pointsChange > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        <Zap className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <div>
                        <span className="font-bold text-white block">{h.title}</span>
                        <span className="text-[10px] text-slate-400">{h.timestamp}</span>
                      </div>
                    </div>

                    <span className={`font-black text-xs ${
                      h.pointsChange > 0 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {h.pointsChange > 0 ? `+${h.pointsChange}` : h.pointsChange} PTS
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: BADGES */}
        {activeTab === 'badges' && (
          <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
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
        )}

      </div>
    </div>
  );
};
