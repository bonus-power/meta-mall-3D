import React, { useState, useEffect } from 'react';
import { Shield, Store, Lock, User, RefreshCw, KeyRound, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface AuthModalProps {
  targetMode: 'admin' | 'business';
  onSuccess: () => void;
  onCancel: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ targetMode, onSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');
  
  // Math captcha state
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Generate new captcha question
  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    const n2 = Math.floor(Math.random() * 8) + 1; // 1 to 8
    setNum1(n1);
    setNum2(n2);
    setUserCaptcha('');
    setErrorMessage('');
  };

  useEffect(() => {
    generateCaptcha();
  }, [targetMode]);

  const expectedAnswer = num1 + num2;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Check captcha
    if (parseInt(userCaptcha.trim(), 10) !== expectedAnswer) {
      setErrorMessage('❌ Codice CAPTCHA errato. Riprova con il nuovo calcolo.');
      generateCaptcha();
      return;
    }

    // Validate credentials
    if (targetMode === 'admin') {
      if (
        (username.toLowerCase() === 'admin' && (password === 'adminpass' || password === 'admin123' || password === 'admin'))
      ) {
        setIsSuccess(true);
        sessionStorage.setItem('isAuthenticatedAdmin', 'true');
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        setErrorMessage('❌ Credenziali Admin errate. Usa: admin / adminpass');
        generateCaptcha();
      }
    } else {
      // Business mode
      if (
        (username.toLowerCase() === 'azienda' || username.toLowerCase() === 'business' || username.toLowerCase() === 'partner') &&
        (password === 'password123' || password === 'azienda123' || password === 'azienda')
      ) {
        setIsSuccess(true);
        sessionStorage.setItem('isAuthenticatedBusiness', 'true');
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        setErrorMessage('❌ Credenziali Azienda errate. Usa: azienda / password123');
        generateCaptcha();
      }
    }
  };

  const handleFillDemo = () => {
    if (targetMode === 'admin') {
      setUsername('admin');
      setPassword('adminpass');
    } else {
      setUsername('azienda');
      setPassword('password123');
    }
    setUserCaptcha(String(expectedAnswer));
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Decorative Top Gradient Line */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${
            targetMode === 'admin'
              ? 'from-red-600 via-amber-500 to-red-600'
              : 'from-amber-500 via-yellow-300 to-amber-500'
          }`}
        />

        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-full transition-all cursor-pointer"
          title="Chiudi e torna alla mappa"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2 pt-2">
          <div
            className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center shadow-lg ${
              targetMode === 'admin'
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-red-500/20'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-amber-500/20'
            }`}
          >
            {targetMode === 'admin' ? <Shield className="w-7 h-7" /> : <Store className="w-7 h-7" />}
          </div>

          <h2 className="text-xl font-black tracking-wider uppercase text-white">
            {targetMode === 'admin' ? 'ACCESSO AREA ADMIN' : 'ACCESSO AREA AZIENDE SaaS'}
          </h2>
          <p className="text-xs text-slate-400">
            Inserisci le tue credenziali di sicurezza e risolvi il Captcha anti-bot per accedere.
          </p>
        </div>

        {/* Success Alert */}
        {isSuccess ? (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl flex items-center justify-center gap-3 text-emerald-300 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Accesso Autorizzato! Reindirizzamento in corso...</span>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {/* Username Input */}
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" /> Username
              </label>
              <input
                type="text"
                required
                placeholder={targetMode === 'admin' ? 'Username Admin (es. admin)' : 'Username Azienda (es. azienda)'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 p-3 rounded-xl text-white font-bold outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 p-3 rounded-xl text-white font-bold outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            {/* Captcha Protection Block */}
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" /> Protezione anti-bot Captcha
                </span>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="p-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                  title="Rigenera calcolo"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3 py-2 bg-black border border-slate-800 rounded-xl font-mono text-sm font-extrabold text-amber-300 tracking-wider shrink-0 select-none">
                  {num1} + {num2} = ?
                </div>
                <input
                  type="number"
                  required
                  placeholder="Risultato"
                  value={userCaptcha}
                  onChange={(e) => setUserCaptcha(e.target.value)}
                  className="flex-1 bg-black border border-slate-800 focus:border-amber-500 p-2.5 rounded-xl text-amber-300 font-mono font-bold text-center outline-none"
                />
              </div>
            </div>

            {/* Error Message Display */}
            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Demo Helper Box */}
            <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 font-bold block">Demo Test Credenziali:</span>
                <span className="text-amber-300 font-mono font-bold">
                  {targetMode === 'admin' ? 'admin / adminpass' : 'azienda / password123'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-extrabold rounded-lg border border-amber-500/40 transition-all cursor-pointer text-[10px] uppercase tracking-wider shrink-0"
              >
                Compila Demo
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="w-1/3 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-2xl uppercase tracking-wider text-xs transition-all cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="submit"
                className={`w-2/3 py-3 font-black rounded-2xl uppercase tracking-wider text-xs shadow-lg transition-all cursor-pointer active:scale-95 ${
                  targetMode === 'admin'
                    ? 'bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white shadow-red-600/30'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black shadow-amber-500/30'
                }`}
              >
                Accedi Ora
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
