import React, { useState } from 'react';
import { Company } from '../../types';
import {
  X,
  ExternalLink,
  Zap,
  Tag,
  Phone,
  Mail,
  MapPin,
  Globe,
  Youtube,
  QrCode,
  Code,
  CheckCircle2,
  Copy,
  Star,
  ShoppingBag,
  Compass,
} from 'lucide-react';
import { CompanyVirtualTourViewer } from '../3d/CompanyVirtualTourViewer';

interface CompanyMiniSiteModalProps {
  company: Company | null;
  onClose: () => void;
  onUpdateCompany: (updatedCompany: Company) => void;
}

export const CompanyMiniSiteModal: React.FC<CompanyMiniSiteModalProps> = ({
  company,
  onClose,
  onUpdateCompany,
}) => {
  if (!company) return null;

  const [bonusLinkInput, setBonusLinkInput] = useState(company.bonusPowerLink);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [showVirtualTour, setShowVirtualTour] = useState(false);

  const embedSnippet = `<iframe src="${window.location.origin}/embed/company/${company.id}" width="100%" height="650" frameborder="0" style="border-radius:24px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);"></iframe>`;

  const handleSaveBonusLink = () => {
    onUpdateCompany({
      ...company,
      bonusPowerLink: bonusLinkInput,
    });
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2500);
  };

  // Generate YouTube embed link
  const getYouTubeEmbedUrl = (idOrUrl: string) => {
    if (!idOrUrl) return null;
    if (idOrUrl.includes('youtube.com') || idOrUrl.includes('youtu.be')) {
      const match = idOrUrl.match(/(?:v=|\/)([\w-]{11})/);
      return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    }
    return `https://www.youtube.com/embed/${idOrUrl}`;
  };

  const youtubeUrl = getYouTubeEmbedUrl(company.youtubeVideoId);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#080808] border border-yellow-500/30 rounded-3xl max-w-4xl w-full my-8 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] text-slate-100 relative animate-in fade-in zoom-in-95">
        {/* Header Image Banner */}
        <div className="relative h-56 sm:h-72 w-full overflow-hidden">
          <img
            src={company.headerImage}
            alt={company.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/80 hover:bg-black text-white/70 hover:text-white border border-white/20 flex items-center justify-center transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo & Basic Info */}
          <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <img
                src={company.logo}
                alt={company.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-yellow-500 shadow-[0_0_20px_rgba(212,175,55,0.4)] bg-black"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-light tracking-wide text-white uppercase">{company.name}</h2>
                  {company.verified && <CheckCircle2 className="w-5 h-5 text-yellow-500" title="Azienda Verificata" />}
                </div>
                <p className="text-xs sm:text-sm text-white/60 flex items-center gap-2 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-yellow-500" />
                  <span>{company.address}, {company.city} ({company.country})</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                    {company.subCategory}
                  </span>
                  <div className="flex items-center text-yellow-400 text-xs font-bold gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                    <span>{company.rating} / 5.0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Header Action Buttons: Virtual Tour 360° & Direct Bonus-Power Link */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowVirtualTour(true)}
                className="px-4 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 hover:from-yellow-400 hover:to-yellow-200 text-black font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-[0_0_25px_rgba(255,215,0,0.5)] flex items-center gap-2 transform hover:scale-105 transition-all border border-yellow-200"
              >
                <Compass className="w-4 h-4 text-black animate-spin" style={{ animationDuration: '10s' }} />
                <span>Virtual Tour 360°</span>
              </button>

              <a
                href={company.bonusPowerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center gap-2 transform hover:scale-105 transition-all"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>Apri in Bonus-Power</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Mini-site Content Body */}
        <div className="p-6 space-y-8 max-h-[60vh] overflow-y-auto">
          {/* Editable Bonus-Power Link & Embed Code Bar */}
          <div className="bg-black/80 p-4 rounded-2xl border border-yellow-500/25 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Campo "Bonus-Power Link" Modificabile:</span>
              </label>

              <button
                onClick={() => setShowEmbedCode(!showEmbedCode)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-white/10"
              >
                <Code className="w-3.5 h-3.5 text-yellow-500" />
                <span>Codice Embed Iframe</span>
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                value={bonusLinkInput}
                onChange={(e) => setBonusLinkInput(e.target.value)}
                placeholder="https://bonuspower.net/..."
                className="flex-1 bg-zinc-950 border border-white/15 px-3 py-2 rounded-xl text-xs text-yellow-200 focus:outline-none focus:border-yellow-500"
              />
              <button
                onClick={handleSaveBonusLink}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Salva Link
              </button>
            </div>

            {/* Embed Code Snippet Modal Display */}
            {showEmbedCode && (
              <div className="p-3 bg-zinc-950 rounded-xl border border-yellow-500/30 text-xs space-y-2 mt-2">
                <div className="flex items-center justify-between text-white/80 font-bold">
                  <span>Incolla questo codice nel tuo sito web:</span>
                  <button
                    onClick={handleCopyEmbed}
                    className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 font-bold text-[11px] uppercase tracking-wider"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedEmbed ? 'Copiato!' : 'Copia'}</span>
                  </button>
                </div>
                <code className="block p-2 bg-black rounded text-yellow-300 text-[10px] font-mono break-all border border-white/10">
                  {embedSnippet}
                </code>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-yellow-500 font-bold text-xs mb-2 uppercase tracking-widest">Descrizione Aziendale</h3>
            <p className="text-sm text-white/80 leading-relaxed bg-black/50 p-4 rounded-2xl border border-white/10">
              {company.description}
            </p>
          </div>

          {/* YouTube Video Section */}
          {youtubeUrl && (
            <div>
              <h3 className="text-yellow-500 font-bold text-xs mb-3 uppercase tracking-widest flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>Video Presentazione YouTube</span>
              </h3>
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                <iframe
                  src={youtubeUrl}
                  title={company.name}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Active Offers Section */}
          {company.offers && company.offers.length > 0 && (
            <div>
              <h3 className="text-yellow-500 font-bold text-xs mb-3 uppercase tracking-widest flex items-center gap-2">
                <Tag className="w-4 h-4 text-yellow-500" />
                <span>Offerte Esclusive & Codici Sconto</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {company.offers.map((off) => (
                  <div
                    key={off.id}
                    className="p-4 bg-gradient-to-br from-zinc-950 to-black border border-yellow-500/30 rounded-2xl space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-yellow-500 text-black uppercase tracking-wider">
                        {off.discount}
                      </span>
                      <span className="text-[10px] text-yellow-400 font-mono">Scade in {off.expiresIn}</span>
                    </div>
                    <h4 className="text-white font-bold text-xs">{off.title}</h4>
                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                      <code className="text-yellow-400 font-mono font-bold bg-black px-2 py-1 rounded border border-white/15">
                        {off.code}
                      </code>
                      <span className="text-yellow-400 text-[11px] font-semibold">⚡ {off.bonusPowerBonus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products/Services Catalog */}
          {company.products && company.products.length > 0 && (
            <div>
              <h3 className="text-yellow-500 font-bold text-xs mb-3 uppercase tracking-widest flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-yellow-500" />
                <span>Prodotti & Servizi in Vetrina</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {company.products.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 bg-black/60 border border-white/10 rounded-2xl flex gap-3 items-center hover:border-yellow-500/40 transition-all"
                  >
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-20 h-20 rounded-xl object-cover border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      {prod.tag && (
                        <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest">
                          {prod.tag}
                        </span>
                      )}
                      <h4 className="text-white font-bold text-xs truncate">{prod.name}</h4>
                      <p className="text-[11px] text-white/50 line-clamp-2">{prod.description}</p>
                      <span className="text-yellow-400 font-black text-xs block mt-1">{prod.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contacts & QR Code Footer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="space-y-2 text-xs text-white/70">
              <h4 className="text-yellow-500 font-bold uppercase tracking-widest text-[10px]">Contatti Diretti</h4>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-yellow-500" /> {company.phone}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-yellow-500" /> {company.email}
              </p>
              <p className="flex items-center gap-2 truncate">
                <Globe className="w-3.5 h-3.5 text-yellow-500" /> {company.website}
              </p>
            </div>

            {/* QR Code section */}
            <div className="md:col-span-2 bg-black/80 p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-yellow-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-yellow-500" />
                  <span>QR Code Bonus-Power</span>
                </h4>
                <p className="text-[11px] text-white/50 mt-1">
                  Inquadra col telefono per aprire direttamente il link aziendale Bonus-Power.
                </p>
              </div>

              {/* Stylized QR placeholder svg */}
              <div className="w-16 h-16 bg-white p-1 rounded-xl flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-full h-full fill-black">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v4h-4v-4zm-4 4h4v4h-4v-4zm0-4h4v4h-4v-4zm4-4h4v4h-4v-4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen 360 Virtual Tour Modal */}
      {showVirtualTour && (
        <CompanyVirtualTourViewer
          company={company}
          onClose={() => setShowVirtualTour(false)}
        />
      )}
    </div>
  );
};
