import React, { useState } from 'react';
import { Company, Pavilion, Panorama360, SponsorPanel, AdminCollaborator } from '../../types';
import {
  Shield,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle,
  Building,
  Layers,
  Image as ImageIcon,
  Zap,
  Youtube,
  Code,
  Copy,
  Megaphone,
  Users,
  DollarSign,
  Globe,
  PlusCircle,
  X,
  Sparkles,
  ExternalLink,
  Eye,
} from 'lucide-react';

import { PointsRuleConfig } from '../../types';

interface AdminDashboardProps {
  companies: Company[];
  pavilions: Pavilion[];
  panoramas: Panorama360[];
  sponsorPanels?: SponsorPanel[];
  collaborators?: AdminCollaborator[];
  pointsRules?: PointsRuleConfig;
  onUpdateCompanies: (companies: Company[]) => void;
  onUpdatePanoramas: (panoramas: Panorama360[]) => void;
  onUpdateSponsorPanels?: (panels: SponsorPanel[]) => void;
  onUpdateCollaborators?: (collaborators: AdminCollaborator[]) => void;
  onUpdatePointsRules?: (rules: PointsRuleConfig) => void;
  onCreditUserPoints?: (email: string, points: number) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  companies,
  pavilions,
  panoramas,
  sponsorPanels = [],
  collaborators = [],
  pointsRules = {
    dailyLoginPoints: 100,
    favoriteCompanyPoints: 25,
    visitPavilionPoints: 50,
    surveyPoints: 150,
    viewPosterPoints: 30,
    watchVideoPoints: 60,
    listenMusicPoints: 40,
    centerCustomPoints: 80,
    centerCustomLabel: 'Interazione Centro Galleria 3D',
  },
  onUpdateCompanies,
  onUpdatePanoramas,
  onUpdateSponsorPanels,
  onUpdateCollaborators,
  onUpdatePointsRules,
  onCreditUserPoints,
}) => {
  const [activeTab, setActiveTab] = useState<'companies' | 'pavilions' | 'panoramas' | 'sponsors' | 'gamification' | 'embed'>('companies');
  const [localRules, setLocalRules] = useState<PointsRuleConfig>(pointsRules);
  const [creditEmail, setCreditEmail] = useState('');
  const [creditAmount, setCreditAmount] = useState(100);
  const [creditSuccess, setCreditSuccess] = useState('');
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Panorama state
  const [editingPanorama, setEditingPanorama] = useState<Panorama360 | null>(null);
  const [showAddPanoModal, setShowAddPanoModal] = useState(false);
  const [previewPanorama, setPreviewPanorama] = useState<Panorama360 | null>(null);
  const [newPano, setNewPano] = useState<Partial<Panorama360>>({
    title: '',
    category: 'Centro Commerciale 3D',
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1600&q=80',
    description: '',
    iframeUrl: '',
  });

  const handleCreatePanorama = () => {
    if (!newPano.title) return;
    const itemToAdd: Panorama360 = {
      id: `pano-${Date.now()}`,
      title: newPano.title,
      category: newPano.category || 'Centro Commerciale 3D',
      imageUrl: newPano.imageUrl || 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1600&q=80',
      description: newPano.description || '',
      iframeUrl: newPano.iframeUrl || undefined,
    };
    onUpdatePanoramas([...panoramas, itemToAdd]);
    setShowAddPanoModal(false);
    setNewPano({
      title: '',
      category: 'Centro Commerciale 3D',
      imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1600&q=80',
      description: '',
      iframeUrl: '',
    });
  };

  const handleSavePanorama = () => {
    if (editingPanorama) {
      const updated = panoramas.map((p) => (p.id === editingPanorama.id ? editingPanorama : p));
      onUpdatePanoramas(updated);
      setEditingPanorama(null);
    }
  };

  const handleDeletePanorama = (id: string) => {
    onUpdatePanoramas(panoramas.filter((p) => p.id !== id));
  };

  // Sponsor state
  const [editingSponsor, setEditingSponsor] = useState<SponsorPanel | null>(null);
  const [showAddSponsorModal, setShowAddSponsorModal] = useState(false);
  const [sponsorFilter, setSponsorFilter] = useState<'all' | 'active' | 'available'>('all');
  const [newSponsor, setNewSponsor] = useState<Partial<SponsorPanel>>({
    title: 'SPAZIO SPONSOR PARETE DISPONIBILE',
    advertiserName: 'Spazio Libero per Affitto',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
    tagline: 'Clicca qui per acquistare questo Manifesto!',
    description: 'Promuovi il tuo brand sulla parete del centro commerciale 3D.',
    websiteUrl: '',
    positionX: 100,
    side: 'left',
    status: 'available',
    pricePerMonth: '€299 / mese',
    category: 'Standard Sponsor',
  });

  // Collaborator state
  const [showAddCollabModal, setShowAddCollabModal] = useState(false);
  const [newCollab, setNewCollab] = useState<Partial<AdminCollaborator>>({
    name: '',
    email: '',
    role: 'sponsor_collaborator',
    active: true,
  });

  // New company form state
  const [newComp, setNewComp] = useState<Partial<Company>>({
    name: '',
    categoryId: 'shopping',
    subCategory: 'Alta Moda & Retail',
    description: '',
    address: 'Via Roma 1',
    city: 'Roma',
    country: 'Italia',
    lat: 41.9028,
    lng: 12.4964,
    phone: '+39 06 123456',
    email: 'contact@azienda.it',
    website: 'https://azienda.it',
    bonusPowerLink: 'https://bonuspower.net/azienda-promo',
    youtubeVideoId: 'dQw4w9WgXcQ',
    logo: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=300&q=80',
    headerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    products: [],
    offers: [],
    featured: true,
    verified: true,
    rating: 5.0,
  });

  const handleSaveCompany = () => {
    if (editingCompany) {
      const updated = companies.map((c) => (c.id === editingCompany.id ? editingCompany : c));
      onUpdateCompanies(updated);
      setEditingCompany(null);
    }
  };

  const handleDeleteCompany = (id: string) => {
    onUpdateCompanies(companies.filter((c) => c.id !== id));
  };

  const handleCreateCompany = () => {
    if (!newComp.name) return;
    const companyToAdd: Company = {
      ...(newComp as Company),
      id: `comp-${Date.now()}`,
    };
    onUpdateCompanies([...companies, companyToAdd]);
    setShowAddModal(false);
  };

  const fullMallEmbedCode = `<iframe src="${window.location.origin}" width="100%" height="800" frameborder="0" style="border-radius:24px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);" allow="camera; microphone; VR"></iframe>`;

  return (
    <div className="w-full h-full bg-[#050505] text-slate-100 p-6 overflow-y-auto pt-32 sm:pt-36 space-y-6">
      {/* Admin Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-600 to-yellow-200 p-0.5 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-light text-white tracking-[0.15em] uppercase">
              PANNELLO AMMINISTRAZIONE <span className="font-bold text-yellow-500">GLOBAL 3D</span>
            </h2>
            <p className="text-xs text-white/40 uppercase tracking-wider">
              Gestisci aziende, padiglioni, link Bonus-Power, video YouTube e codici embed
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'companies'
                ? 'bg-yellow-500 text-black shadow-[0_0_12px_rgba(212,175,55,0.35)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Gestione Aziende ({companies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pavilions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'pavilions'
                ? 'bg-yellow-500 text-black shadow-[0_0_12px_rgba(212,175,55,0.35)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Padiglioni 3D ({pavilions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('panoramas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'panoramas'
                ? 'bg-yellow-500 text-black shadow-[0_0_12px_rgba(212,175,55,0.35)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Panorami 360° ({panoramas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sponsors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'sponsors'
                ? 'bg-yellow-500 text-black shadow-[0_0_12px_rgba(212,175,55,0.35)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Megaphone className="w-4 h-4 text-cyan-400" />
            <span>Sponsor & Pareti 3D ({sponsorPanels.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gamification')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'gamification'
                ? 'bg-yellow-500 text-black shadow-[0_0_12px_rgba(212,175,55,0.35)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Regole Punti & Coupon</span>
          </button>

          <button
            onClick={() => setActiveTab('embed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'embed'
                ? 'bg-yellow-500 text-black shadow-[0_0_12px_rgba(212,175,55,0.35)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Codice Embed</span>
          </button>
        </div>
      </div>

      {/* Tab: Companies Management */}
      {activeTab === 'companies' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-yellow-500 font-bold text-xs uppercase tracking-widest">Elenco Aziende Partecipanti</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi Nuova Azienda</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((c) => (
              <div
                key={c.id}
                className="bg-[#080808] border border-white/10 p-4 rounded-2xl space-y-3 relative hover:border-yellow-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img src={c.logo} alt={c.name} className="w-12 h-12 rounded-xl object-cover border border-yellow-500/40" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-xs uppercase tracking-wider truncate">{c.name}</h4>
                    <p className="text-[11px] text-white/50 truncate">
                      📍 {c.city}, {c.country} • {c.subCategory}
                    </p>
                  </div>
                </div>

                <div className="text-xs space-y-1 bg-black p-2.5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-1.5 text-yellow-400 truncate">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="font-mono text-[11px] truncate">{c.bonusPowerLink}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-red-400 truncate">
                    <Youtube className="w-3.5 h-3.5" />
                    <span className="font-mono text-[11px] truncate">YouTube: {c.youtubeVideoId}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => setEditingCompany(c)}
                    className="p-2 bg-white/5 hover:bg-white/10 text-yellow-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-white/10"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Modifica
                  </button>
                  <button
                    onClick={() => handleDeleteCompany(c.id)}
                    className="p-2 bg-red-950/80 hover:bg-red-900 text-red-300 rounded-xl text-xs font-bold border border-red-500/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#080808] border border-yellow-500/30 p-6 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-[0_0_40px_rgba(0,0,0,0.9)] space-y-4">
            <h3 className="text-white font-light text-lg tracking-wide uppercase">Modifica <span className="font-bold text-yellow-500">Azienda</span></h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-white/50 block mb-1 uppercase tracking-wider text-[10px]">Nome Azienda</label>
                <input
                  type="text"
                  value={editingCompany.name}
                  onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200"
                />
              </div>

              <div>
                <label className="text-white/50 block mb-1 uppercase tracking-wider text-[10px]">Padiglione Categoria</label>
                <select
                  value={editingCompany.categoryId}
                  onChange={(e) => setEditingCompany({ ...editingCompany, categoryId: e.target.value as any })}
                  className="w-full bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200"
                >
                  {pavilions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-white/50 block mb-1 uppercase tracking-wider text-[10px]">Bonus-Power Link</label>
                <input
                  type="url"
                  value={editingCompany.bonusPowerLink}
                  onChange={(e) => setEditingCompany({ ...editingCompany, bonusPowerLink: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200"
                />
              </div>

              <div>
                <label className="text-white/50 block mb-1 uppercase tracking-wider text-[10px]">YouTube Video ID / URL</label>
                <input
                  type="text"
                  value={editingCompany.youtubeVideoId}
                  onChange={(e) => setEditingCompany({ ...editingCompany, youtubeVideoId: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200"
                />
              </div>

              <div>
                <label className="text-white/50 block mb-1 uppercase tracking-wider text-[10px]">Città & Nazione</label>
                <input
                  type="text"
                  value={editingCompany.city}
                  onChange={(e) => setEditingCompany({ ...editingCompany, city: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setEditingCompany(null)}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 hover:text-white rounded-xl text-xs uppercase tracking-wider font-bold"
              >
                Annulla
              </button>
              <button
                onClick={handleSaveCompany}
                className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Salva Modifiche
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#080808] border border-yellow-500/30 p-6 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-[0_0_40px_rgba(0,0,0,0.9)] space-y-4">
            <h3 className="text-white font-light text-lg tracking-wide uppercase">Aggiungi Nuova Azienda al <span className="font-bold text-yellow-500">Mall 3D</span></h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-white/50 block mb-1 uppercase tracking-wider text-[10px]">Nome Azienda</label>
                <input
                  type="text"
                  value={newComp.name}
                  onChange={(e) => setNewComp({ ...newComp, name: e.target.value })}
                  placeholder="Es. Sarti Italiani 3D"
                  className="w-full bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200"
                />
              </div>

              <div>
                <label className="text-white/50 block mb-1 uppercase tracking-wider text-[10px]">Padiglione</label>
                <select
                  value={newComp.categoryId}
                  onChange={(e) => setNewComp({ ...newComp, categoryId: e.target.value as any })}
                  className="w-full bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200"
                >
                  {pavilions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-white/50 block mb-1 uppercase tracking-wider text-[10px]">Link Bonus-Power Personalizzato</label>
                <input
                  type="url"
                  value={newComp.bonusPowerLink}
                  onChange={(e) => setNewComp({ ...newComp, bonusPowerLink: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-white/50 block mb-1 uppercase tracking-wider text-[10px]">Descrizione</label>
                <textarea
                  value={newComp.description}
                  onChange={(e) => setNewComp({ ...newComp, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200 h-20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 hover:text-white rounded-xl text-xs uppercase tracking-wider font-bold"
              >
                Annulla
              </button>
              <button
                onClick={handleCreateCompany}
                className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" /> Crea Azienda 3D
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Pavilions Overview */}
      {activeTab === 'pavilions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pavilions.map((p) => (
            <div key={p.id} className="p-4 bg-[#080808] border border-white/10 rounded-2xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg font-bold flex items-center justify-center text-black text-xs shadow-md" style={{ backgroundColor: p.color }}>
                  3D
                </div>
                <h4 className="text-white font-bold text-xs uppercase tracking-wider truncate">{p.name}</h4>
              </div>
              <p className="text-[11px] text-yellow-400">{p.tagline}</p>
              <p className="text-[11px] text-white/50 line-clamp-2">{p.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Panorami 360° & Embed Iframe */}
      {activeTab === 'panoramas' && (
        <div className="space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-4 bg-[#080808] p-4 rounded-2xl border border-white/10">
            <div>
              <h3 className="text-yellow-500 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-yellow-400" />
                Gestione Panorami 360° & Embed Virtual Tour / Iframe ({panoramas.length})
              </h3>
              <p className="text-xs text-white/50 mt-1">
                Aggiungi o modifica viste panoramiche 360° equirettangolari oppure integra tour virtuali esterni via Iframe (Matterport, Kuula, StreetView, Panoee).
              </p>
            </div>
            <button
              onClick={() => setShowAddPanoModal(true)}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi Nuovo Panorama / Iframe</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {panoramas.map((p) => (
              <div
                key={p.id}
                className="bg-[#080a10] border border-white/10 hover:border-yellow-500/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  {/* Thumbnail / Iframe indicator */}
                  <div className="relative h-44 bg-black overflow-hidden">
                    {p.iframeUrl ? (
                      <div className="w-full h-full relative">
                        <iframe
                          src={p.iframeUrl}
                          className="w-full h-full pointer-events-none opacity-80"
                          title={p.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-cyan-500 text-black shadow-md border border-cyan-300">
                          Embed Iframe
                        </span>
                      </div>
                    ) : (
                      <div className="w-full h-full relative">
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-yellow-500/90 text-black shadow-md">
                          Foto 360°
                        </span>
                      </div>
                    )}

                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-black/70 backdrop-blur-md text-amber-300 border border-amber-500/40">
                      {p.category}
                    </span>
                  </div>

                  {/* Content details */}
                  <div className="p-4 space-y-2">
                    <h4 className="text-white font-bold text-sm line-clamp-1">{p.title}</h4>
                    <p className="text-slate-300 text-xs line-clamp-2">{p.description || 'Nessuna descrizione specificata.'}</p>

                    {p.iframeUrl && (
                      <div className="text-[11px] font-mono text-cyan-300 bg-black/60 p-2 rounded-xl border border-cyan-500/30 truncate flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{p.iframeUrl}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 pt-2 border-t border-white/10 flex items-center justify-between bg-black/40">
                  <button
                    onClick={() => setPreviewPanorama(p)}
                    className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-yellow-500/30 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" /> Anteprima
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingPanorama(p)}
                      className="p-1.5 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 border border-white/10"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Modifica
                    </button>
                    <button
                      onClick={() => handleDeletePanorama(p.id)}
                      className="p-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 rounded-lg text-xs font-semibold border border-red-500/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Sponsor & Manifesti Pareti 3D */}
      {activeTab === 'sponsors' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#080d1a] border border-cyan-500/30 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold">Totale Manifesti</div>
                <div className="text-xl font-bold text-white">{sponsorPanels.length} Spazi Parete</div>
              </div>
            </div>

            <div className="bg-[#081a10] border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold">Sponsor Attivi</div>
                <div className="text-xl font-bold text-emerald-300">
                  {sponsorPanels.filter((p) => p.status === 'active').length} Occupati
                </div>
              </div>
            </div>

            <div className="bg-[#1a1408] border border-yellow-500/30 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold">Spazi Disponibili</div>
                <div className="text-xl font-bold text-yellow-300">
                  {sponsorPanels.filter((p) => p.status === 'available').length} Acquistabili
                </div>
              </div>
            </div>

            <div className="bg-[#18081a] border border-purple-500/30 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold">Collaboratori Sponsor</div>
                <div className="text-xl font-bold text-purple-300">{collaborators.length} Staff Admin</div>
              </div>
            </div>
          </div>

          {/* Action Header & Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#080808] p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtra Spazi:</span>
              <button
                onClick={() => setSponsorFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  sponsorFilter === 'all' ? 'bg-cyan-500 text-black' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Tutti ({sponsorPanels.length})
              </button>
              <button
                onClick={() => setSponsorFilter('active')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  sponsorFilter === 'active' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Attivi ({sponsorPanels.filter((p) => p.status === 'active').length})
              </button>
              <button
                onClick={() => setSponsorFilter('available')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  sponsorFilter === 'available' ? 'bg-yellow-500 text-black' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Disponibili ({sponsorPanels.filter((p) => p.status === 'available').length})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddCollabModal(true)}
                className="px-3.5 py-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5"
              >
                <Users className="w-4 h-4" />
                + Aggiungi Collaboratore
              </button>

              <button
                onClick={() => setShowAddSponsorModal(true)}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                Aggiungi Spazio Parete 3D
              </button>
            </div>
          </div>

          {/* Grid of Wall Sponsor Banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sponsorPanels
              .filter((p) => sponsorFilter === 'all' || p.status === sponsorFilter)
              .map((panel) => (
                <div
                  key={panel.id}
                  className="bg-[#090d16] border border-white/10 hover:border-cyan-500/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Poster Header Image */}
                    <div className="relative h-36 bg-black overflow-hidden">
                      <img
                        src={panel.imageUrl}
                        alt={panel.title}
                        className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-black/70 backdrop-blur-md text-cyan-300 border border-cyan-500/40">
                        {panel.side === 'left' ? 'Parete Sinistra' : 'Parete Destra'} • X: {panel.positionX}m
                      </div>

                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shadow-lg ${
                            panel.status === 'active'
                              ? 'bg-emerald-500 text-black font-black'
                              : 'bg-yellow-400 text-black font-black'
                          }`}
                        >
                          {panel.status === 'active' ? 'Attivo' : 'Disponibile'}
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 space-y-2">
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                        {panel.advertiserName}
                      </div>
                      <h4 className="text-white font-bold text-sm line-clamp-1">{panel.title}</h4>
                      <p className="text-slate-300 text-xs line-clamp-2">{panel.tagline}</p>
                    </div>
                  </div>

                  {/* Footer & Controls */}
                  <div className="p-4 pt-2 border-t border-white/10 flex items-center justify-between bg-black/30">
                    <span className="text-xs font-bold text-yellow-400">{panel.pricePerMonth}</span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingSponsor(panel)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-cyan-300 hover:text-cyan-200 text-xs flex items-center gap-1 font-semibold"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Modifica
                      </button>

                      {onUpdateSponsorPanels && (
                        <button
                          onClick={() => {
                            onUpdateSponsorPanels(sponsorPanels.filter((p) => p.id !== panel.id));
                          }}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Admin Collaborators List */}
          <div className="bg-[#080c16] border border-purple-500/30 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  Collaboratori & Gestori Commerciali Admin
                </h3>
                <p className="text-xs text-slate-400">
                  Gestisci i collaboratori autorizzati a caricare, modificare ed approvare i manifesti pubblicitari.
                </p>
              </div>

              <button
                onClick={() => setShowAddCollabModal(true)}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" /> Nuovo Collaboratore
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {collaborators.map((c) => (
                <div key={c.id} className="p-4 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-white">{c.name}</div>
                    <div className="text-xs text-slate-400">{c.email}</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] uppercase font-bold">
                      {c.role === 'sponsor_collaborator'
                        ? 'Commerciale Sponsor'
                        : c.role === 'content_manager'
                        ? 'Gestore Contenuti'
                        : 'Admin Globale'}
                    </span>
                  </div>

                  {onUpdateCollaborators && (
                    <button
                      onClick={() => onUpdateCollaborators(collaborators.filter((item) => item.id !== c.id))}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Sponsor Panel */}
      {showAddSponsorModal && onUpdateSponsorPanels && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#090d16] border border-yellow-500/40 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-yellow-400" />
                Crea Nuovo Spazio Parete 3D
              </h3>
              <button onClick={() => setShowAddSponsorModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Parete Strategica</label>
                <select
                  value={newSponsor.side}
                  onChange={(e) => setNewSponsor({ ...newSponsor, side: e.target.value as 'left' | 'right' })}
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="left">Parete Sinistra (Z = -9.8m)</option>
                  <option value="right">Parete Destra (Z = +9.8m)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Posizione X (metri lungo corridoio)</label>
                <input
                  type="number"
                  value={newSponsor.positionX}
                  onChange={(e) => setNewSponsor({ ...newSponsor, positionX: Number(e.target.value) })}
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Titolo Manifesto</label>
                <input
                  type="text"
                  value={newSponsor.title}
                  onChange={(e) => setNewSponsor({ ...newSponsor, title: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Brand / Advertiser</label>
                <input
                  type="text"
                  value={newSponsor.advertiserName}
                  onChange={(e) => setNewSponsor({ ...newSponsor, advertiserName: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-slate-300 mb-1">Slogan / Tagline</label>
                <input
                  type="text"
                  value={newSponsor.tagline}
                  onChange={(e) => setNewSponsor({ ...newSponsor, tagline: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-slate-300 mb-1">URL Immagine Manifesto</label>
                <input
                  type="text"
                  value={newSponsor.imageUrl}
                  onChange={(e) => setNewSponsor({ ...newSponsor, imageUrl: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Stato Iniziale</label>
                  <select
                    value={newSponsor.status}
                    onChange={(e) => setNewSponsor({ ...newSponsor, status: e.target.value as 'active' | 'available' })}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value="available">Disponibile per Affitto</option>
                    <option value="active">Occupato / Attivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Prezzo / Mese</label>
                  <input
                    type="text"
                    value={newSponsor.pricePerMonth}
                    onChange={(e) => setNewSponsor({ ...newSponsor, pricePerMonth: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-yellow-300 mb-1 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Premio Punti Visione (PTS) per Utenti
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  step="5"
                  value={newSponsor.pointsReward ?? 50}
                  onChange={(e) => setNewSponsor({ ...newSponsor, pointsReward: parseInt(e.target.value, 10) || 50 })}
                  className="w-full bg-black border border-yellow-500/50 rounded-xl px-3 py-2 text-sm text-yellow-300 font-extrabold"
                />
              </div>
            </div>

            <button
              onClick={() => {
                const itemToAdd: SponsorPanel = {
                  ...(newSponsor as SponsorPanel),
                  id: `sp-${Date.now()}`,
                };
                onUpdateSponsorPanels([...sponsorPanels, itemToAdd]);
                setShowAddSponsorModal(false);
              }}
              className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-sm uppercase tracking-wider transition-all shadow-md mt-2"
            >
              Conferma & Crea Spazio Parete 3D
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add Admin Collaborator */}
      {showAddCollabModal && onUpdateCollaborators && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#090d16] border border-purple-500/40 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Aggiungi Collaboratore Commerciale
              </h3>
              <button onClick={() => setShowAddCollabModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Nome & Cognome</label>
                <input
                  type="text"
                  value={newCollab.name}
                  onChange={(e) => setNewCollab({ ...newCollab, name: e.target.value })}
                  placeholder="Es. Mario Rossi"
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={newCollab.email}
                  onChange={(e) => setNewCollab({ ...newCollab, email: e.target.value })}
                  placeholder="mario.rossi@azienda.it"
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Ruolo Autorizzazioni</label>
                <select
                  value={newCollab.role}
                  onChange={(e) =>
                    setNewCollab({
                      ...newCollab,
                      role: e.target.value as 'sponsor_collaborator' | 'content_manager' | 'admin',
                    })
                  }
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="sponsor_collaborator">Commerciale Sponsor / Manifesti</option>
                  <option value="content_manager">Gestore Contenuti & Video</option>
                  <option value="admin">Amministratore Completo</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                if (!newCollab.name || !newCollab.email) return;
                const itemToAdd: AdminCollaborator = {
                  ...(newCollab as AdminCollaborator),
                  id: `collab-${Date.now()}`,
                };
                onUpdateCollaborators([...collaborators, itemToAdd]);
                setShowAddCollabModal(false);
              }}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm uppercase tracking-wider transition-all shadow-md"
            >
              Salva Collaboratore
            </button>
          </div>
        </div>
      )}

      {/* Edit Sponsor Modal */}
      {editingSponsor && onUpdateSponsorPanels && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#090d16] border border-cyan-500/40 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-cyan-400" />
                Modifica Manifesto Parete 3D
              </h3>
              <button onClick={() => setEditingSponsor(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Titolo Manifesto</label>
                <input
                  type="text"
                  value={editingSponsor.title}
                  onChange={(e) => setEditingSponsor({ ...editingSponsor, title: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Brand / Advertiser</label>
                <input
                  type="text"
                  value={editingSponsor.advertiserName}
                  onChange={(e) => setEditingSponsor({ ...editingSponsor, advertiserName: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Tagline / Slogan</label>
                <input
                  type="text"
                  value={editingSponsor.tagline}
                  onChange={(e) => setEditingSponsor({ ...editingSponsor, tagline: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">URL Immagine Poster</label>
                <input
                  type="text"
                  value={editingSponsor.imageUrl}
                  onChange={(e) => setEditingSponsor({ ...editingSponsor, imageUrl: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-emerald-300 mb-1 font-semibold flex items-center gap-1">
                  <ExternalLink className="w-3.5 h-3.5" /> Link Esterno per Acquisto (Stripe / PayPal / E-commerce)
                </label>
                <input
                  type="text"
                  value={editingSponsor.externalPurchaseUrl || ''}
                  onChange={(e) => setEditingSponsor({ ...editingSponsor, externalPurchaseUrl: e.target.value })}
                  placeholder="https://meta-tv.net/checkout/sponsor"
                  className="w-full bg-black border border-emerald-500/40 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Stato</label>
                  <select
                    value={editingSponsor.status}
                    onChange={(e) =>
                      setEditingSponsor({ ...editingSponsor, status: e.target.value as 'active' | 'available' })
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value="active">Occupato / Attivo</option>
                    <option value="available">Disponibile</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Prezzo / Mese</label>
                  <input
                    type="text"
                    value={editingSponsor.pricePerMonth}
                    onChange={(e) => setEditingSponsor({ ...editingSponsor, pricePerMonth: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-yellow-300 mb-1 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Premio Punti Visione (PTS) per Utenti
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  step="5"
                  value={editingSponsor.pointsReward ?? 50}
                  onChange={(e) =>
                    setEditingSponsor({ ...editingSponsor, pointsReward: parseInt(e.target.value, 10) || 50 })
                  }
                  className="w-full bg-black border border-yellow-500/50 rounded-xl px-3 py-2 text-sm text-yellow-300 font-extrabold"
                />
              </div>
            </div>

            <button
              onClick={() => {
                const updated = sponsorPanels.map((s) => (s.id === editingSponsor.id ? editingSponsor : s));
                onUpdateSponsorPanels(updated);
                setEditingSponsor(null);
              }}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-sm uppercase tracking-wider transition-all shadow-md"
            >
              Salva Modifiche Manifesto
            </button>
          </div>
        </div>
      )}

      {/* Tab: Regole Punti & Gamification */}
      {activeTab === 'gamification' && (
        <div className="space-y-6">
          <div className="bg-[#080808] p-5 rounded-2xl border border-yellow-500/40 shadow-xl space-y-2">
            <h3 className="text-yellow-400 font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Pannello Amministratore: Regole Accumulo Punti & Privacy Cliente
            </h3>
            <p className="text-xs text-slate-300">
              Imposta quanti punti Bonus-Power assegnare agli utenti per ogni azione e gestisci l'accredito manuale dei punti.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box 1: Configurazione Valore Punti */}
            <div className="p-5 bg-zinc-950 rounded-2xl border border-white/10 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Regole Assegnazione Punti Automatica
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    Bonus Giornaliero Login (PTS)
                  </label>
                  <input
                    type="number"
                    value={localRules.dailyLoginPoints}
                    onChange={(e) => setLocalRules({ ...localRules, dailyLoginPoints: Number(e.target.value) })}
                    className="w-full bg-black border border-white/15 p-2.5 rounded-xl text-yellow-300 font-bold"
                  />
                  <span className="text-[10px] text-slate-400">Punti assegnati ogni 24 ore alla prima visita del cliente.</span>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    Salvataggio Azienda nei Preferiti (PTS)
                  </label>
                  <input
                    type="number"
                    value={localRules.favoriteCompanyPoints}
                    onChange={(e) => setLocalRules({ ...localRules, favoriteCompanyPoints: Number(e.target.value) })}
                    className="w-full bg-black border border-white/15 p-2.5 rounded-xl text-yellow-300 font-bold"
                  />
                  <span className="text-[10px] text-slate-400">Punti accreditati quando l'utente clicca il cuore ❤️ su una scheda azienda.</span>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    Esplorazione Padiglione 3D (PTS)
                  </label>
                  <input
                    type="number"
                    value={localRules.visitPavilionPoints}
                    onChange={(e) => setLocalRules({ ...localRules, visitPavilionPoints: Number(e.target.value) })}
                    className="w-full bg-black border border-white/15 p-2.5 rounded-xl text-yellow-300 font-bold"
                  />
                  <span className="text-[10px] text-slate-400">Punti per l'ingresso nei vari settori e padiglioni della fiera.</span>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    Compilazione Sondaggio / Feedback (PTS)
                  </label>
                  <input
                    type="number"
                    value={localRules.surveyPoints}
                    onChange={(e) => setLocalRules({ ...localRules, surveyPoints: Number(e.target.value) })}
                    className="w-full bg-black border border-white/15 p-2.5 rounded-xl text-yellow-300 font-bold"
                  />
                </div>

                <div className="pt-2 border-t border-white/10 space-y-3">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    🖼️ 🎬 🎵 PUNTI MEDIA & INTERAZIONI CENTRO COMMERCIALE
                  </span>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      🖼️ Visione Manifesto / Banner Pubblicitario (PTS)
                    </label>
                    <input
                      type="number"
                      value={localRules.viewPosterPoints || 30}
                      onChange={(e) => setLocalRules({ ...localRules, viewPosterPoints: Number(e.target.value) })}
                      className="w-full bg-black border border-amber-500/30 p-2.5 rounded-xl text-yellow-300 font-bold"
                    />
                    <span className="text-[10px] text-slate-400">Punti accreditati quando l'utente apre/guarda un manifesto della galleria.</span>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      🎬 Visione Video Promo / YouTube 3D (PTS)
                    </label>
                    <input
                      type="number"
                      value={localRules.watchVideoPoints || 60}
                      onChange={(e) => setLocalRules({ ...localRules, watchVideoPoints: Number(e.target.value) })}
                      className="w-full bg-black border border-amber-500/30 p-2.5 rounded-xl text-yellow-300 font-bold"
                    />
                    <span className="text-[10px] text-slate-400">Punti assegnati alla visione dei video promozionali e tour nei mini-siti.</span>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      🎵 Ascolto Musica / Stream Audio Galleria (PTS)
                    </label>
                    <input
                      type="number"
                      value={localRules.listenMusicPoints || 40}
                      onChange={(e) => setLocalRules({ ...localRules, listenMusicPoints: Number(e.target.value) })}
                      className="w-full bg-black border border-amber-500/30 p-2.5 rounded-xl text-yellow-300 font-bold"
                    />
                    <span className="text-[10px] text-slate-400">Punti per l'ascolto della musica o radio di sottofondo della Galleria 3D.</span>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      🏛️ Attività Centro Commerciale (PTS)
                    </label>
                    <input
                      type="number"
                      value={localRules.centerCustomPoints || 80}
                      onChange={(e) => setLocalRules({ ...localRules, centerCustomPoints: Number(e.target.value) })}
                      className="w-full bg-black border border-amber-500/30 p-2.5 rounded-xl text-yellow-300 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      ✏️ Titolo Attività Centro Personalizzata Admin
                    </label>
                    <input
                      type="text"
                      value={localRules.centerCustomLabel || 'Interazione Centro Galleria 3D'}
                      onChange={(e) => setLocalRules({ ...localRules, centerCustomLabel: e.target.value })}
                      placeholder="es. Partecipazione Evento Plaza 3D"
                      className="w-full bg-black border border-white/15 p-2.5 rounded-xl text-white font-semibold"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onUpdatePointsRules) onUpdatePointsRules(localRules);
                    alert('Regole punti salvate con successo!');
                  }}
                  className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold uppercase text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Salva Regole Punti Admin</span>
                </button>
              </div>
            </div>

            {/* Box 2: Accredito Manuale & Policy Privacy */}
            <div className="space-y-4">
              <div className="p-5 bg-zinc-950 rounded-2xl border border-white/10 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  Accredito Manuale Punti ad Utente
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Email Cliente / Username</label>
                    <input
                      type="text"
                      value={creditEmail}
                      onChange={(e) => setCreditEmail(e.target.value)}
                      placeholder="es. cliente@email.it"
                      className="w-full bg-black border border-white/15 p-2.5 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Quantità Punti Bonus-Power da Assegnare</label>
                    <input
                      type="number"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(Number(e.target.value))}
                      className="w-full bg-black border border-white/15 p-2.5 rounded-xl text-yellow-300 font-bold"
                    />
                  </div>

                  {creditSuccess && (
                    <div className="p-2 bg-green-500/20 border border-green-500/40 text-green-300 text-xs font-bold rounded-xl">
                      {creditSuccess}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (!creditEmail) {
                        alert('Inserisci un indirizzo email valido.');
                        return;
                      }
                      if (onCreditUserPoints) {
                        onCreditUserPoints(creditEmail, creditAmount);
                      }
                      setCreditSuccess(`Inviati +${creditAmount} Punti Bonus-Power a ${creditEmail}!`);
                      setTimeout(() => setCreditSuccess(''), 3000);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-200 text-black font-extrabold uppercase text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-black" />
                    <span>Accredita Punti a Cliente</span>
                  </button>
                </div>
              </div>

              {/* Architecture & Privacy Note */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2 text-xs">
                <h5 className="font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-yellow-400" />
                  Architettura Login & Privacy Semplificata
                </h5>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  <strong>1. Esplorazione Libera per Tutti:</strong> I visitatori possono percorrere la fiera 3D, entrare nei padiglioni, visualizzare le schede aziendali e i tour 360° senza alcuna registrazione.
                </p>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  <strong>2. Registrazione Minimale Privacy-First:</strong> Quando il cliente intende accumulare punti, salvare preferiti o riscattare coupon, effettua la registrazione chiedendo esclusivamente <strong>Username, Email e Password</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Embed Code */}
      {activeTab === 'embed' && (
        <div className="bg-[#080808] border border-yellow-500/30 p-6 rounded-3xl space-y-4 max-w-3xl">
          <h3 className="text-white font-light text-lg tracking-wide uppercase flex items-center gap-2">
            <Code className="w-5 h-5 text-yellow-500" />
            <span>Generatore Codice Embed <span className="font-bold text-yellow-500">Iframe Globale</span></span>
          </h3>
          <p className="text-xs text-white/60">
            Copia ed incolla questo frammento HTML nel tuo sito per integrare l'intero Centro Commerciale Virtuale 3D Meta-TV!
          </p>

          <div className="relative">
            <code className="block p-4 bg-black rounded-2xl text-yellow-300 text-xs font-mono break-all border border-white/10">
              {fullMallEmbedCode}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(fullMallEmbedCode);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
              className="absolute top-3 right-3 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1 shadow-md"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedCode ? 'Copiato!' : 'Copia Codice'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add New Panorama / Iframe */}
      {showAddPanoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#080808] border border-yellow-500/40 p-6 rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-[0_0_50px_rgba(245,158,11,0.2)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-white font-light text-lg tracking-wide uppercase flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-yellow-400" />
                Aggiungi <span className="font-bold text-yellow-500">Panorama 360° / Embed Iframe</span>
              </h3>
              <button onClick={() => setShowAddPanoModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-white/60 block mb-1 uppercase tracking-wider text-[10px] font-bold">Titolo Panorama / Ambience</label>
                <input
                  type="text"
                  value={newPano.title}
                  onChange={(e) => setNewPano({ ...newPano, title: e.target.value })}
                  placeholder="Es. Plaza Galleria Est 360°"
                  className="w-full bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200 focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1 uppercase tracking-wider text-[10px] font-bold">Categoria</label>
                <input
                  type="text"
                  value={newPano.category}
                  onChange={(e) => setNewPano({ ...newPano, category: e.target.value })}
                  placeholder="Es. Centro Commerciale, Area VIP, Food Court"
                  className="w-full bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200 focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1 uppercase tracking-wider text-[10px] font-bold">URL Immagine Panorama 360° (Equirettangolare)</label>
                <input
                  type="url"
                  value={newPano.imageUrl}
                  onChange={(e) => setNewPano({ ...newPano, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200 focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-cyan-400 block mb-1 uppercase tracking-wider text-[10px] font-bold flex items-center gap-1">
                  <ExternalLink className="w-3.5 h-3.5" /> URL Embed Iframe Opzionale (Matterport, Kuula, StreetView, Panoee)
                </label>
                <input
                  type="url"
                  value={newPano.iframeUrl || ''}
                  onChange={(e) => setNewPano({ ...newPano, iframeUrl: e.target.value })}
                  placeholder="https://my.matterport.com/show/?m=... oppure https://kuula.co/share/..."
                  className="w-full bg-zinc-950 border border-cyan-500/40 p-2.5 rounded-xl text-cyan-200 focus:border-cyan-400 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Se inserito, il tour virtuale verrà integrato direttamente via Iframe interattivo a schermo intero.</p>
              </div>

              <div>
                <label className="text-white/60 block mb-1 uppercase tracking-wider text-[10px] font-bold">Descrizione</label>
                <textarea
                  value={newPano.description}
                  onChange={(e) => setNewPano({ ...newPano, description: e.target.value })}
                  placeholder="Descrizione dettagliata dell'ambiente 360°..."
                  className="w-full bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200 h-20 focus:border-yellow-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowAddPanoModal(false)}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 hover:text-white rounded-xl text-xs uppercase tracking-wider font-bold"
              >
                Annulla
              </button>
              <button
                onClick={handleCreatePanorama}
                className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-xs uppercase tracking-wider font-extrabold flex items-center gap-1.5 shadow-md"
              >
                <CheckCircle className="w-4 h-4" /> Salva Panorama 360°
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Panorama */}
      {editingPanorama && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#080808] border border-yellow-500/40 p-6 rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-[0_0_50px_rgba(245,158,11,0.2)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-white font-light text-lg tracking-wide uppercase flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-yellow-400" />
                Modifica <span className="font-bold text-yellow-500">Panorama 360°</span>
              </h3>
              <button onClick={() => setEditingPanorama(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-white/60 block mb-1 uppercase tracking-wider text-[10px] font-bold">Titolo</label>
                <input
                  type="text"
                  value={editingPanorama.title}
                  onChange={(e) => setEditingPanorama({ ...editingPanorama, title: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1 uppercase tracking-wider text-[10px] font-bold">Categoria</label>
                <input
                  type="text"
                  value={editingPanorama.category}
                  onChange={(e) => setEditingPanorama({ ...editingPanorama, category: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1 uppercase tracking-wider text-[10px] font-bold">URL Immagine 360°</label>
                <input
                  type="url"
                  value={editingPanorama.imageUrl}
                  onChange={(e) => setEditingPanorama({ ...editingPanorama, imageUrl: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200"
                />
              </div>

              <div>
                <label className="text-cyan-400 block mb-1 uppercase tracking-wider text-[10px] font-bold flex items-center gap-1">
                  <ExternalLink className="w-3.5 h-3.5" /> URL Embed Iframe Opzionale
                </label>
                <input
                  type="url"
                  value={editingPanorama.iframeUrl || ''}
                  onChange={(e) => setEditingPanorama({ ...editingPanorama, iframeUrl: e.target.value })}
                  className="w-full bg-zinc-950 border border-cyan-500/40 p-2.5 rounded-xl text-cyan-200"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1 uppercase tracking-wider text-[10px] font-bold">Descrizione</label>
                <textarea
                  value={editingPanorama.description}
                  onChange={(e) => setEditingPanorama({ ...editingPanorama, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200 h-20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setEditingPanorama(null)}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 hover:text-white rounded-xl text-xs uppercase tracking-wider font-bold"
              >
                Annulla
              </button>
              <button
                onClick={handleSavePanorama}
                className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-xs uppercase tracking-wider font-extrabold flex items-center gap-1.5 shadow-md"
              >
                <Save className="w-4 h-4" /> Salva Modifiche
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Live Panorama / Iframe Preview */}
      {previewPanorama && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col p-4 sm:p-6">
          <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-2xl border border-yellow-500/40 mb-4 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400 font-bold text-sm">
                360°
              </span>
              <div>
                <h3 className="text-white font-extrabold text-sm uppercase tracking-wider">{previewPanorama.title}</h3>
                <p className="text-xs text-slate-400">{previewPanorama.description}</p>
              </div>
            </div>
            <button
              onClick={() => setPreviewPanorama(null)}
              className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <X className="w-4 h-4" /> Chiudi Anteprima
            </button>
          </div>

          <div className="flex-1 w-full h-full rounded-2xl overflow-hidden border border-white/15 bg-black relative">
            {previewPanorama.iframeUrl ? (
              <iframe
                src={previewPanorama.iframeUrl}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; vr"
                allowFullScreen
                title={previewPanorama.title}
              />
            ) : (
              <div className="w-full h-full relative flex items-center justify-center">
                <img
                  src={previewPanorama.imageUrl}
                  alt={previewPanorama.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-yellow-500/30 text-amber-300 text-xs font-semibold max-w-xl">
                  📍 Vista Equirettangolare 360°: {previewPanorama.title}. Nel visualizzatore 3D principale è possibile ruotare la fotocamera a 360°.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
