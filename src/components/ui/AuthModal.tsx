import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { X, Lock, User, Mail, ShieldCheck, CheckCircle2, Sparkles, LogIn, UserPlus, LogOut, Key } from 'lucide-react';

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentUser?: UserProfile;
  onLogin?: (profile: UserProfile) => void;
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

  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [password, setPassword] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Admin or Business Portal Login
  const handlePortalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetMode === 'admin') {
      if (adminPasswordInput === 'admin' || adminPasswordInput === 'admin123' || adminPasswordInput.length > 0) {
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg('Password errata.');
      }
    } else if (targetMode === 'business') {
      if (adminPasswordInput.length > 0) {
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg('Inserisci la password aziendale.');
      }
    }
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password || (mode === 'register' && !username)) {
      setErrorMsg('Compila tutti i campi richiesti per continuare.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMsg('Inserisci un indirizzo e-mail valido.');
      return;
    }

    const createdProfile: UserProfile = {
      id: currentUser?.id || `usr-${Date.now()}`,
      username: username || email.split('@')[0],
      email: email,
      isLoggedIn: true,
      createdAt: currentUser?.createdAt || new Date().toLocaleDateString('it-IT'),
    };

    if (onLogin) onLogin(createdProfile);
    setSuccessMsg(mode === 'register' ? 'Account creato con successo! Benvenuto in Bonus-Power VIP.' : 'Accesso effettuato con successo!');
    setTimeout(() => {
      setSuccessMsg('');
      if (onClose) onClose();
    }, 1200);
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
              <span className="text-[10px] text-slate-500 mt-1 block">Demo: inserisci qualsiasi password o "admin"</span>
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
      <div className="bg-[#0a0a0a] border border-amber-500/40 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(245,158,11,0.2)] text-slate-100 relative animate-in zoom-in-95 space-y-6">
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center font-bold text-sm transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-0.5 shadow-[0_0_25px_rgba(212,175,55,0.3)]">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-yellow-400" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-white uppercase tracking-wider">
            {currentUser?.isLoggedIn ? 'Profilo Cliente VIP' : mode === 'register' ? 'Registrazione Rapida VIP' : 'Accedi al Tuo Account'}
          </h2>
          <p className="text-xs text-slate-400">
            {currentUser?.isLoggedIn
              ? 'I tuoi punti Bonus-Power e i tuoi coupon sono sincronizzati in modo sicuro.'
              : 'Nessuna registrazione obbligatoria per esplorare. Registrati in 10 secondi per salvare punti e coupon!'}
          </p>
        </div>

        {/* Privacy Guarantee Banner */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-[11px] text-amber-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-yellow-300 uppercase font-bold">Privacy e Trasparenza 100%</strong>
            Chiediamo solo <strong>Username, Email e Password</strong>. Nessuna carta di credito, nessun dato personale invasivo.
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
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-zinc-950 rounded-2xl border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Username:</span>
                <span className="font-bold text-yellow-400">{currentUser.username}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Email:</span>
                <span className="font-bold text-white">{currentUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Data Iscrizione:</span>
                <span className="text-slate-300">{currentUser.createdAt}</span>
              </div>
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
          /* Login / Register Form */
          <form onSubmit={handleUserSubmit} className="space-y-4">
            {/* Mode Switcher */}
            <div className="grid grid-cols-2 p-1 bg-black rounded-xl border border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'register' ? 'bg-yellow-500 text-black font-extrabold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Registrati</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'login' ? 'bg-yellow-500 text-black font-extrabold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Accedi</span>
              </button>
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1.5">
                  Username Utente
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Es. MarioVIP"
                    className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1.5">
                Indirizzo Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mariovip@email.it"
                  className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>
            </div>

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
                  placeholder="••••••••"
                  className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 hover:from-yellow-400 hover:to-yellow-200 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{mode === 'register' ? 'Crea Account VIP Gratis' : 'Accedi e Sincronizza Punti'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

