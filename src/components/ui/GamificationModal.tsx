import React, { useState } from 'react';
import { Trophy, Award, Sparkles, Gift, Check, Flame, RefreshCw, Globe, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { UserStats, Badge, Company, PointsRuleConfig, RedeemedCoupon } from '../../types';
import { syncPointsWithWordPress } from '../../services/wpSyncService';

interface GamificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  badges: Badge[];
  companies: Company[];
  onUpdateStats: React.Dispatch<React.SetStateAction<UserStats>>;
  onSelectCompany: (company: Company) => void;
  onToggleFavoriteCompany: (companyId: string) => void;
  pointsRules: PointsRuleConfig;
}

export const GamificationModal: React.FC<GamificationModalProps> = ({
  isOpen,
  onClose,
  stats,
  badges,
  companies,
  onUpdateStats,
  onSelectCompany,
  pointsRules,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'badges' | 'favorites' | 'history' | 'wordpress'>('overview');
  const [targetSite, setTargetSite] = useState<'scontaziende' | 'metatv'>('scontaziende');
  const [customUsername, setCustomUsername] = useState(stats.profile?.email || stats.profile?.username || 'areacash@gmail.com');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const xpForNextLevel = stats.level * 200;
  const progressPercent = Math.min(100, Math.round((stats.xp / xpForNextLevel) * 100));

  // Test send points to WordPress site
  const handleTestWordPressSync = async (amount: number = 100) => {
    if (stats.coins < amount) {
      setSyncStatus({
        success: false,
        message: `⚠️ Saldo insufficiente nel Centro 3D: hai ${stats.coins} PTS, ne servono almeno ${amount} da trasferire.`,
      });
      return;
    }

    setIsSyncing(true);
    setSyncStatus(null);

    const res = await syncPointsWithWordPress({
      username: customUsername.trim(),
      amount: amount,
      reason: `Trasferimento Punti dal Centro 3D (${targetSite})`,
      targetSite: targetSite,
    });

    setIsSyncing(false);
    setSyncStatus({
      success: res.success,
      message: res.success
        ? `✅ Trasferiti con successo ${amount} PTS all'utente @${customUsername} su ${targetSite === 'scontaziende' ? 'scontaziende.it' : 'meta-tv.eu'}! Saldo WP: ${res.newBalance ?? 'aggiornato'}`
        : `⚠️ Errore: ${res.message || 'Verifica lo stato del plugin su WordPress.'}`,
    });

    if (res.success) {
      onUpdateStats((prev) => ({
        ...prev,
        coins: Math.max(0, prev.coins - amount),
        activityHistory: [
          {
            id: `act-${Date.now()}`,
            type: 'spend',
            title: `Trasferimento a ${targetSite === 'scontaziende' ? 'scontaziende.it' : 'meta-tv.eu'} (-${amount} PTS)`,
            pointsChange: -amount,
            timestamp: new Date().toLocaleDateString('it-IT', { hour: '2-digit', minute: '2-digit' }),
          },
          ...(prev.activityHistory || []),
        ],
      }));
    }
  };

  const favoriteCompanies = companies.filter((c) => (stats.favoriteCompanyIds || []).includes(c.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Header with VIP & Balance */}
        <div className="relative p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition"
          >
            ✕
          </button>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl p-3 bg-indigo-500/20 border border-indigo-500/40 rounded-xl shadow-inner">
                👑
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-wide">
                    {stats.profile?.fullName || stats.profile?.username || 'Esploratore Meta-TV'}
                  </h2>
                  <span className="px-2.5 py-0.5 text-xs font-semibold uppercase rounded-full bg-cyan-500/30 text-cyan-300 border border-cyan-500/40">
                    Livello {stats.level}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-0.5">
                  Account Collegato: <span className="text-cyan-400 font-mono font-medium">{stats.profile?.username || customUsername}</span>
                </p>
              </div>
            </div>

            {/* Quick Balance */}
            <div className="flex items-center gap-4 bg-slate-800/80 border border-slate-700/80 px-4 py-2 rounded-xl">
              <div>
                <div className="text-xs text-slate-400 font-medium">Saldo Punti Centro 3D</div>
                <div className="text-2xl font-extrabold text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  {stats.coins.toLocaleString()} PTS
                </div>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Esperienza Livello {stats.level}</span>
              <span>{stats.xp} / {xpForNextLevel} XP</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation - Sticky & shrink-0 per rimanere sempre visibile */}
        <div className="sticky top-0 z-20 flex border-b border-slate-800 bg-slate-950 px-4 sm:px-6 gap-2 overflow-x-auto shrink-0 shadow-md no-scrollbar">
          {[
            { id: 'overview', label: 'Panoramica', icon: Trophy },
            { id: 'wordpress', label: 'Sincronizzazione Live WP', icon: Globe },
            { id: 'badges', label: 'Badge Sbloccati', icon: Award },
            { id: 'favorites', label: 'Aziende Preferite', icon: Heart },
            { id: 'history', label: 'Storico Attività', icon: Flame },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-cyan-400 text-cyan-400 bg-cyan-950/30'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-xl">
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Padiglioni Visitati</div>
                  <div className="text-2xl font-bold text-white mt-1">{stats.visitedPavilions.length} Padiglioni</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-xl">
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Badge Conquistati</div>
                  <div className="text-2xl font-bold text-cyan-400 mt-1">{stats.unlockedBadges.length} / {badges.length}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-xl">
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Aziende Preferite</div>
                  <div className="text-2xl font-bold text-amber-400 mt-1">{favoriteCompanies.length} Salve</div>
                </div>
              </div>

              {/* Quick Sync Banner */}
              <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-indigo-300 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-400" />
                    Sincronizzazione Automatica Punti Attiva
                  </h3>
                  <p className="text-sm text-slate-300 mt-1">
                    I punti accumulati nel Centro 3D vengono accreditati su WordPress (myCred).
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('wordpress')}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-lg shadow transition whitespace-nowrap"
                >
                  Gestisci Ponte WP
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: WORDPRESS / MYCRED SYNC */}
          {activeTab === 'wordpress' && (
            <div className="space-y-6">
              <div className="bg-slate-800/40 border border-slate-700/60 p-5 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    Ponte Sincronizzazione Live WordPress (myCred)
                  </h3>
                  <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-semibold">
                    Plugin Dedicato
                  </span>
                </div>
                
                <p className="text-sm text-slate-300 leading-relaxed">
                  Invia istantaneamente i punti dal Centro 3D al database WordPress del tuo sito tramite il plugin <b className="text-cyan-400">Meta-TV 3D Points Sync Bridge</b>.
                </p>

                {/* SITO TARGET & USERNAME */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Sito WordPress di Destinazione
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTargetSite('scontaziende')}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border transition ${
                          targetSite === 'scontaziende'
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        scontaziende.it (Test)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTargetSite('metatv')}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border transition ${
                          targetSite === 'metatv'
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        meta-tv.eu (Prod)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Username o Email WordPress
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customUsername}
                        onChange={(e) => setCustomUsername(e.target.value)}
                        placeholder="es. scontaziende0 oppure areacash@gmail.com"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                {/* TEST SYNC BUTTON */}
                <div className="pt-2">
                  <button
                    onClick={() => handleTestWordPressSync(100)}
                    disabled={isSyncing}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Comunicazione in corso con {targetSite === 'scontaziende' ? 'scontaziende.it' : 'meta-tv.eu'}...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        INVIA +100 PTS A {targetSite === 'scontaziende' ? 'SCONTAZIENDE.IT' : 'META-TV.EU'}
                      </>
                    )}
                  </button>
                </div>

                {/* RESULT STATUS */}
                {syncStatus && (
                  <div
                    className={`p-4 rounded-xl text-sm border font-medium ${
                      syncStatus.success
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                        : 'bg-amber-950/40 border-amber-500/60 text-amber-300'
                    }`}
                  >
                    {syncStatus.message}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BADGES */}
          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map((badge) => {
                const isUnlocked = stats.unlockedBadges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-xl border flex items-center gap-4 transition ${
                      isUnlocked
                        ? 'bg-slate-800/60 border-cyan-500/40'
                        : 'bg-slate-900/40 border-slate-800 opacity-50'
                    }`}
                  >
                    <span className="text-3xl">{badge.icon}</span>
                    <div>
                      <h4 className="font-bold text-white text-base">{badge.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{badge.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: FAVORITES */}
          {activeTab === 'favorites' && (
            <div className="space-y-3">
              {favoriteCompanies.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  Nessuna azienda preferita salvata. Esplora i padiglioni e clicca sul cuore per salvarle!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {favoriteCompanies.map((comp) => (
                    <div
                      key={comp.id}
                      onClick={() => onSelectCompany(comp)}
                      className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl flex items-center justify-between hover:border-cyan-500/40 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <img src={comp.logo} alt={comp.name} className="w-10 h-10 rounded-lg object-contain bg-white/5 p-1" />
                        <div>
                          <div className="font-bold text-white text-sm">{comp.name}</div>
                          <div className="text-xs text-slate-400">{comp.category}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ACTIVITY HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {(stats.activityHistory || []).length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  Nessuna attività registrata di recente.
                </div>
              ) : (
                <div className="space-y-2">
                  {(stats.activityHistory || []).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-white text-sm">{item.title}</div>
                        <div className="text-xs text-slate-400">{item.timestamp}</div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${item.pointsChange >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                        {item.pointsChange >= 0 ? `+${item.pointsChange}` : item.pointsChange} PTS
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
