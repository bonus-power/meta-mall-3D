import React, { useState } from 'react';
import { Company, Product, Offer, VirtualTourHotspot, VirtualTourScene } from '../../types';
import {
  Store,
  Save,
  Plus,
  Trash2,
  Zap,
  Youtube,
  Tag,
  ShoppingBag,
  Code,
  Copy,
  Compass,
  Camera,
  Eye,
  BarChart3,
  TrendingUp,
  Users,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Layers,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  Check,
  QrCode,
  ShieldCheck,
  DoorOpen,
  ArrowUpRight,
  Download,
} from 'lucide-react';
import { CompanyVirtualTourViewer } from '../3d/CompanyVirtualTourViewer';

interface BusinessDashboardProps {
  companies: Company[];
  onUpdateCompany: (updated: Company) => void;
}

type TabType = 'overview' | 'profile' | 'catalog' | 'tour360' | 'billing' | 'embed';

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  companies,
  onUpdateCompany,
}) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companies[0]?.id || '');
  const activeCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0];

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [formData, setFormData] = useState<Company>(activeCompany);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showTourPreview, setShowTourPreview] = useState(false);

  // Active scene selected for editing in virtual tour
  const [selectedSceneId, setSelectedSceneId] = useState<string>('scene-1');

  // Hotspot creation state
  const [newHotspot, setNewHotspot] = useState<Partial<VirtualTourHotspot>>({
    label: '🌐 Visita Punto d\'Interesse',
    actionType: 'info',
    yaw: 0,
    pitch: 0,
    points: 10,
    targetSceneId: '',
  });

  // New product form
  const [newProd, setNewProd] = useState<Partial<Product>>({
    name: '',
    price: '€ 99,00',
    description: '',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80',
    tag: 'Novità',
  });

  // New offer form
  const [newOffer, setNewOffer] = useState<Partial<Offer>>({
    title: 'Sconto 20% Esclusivo Bonus-Power',
    discount: '-20%',
    code: 'POWER20',
    expiresIn: '7 giorni',
    bonusPowerBonus: '100 Punti Power',
  });

  // Helper to retrieve current tour scenes
  const getTourScenes = (): VirtualTourScene[] => {
    if (formData.virtualTour?.scenes && formData.virtualTour.scenes.length > 0) {
      return formData.virtualTour.scenes;
    }
    return [
      {
        id: 'scene-1',
        name: '1. Ambiente Principale',
        panoramaUrl:
          formData.virtualTour?.panoramaUrl ||
          formData.headerImage ||
          'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2000&q=80',
        hotspots: formData.virtualTour?.hotspots || [],
      },
    ];
  };

  const tourScenes = getTourScenes();
  const currentScene = tourScenes.find((s) => s.id === selectedSceneId) || tourScenes[0];

  const handleSelectCompanyChange = (id: string) => {
    setSelectedCompanyId(id);
    const comp = companies.find((c) => c.id === id);
    if (comp) setFormData(comp);
  };

  const handleSave = () => {
    onUpdateCompany(formData);
    alert('✅ Profilo Aziendale & Impostazioni SaaS Salvati con Successo!');
  };

  // Add new room/scene to virtual tour
  const handleAddScene = () => {
    const newId = `scene-${Date.now()}`;
    const newScene: VirtualTourScene = {
      id: newId,
      name: `${tourScenes.length + 1}. Nuova Stanza / Ambiente`,
      panoramaUrl:
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80',
      hotspots: [],
    };
    const updatedScenes = [...tourScenes, newScene];
    const updated = {
      ...formData,
      virtualTour: {
        ...(formData.virtualTour || {
          enabled: true,
          title: `Virtual Tour 360° - ${formData.name}`,
        }),
        scenes: updatedScenes,
      },
    };
    setFormData(updated);
    onUpdateCompany(updated);
    setSelectedSceneId(newId);
  };

  // Delete scene
  const handleDeleteScene = (sceneIdToDelete: string) => {
    if (tourScenes.length <= 1) {
      alert('Il Virtual Tour deve contenere almeno una stanza.');
      return;
    }
    const updatedScenes = tourScenes.filter((s) => s.id !== sceneIdToDelete);
    const updated = {
      ...formData,
      virtualTour: {
        ...formData.virtualTour!,
        scenes: updatedScenes,
      },
    };
    setFormData(updated);
    onUpdateCompany(updated);
    if (selectedSceneId === sceneIdToDelete) {
      setSelectedSceneId(updatedScenes[0].id);
    }
  };

  // Update scene properties
  const handleUpdateCurrentScene = (fields: Partial<VirtualTourScene>) => {
    const updatedScenes = tourScenes.map((s) =>
      s.id === currentScene.id ? { ...s, ...fields } : s
    );
    const updated = {
      ...formData,
      virtualTour: {
        ...formData.virtualTour!,
        scenes: updatedScenes,
      },
    };
    setFormData(updated);
    onUpdateCompany(updated);
  };

  // Image uploaders
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const updated = { ...formData, logo: evt.target.result as string };
          setFormData(updated);
          onUpdateCompany(updated);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeaderImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const updated = { ...formData, headerImage: evt.target.result as string };
          setFormData(updated);
          onUpdateCompany(updated);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handle360FileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const url = evt.target.result as string;
          handleUpdateCurrentScene({ panoramaUrl: url });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Hotspots
  const handleAddHotspot = () => {
    if (!newHotspot.label) return;
    const hs: VirtualTourHotspot = {
      id: `hs-${Date.now()}`,
      yaw: Number(newHotspot.yaw) || 0,
      pitch: Number(newHotspot.pitch) || 0,
      label: newHotspot.label,
      actionType: newHotspot.actionType || 'info',
      points: Number(newHotspot.points) || 10,
      targetSceneId: newHotspot.targetSceneId || '',
      targetUrl: newHotspot.targetUrl || formData.bonusPowerLink,
    };

    const updatedHotspots = [...(currentScene.hotspots || []), hs];
    const updatedScenes = tourScenes.map((s) =>
      s.id === currentScene.id ? { ...s, hotspots: updatedHotspots } : s
    );

    const updated = {
      ...formData,
      virtualTour: {
        ...(formData.virtualTour || {
          enabled: true,
          title: `Virtual Tour 360° - ${formData.name}`,
        }),
        scenes: updatedScenes,
      },
    };

    setFormData(updated);
    onUpdateCompany(updated);

    setNewHotspot({
      label: '🌐 Visita Punto d\'Interesse',
      actionType: 'info',
      yaw: 0,
      pitch: 0,
      points: 10,
      targetSceneId: '',
    });
  };

  const handleDeleteHotspot = (id: string) => {
    const updatedHotspots = (currentScene.hotspots || []).filter((h) => h.id !== id);
    const updatedScenes = tourScenes.map((s) =>
      s.id === currentScene.id ? { ...s, hotspots: updatedHotspots } : s
    );

    const updated = {
      ...formData,
      virtualTour: {
        ...formData.virtualTour!,
        scenes: updatedScenes,
      },
    };
    setFormData(updated);
    onUpdateCompany(updated);
  };

  // Products
  const handleAddProduct = () => {
    if (!newProd.name) return;
    const prod: Product = {
      ...(newProd as Product),
      id: `p-${Date.now()}`,
    };
    const updated = { ...formData, products: [...formData.products, prod] };
    setFormData(updated);
    onUpdateCompany(updated);
    setNewProd({
      name: '',
      price: '€ 99,00',
      description: '',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80',
      tag: 'Novità',
    });
  };

  const handleDeleteProduct = (id: string) => {
    const updated = { ...formData, products: formData.products.filter((p) => p.id !== id) };
    setFormData(updated);
    onUpdateCompany(updated);
  };

  // Offers
  const handleAddOffer = () => {
    if (!newOffer.title) return;
    const offer: Offer = {
      ...(newOffer as Offer),
      id: `off-${Date.now()}`,
    };
    const updated = { ...formData, offers: [...formData.offers, offer] };
    setFormData(updated);
    onUpdateCompany(updated);
    setNewOffer({
      title: 'Sconto 20% Esclusivo Bonus-Power',
      discount: '-20%',
      code: 'POWER20',
      expiresIn: '7 giorni',
      bonusPowerBonus: '100 Punti Power',
    });
  };

  const handleDeleteOffer = (id: string) => {
    const updated = { ...formData, offers: formData.offers.filter((o) => o.id !== id) };
    setFormData(updated);
    onUpdateCompany(updated);
  };

  // SaaS Plan Change
  const handleSelectPlan = (plan: 'starter' | 'pro' | 'enterprise') => {
    const updated = { ...formData, planTier: plan, subscriptionStatus: 'active' as const };
    setFormData(updated);
    onUpdateCompany(updated);
    alert(`🎉 Abbonamento aggiornato al piano ${plan.toUpperCase()}!`);
  };

  const embedCode = `<iframe src="${window.location.origin}/embed/company/${formData.id}" width="100%" height="650" frameborder="0" style="border-radius:24px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);"></iframe>`;
  const directLink = `${window.location.origin}/?stand=${formData.id}`;

  return (
    <div className="w-full h-full bg-[#050505] text-slate-100 p-4 sm:p-6 overflow-y-auto pt-32 sm:pt-36 space-y-6">
      {/* SaaS Dashboard Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-0.5 shadow-[0_0_25px_rgba(245,158,11,0.35)] shrink-0">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
              <Store className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-light text-white tracking-[0.15em] uppercase">
                PANNELLO SAAS <span className="font-bold text-amber-400">BUSINESS 3D</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/40">
                PIANO {formData.planTier ? formData.planTier.toUpperCase() : 'PRO PARTNER'}
              </span>
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">
              Gestione Vetrina, Virtual Tour 360°, Catalogo Prodotti e Leads B2B
            </p>
          </div>
        </div>

        {/* Company Switcher Selector */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
          <label className="text-xs text-slate-400 uppercase tracking-wider font-bold">Stand:</label>
          <select
            value={formData.id}
            onChange={(e) => handleSelectCompanyChange(e.target.value)}
            className="bg-black border border-amber-500/50 p-2 rounded-xl text-xs text-amber-300 font-extrabold uppercase tracking-wider focus:outline-none cursor-pointer"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 scale-[1.02]'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Overview & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 scale-[1.02]'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Profilo Stand</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 scale-[1.02]'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Catalogo & Offerte ({formData.products.length + formData.offers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tour360')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'tour360'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 scale-[1.02]'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Virtual Tour 360° ({tourScenes.length} Stanze)</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'billing'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 scale-[1.02]'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Abbonamenti SaaS</span>
        </button>

        <button
          onClick={() => setActiveTab('embed')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'embed'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 scale-[1.02]'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Widget Embed</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Visite Totali Stand</span>
                <Users className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-white">1,428</p>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +18.4% questo mese
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Prodotti Visti</span>
                <ShoppingBag className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-white">682</p>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +24.1% interesse catalogo
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Click Bonus-Power</span>
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-amber-400">319</p>
              <span className="text-[10px] text-amber-400/80 font-bold">22.3% Tasso di Conversione</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Richieste Lead B2B</span>
                <Mail className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-white">47</p>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 12 Contatti caldi
              </span>
            </div>
          </div>

          {/* Performance & Recent Inquiries */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>Andamento Visite & Interazioni 3D (Ultimi 30 giorni)</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">Aggiornato ora</span>
              </div>

              {/* Simulated Bar Chart Visualizer */}
              <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-800">
                {[35, 45, 28, 60, 75, 52, 88, 95, 62, 78, 110, 135, 90, 125, 142].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
                    <div
                      className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md group-hover:from-amber-400 group-hover:to-yellow-300 transition-all shadow-md"
                      style={{ height: `${(val / 150) * 100}%` }}
                    />
                    <span className="text-[9px] text-slate-500 font-mono">{i + 1}G</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <span>📍 Stand: <strong className="text-slate-200">{formData.name}</strong></span>
                <span>⭐ Rating Medio: <strong className="text-amber-400">4.9 / 5.0</strong></span>
              </div>
            </div>

            {/* Recent Leads Inquiries */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Ultimi Lead B2B Ricevuti</span>
              </h3>

              <div className="space-y-3">
                {[
                  { name: 'Marco Rossi', company: 'Design Italia Srl', email: 'm.rossi@designitalia.it', date: 'Oggi 10:15', status: 'Nuovo' },
                  { name: 'Elena Bianchi', company: 'Luxury Living Expo', email: 'e.bianchi@luxexpo.com', date: 'Ieri 16:40', status: 'Contattato' },
                  { name: 'Giuseppe Verdi', company: 'Verdi Retail Group', email: 'g.verdi@verdirretail.it', date: '25 Luglio', status: 'Contattato' },
                ].map((lead, idx) => (
                  <div key={idx} className="p-3 bg-black/60 rounded-2xl border border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{lead.name}</span>
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-lg">{lead.status}</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{lead.company} • {lead.email}</p>
                    <span className="text-[10px] text-slate-500 font-mono block">{lead.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFILO VETRINA STAND */}
      {activeTab === 'profile' && (
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-400" />
              <span>Configurazione Dati Vetrina & Link Bonus-Power</span>
            </h3>

            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4 text-black" />
              <span>Salva Modifiche</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">Nome Azienda / Brand</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black border border-slate-800 p-3 rounded-xl text-amber-300 font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">Città & Nazione</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Città"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-1/2 bg-black border border-slate-800 p-3 rounded-xl text-slate-100 focus:border-amber-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Nazione"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-1/2 bg-black border border-slate-800 p-3 rounded-xl text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">Indirizzo Completo (Sede)</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-black border border-slate-800 p-3 rounded-xl text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">Telefono Sede / WhatsApp</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-black border border-slate-800 p-3 rounded-xl text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">Email Contatto B2B</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-black border border-slate-800 p-3 rounded-xl text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">Sito Web Ufficiale</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full bg-black border border-slate-800 p-3 rounded-xl text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* GPS Latitude & Longitude Coordinates */}
            <div>
              <label className="text-amber-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">Coordinate Mappe (Lat, Lng)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
                  className="w-1/2 bg-black border border-slate-800 p-3 rounded-xl text-slate-100 font-mono focus:border-amber-500 focus:outline-none"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })}
                  className="w-1/2 bg-black border border-slate-800 p-3 rounded-xl text-slate-100 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Logo Image Upload */}
            <div className="sm:col-span-2">
              <label className="text-slate-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">Logo Aziendale (URL o Carica da File PC)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="flex-1 bg-black border border-slate-800 p-3 rounded-xl text-slate-100 focus:border-amber-500 focus:outline-none"
                />
                <label className="px-4 py-3 bg-slate-800 hover:bg-amber-500 hover:text-black text-amber-300 font-extrabold text-xs rounded-xl border border-slate-700 cursor-pointer flex items-center gap-1.5 shrink-0 transition-all">
                  <Camera className="w-4 h-4" />
                  <span>Carica Logo</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Header Banner Upload */}
            <div className="sm:col-span-3">
              <label className="text-slate-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">Immagine Copertina Vetrina (URL o Carica da File PC)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.headerImage}
                  onChange={(e) => setFormData({ ...formData, headerImage: e.target.value })}
                  className="flex-1 bg-black border border-slate-800 p-3 rounded-xl text-slate-100 focus:border-amber-500 focus:outline-none"
                />
                <label className="px-4 py-3 bg-slate-800 hover:bg-amber-500 hover:text-black text-amber-300 font-extrabold text-xs rounded-xl border border-slate-700 cursor-pointer flex items-center gap-1.5 shrink-0 transition-all">
                  <Camera className="w-4 h-4" />
                  <span>Carica Copertina</span>
                  <input type="file" accept="image/*" onChange={handleHeaderImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Custom Bonus-Power Link */}
            <div className="sm:col-span-2">
              <label className="text-amber-400 font-extrabold block mb-1 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Link Bonus-Power Personalizzato</span>
              </label>
              <input
                type="url"
                value={formData.bonusPowerLink}
                onChange={(e) => setFormData({ ...formData, bonusPowerLink: e.target.value })}
                placeholder="https://bonuspower.net/..."
                className="w-full bg-black border border-amber-500/50 p-3 rounded-xl text-amber-300 font-mono font-bold focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* YouTube Presentation Video */}
            <div>
              <label className="text-slate-400 font-bold block mb-1 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>YouTube Video ID o Embed</span>
              </label>
              <input
                type="text"
                value={formData.youtubeVideoId}
                onChange={(e) => setFormData({ ...formData, youtubeVideoId: e.target.value })}
                className="w-full bg-black border border-slate-800 p-3 rounded-xl text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Description textarea */}
            <div className="sm:col-span-3">
              <label className="text-slate-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">Descrizione Attività e Prodotti</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-black border border-slate-800 p-3 rounded-xl text-slate-100 h-28 focus:border-amber-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CATALOGO PRODOTTI & OFFERTE */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Products Manager */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Prodotti e Servizi in Vetrina</span>
            </h3>

            {/* Form to add product */}
            <div className="p-4 bg-black/60 border border-slate-800 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Aggiungi Nuovo Prodotto</span>
              <div className="space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Nome Prodotto (es. Orologio Luxury Gold)"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white placeholder-slate-500"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Prezzo (es. € 149,00)"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    className="w-1/2 bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-amber-300 font-bold placeholder-slate-500"
                  />
                  <input
                    type="text"
                    placeholder="Tag / Etichetta (es. Novità, Best Seller)"
                    value={newProd.tag}
                    onChange={(e) => setNewProd({ ...newProd, tag: e.target.value })}
                    className="w-1/2 bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 placeholder-slate-500"
                  />
                </div>
                <button
                  onClick={handleAddProduct}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold uppercase tracking-wider py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4 text-black" /> Inserisci nel Catalogo
                </button>
              </div>
            </div>

            {/* Product list */}
            <div className="space-y-2">
              {formData.products.map((p) => (
                <div key={p.id} className="p-3 bg-black/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-slate-800" />
                    <div>
                      <h4 className="text-white font-bold uppercase tracking-wider text-xs">{p.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 font-bold font-mono">{p.price}</span>
                        {p.tag && <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[9px] rounded font-bold">{p.tag}</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="p-2 text-red-400 hover:bg-red-950/80 rounded-xl transition-all cursor-pointer"
                    title="Rimuovi prodotto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Offers & Coupon Codes Manager */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-400" />
              <span>Offerte Speciali & Codici Sconto</span>
            </h3>

            {/* Form to add offer */}
            <div className="p-4 bg-black/60 border border-slate-800 rounded-2xl space-y-3 text-xs">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Pubblica Nuova Offerta Promozionale</span>
              <input
                type="text"
                placeholder="Titolo Offerta (es. Sconto 20% Riservato)"
                value={newOffer.title}
                onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white placeholder-slate-500"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Percentuale (es. -20%)"
                  value={newOffer.discount}
                  onChange={(e) => setNewOffer({ ...newOffer, discount: e.target.value })}
                  className="w-1/2 bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-amber-300 font-bold placeholder-slate-500"
                />
                <input
                  type="text"
                  placeholder="Codice Coupon (es. POWER20)"
                  value={newOffer.code}
                  onChange={(e) => setNewOffer({ ...newOffer, code: e.target.value })}
                  className="w-1/2 bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono placeholder-slate-500"
                />
              </div>
              <button
                onClick={handleAddOffer}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold uppercase tracking-wider py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4 text-black" /> Attiva Promozione
              </button>
            </div>

            {/* Offer list */}
            <div className="space-y-2">
              {formData.offers.map((off) => (
                <div key={off.id} className="p-3 bg-black/80 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <h4 className="text-white font-bold uppercase tracking-wider text-xs">{off.title}</h4>
                    <span className="text-[10px] text-amber-400 font-mono">Codice: {off.code} ({off.discount})</span>
                  </div>
                  <button
                    onClick={() => handleDeleteOffer(off.id)}
                    className="p-2 text-red-400 hover:bg-red-950/80 rounded-xl transition-all cursor-pointer"
                    title="Elimina offerta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VIRTUAL TOUR 360° MULTI-STANZA */}
      {activeTab === 'tour360' && (
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Virtual Tour 360° Multi-Stanza / Multi-Ambiente</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Crea ed edita il percorso esperienziale a 360° per il tuo stand
              </p>
            </div>

            <button
              onClick={() => setShowTourPreview(true)}
              className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-extrabold text-xs uppercase tracking-wider rounded-xl border border-amber-500/50 flex items-center gap-2 transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Apri Anteprima Virtual Tour</span>
            </button>
          </div>

          {/* Room Selector */}
          <div className="bg-black/60 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Stanze Configurate ({tourScenes.length}):</span>
              </span>

              <button
                onClick={handleAddScene}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>Nuova Stanza / Salone</span>
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {tourScenes.map((scene, idx) => {
                const isSelected = scene.id === currentScene.id;
                return (
                  <div key={scene.id} className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setSelectedSceneId(scene.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-black border-amber-300 font-extrabold shadow-md shadow-amber-500/20'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      <DoorOpen className="w-4 h-4" />
                      <span>{scene.name || `Stanza ${idx + 1}`}</span>
                      <span className="text-[10px] opacity-70">({scene.hotspots.length} hs)</span>
                    </button>

                    {tourScenes.length > 1 && (
                      <button
                        onClick={() => handleDeleteScene(scene.id)}
                        className="p-1.5 text-red-400 hover:bg-red-950/80 rounded-lg transition-all cursor-pointer"
                        title="Elimina Stanza"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Scene Settings & Upload */}
          <div className="p-4 bg-black border border-slate-800 rounded-2xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-amber-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">
                  Nome Stanza Corrente
                </label>
                <input
                  type="text"
                  value={currentScene.name}
                  onChange={(e) => handleUpdateCurrentScene({ name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-amber-300 font-bold"
                />
              </div>

              <div>
                <label className="text-amber-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">
                  Tipologia Ambiente
                </label>
                <select
                  value={currentScene.type || 'room'}
                  onChange={(e) => handleUpdateCurrentScene({ type: e.target.value as 'room' | 'corridor' })}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-amber-300 font-bold uppercase text-xs"
                >
                  <option value="room">🚪 Stanza / Ambiente Espositivo</option>
                  <option value="corridor">🛣️ Corridoio / Passaggio 2D</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="text-amber-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">
                  Foto Panorama 360° (URL o Carica File Locale 360)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentScene.panoramaUrl}
                    onChange={(e) => handleUpdateCurrentScene({ panoramaUrl: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 text-xs"
                    placeholder="https://..."
                  />
                  <label className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Camera className="w-4 h-4 text-black" />
                    <span>Carica 360°</span>
                    <input type="file" accept="image/*" onChange={handle360FileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Hotspot Creator */}
          <div className="p-4 bg-black/60 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
              Aggiungi Hotspot Cliccabile a "{currentScene.name}"
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
              <input
                type="text"
                placeholder="Etichetta (es. 🚪 Entra nel Salone VIP)"
                value={newHotspot.label}
                onChange={(e) => setNewHotspot({ ...newHotspot, label: e.target.value })}
                className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white placeholder-slate-500"
              />

              <select
                value={newHotspot.actionType}
                onChange={(e) => setNewHotspot({ ...newHotspot, actionType: e.target.value as any })}
                className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-amber-300 font-bold uppercase text-[11px]"
              >
                <option value="scene-change">🚪 Porta altra Stanza</option>
                <option value="bonus-power">⚡ Link Bonus-Power</option>
                <option value="website">🌐 Sito Web Esterno</option>
                <option value="product">🛒 Prodotto Catalogo</option>
                <option value="phone">📞 Chiamata Diretta</option>
                <option value="info">ℹ️ Info Scheda Pop-up</option>
              </select>

              {newHotspot.actionType === 'scene-change' ? (
                <select
                  value={newHotspot.targetSceneId}
                  onChange={(e) => setNewHotspot({ ...newHotspot, targetSceneId: e.target.value })}
                  className="bg-slate-950 border border-amber-500/50 p-2.5 rounded-xl text-amber-300 font-bold uppercase text-[11px]"
                >
                  <option value="">Seleziona Stanza Destinazione...</option>
                  {tourScenes
                    .filter((s) => s.id !== currentScene.id)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Yaw (-180/180)"
                    value={newHotspot.yaw}
                    onChange={(e) => setNewHotspot({ ...newHotspot, yaw: Number(e.target.value) })}
                    className="w-1/2 bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 placeholder-slate-500"
                  />
                  <input
                    type="number"
                    placeholder="Pitch (-90/90)"
                    value={newHotspot.pitch}
                    onChange={(e) => setNewHotspot({ ...newHotspot, pitch: Number(e.target.value) })}
                    className="w-1/2 bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 placeholder-slate-500"
                  />
                </div>
              )}

              <button
                onClick={handleAddHotspot}
                className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold uppercase tracking-wider rounded-xl p-2.5 text-xs flex items-center justify-center gap-1 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4 text-black" /> Aggiungi Hotspot
              </button>
            </div>
          </div>

          {/* Hotspot list */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Hotspots Configurati in "{currentScene.name}" ({currentScene.hotspots?.length || 0}):
            </span>

            {(currentScene.hotspots || []).map((hs) => {
              const targetSceneObj = tourScenes.find((s) => s.id === hs.targetSceneId);
              return (
                <div key={hs.id} className="p-3 bg-black border border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono font-bold rounded text-[10px]">
                      {hs.actionType === 'scene-change' ? '🚪 PORTA STANZA' : hs.actionType.toUpperCase()}
                    </span>
                    <div>
                      <h4 className="text-white font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                        <span>{hs.label}</span>
                        {targetSceneObj && (
                          <span className="text-amber-400 font-bold text-[10px]">
                            → {targetSceneObj.name}
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Yaw: {hs.yaw}° | Pitch: {hs.pitch}°
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteHotspot(hs.id)}
                    className="p-1.5 text-red-400 hover:bg-red-950/80 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: ABBONAMENTI SAAS & FATTURAZIONE */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Piani di Abbonamento SaaS & Vantaggi Partner</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Scegli la visibilità del tuo stand nel Centro Commerciale Virtuale Meta-TV 3D
                </p>
              </div>

              <div className="px-3.5 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 font-extrabold text-xs uppercase tracking-wider">
                Stato: <span className="text-emerald-400">ATTIVO</span>
              </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Plan 1: Starter */}
              <div className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-6 ${
                formData.planTier === 'starter'
                  ? 'bg-amber-500/10 border-amber-500 shadow-xl shadow-amber-500/10'
                  : 'bg-black/60 border-slate-800'
              }`}>
                <div className="space-y-3">
                  <span className="px-3 py-1 bg-slate-800 text-slate-300 text-[10px] font-extrabold uppercase rounded-full tracking-wider">
                    STARTER
                  </span>
                  <h4 className="text-xl font-bold text-white">Vetrina Base</h4>
                  <p className="text-3xl font-black text-amber-400">Gratis <span className="text-xs font-normal text-slate-400">/ sempre</span></p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Perfetto per iniziare e figurare nella mappa 2D e nei corridoi generali con dati di contatto.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Posizione Mappa 2D & Mappa Globale</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Scheda Informazioni e Telefono</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Fino a 3 Prodotti in Vetrina</li>
                    <li className="flex items-center gap-2 text-slate-500"><Check className="w-4 h-4 text-slate-600 shrink-0" /> No Virtual Tour 360° Multi-Stanza</li>
                  </ul>
                </div>

                <button
                  onClick={() => handleSelectPlan('starter')}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    formData.planTier === 'starter'
                      ? 'bg-amber-500 text-black font-extrabold'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {formData.planTier === 'starter' ? 'Piano Attuale' : 'Seleziona Starter'}
                </button>
              </div>

              {/* Plan 2: Pro Partner */}
              <div className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-6 relative overflow-hidden ${
                (!formData.planTier || formData.planTier === 'pro')
                  ? 'bg-amber-500/15 border-amber-400 shadow-2xl shadow-amber-500/20'
                  : 'bg-black/60 border-slate-800'
              }`}>
                <div className="absolute top-3 right-3 px-2.5 py-0.5 bg-amber-500 text-black font-black text-[9px] uppercase rounded-full tracking-widest shadow-md">
                  POPULARE
                </div>
                <div className="space-y-3">
                  <span className="px-3 py-1 bg-amber-500 text-black text-[10px] font-black uppercase rounded-full tracking-wider">
                    PRO PARTNER
                  </span>
                  <h4 className="text-xl font-bold text-white">Stand 3D & Virtual Tour</h4>
                  <p className="text-3xl font-black text-amber-400">€ 49 <span className="text-xs font-normal text-slate-400">/ mese</span></p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Il piano ideale per la maggior parte delle attività: Virtual Tour 360°, Catalogo Prodotti illimitato e Link Bonus-Power.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Tutti i vantaggi del piano Starter</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Virtual Tour 360° Multi-Stanza</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Link Bonus-Power Personale integrato</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Prodotti & Offerte Illimitati</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Codice Iframe Widget per tuo Sito</li>
                  </ul>
                </div>

                <button
                  onClick={() => handleSelectPlan('pro')}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    (!formData.planTier || formData.planTier === 'pro')
                      ? 'bg-amber-500 text-black font-extrabold shadow-lg'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {(!formData.planTier || formData.planTier === 'pro') ? 'Piano Attuale (Pro)' : 'Passa a Pro Partner'}
                </button>
              </div>

              {/* Plan 3: Enterprise VIP */}
              <div className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-6 ${
                formData.planTier === 'enterprise'
                  ? 'bg-amber-500/10 border-amber-500 shadow-xl shadow-amber-500/10'
                  : 'bg-black/60 border-slate-800'
              }`}>
                <div className="space-y-3">
                  <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-300 text-black text-[10px] font-black uppercase rounded-full tracking-wider">
                    ENTERPRISE 3D VIP
                  </span>
                  <h4 className="text-xl font-bold text-white">Padiglione Esclusivo</h4>
                  <p className="text-3xl font-black text-amber-400">€ 149 <span className="text-xs font-normal text-slate-400">/ mese</span></p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Massima visibilità con banner sponsor nei corridoi 3D, supporto dedicato e posizionamento primario nella mappa.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Tutti i vantaggi Pro Partner</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Banner Sponsor in cima ai Corridoi</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Evidenziazione Oro nella Mappa 2D</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Assistenza VIP e setup personalizzato</li>
                  </ul>
                </div>

                <button
                  onClick={() => handleSelectPlan('enterprise')}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    formData.planTier === 'enterprise'
                      ? 'bg-amber-500 text-black font-extrabold'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {formData.planTier === 'enterprise' ? 'Piano Attuale' : 'Passa a Enterprise 3D VIP'}
                </button>
              </div>
            </div>
          </div>

          {/* Invoices History Table */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Storico Fatture SaaS</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3 font-bold">Fattura ID</th>
                    <th className="pb-3 font-bold">Data Emissione</th>
                    <th className="pb-3 font-bold">Descrizione Piano</th>
                    <th className="pb-3 font-bold">Importo</th>
                    <th className="pb-3 font-bold">Stato</th>
                    <th className="pb-3 font-bold text-right">Download PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {[
                    { id: 'INV-2026-0041', date: '01/07/2026', desc: 'Piano Pro Partner 3D (Luglio 2026)', price: '€ 49,00', status: 'Pagata' },
                    { id: 'INV-2026-0032', date: '01/06/2026', desc: 'Piano Pro Partner 3D (Giugno 2026)', price: '€ 49,00', status: 'Pagata' },
                    { id: 'INV-2026-0021', date: '01/05/2026', desc: 'Setup Iniziale Stand & Vetrina 3D', price: '€ 0,00', status: 'Gratuito' },
                  ].map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/40">
                      <td className="py-3 font-mono font-bold text-slate-200">{inv.id}</td>
                      <td className="py-3 text-slate-400">{inv.date}</td>
                      <td className="py-3 text-white font-medium">{inv.desc}</td>
                      <td className="py-3 font-bold text-amber-400 font-mono">{inv.price}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg">{inv.status}</span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => alert(`📥 Download avviato per la fattura ${inv.id}`)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3 text-amber-400" /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: WIDGET EMBED & INTEGRAZIONI */}
      {activeTab === 'embed' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Iframe Code Generator */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Code className="w-4 h-4 text-amber-400" />
              <span>Incolla l'Iframe nel tuo Sito Web</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Copia il codice HTML qui sotto e incollalo nel tuo CMS (WordPress, Shopify, Wix, Squarespace, Webflow) per mostrare il tuo Mini-Sito / Stand Virtuale 3D direttamente sul tuo sito ufficiale!
            </p>

            <div className="relative">
              <pre className="p-4 bg-black rounded-2xl text-amber-300 text-[11px] font-mono whitespace-pre-wrap break-all border border-slate-800 leading-relaxed">
                {embedCode}
              </pre>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(embedCode);
                  setCopiedEmbed(true);
                  setTimeout(() => setCopiedEmbed(false), 2000);
                }}
                className="mt-3 w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Copy className="w-4 h-4 text-black" />
                <span>{copiedEmbed ? 'Copiato negli Appunti!' : 'Copia Codice HTML Iframe'}</span>
              </button>
            </div>
          </div>

          {/* Direct Link & QR Code */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Link Diretto & QR Code Promozionale</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Condividi questo link diretto sui tuoi canali social o stampa il QR Code sui volantini per indirizzare i clienti direttamente al tuo Stand 3D nel mall.
            </p>

            <div className="p-3 bg-black rounded-2xl border border-slate-800 space-y-2">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Link Diretto Stand:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={directLink}
                  className="flex-1 bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-amber-300 font-mono text-xs"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(directLink);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  {copiedLink ? 'Copiato!' : 'Copia'}
                </button>
              </div>
            </div>

            {/* QR Code graphic mockup */}
            <div className="p-4 bg-black rounded-2xl border border-slate-800 flex items-center gap-4">
              <div className="w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(directLink)}`}
                  alt="QR Code Stand 3D"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">QR Code Stand Pronto</h4>
                <p className="text-[11px] text-slate-400">Scansiona con qualsiasi smartphone per aprire lo stand in 3D.</p>
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(directLink)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-amber-400 font-bold hover:underline pt-1"
                >
                  <Download className="w-3.5 h-3.5" /> Scarica QR ad alta risoluzione
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live 360 Virtual Tour Preview Modal */}
      {showTourPreview && (
        <CompanyVirtualTourViewer
          company={formData}
          onClose={() => setShowTourPreview(false)}
        />
      )}
    </div>
  );
};
