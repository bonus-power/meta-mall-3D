import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { META_TV_INITIAL_USERS, META_TV_CONFIG, MetaTvUserAccount } from '../../data/metaTvUsers';
import { loginWordPressUser } from '../../services/wpSyncService';
import {
  X,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  LogOut,
  Key,
  ExternalLink,
  Coins,
  Wallet,
  Users,
  Loader2,
  Globe
} from 'lucide-react';

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentUser?: UserProfile;
  onLogin?: (profile: UserProfile, initialCoins?: number) => void;
  onLogout?: () => void;
  // Dashboard protection props
  targetMode?: 'admin' | 'business' | 'user';
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen = true,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  targetMode = 'user',
  onSuccess,
  onCancel,
}) => {
  if (!isOpen) return null;

  // Stored users in localStorage or initial from Bonus Power / Meta-TV
  const [userAccounts] = useState<MetaTvUserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('meta_tv_registered_users');
      return saved ? JSON.parse(saved) : META_TV_INITIAL_USERS;
    } catch {
      return META_TV_INITIAL_USERS;
    }
  });

  const [authTargetSite, setAuthTargetSite] = useState<'scontaziende' | 'metatv'>('scontaziende');
  const [loginIdentifier, setLoginIdentifier] = useState(currentUser?.email || currentUser?.username || 'areacash@gmail.com');
  const [password, setPassword] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  // Handle Admin or Business Portal Login
  const handlePortalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (targetMode === 'admin') {
      if (adminPasswordInput === 'admin') {
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg('Password errata. La password per l\'Admin è "admin".');
      }
    } else if (targetMode === 'business') {
      if (adminPasswordInput === '12345678') {
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg('Password errata. La password per l\'Azienda Demo è "12345678".');
      }
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginIdentifier.trim() || !password) {
      setErrorMsg('Inserisci Username o Email e Password per accedere.');
      return;
    }

    setIsLoading(true);

    // 1. Prova prima l'autenticazione LIVE con WordPress (Scontaziende o Meta-TV)
    try {
      const wpResult = await loginWordPressUser(loginIdentifier.trim(), password, authTargetSite);

      if (wpResult.success && wpResult.user) {
        const u = wpResult.user;
        const createdProfile: UserProfile = {
          id: String(u.id),
          username: u.username,
          fullName: u.display_name || u.username,
          email: u.email,
          isLoggedIn: true,
          role: u.roles?.includes('administrator') ? 'admin' : 'user',
          discountPoints: u.points_balance || 100,
          walletBalance: 0,
          qualifiedSilver: true,
          isCompany: false,
          createdAt: new Date().toLocaleDateString('it-IT'),
        };

        if (onLogin) {
          onLogin(createdProfile, u.points_balance ?? 100);
        }

        setIsLoading(false);
        setSuccessMsg(`✅ Accesso riuscito con ${authTargetSite === 'scontaziende' ? 'Scontaziende.it' : 'Meta-TV'}! Saldo: ${u.points_balance ?? 0} PTS`);
        setTimeout(() => {
          setSuccessMsg('');
          if (onClose) onClose();
        }, 1100);
        return;
      } else if (wpResult.message && !wpResult.message.includes('Impossibile contattare')) {
        // Se WordPress ha risposto con errore di credenziali, mostriamo l'errore esatto
        setIsLoading(false);
        setErrorMsg(wpResult.message);
        return;
      }
    } catch (err) {
      console.warn('Errore chiamata autenticazione WP, controllo anagrafica locale:', err);
    }

    // 2. Fallback su anagrafica locale per account demo/offline
    const trimmed = loginIdentifier.trim().toLowerCase();
    const foundUser = userAccounts.find(
      (u) =>
        u.username.toLowerCase() === trimmed ||
        u.email.toLowerCase() === trimmed
    );

    setIsLoading(false);

    if (foundUser) {
      if (foundUser.password && foundUser.password !== password) {
        setErrorMsg('Password non corretta. Verifica le credenziali del tuo account.');
        return;
      }

      const createdProfile: UserProfile = {
        id: foundUser.id,
        username: foundUser.username,
        fullName: foundUser.fullName || foundUser.username,
        email: foundUser.email,
        isLoggedIn: true,
        role: foundUser.role || 'user',
        discountPoints: foundUser.discountPoints ?? 100,
        walletBalance: foundUser.walletBalance ?? 0,
        qualifiedSilver: foundUser.qualifiedSilver ?? true,
        isCompany: foundUser.isCompany ?? false,
        comune: foundUser.comune,
        provincia: foundUser.provincia,
        cap: foundUser.cap,
        createdAt: foundUser.registeredAt ? new Date(foundUser.registeredAt).toLocaleDateString('it-IT') : new Date().toLocaleDateString('it-IT'),
      };

      if (onLogin) {
        onLogin(createdProfile, (foundUser.discountPoints || 100) * 10);
      }

      setSuccessMsg(`Accesso completato! Benvenuto @${createdProfile.username}`);
      setTimeout(() => {
        setSuccessMsg('');
        if (onClose) onClose();
      }, 1100);
    } else {
      setErrorMsg(`Credenziali non valide su ${authTargetSite === 'scontaziende' ? 'scontaziende.it' : 'meta-tv.eu'} e non trovate in anagrafica.`);
    }
  };

  const handleSelectQuickAccount = (account: MetaTvUserAccount) => {
    setLoginIdentifier(account.email || account.username);
    setPassword(account.password || '12345678');
    setShowAccountPicker(false);
    setErrorMsg('');
  };

  const handleClose = () => {
    if (onClose) onClose();
    if (onCancel) onCancel();
  };

  // If this is protecting Admin or Business panel:
  if (targetMode === 'admin' || targetMode === 'business') {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
        <div className="bg-[#0a0a0a] border border-amber-500/40 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(245,158,11,0.2)] text-slate-100 relative space-y-5 animate-in zoom-in-95">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white flex items-center justify-center font-bold text-sm"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-lg">
              <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                <Key className="w-7 h-7 text-yellow-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
              {targetMode === 'admin' ? 'Accesso Area Amministratore' : 'Accesso Portale Aziende 3D'}
            </h2>
            <p className="text-xs text-slate-400">
              {targetMode === 'admin'
                ? 'Inserisci la password di amministrazione per gestire aziende, 360° e regole punti.'
                : 'Inserisci le credenziali del tuo mini-sito 3D.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-300 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handlePortalSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1.5">
                Password di Accesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  className="w-full bg-black border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-xs text-yellow-300 font-bold focus:border-yellow-500 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-amber-400 font-medium mt-1 block">
                {targetMode === 'admin' ? '🔑 Password Admin: admin' : '🏢 Password Azienda Demo: 12345678'}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-xs font-bold uppercase"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs uppercase rounded-xl shadow-md"
              >
                Accedi
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // User VIP Profile Registration / Login Mode:
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0a0a0a] border border-amber-500/40 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(245,158,11,0.2)] text-slate-100 relative animate-in zoom-in-95 space-y-5">
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center font-bold text-sm transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-0.5 shadow-[0_0_25px_rgba(212,175,55,0.3)]">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-yellow-400" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-white uppercase tracking-wider">
            {currentUser?.isLoggedIn ? 'Area Riservata Meta-TV' : 'Login Meta-TV'}
          </h2>
          <p className="text-xs text-slate-400">
            {currentUser?.isLoggedIn
              ? 'Punti sincronizzati con Meta-TV ed utilizzabili su Bonus Power.'
              : 'Accedi con le stesse credenziali Username e Password di Meta-TV / Bonus Power.'}
          </p>
        </div>

        {/* Integration Hub Banner */}
        <div className="p-3 bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-black border border-amber-500/30 rounded-2xl text-[11px] text-amber-200/90 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="block text-yellow-300 uppercase font-bold text-[10px] tracking-wider">
              Circuito Unificato Meta-TV ⇄ Bonus Power
            </strong>
            <p className="text-[10.5px] leading-relaxed text-slate-300">
              I punti accumulati esplorando il Centro 3D si sommano nel tuo conto su <span className="text-yellow-400 font-semibold">meta-tv.eu</span> e sono pronti per essere spesi come Punti Sconto nell'app <strong>Bonus Power</strong>.
            </p>
          </div>
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-2xl text-green-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-300 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* If already logged in */}
        {currentUser?.isLoggedIn ? (
          <div className="space-y-4 pt-1">
            <div className="p-4 bg-zinc-950 rounded-2xl border border-white/10 space-y-2.5 text-xs">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-slate-400">Username:</span>
                <span className="font-bold text-yellow-400 flex items-center gap-1">
                  @{currentUser.username}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-slate-400">Email:</span>
                <span className="font-bold text-white">{currentUser.email}</span>
              </div>
              {currentUser.comune && (
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-slate-400">Zona / Comune:</span>
                  <span className="text-slate-300 capitalize">{currentUser.comune} ({currentUser.cap || currentUser.provincia})</span>
                </div>
              )}
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-slate-400">Stato Qualifica:</span>
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 rounded-md font-bold text-[10px]">
                  {currentUser.qualifiedSilver ? '⭐ Qualificato Silver' : 'Utente Standard'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-slate-400">Piattaforma:</span>
                <span className="text-amber-300 font-semibold flex items-center gap-1">
                  meta-tv.eu
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
              <a
                href={META_TV_CONFIG.wpLoginUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl text-yellow-400 font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Area Riservata Meta-TV</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={META_TV_CONFIG.bonusPowerAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl text-amber-400 font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Bonus Power App</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <button
              onClick={() => {
                if (onLogout) onLogout();
                if (onClose) onClose();
              }}
              className="w-full py-3 bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnetti Account</span>
            </button>
          </div>
        ) : (
          /* Login Form */
          <form onSubmit={handleUserSubmit} className="space-y-3.5">
            {/* Site selector */}
            <div>
              <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                Autentica con account:
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/60 border border-white/10 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAuthTargetSite('scontaziende')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    authTargetSite === 'scontaziende'
                      ? 'bg-amber-500 text-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Scontaziende.it</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTargetSite('metatv')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    authTargetSite === 'metatv'
                      ? 'bg-amber-500 text-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Meta-TV.eu</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase block">
                  Username o Email {authTargetSite === 'scontaziende' ? 'Scontaziende' : 'Meta-TV'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowAccountPicker(!showAccountPicker)}
                  className="text-[10px] text-yellow-400 hover:text-yellow-300 flex items-center gap-1 font-bold underline"
                >
                  <Users className="w-3 h-3" />
                  <span>Account Demo</span>
                </button>
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="Es. areacash@gmail.com o username"
                  className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick account selector popup list */}
            {showAccountPicker && (
              <div className="p-3 bg-zinc-950 border border-yellow-500/40 rounded-2xl space-y-2 animate-in fade-in-50">
                <span className="text-[10px] uppercase font-bold text-yellow-400 block tracking-wider">
                  Seleziona account anagrafica:
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {userAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleSelectQuickAccount(acc)}
                      className="w-full p-2 bg-zinc-900 hover:bg-yellow-500/20 border border-white/5 hover:border-yellow-500/40 rounded-xl flex items-center justify-between text-left transition-all"
                    >
                      <div>
                        <div className="font-bold text-white text-xs">@{acc.username}</div>
                        <div className="text-[10px] text-slate-400">{acc.email} {acc.comune ? `• ${acc.comune}` : ''}</div>
                      </div>
                      <span className="px-2 py-0.5 bg-black/60 text-yellow-400 text-[9px] font-bold rounded-lg border border-white/10">
                        {acc.discountPoints || 100} PTS
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="La password del tuo account WordPress"
                  className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px]">
                <span className="text-amber-400/90 font-medium">
                  Verifica live tramite WordPress
                </span>
                <a
                  href={authTargetSite === 'scontaziende' ? 'https://scontaziende.it/wp-login.php' : META_TV_CONFIG.wpLoginUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white underline flex items-center gap-0.5"
                >
                  <span>Registrati</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 hover:from-yellow-400 hover:to-yellow-200 disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifica credenziali con {authTargetSite === 'scontaziende' ? 'Scontaziende' : 'Meta-TV'}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Accedi con {authTargetSite === 'scontaziende' ? 'Scontaziende.it' : 'Meta-TV.eu'}</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
