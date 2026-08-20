import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Compass,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Check,
  Upload,
  ArrowLeft,
  Sparkles,
  Share2,
  Eye,
  Info,
} from 'lucide-react';

export interface DemoEnvironment360 {
  envId: string;
  title: string;
  subtitle: string;
  category: string;
  icon: string;
  badgeColor: string;
  imageUrl: string;
  description: string;
  highlights: string[];
}

export const DEMO_ENVIRONMENTS: DemoEnvironment360[] = [
  {
    envId: 'fashion',
    title: 'Boutique Moda & Galleria Lusso',
    subtitle: 'Showroom Virtuale di Lusso & Vetrine 3D (Panoramica 360° Equirettangolare)',
    category: 'Shopping & Retail',
    icon: '👗',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    imageUrl: '/panoramas/fashion.jpg',
    description: 'Ambiente equirettangolare a 360° ad alta definizione per boutique di alta moda con corridoi e vetrine espositive.',
    highlights: ['Foto Equirettangolare 2:1', 'Rotazione Orizzontale Fissa', 'Illuminazione Showroom'],
  },
  {
    envId: 'auto',
    title: 'Showroom Supercar & Motori',
    subtitle: 'Salone Espositivo Auto di Lusso (Panoramica 360° Equirettangolare)',
    category: 'Auto & Mobilità',
    icon: '🏎️',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    imageUrl: '/panoramas/auto.jpg',
    description: 'Spazio espositivo a 360° equirettangolare per concessionari auto e moto con vista a 360° centrata all’altezza occhi.',
    highlights: ['Vista Orizzontale Bloccata', 'Ambiente Officina & Salone', 'Rotazione Fluida DX/SX'],
  },
  {
    envId: 'food',
    title: 'Piazza del Cibo & Ristoranti Gourmet',
    subtitle: 'Ristorante con Vista Galleria & Terrazza (Panoramica 360° Equirettangolare)',
    category: 'Food & Beverage',
    icon: '🍕',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    imageUrl: '/panoramas/food.jpg',
    description: 'Foto equirettangolare a 360° di un elegante ristorante gourmet con luci calde e tavoli d’atmosfera.',
    highlights: ['Ambiente Ristorante Reale', 'Focus Orizzontale a 360°', 'Foto Sferica 2:1 Rettangolare'],
  },
  {
    envId: 'tech',
    title: 'Piazza Tech & Store High-Tech VR',
    subtitle: 'Store Elettronica & Laboratorio Futuro (Panoramica 360° Equirettangolare)',
    category: 'Tecnologia',
    icon: '📱',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    imageUrl: '/panoramas/tech.jpg',
    description: 'Studio hi-tech panoramico a 360° equirettangolare per la presentazione di prodotti tecnologici e gadget.',
    highlights: ['Set Fotografico 360°', 'Rotazione DX e SX', 'Centratura in Altezza Perfetta'],
  },
  {
    envId: 'jewels',
    title: 'Atrio Cristallo & Gioielleria di Prestigio',
    subtitle: 'Salotto di Lusso per Orologeria & Diamanti (Panoramica 360° Equirettangolare)',
    category: 'Lusso & Gioielli',
    icon: '💎',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    imageUrl: '/panoramas/jewels.jpg',
    description: 'Ambiente di prestigioso museo e galleria espositiva con finiture dorate e proiezioni di luce.',
    highlights: ['Architettura Monumentale 360°', 'Prospettiva Orizzontale Guida', 'Immagine Rettangolare 2:1'],
  },
  {
    envId: 'casa',
    title: 'Loft Arredamento & Design d’Interni',
    subtitle: 'Showroom Mobili & Cucine Moderne (Panoramica 360° Equirettangolare)',
    category: 'Casa & Living',
    icon: '🛋️',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    imageUrl: '/panoramas/casa.jpg',
    description: 'Loft panoramico equirettangolare per brand di arredamento, con divani e interni eleganti.',
    highlights: ['Living Room Completo 360°', 'Scorrimento Fluido Orizzontale', 'Nessuna Inclinazione Verticale'],
  },
  {
    envId: 'beauty',
    title: 'Centro Benessere & Spa Rigenerativa',
    subtitle: 'Oasi Relax, Resort & Spa (Panoramica 360° Equirettangolare)',
    category: 'Beauty & Wellness',
    icon: '🧘',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    imageUrl: '/panoramas/beauty.jpg',
    description: 'Panoramica equirettangolare all’alba per resort e spa con atmosfera rilassante.',
    highlights: ['Atmosfera Relax a 360°', 'Foto Sferica 2:1', 'Esplorazione Orizzontale Facile'],
  },
];

