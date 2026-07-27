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
  Globe,
  Phone,
  Info,
  DoorOpen,
  Layers,
  FolderPlus,
} from 'lucide-react';
import { CompanyVirtualTourViewer } from '../3d/CompanyVirtualTourViewer';

interface BusinessDashboardProps {
  companies: Company[];
  onUpdateCompany: (updated: Company) => void;
}

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  companies,
  onUpdateCompany,
}) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companies[0]?.id || '');
  const activeCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0];

  const [formData, setFormData] = useState<Company>(activeCompany);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [showTourPreview, setShowTourPreview] = useState(false);

  // Active scene selected for editing in virtual tour
  const [selectedSceneId, setSelectedSceneId] = useState<string>('scene-1');

  // Hotspot creation state
  const [newHotspot, setNewHotspot] = useState<Partial<VirtualTourHotspot>>({
    label: '🌐 Visita Punto d\'Interesse',
    actionType: 'info',
    yaw: 0,
    pitch: 0,
    points: 0,
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

  // Local image file handlers
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

  const handleSelectCompanyChange = (id: string) => {
    setSelectedCompanyId(id);
    const comp = companies.find((c) => c.id === id);
    if (comp) setFormData(comp);
  };

  const handleSave = () => {
    onUpdateCompany(formData);
    alert('✅ Profilo Aziendale & Virtual Tour Multi-Stanza Salvati con Successo!');
  };

  const handleAddHotspot = () => {
    if (!newHotspot.label) return;
    const hs: VirtualTourHotspot = {
      id: `hs-${Date.now()}`,
      yaw: Number(newHotspot.yaw) || 0,
      pitch: Number(newHotspot.pitch) || 0,
      label: newHotspot.label,
      actionType: newHotspot.actionType || 'info',
      points: Number(newHotspot.points) || 0,
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

    // Reset new hotspot form
    setNewHotspot({
      label: '🌐 Visita Punto d\'Interesse',
      actionType: 'info',
      yaw: 0,
      pitch: 0,
      points: 0,
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

  const handleAddProduct = () => {
    if (!newProd.name) return;
    const prod: Product = {
      ...(newProd as Product),
      id: `p-${Date.now()}`,
    };
    const updated = { ...formData, products: [...formData.products, prod] };
    setFormData(updated);
    onUpdateCompany(updated);
  };

  const handleDeleteProduct = (id: string) => {
    const updated = { ...formData, products: formData.products.filter((p) => p.id !== id) };
    setFormData(updated);
    onUpdateCompany(updated);
  };

  const handleAddOffer = () => {
    if (!newOffer.title) return;
    const offer: Offer = {
      ...(newOffer as Offer),
      id: `off-${Date.now()}`,
    };
    const updated = { ...formData, offers: [...formData.offers, offer] };
    setFormData(updated);
    onUpdateCompany(updated);
  };

  const handleDeleteOffer = (id: string) => {
    const updated = { ...formData, offers: formData.offers.filter((o) => o.id !== id) };
    setFormData(updated);
    onUpdateCompany(updated);
  };

  const embedCode = `<iframe src="${window.location.origin}/embed/company/${formData.id}" width="100%" height="650" frameborder="0" style="border-radius:24px;"></iframe>`;

  return (
    <div className="w-full h-full bg-[#050505] text-slate-100 p-6 overflow-y-auto pt-32 sm:pt-36 space-y-6">
      {/* Vendor Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-600 to-yellow-200 p-0.5 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
              <Store className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-light text-white tracking-[0.15em] uppercase">
              PANNELLO AZIENDE <span className="font-bold text-yellow-500">PARTNER 3D</span>
            </h2>
            <p className="text-xs text-white/40 uppercase tracking-wider">
              Gestisci vetrina, catalogo prodotti, offerte attive e Link Bonus-Power per la tua attività
            </p>
          </div>
        </div>

        {/* Company Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-white/50 uppercase tracking-wider">Azienda:</label>
          <select
            value={formData.id}
            onChange={(e) => handleSelectCompanyChange(e.target.value)}
            className="bg-zinc-950 border border-yellow-500/40 p-2.5 rounded-xl text-xs text-yellow-300 font-bold uppercase tracking-wider"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Core Info & Bonus-Power Link */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#080808] border border-white/10 p-6 rounded-3xl space-y-4">
            <h3 className="text-yellow-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Store className="w-4 h-4 text-yellow-500" />
              <span>Informazioni Principali & Bonus-Power</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-white/50 block mb-1 uppercase tracking-wider text-[10px]">Nome Azienda</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200"
                />
              </div>

              <div>
                <label className="text-white/50 block mb-1 uppercase tracking-wider text-[10px]">Logo Aziendale (URL o Locale)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    className="flex-1 bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200"
                  />
                  <label className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-yellow-300 font-bold text-xs rounded-xl border border-white/15 cursor-pointer flex items-center gap-1 shrink-0">
                    <Camera className="w-4 h-4 text-yellow-400" />
                    <span>Upload Logo</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-white/50 block mb-1 uppercase tracking-wider text-[10px]">Immagine Copertina Vetrina (URL o Locale)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.headerImage}
                    onChange={(e) => setFormData({ ...formData, headerImage: e.target.value })}
                    className="flex-1 bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200"
                  />
                  <label className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-yellow-300 font-bold text-xs rounded-xl border border-white/15 cursor-pointer flex items-center gap-1 shrink-0">
                    <Camera className="w-4 h-4 text-yellow-400" />
                    <span>Upload Copertina</span>
                    <input type="file" accept="image/*" onChange={handleHeaderImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-yellow-400 font-bold block mb-1 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>Link Bonus-Power Personalizzato</span>
                </label>
                <input
                  type="url"
                  value={formData.bonusPowerLink}
                  onChange={(e) => setFormData({ ...formData, bonusPowerLink: e.target.value })}
                  placeholder="https://bonuspower.net/..."
                  className="w-full bg-zinc-950 border border-yellow-500/50 p-2.5 rounded-xl text-yellow-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-white/50 block mb-1 flex items-center gap-1 uppercase tracking-wider text-[10px]">
                  <Youtube className="w-4 h-4 text-red-500" />
                  <span>YouTube Video ID o URL</span>
                </label>
                <input
                  type="text"
                  value={formData.youtubeVideoId}
                  onChange={(e) => setFormData({ ...formData, youtubeVideoId: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200"
                />
              </div>

              <div>
                <label className="text-white/50 block mb-1 uppercase tracking-wider text-[10px]">Sito Web Ufficiale</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-white/50 block mb-1 uppercase tracking-wider text-[10px]">Descrizione Attività</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/15 p-2.5 rounded-xl text-yellow-200 h-24"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Salva Profilo Azienda</span>
              </button>
            </div>
          </div>

          {/* Virtual Tour 360 Management Block */}
          <div className="bg-[#080808] border border-yellow-500/30 p-6 rounded-3xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <h3 className="text-yellow-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                <Compass className="w-4 h-4 text-yellow-500" />
                <span>Virtual Tour 360° Multi-Stanza / Multi-Ambiente Interattivo</span>
              </h3>

              <button
                onClick={() => setShowTourPreview(true)}
                className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500 text-yellow-300 hover:text-black font-extrabold text-xs uppercase tracking-wider rounded-xl border border-yellow-500/50 flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]"
              >
                <Eye className="w-4 h-4" />
                <span>Anteprima Tour 360°</span>
              </button>
            </div>

            <p className="text-xs text-white/60">
              Crea un percorso virtuale multilivello per i tuoi clienti! Aggiungi diverse sale/stanze (es. <span className="text-yellow-400 font-bold">Ingresso, Showroom, Sala VIP</span>) e inserisci hotspot con porte per passare da una stanza all'altra o mostrare prodotti e link.
            </p>

            {/* Room / Scenes Selector Tabs Bar */}
            <div className="bg-black border border-white/10 p-3 rounded-2xl space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-yellow-500" />
                  <span>Stanze del Tour ({tourScenes.length}):</span>
                </span>

                <button
                  onClick={handleAddScene}
                  className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs rounded-xl flex items-center gap-1 shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuova Stanza / Ambiente</span>
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {tourScenes.map((scene, idx) => {
                  const isSelected = scene.id === currentScene.id;
                  return (
                    <div key={scene.id} className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setSelectedSceneId(scene.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-yellow-500 text-black border-yellow-300 font-extrabold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-white/80 border-white/10'
                        }`}
                      >
                        <DoorOpen className="w-4 h-4" />
                        <span>{scene.name || `Stanza ${idx + 1}`}</span>
                        <span className="text-[10px] opacity-70">({scene.hotspots.length} hs)</span>
                      </button>

                      {tourScenes.length > 1 && (
                        <button
                          onClick={() => handleDeleteScene(scene.id)}
                          className="p-1.5 text-red-400 hover:bg-red-950 rounded-lg transition-all"
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

            {/* Current Scene Settings & Panorama Upload */}
            <div className="p-4 bg-zinc-950 border border-yellow-500/30 rounded-2xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-yellow-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">
                    Nome Stanza / Corridoio Corrente
                  </label>
                  <input
                    type="text"
                    value={currentScene.name}
                    onChange={(e) => handleUpdateCurrentScene({ name: e.target.value })}
                    className="w-full bg-black border border-white/15 p-2.5 rounded-xl text-yellow-200 font-bold"
                    placeholder="es. Corridoio Galleria Espositiva"
                  />
                </div>

                <div>
                  <label className="text-yellow-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">
                    Tipologia Ambiente 2D
                  </label>
                  <select
                    value={currentScene.type || 'room'}
                    onChange={(e) => handleUpdateCurrentScene({ type: e.target.value as 'room' | 'corridor' })}
                    className="w-full bg-black border border-yellow-500/50 p-2.5 rounded-xl text-yellow-300 font-bold uppercase text-xs"
                  >
                    <option value="room">🚪 Stanza / Ambiente Principale</option>
                    <option value="corridor">🛣️ Corridoio / Passaggio 2D</option>
                  </select>
                </div>

                <div>
                  <label className="text-yellow-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">
                    Coordinate Mappa 2D (% X e Y)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={currentScene.mapCoords?.x ?? 50}
                      onChange={(e) =>
                        handleUpdateCurrentScene({
                          mapCoords: {
                            x: Number(e.target.value),
                            y: currentScene.mapCoords?.y ?? 50,
                          },
                        })
                      }
                      placeholder="X %"
                      className="w-1/2 bg-black border border-white/15 p-2.5 rounded-xl text-yellow-200 text-xs font-mono"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={currentScene.mapCoords?.y ?? 50}
                      onChange={(e) =>
                        handleUpdateCurrentScene({
                          mapCoords: {
                            x: currentScene.mapCoords?.x ?? 50,
                            y: Number(e.target.value),
                          },
                        })
                      }
                      placeholder="Y %"
                      className="w-1/2 bg-black border border-white/15 p-2.5 rounded-xl text-yellow-200 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="text-yellow-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">
                    Foto 360° Foto Panorama (URL o File Locale PC/Smartphone)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentScene.panoramaUrl}
                      onChange={(e) => handleUpdateCurrentScene({ panoramaUrl: e.target.value })}
                      className="flex-1 bg-black border border-white/15 p-2.5 rounded-xl text-yellow-200 text-xs"
                      placeholder="https://... o carica file ->"
                    />
                    <label className="px-3 py-2 bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-400 hover:to-amber-300 text-black font-extrabold text-xs rounded-xl border border-yellow-300 cursor-pointer flex items-center gap-1 shrink-0">
                      <Camera className="w-4 h-4 text-black" />
                      <span>Carica 360°</span>
                      <input type="file" accept="image/*" onChange={handle360FileUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Preset selector for current scene */}
              <div>
                <label className="text-white/40 block mb-1 uppercase tracking-wider text-[10px]">
                  Oppure applica una foto 360° d'esempio a questa stanza:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Boutique & Showroom', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2000&q=80' },
                    { label: 'Salone Interno', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80' },
                    { label: 'Ristorante / Sala', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=2000&q=80' },
                    { label: 'Privé Lusso', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=80' },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleUpdateCurrentScene({ panoramaUrl: preset.url })}
                      className="px-2.5 py-1 bg-black hover:bg-yellow-500/20 text-white/70 hover:text-yellow-300 rounded-lg border border-white/10 text-[10px] font-bold uppercase"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hotspots Creator for Current Scene */}
            <div className="p-4 bg-black border border-white/10 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-yellow-500" />
                <span>Aggiungi Hotspot Cliccabile a "{currentScene.name}"</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Etichetta (es. 🚪 Entra nel Salone)"
                  value={newHotspot.label}
                  onChange={(e) => setNewHotspot({ ...newHotspot, label: e.target.value })}
                  className="bg-zinc-950 border border-white/15 p-2 rounded-xl text-yellow-100 placeholder-white/30"
                />

                <select
                  value={newHotspot.actionType}
                  onChange={(e) =>
                    setNewHotspot({
                      ...newHotspot,
                      actionType: e.target.value as any,
                    })
                  }
                  className="bg-zinc-950 border border-white/15 p-2 rounded-xl text-yellow-300 font-bold uppercase text-[11px]"
                >
                  <option value="scene-change">🚪 Passa ad altra Stanza / Ambiente</option>
                  <option value="bonus-power">⚡ Bonus-Power Link</option>
                  <option value="website">🌐 Sito Web</option>
                  <option value="product">🛒 Prodotto in Vetrina</option>
                  <option value="phone">📞 Chiamata Telefonica</option>
                  <option value="info">ℹ️ Informazioni</option>
                </select>

                {newHotspot.actionType === 'scene-change' ? (
                  <select
                    value={newHotspot.targetSceneId}
                    onChange={(e) =>
                      setNewHotspot({ ...newHotspot, targetSceneId: e.target.value })
                    }
                    className="bg-zinc-950 border border-yellow-500/50 p-2 rounded-xl text-yellow-300 font-bold uppercase text-[11px]"
                  >
                    <option value="">Seleziona Stanza di Destinazione...</option>
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
                      className="w-1/2 bg-zinc-950 border border-white/15 p-2 rounded-xl text-yellow-100 placeholder-white/30"
                    />
                    <input
                      type="number"
                      placeholder="Pitch (-90/90)"
                      value={newHotspot.pitch}
                      onChange={(e) => setNewHotspot({ ...newHotspot, pitch: Number(e.target.value) })}
                      className="w-1/2 bg-zinc-950 border border-white/15 p-2 rounded-xl text-yellow-100 placeholder-white/30"
                    />
                  </div>
                )}

                <button
                  onClick={handleAddHotspot}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold uppercase tracking-wider rounded-xl p-2 text-xs flex items-center justify-center gap-1 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Aggiungi Hotspot
                </button>
              </div>
            </div>

            {/* Hotspots List for Current Scene */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">
                Hotspots Configurati in "{currentScene.name}" ({currentScene.hotspots?.length || 0}):
              </span>

              {(currentScene.hotspots || []).map((hs) => {
                const targetSceneObj = tourScenes.find((s) => s.id === hs.targetSceneId);
                return (
                  <div
                    key={hs.id}
                    className="p-3 bg-black border border-white/10 rounded-2xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 font-mono font-bold rounded text-[10px]">
                        {hs.actionType === 'scene-change' ? '🚪 PORTA STANZA' : hs.actionType.toUpperCase()}
                      </span>
                      <div>
                        <h4 className="text-white font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                          <span>{hs.label}</span>
                          {targetSceneObj && (
                            <span className="text-yellow-400 font-bold text-[10px]">
                              → {targetSceneObj.name}
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-white/40 font-mono">
                          Yaw: {hs.yaw}° | Pitch: {hs.pitch}°
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteHotspot(hs.id)}
                      className="p-1.5 text-red-400 hover:bg-red-950 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Products Management */}
          <div className="bg-[#080808] border border-white/10 p-6 rounded-3xl space-y-4">
            <h3 className="text-yellow-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-yellow-500" />
              <span>Gestione Prodotti & Servizi</span>
            </h3>

            {/* Add product form */}
            <div className="p-4 bg-black border border-white/10 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider block">Aggiungi Nuovo Prodotto</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Nome Prodotto"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="bg-zinc-950 border border-white/15 p-2 rounded-xl text-yellow-100 placeholder-white/30"
                />
                <input
                  type="text"
                  placeholder="Prezzo (es. € 99,00)"
                  value={newProd.price}
                  onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                  className="bg-zinc-950 border border-white/15 p-2 rounded-xl text-yellow-100 placeholder-white/30"
                />
                <button
                  onClick={handleAddProduct}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-wider rounded-xl p-2 text-xs flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Aggiungi
                </button>
              </div>
            </div>

            {/* List products */}
            <div className="space-y-2">
              {formData.products.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-black border border-white/10 rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                    <div>
                      <h4 className="text-white font-bold uppercase tracking-wider text-xs">{p.name}</h4>
                      <p className="text-yellow-400 text-[11px] font-mono">{p.price}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="p-2 text-red-400 hover:bg-red-950 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Offers & Embed Code */}
        <div className="space-y-6">
          {/* Active Offers */}
          <div className="bg-[#080808] border border-white/10 p-6 rounded-3xl space-y-4">
            <h3 className="text-yellow-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Tag className="w-4 h-4 text-yellow-500" />
              <span>Offerte & Codici Sconto</span>
            </h3>

            {/* Add offer form */}
            <div className="p-3 bg-black border border-white/10 rounded-2xl space-y-2 text-xs">
              <input
                type="text"
                placeholder="Titolo Offerta"
                value={newOffer.title}
                onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                className="w-full bg-zinc-950 border border-white/15 p-2 rounded-xl text-yellow-100 placeholder-white/30"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Sconto (es. -20%)"
                  value={newOffer.discount}
                  onChange={(e) => setNewOffer({ ...newOffer, discount: e.target.value })}
                  className="w-1/2 bg-zinc-950 border border-white/15 p-2 rounded-xl text-yellow-100 placeholder-white/30"
                />
                <input
                  type="text"
                  placeholder="Codice (es. POWER20)"
                  value={newOffer.code}
                  onChange={(e) => setNewOffer({ ...newOffer, code: e.target.value })}
                  className="w-1/2 bg-zinc-950 border border-white/15 p-2 rounded-xl text-yellow-100 placeholder-white/30"
                />
              </div>
              <button
                onClick={handleAddOffer}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-wider py-2 rounded-xl flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" /> Pubblica Offerta
              </button>
            </div>

            {/* List offers */}
            <div className="space-y-2">
              {formData.offers.map((off) => (
                <div
                  key={off.id}
                  className="p-3 bg-black border border-white/10 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="text-white font-bold uppercase tracking-wider text-xs">{off.title}</h4>
                    <span className="text-[10px] text-yellow-400 font-mono">Codice: {off.code}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteOffer(off.id)}
                    className="p-1.5 text-red-400 hover:bg-red-950 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Iframe Embed Generator for Business Owners */}
          <div className="bg-[#080808] border border-yellow-500/30 p-6 rounded-3xl space-y-4">
            <h3 className="text-white font-light text-xs uppercase tracking-widest flex items-center gap-2">
              <Code className="w-4 h-4 text-yellow-500" />
              <span>Genera Embed per il tuo <span className="font-bold text-yellow-500">Sito Web</span></span>
            </h3>
            <p className="text-xs text-white/50">
              Incolla questo codice nel tuo sito web aziendale per mostrare il tuo Mini-Sito 3D direttamente ai tuoi clienti!
            </p>

            <code className="block p-3 bg-black rounded-xl text-yellow-300 text-[10px] font-mono break-all border border-white/10">
              {embedCode}
            </code>

            <button
              onClick={() => {
                navigator.clipboard.writeText(embedCode);
                setCopiedEmbed(true);
                setTimeout(() => setCopiedEmbed(false), 2000);
              }}
              className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedEmbed ? 'Copiato negli Appunti!' : 'Copia Codice Iframe'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live 360 Virtual Tour Preview Modal for Business Owners */}
      {showTourPreview && (
        <CompanyVirtualTourViewer
          company={formData}
          onClose={() => setShowTourPreview(false)}
        />
      )}
    </div>
  );
};
