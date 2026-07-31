import React, { useState, useEffect } from 'react';
import { SponsorPanel, PointsRuleConfig } from '../../types';
import {
  X,
  ExternalLink,
  ShoppingBag,
  CheckCircle,
  Zap,
  Globe,
  Tag,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  Sparkles,
  CreditCard,
  Edit,
  ArrowRight,
  Video,
  Play,
  Tv,
} from 'lucide-react';

function parseYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  if (url.includes('/embed/')) return url;
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&rel=0`;
  }
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&rel=0`;
  }
  return null;
}

interface SponsorPanelModalProps {
  panel: SponsorPanel;
  onClose: () => void;
  onStepBack?: () => void;
  onUpdatePanel: (updated: SponsorPanel) => void;
  pointsRules?: PointsRuleConfig;
  onEarnPoints?: (points: number, title: string) => void;
}

export const SponsorPanelModal: React.FC<SponsorPanelModalProps> = ({
  panel,
  onClose,
  onStepBack,
  onUpdatePanel,
  pointsRules = {
    dailyLoginPoints: 100,
    favoriteCompanyPoints: 25,
    visitPavilionPoints: 50,
    surveyPoints: 150,
    viewPosterPoints: 30,
    watchVideoPoints: 60,
    listenMusicPoints: 40,
    centerCustomPoints: 80,
  },
  onEarnPoints,
}) => {
  const [activeTab, setActiveTab] = useState<'view' | 'buy' | 'edit'>(
    panel.status === 'available' ? 'buy' : 'view'
  );

  const [hasClaimedPosterPoints, setHasClaimedPosterPoints] = useState(false);
  const [hasClaimedVideoPoints, setHasClaimedVideoPoints] = useState(false);
  const [claimFeedback, setClaimFeedback] = useState<string | null>(null);

  const initialEmbedUrl = panel.youtubeEmbedUrl || parseYouTubeEmbedUrl(panel.videoUrl) || '';
  const [showVideo, setShowVideo] = useState<boolean>(!!initialEmbedUrl);

  // Listen for Down Arrow (or S key) to step back and close full screen manifesto
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (onStepBack) {
          onStepBack();
        } else {
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onStepBack]);

  // Form state for purchasing / booking
  const [purchaseForm, setPurchaseForm] = useState({
    advertiserName: '',
    email: '',
    phone: '',
    title: '',
    tagline: '',
    description: '',
    websiteUrl: '',
    externalPurchaseUrl: panel.externalPurchaseUrl || 'https://meta-tv.net/acquista-sponsor-3d',
    imageUrl: panel.imageUrl || 'https://images.unsplash.com/photo-1542744094-3a317272018a?auto=format&fit=crop&w=800&q=80',
    youtubeEmbedUrl: initialEmbedUrl,
    mediaType: panel.mediaType || (initialEmbedUrl ? 'youtube' : 'image'),
    plan: '1_month',
  });

  const [purchasedSuccess, setPurchasedSuccess] = useState(false);

  // Form state for admin edit
  const [editForm, setEditForm] = useState<SponsorPanel>({
    ...panel,
    youtubeEmbedUrl: initialEmbedUrl,
  });

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseForm.advertiserName || !purchaseForm.title) return;

    const priceMap: Record<string, string> = {
      '1_month': '€299 / mese',
      '3_months': '€269 / mese',
      '12_months': '€199 / mese',
    };

    const parsedVideo = parseYouTubeEmbedUrl(purchaseForm.youtubeEmbedUrl) || purchaseForm.youtubeEmbedUrl;

    const updated: SponsorPanel = {
      ...panel,
      status: 'active',
      advertiserName: purchaseForm.advertiserName,
      title: purchaseForm.title,
      tagline: purchaseForm.tagline || 'Sponsor Ufficiale Galleria Meta-TV 3D',
      description: purchaseForm.description || 'Promozione esclusiva nel centro commerciale virtuale Meta-TV.',
      websiteUrl: purchaseForm.websiteUrl || 'https://meta-tv.net',
      externalPurchaseUrl: purchaseForm.externalPurchaseUrl || 'https://meta-tv.net/acquista-sponsor-3d',
      imageUrl: purchaseForm.imageUrl,
      youtubeEmbedUrl: parsedVideo,
      mediaType: parsedVideo ? 'youtube' : 'image',
      boughtByEmail: purchaseForm.email,
      pricePerMonth: priceMap[purchaseForm.plan] || '€299 / mese',
      createdAt: new Date().toISOString(),
    };

    onUpdatePanel(updated);
    setPurchasedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2200);
  };

  const handleAdminEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedVideo = parseYouTubeEmbedUrl(editForm.youtubeEmbedUrl) || editForm.youtubeEmbedUrl;
    onUpdatePanel({
      ...editForm,
      youtubeEmbedUrl: parsedVideo,
      mediaType: parsedVideo ? 'youtube' : 'image',
    });
    onClose();
  };

  const presetImages = [
    { label: 'Moda & Lusso', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80' },
    { label: 'Auto & Motori', url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80' },
    { label: 'Tecnologia', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80' },
    { label: 'Food & Wine', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
    { label: 'Business & Finanza', url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col w-full h-full bg-black/95 backdrop-blur-2xl animate-fadeIn overflow-hidden">
      
      {/* Top Fullscreen Control & Info Header */}
      <div className="bg-gradient-to-r from-[#0d1322] via-[#111827] to-[#0d1322] border-b border-amber-500/30 px-4 sm:px-6 py-3 flex items-center justify-between text-xs sm:text-sm text-amber-200 font-bold shadow-lg z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-wider text-amber-400 font-extrabold text-xs">
                MANIFESTO A SCHERMO INTERO • {panel.side === 'left' ? 'Parete Sinistra' : 'Parete Destra'}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
                panel.status === 'active'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
              }`}>
                {panel.status === 'active' ? 'Sponsor Attivo' : 'Spazio Disponibile'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">{panel.title}</h2>
          </div>
        </div>

        {/* Center Prominent Step-Back Action Button */}
        <button
          onClick={onStepBack || onClose}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all transform hover:scale-105 active:scale-95 border border-yellow-300/80"
          title="Indietreggia e ritorna al corridoio centrale (Freccia Giù)"
        >
          <span className="text-lg animate-bounce">▼</span>
          <span>INDIETREGGIA (FRECCIA GIÙ)</span>
        </button>

        {/* Right Tab Controls & Close Button */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex bg-black/60 p-1 rounded-xl border border-white/10 gap-1">
            {panel.status === 'active' && (
              <button
                onClick={() => setActiveTab('view')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'view'
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                Manifesto
              </button>
            )}
            <button
              onClick={() => setActiveTab('buy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'buy'
                  ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Acquista
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'edit'
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-400/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            title="Chiudi"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Fullscreen Body Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col justify-center items-center">
        {purchasedSuccess ? (
          <div className="py-12 text-center space-y-4 animate-scaleUp max-w-lg mx-auto">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white">Manifesto Pubblicitario Attivato!</h3>
            <p className="text-slate-300 text-sm">
              Il tuo banner sponsor è stato installato in tempo reale sulla parete della Galleria 3D Meta-TV.
            </p>
            <button
              onClick={onStepBack || onClose}
              className="mt-4 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl"
            >
              Ritorna al Corridoio 3D (Freccia Giù)
            </button>
          </div>
        ) : activeTab === 'view' ? (
          <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center space-y-4">
            
            {/* FULLSCREEN MANIFESTO MEDIA DISPLAY (YOUTUBE IFRAME OR IMAGE) */}
            <div className="relative w-full flex flex-col items-center justify-center rounded-3xl overflow-hidden border-2 border-yellow-500/60 shadow-[0_0_100px_rgba(255,215,0,0.3)] bg-slate-950 p-2 group">
              
              {/* Media Mode Toggle (If YouTube video exists) */}
              {initialEmbedUrl && (
                <div className="absolute top-4 right-4 z-20 bg-black/80 backdrop-blur-md p-1 rounded-xl border border-amber-500/40 flex items-center gap-1">
                  <button
                    onClick={() => setShowVideo(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      showVideo
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    Video YouTube
                  </button>
                  <button
                    onClick={() => setShowVideo(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      !showVideo
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Immagine
                  </button>
                </div>
              )}

              {showVideo && initialEmbedUrl ? (
                <div className="w-full aspect-video max-h-[62vh] sm:max-h-[68vh] rounded-2xl overflow-hidden bg-black shadow-2xl">
                  <iframe
                    src={initialEmbedUrl}
                    title={panel.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <img
                  src={panel.imageUrl}
                  alt={panel.title}
                  className="max-h-[62vh] sm:max-h-[70vh] w-auto max-w-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-[1.01]"
                />
              )}

              {/* Glass Overlay Title Tag */}
              <div className="w-full mt-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-yellow-500/40 border border-yellow-300 text-yellow-200 font-extrabold text-xs uppercase">
                      {panel.category || 'Gold Sponsor 3D'}
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                      Azienda: {panel.advertiserName || 'Partner Ufficiale'}
                    </span>
                    {initialEmbedUrl && (
                      <span className="bg-red-600/90 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Tv className="w-3 h-3" /> YOUTUBE VIDEO
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">{panel.title}</h3>
                  <p className="text-cyan-300 text-xs sm:text-sm font-semibold">{panel.tagline}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Points Reward Button for Manifesto / Video */}
                  {showVideo && initialEmbedUrl ? (
                    <button
                      disabled={hasClaimedVideoPoints}
                      onClick={() => {
                        const pts = panel.pointsReward ? Math.round(panel.pointsReward * 1.5) : (pointsRules.watchVideoPoints || 60);
                        if (onEarnPoints) onEarnPoints(pts, `Visione Video: ${panel.title}`);
                        setHasClaimedVideoPoints(true);
                        setClaimFeedback(`+${pts} PTS Guadagnati per la visione video!`);
                        setTimeout(() => setClaimFeedback(null), 3000);
                      }}
                      className={`px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase flex items-center gap-1.5 transition-all shadow-md ${
                        hasClaimedVideoPoints
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                          : 'bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white animate-pulse'
                      }`}
                    >
                      <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                      {hasClaimedVideoPoints
                        ? 'Punti Video Riscattai ✓'
                        : `Riscatta +${panel.pointsReward ? Math.round(panel.pointsReward * 1.5) : (pointsRules.watchVideoPoints || 60)} PTS Video`}
                    </button>
                  ) : (
                    <button
                      disabled={hasClaimedPosterPoints}
                      onClick={() => {
                        const pts = panel.pointsReward || pointsRules.viewPosterPoints || 40;
                        if (onEarnPoints) onEarnPoints(pts, `Visione Manifesto: ${panel.title}`);
                        setHasClaimedPosterPoints(true);
                        setClaimFeedback(`+${pts} PTS Guadagnati per la visione manifesto!`);
                        setTimeout(() => setClaimFeedback(null), 3000);
                      }}
                      className={`px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase flex items-center gap-1.5 transition-all shadow-md ${
                        hasClaimedPosterPoints
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                          : 'bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-400 hover:to-amber-300 text-black'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-black" />
                      {hasClaimedPosterPoints
                        ? 'Punti Manifesto Riscattai ✓'
                        : `Riscatta +${panel.pointsReward || pointsRules.viewPosterPoints || 40} PTS Manifesto`}
                    </button>
                  )}

                  {claimFeedback && (
                    <div className="px-3 py-1 bg-emerald-500/30 border border-emerald-400/60 text-emerald-200 text-xs font-bold rounded-lg animate-bounce">
                      {claimFeedback}
                    </div>
                  )}

                  {panel.websiteUrl && (
                    <a
                      href={panel.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 font-bold text-xs border border-cyan-400/50 flex items-center gap-1.5 transition-all"
                    >
                      <Globe className="w-4 h-4 text-cyan-400" />
                      Visita Sito Web
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => setActiveTab('buy')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-400 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {panel.status === 'available' ? '🛒 Acquista / Affitta Spazio 3D' : 'Prenota Spazio / Modifica'}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">ℹ️ COMANDO TASTIERA:</span>
                <span>Premi <strong>Freccia Giù (▼)</strong> per indietreggiare al centro del corridoio.</span>
              </div>

              <button
                onClick={onStepBack || onClose}
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-black uppercase text-xs flex items-center gap-2 transition-all"
              >
                <span>▼</span>
                <span>INDIETREGGIA ORA</span>
              </button>
            </div>

          </div>
        ) : activeTab === 'buy' ? (
            <form onSubmit={handlePurchaseSubmit} className="space-y-6">
              <div className="bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-transparent border border-yellow-500/30 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-yellow-300 text-base flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Acquista Posizione Parete Galleria 3D
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Posizione: {panel.side === 'left' ? 'Parete Sinistra' : 'Parete Destra'} • X-Coord: {panel.positionX}m
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-white">{panel.pricePerMonth}</div>
                  <div className="text-[10px] text-emerald-400 uppercase font-bold">Attivazione Immediata</div>
                </div>
              </div>

              {/* Form inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome Azienda / Brand *
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={purchaseForm.advertiserName}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, advertiserName: e.target.value })}
                      placeholder="Es. Alfa Motors S.r.l."
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Titolo Manifesto Pubblicitario *
                  </label>
                  <input
                    type="text"
                    required
                    value={purchaseForm.title}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, title: e.target.value })}
                    placeholder="Es. Nuova Collezione Inverno 2026"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Contatto / Referente *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={purchaseForm.email}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, email: e.target.value })}
                      placeholder="sponsor@azienda.it"
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Telefono
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="tel"
                      value={purchaseForm.phone}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, phone: e.target.value })}
                      placeholder="+39 02 1234567"
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Slogan / Sottotitolo Promo
                  </label>
                  <input
                    type="text"
                    value={purchaseForm.tagline}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, tagline: e.target.value })}
                    placeholder="Es. Sconto 20% esclusivo per i visitatori Meta-TV 3D"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-red-300 mb-1 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-red-400" />
                    URL Video YouTube (IFrame / Video Promo) - Opzionale
                  </label>
                  <input
                    type="url"
                    value={purchaseForm.youtubeEmbedUrl}
                    onChange={(e) =>
                      setPurchaseForm({
                        ...purchaseForm,
                        youtubeEmbedUrl: e.target.value,
                        mediaType: e.target.value ? 'youtube' : 'image',
                      })
                    }
                    placeholder="https://www.youtube.com/watch?v=... oppure https://youtu.be/..."
                    className="w-full bg-black/50 border border-red-500/40 rounded-xl px-3 py-2 text-sm text-white focus:border-red-400 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Incolla qualsiasi link YouTube: verrà riprodotto direttamente nel manifesto della Galleria 3D!
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sito Web / Link E-commerce Sponsor
                  </label>
                  <input
                    type="url"
                    value={purchaseForm.websiteUrl}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, websiteUrl: e.target.value })}
                    placeholder="https://www.tuosito.it"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-emerald-300 mb-1 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    Link Esterno per Acquisto (Checkout Stripe / PayPal / E-commerce Esterno)
                  </label>
                  <input
                    type="url"
                    value={purchaseForm.externalPurchaseUrl}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, externalPurchaseUrl: e.target.value })}
                    placeholder="https://meta-tv.net/checkout/sponsor"
                    className="w-full bg-black/50 border border-emerald-500/40 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    I visitatori potranno cliccare su questo link per completare l'acquisto direttamente sul tuo e-commerce esterno.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    URL Immagine Manifesto Pubblicitario
                  </label>
                  <input
                    type="text"
                    value={purchaseForm.imageUrl}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none"
                  />

                  {/* Preset Image Selectors */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-[10px] text-slate-400 py-1 font-semibold">Usa immagine demo:</span>
                    {presetImages.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPurchaseForm({ ...purchaseForm, imageUrl: p.url })}
                        className="text-[10px] px-2 py-1 rounded-md bg-white/5 hover:bg-white/15 text-cyan-300 border border-white/10"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Piano Durata Pubblicità
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '1_month', label: '1 Mese', price: '€299', savings: 'Standard' },
                      { id: '3_months', label: '3 Mesi', price: '€269/m', savings: 'Sconto 10%' },
                      { id: '12_months', label: '12 Mesi', price: '€199/m', savings: 'Sconto 30%' },
                    ].map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setPurchaseForm({ ...purchaseForm, plan: plan.id })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          purchaseForm.plan === plan.id
                            ? 'bg-yellow-500/20 border-yellow-400 text-white'
                            : 'bg-black/30 border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <div className="font-bold text-sm text-white">{plan.label}</div>
                        <div className="text-xs text-yellow-300 font-bold mt-0.5">{plan.price}</div>
                        <div className="text-[10px] text-emerald-400">{plan.savings}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-400 text-black font-extrabold text-base shadow-[0_0_30px_rgba(255,215,0,0.4)] transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <CreditCard className="w-5 h-5" />
                Conferma Acquisto & Attiva Manifesto 3D
                <ArrowRight className="w-5 h-5 ml-1" />
              </button>
            </form>
          ) : (
            /* Admin Direct Edit View */
            <form onSubmit={handleAdminEditSubmit} className="space-y-4">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4">
                <h4 className="font-bold text-purple-300 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Modifica Amministrativa Diretta Spazio Parete
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Stato Manifesto</label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value as 'active' | 'available' | 'pending' })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value="active">Attivo / Occupato</option>
                    <option value="available">Disponibile per Affitto</option>
                    <option value="pending">In Attesa Approvazione</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-yellow-300 mb-1 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    Premio Punti Visione (PTS)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    step="5"
                    value={editForm.pointsReward ?? 50}
                    onChange={(e) => setEditForm({ ...editForm, pointsReward: parseInt(e.target.value, 10) || 50 })}
                    className="w-full bg-black/50 border border-yellow-500/50 rounded-xl px-3 py-2 text-sm text-yellow-300 font-extrabold"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Prezzo / Mese</label>
                  <input
                    type="text"
                    value={editForm.pricePerMonth}
                    onChange={(e) => setEditForm({ ...editForm, pricePerMonth: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Nome Advertiser</label>
                  <input
                    type="text"
                    value={editForm.advertiserName}
                    onChange={(e) => setEditForm({ ...editForm, advertiserName: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Titolo Banner</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs text-slate-300 mb-1">Tagline / Slogan</label>
                  <input
                    type="text"
                    value={editForm.tagline}
                    onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs text-red-300 mb-1 font-semibold flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-red-400" />
                    YouTube Embed Video URL
                  </label>
                  <input
                    type="text"
                    value={editForm.youtubeEmbedUrl || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        youtubeEmbedUrl: e.target.value,
                        mediaType: e.target.value ? 'youtube' : 'image',
                      })
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-black/50 border border-red-500/40 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs text-slate-300 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={editForm.imageUrl}
                    onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs text-slate-300 mb-1">Sito Web URL</label>
                  <input
                    type="text"
                    value={editForm.websiteUrl}
                    onChange={(e) => setEditForm({ ...editForm, websiteUrl: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs text-emerald-300 mb-1 font-semibold">Link Acquisto Esterno (Checkout / E-commerce)</label>
                  <input
                    type="text"
                    value={editForm.externalPurchaseUrl || ''}
                    onChange={(e) => setEditForm({ ...editForm, externalPurchaseUrl: e.target.value })}
                    placeholder="https://meta-tv.net/checkout/sponsor"
                    className="w-full bg-black/50 border border-emerald-500/40 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg transition-all"
              >
                Salva Modifiche Amministrative
              </button>
            </form>
          )}
        </div>
    </div>
  );
};