interface Demo360ViewerProps {
  onBackToMall?: () => void;
}

export const Demo360Viewer: React.FC<Demo360ViewerProps> = ({ onBackToMall }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Initialize active environment from URL query parameter ?env=... or default to fashion
  const [activeEnv, setActiveEnv] = useState<DemoEnvironment360>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const envParam = params.get('env');
      if (envParam) {
        const found = DEMO_ENVIRONMENTS.find((e) => e.envId === envParam);
        if (found) return found;
      }
    }
    return DEMO_ENVIRONMENTS[0];
  });

  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(true);
  const [fovZoom, setFovZoom] = useState<number>(75); // Standard FOV

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lonRef = useRef<number>(0);
  const latRef = useRef<number>(0);
  const prevMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update URL parameter without reloading page when environment changes
  const selectEnvironment = (env: DemoEnvironment360) => {
    setCustomImage(null);
    setActiveEnv(env);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', 'panorama');
      url.searchParams.set('env', env.envId);
      window.history.pushState({}, '', url.toString());
    }
  };

  // Copy direct link for current demo
  const copyDirectLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}?mode=panorama&env=${activeEnv.envId}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Upload custom 360 panorama image
  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setCustomImage(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 3D WebGL Sphere Render Engine
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : window.innerWidth;
    const height = rect.height > 0 ? rect.height : window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(fovZoom, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0.1);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height, true);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const canvasEl = renderer.domElement;
    canvasEl.style.width = '100%';
    canvasEl.style.height = '100%';
    canvasEl.style.display = 'block';
    canvasEl.style.position = 'absolute';
    canvasEl.style.top = '0';
    canvasEl.style.left = '0';

    container.appendChild(canvasEl);

// Helper to create a 2:1 procedural equirectangular 360 canvas texture so rendering NEVER fails
function createProcedural360Texture(env: DemoEnvironment360): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Background gradient (Ceiling to Floor)
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#020617'); // Dark ceiling
    grad.addColorStop(0.3, '#0f172a');
    grad.addColorStop(0.5, '#1e1b4b'); // Eye-level glow
    grad.addColorStop(0.52, '#0f172a'); // Horizon floor line
    grad.addColorStop(1, '#020617'); // Glossy floor
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Horizon glowing neon line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Floor Grid lines (Perspective projection)
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.lineWidth = 2;
    for (let x = 0; x < canvas.width; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, canvas.height / 2);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = canvas.height / 2 + 20; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Ceiling Lights Grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    for (let y = 0; y < canvas.height / 2 - 20; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 4 Showroom Wall Display Panels around the 360 space
    const xPositions = [256, 768, 1280, 1792];
    xPositions.forEach((px, idx) => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
      ctx.shadowBlur = 15;

      const pw = 340;
      const ph = 380;
      const py = canvas.height / 2 - ph / 2;

      ctx.fillRect(px - pw / 2, py, pw, ph);
      ctx.strokeRect(px - pw / 2, py, pw, ph);

      ctx.shadowBlur = 0;
      ctx.font = '80px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(env.icon, px, py + 100);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(env.title.split('&')[0], px, py + 200);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.fillText(`Vetrina 3D ${idx + 1} • ${env.category}`, px, py + 245);
    });

    // 360 Header Banner
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`✨ META-TV VIRTUAL SHOWROOM 360° - ${env.title.toUpperCase()} ✨`, canvas.width / 2, 80);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

    // 4. Inverted Panoramic Sphere
    const sphereGeo = new THREE.SphereGeometry(500, 60, 40);
    sphereGeo.scale(-1, 1, 1);

    // Initial procedural texture (guarantees instant render with zero black screen)
    const initialTexture = createProcedural360Texture(activeEnv);
    const sphereMat = new THREE.MeshBasicMaterial({ map: initialTexture });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphereMesh);

    // Load actual high-res photo texture asynchronously with crossOrigin and fallbacks
    const textureUrl = customImage || activeEnv.imageUrl;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const photoTexture = new THREE.Texture(img);
      photoTexture.needsUpdate = true;
      sphereMat.map = photoTexture;
      sphereMat.needsUpdate = true;
    };
    img.onerror = () => {
      console.warn('Could not load external image, using 360 showroom texture fallback');
    };
    img.src = textureUrl;

    // 5. Controls
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - prevMouseRef.current.x;

      lonRef.current -= deltaX * 0.15;
      latRef.current = 0; // Fixed horizon level - no up/down motion

      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Touch support for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseRef.current.x;

      lonRef.current -= deltaX * 0.2;
      latRef.current = 0; // Fixed horizon level - no up/down motion

      prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Resize
    const handleResize = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const w = rect.width > 0 ? rect.width : window.innerWidth;
      const h = rect.height > 0 ? rect.height : window.innerHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, true);
      }
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    // Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isAutoRotate && !isDraggingRef.current) {
        lonRef.current += 0.08;
      }

      const phi = THREE.MathUtils.degToRad(90 - latRef.current);
      const theta = THREE.MathUtils.degToRad(lonRef.current);

      const target = new THREE.Vector3();
      target.x = 500 * Math.sin(phi) * Math.cos(theta);
      target.y = 500 * Math.cos(phi);
      target.z = 500 * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(target);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sphereGeo.dispose();
      sphereMat.dispose();
      initialTexture.dispose();
      renderer.dispose();
    };
  }, [activeEnv, customImage, isAutoRotate]);

  // Adjust camera zoom / FOV
  const adjustZoom = (delta: number) => {
    if (cameraRef.current) {
      const newFov = Math.max(30, Math.min(110, cameraRef.current.fov + delta));
      cameraRef.current.fov = newFov;
      cameraRef.current.updateProjectionMatrix();
      setFovZoom(newFov);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-slate-950 overflow-hidden text-slate-100 flex flex-col font-sans select-none z-[1000]">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Header Bar */}
      <header className="relative z-30 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent backdrop-blur-md border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          {onBackToMall && (
            <button
              onClick={onBackToMall}
              className="px-3.5 py-2 bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-extrabold text-xs rounded-xl border border-amber-500/40 transition-all flex items-center gap-2 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Torna al Galleria 3D</span>
            </button>
          )}

          <div className="hidden md:flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-300">Demo Spazi Panoramici 360°</span>
          </div>
        </div>

        {/* Share & Link Copy Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyDirectLink}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg border ${
              copiedLink
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-amber-400'
            }`}
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copiato!' : 'Copia Link Diretto Demo'}</span>
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 transition-all"
            title="Dettagli Spazio"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Bottom Control & Selector Dashboard */}
      <div className="mt-auto relative z-30 p-4 sm:p-6 space-y-3 pointer-events-none">
        {/* Info Card (Toggleable) */}
        {showInfo && (
          <div className="pointer-events-auto max-w-xl bg-slate-900/90 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-amber-500/30 shadow-2xl animate-fade-in space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeEnv.icon}</span>
                <div>
                  <h2 className="text-base font-black text-amber-300">{activeEnv.title}</h2>
                  <p className="text-xs text-slate-400">{activeEnv.subtitle}</p>
                </div>
              </div>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${activeEnv.badgeColor}`}>
                {activeEnv.category}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{activeEnv.description}</p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {activeEnv.highlights.map((h, idx) => (
                <span key={idx} className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-700">
                  ✓ {h}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Environment Selector Bar & Viewport Controls */}
        <div className="pointer-events-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-2xl p-3 sm:p-4 rounded-2xl border border-amber-500/30 shadow-2xl">
          {/* List of Environments */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {DEMO_ENVIRONMENTS.map((env) => {
              const isSelected = activeEnv.envId === env.envId && !customImage;
              return (
                <button
                  key={env.envId}
                  onClick={() => selectEnvironment(env)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105'
                      : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-amber-500/40'
                  }`}
                >
                  <span className="text-base">{env.icon}</span>
                  <span>{env.title.split('&')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Controls: Auto-Rotate, Zoom, Custom File Upload */}
          <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800 pt-2 lg:pt-0 lg:pl-3">
            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                isAutoRotate
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Attiva/Disattiva Rotazione Automatica 360°"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin-slow text-amber-400' : ''}`} />
              <span className="hidden sm:inline">{isAutoRotate ? 'Auto-Giro ON' : 'Auto-Giro OFF'}</span>
            </button>

            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
              <button
                onClick={() => adjustZoom(10)}
                className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-all"
                title="Rimpiccolisci Vista (FOV Largo)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => adjustZoom(-10)}
                className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-all"
                title="Ingrandisci Vista (Zoom In)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Custom 360 Image Upload */}
            <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shrink-0">
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Carica Foto 360°</span>
              <input type="file" accept="image/*" onChange={handleCustomUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Floating Drag Hint */}
      <div className="absolute top-20 right-6 z-20 hidden md:flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-full text-xs text-slate-400">
        <Compass className="w-4 h-4 text-amber-400" />
        <span>Trascina a destra e sinistra per ruotare la vista a 360° (Altezza centrata fissa)</span>
      </div>
    </div>
  );
};
