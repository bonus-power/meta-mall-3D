import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Company, VirtualTourHotspot, VirtualTourScene } from '../../types';
import { VirtualTourMiniMap } from './VirtualTourMiniMap';
import {
  X,
  Zap,
  ExternalLink,
  ShoppingBag,
  Phone,
  Info,
  Globe,
  Compass,
  CheckCircle2,
  Sparkles,
  Maximize2,
  Minimize2,
  ArrowRight,
  DoorOpen,
  Layers,
  Footprints,
} from 'lucide-react';

interface CompanyVirtualTourViewerProps {
  company: Company;
  onClose: () => void;
}

interface ScreenHotspot {
  hotspot: VirtualTourHotspot;
  x: number;
  y: number;
  visible: boolean;
}

export const CompanyVirtualTourViewer: React.FC<CompanyVirtualTourViewerProps> = ({
  company,
  onClose,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sphereMatRef = useRef<THREE.MeshBasicMaterial | null>(null);

  const [screenHotspots, setScreenHotspots] = useState<ScreenHotspot[]>([]);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const [bonusPowerPoints, setBonusPowerPoints] = useState<number>(0);
  const [activeProductModal, setActiveProductModal] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [currentYaw, setCurrentYaw] = useState<number>(0);
  const lastYawRef = useRef<number>(0);

  const virtualTour = company.virtualTour || {
    enabled: true,
    title: `Virtual Tour 360° - ${company.name}`,
    panoramaUrl:
      company.headerImage ||
      'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2000&q=80',
    description: `Benvenuto all'interno di ${company.name}. Esplora gli ambienti a 360° e passa da una stanza all'altra!`,
    hotspots: [],
  };

  // Build room scenes list
  const tourScenes: VirtualTourScene[] =
    virtualTour.scenes && virtualTour.scenes.length > 0
      ? virtualTour.scenes
      : [
          {
            id: 'scene-default',
            name: 'Ambiente Principale',
            panoramaUrl:
              virtualTour.panoramaUrl ||
              company.headerImage ||
              'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2000&q=80',
            hotspots: virtualTour.hotspots || [],
          },
        ];

  const [activeSceneId, setActiveSceneId] = useState<string>(
    virtualTour.initialSceneId && tourScenes.some((s) => s.id === virtualTour.initialSceneId)
      ? virtualTour.initialSceneId
      : tourScenes[0].id
  );

  const activeScene = tourScenes.find((s) => s.id === activeSceneId) || tourScenes[0];
  const activeHotspots = activeScene.hotspots || [];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Update sphere texture dynamically when activeScene changes
  useEffect(() => {
    if (sphereMatRef.current && activeScene.panoramaUrl) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(activeScene.panoramaUrl, (newTex) => {
        newTex.colorSpace = THREE.SRGBColorSpace;
        if (sphereMatRef.current) {
          sphereMatRef.current.map = newTex;
          sphereMatRef.current.needsUpdate = true;
        }
      });
    }
  }, [activeSceneId, activeScene.panoramaUrl]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0.1);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height, true);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const canvasEl = renderer.domElement;
    canvasEl.style.width = '100%';
    canvasEl.style.height = '100%';
    canvasEl.style.position = 'absolute';
    canvasEl.style.top = '0';
    canvasEl.style.left = '0';
    container.appendChild(canvasEl);

    // 4. Inverted Panoramic 360 Sphere
    const sphereGeo = new THREE.SphereGeometry(500, 60, 40);
    sphereGeo.scale(-1, 1, 1);

    const textureLoader = new THREE.TextureLoader();
    const initialUrl = activeScene.panoramaUrl;
    const texture = textureLoader.load(initialUrl, () => {
      texture.colorSpace = THREE.SRGBColorSpace;
    });

    const sphereMat = new THREE.MeshBasicMaterial({ map: texture });
    sphereMatRef.current = sphereMat;
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphereMesh);

    // Controls state
    let isDragging = false;
    let lon = 0;
    let lat = 0;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.interactive-hotspot-ui')) return;
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouse.x;
      const deltaY = e.clientY - prevMouse.y;

      lon -= deltaX * 0.15;
      lat += deltaY * 0.15;
      lat = Math.max(-85, Math.min(85, lat));

      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch controls for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouse.x;
      const deltaY = e.touches[0].clientY - prevMouse.y;
      lon -= deltaX * 0.15;
      lat += deltaY * 0.15;
      lat = Math.max(-85, Math.min(85, lat));
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      let w = rect.width;
      let h = rect.height;
      if (w <= 0 || h <= 0) {
        w = container.clientWidth || window.innerWidth;
        h = container.clientHeight || window.innerHeight;
      }
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        if (renderer.domElement) {
          renderer.domElement.style.width = '100%';
          renderer.domElement.style.height = '100%';
        }
      }
    };

    const handleResizeThrottled = () => {
      handleResize();
      setTimeout(handleResize, 50);
      setTimeout(handleResize, 150);
      setTimeout(handleResize, 300);
      setTimeout(handleResize, 600);
    };

    handleResizeThrottled();
    const resizeObserver = new ResizeObserver(() => handleResizeThrottled());
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResizeThrottled);
    document.addEventListener('fullscreenchange', handleResizeThrottled);
    document.addEventListener('webkitfullscreenchange', handleResizeThrottled);

    // Render loop and screen projection of 3D Hotspots
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);

      const target = new THREE.Vector3();
      target.x = 500 * Math.sin(phi) * Math.cos(theta);
      target.y = 500 * Math.cos(phi);
      target.z = 500 * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(target);
      renderer.render(scene, camera);

      // Update normalized Yaw rotation angle for 2D map visual cone orientation
      const normalizedYaw = ((lon % 360) + 360) % 360;
      if (Math.abs(lastYawRef.current - normalizedYaw) >= 0.5) {
        lastYawRef.current = normalizedYaw;
        setCurrentYaw(normalizedYaw);
      }

      // Project Active Hotspot 3D positions to 2D Screen pixel coordinates
      const currentWidth = container.clientWidth || window.innerWidth;
      const currentHeight = container.clientHeight || window.innerHeight;

      const projected: ScreenHotspot[] = activeHotspots.map((hs) => {
        const hsPhi = THREE.MathUtils.degToRad(90 - hs.pitch);
        const hsTheta = THREE.MathUtils.degToRad(hs.yaw);

        const pos = new THREE.Vector3();
        pos.x = 450 * Math.sin(hsPhi) * Math.cos(hsTheta);
        pos.y = 450 * Math.cos(hsPhi);
        pos.z = 450 * Math.sin(hsPhi) * Math.sin(hsTheta);

        pos.project(camera);

        const visible = pos.z < 1;
        const screenX = (pos.x * 0.5 + 0.5) * currentWidth;
        const screenY = (-(pos.y * 0.5) + 0.5) * currentHeight;

        return {
          hotspot: hs,
          x: screenX,
          y: screenY,
          visible,
        };
      });

      setScreenHotspots(projected);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResizeThrottled);
      document.removeEventListener('fullscreenchange', handleResizeThrottled);
      document.removeEventListener('webkitfullscreenchange', handleResizeThrottled);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (container.contains(canvasEl)) {
        container.removeChild(canvasEl);
      }
      renderer.dispose();
    };
  }, [company, virtualTour, activeSceneId, activeHotspots]);

  const handleHotspotClick = (hs: VirtualTourHotspot) => {
    if (hs.points) {
      setBonusPowerPoints((prev) => prev + hs.points!);
    }

    if (hs.actionType === 'scene-change' && hs.targetSceneId) {
      const targetScene = tourScenes.find((s) => s.id === hs.targetSceneId);
      if (targetScene) {
        setActiveSceneId(hs.targetSceneId);
        setActiveNotification(`🚪 Ti sei spostato in: ${targetScene.name}`);
      }
    } else if (hs.actionType === 'bonus-power') {
      const link = hs.targetUrl || company.bonusPowerLink;
      window.open(link, '_blank');
      setActiveNotification(`⚡ +${hs.points || 200} Punti Power Riscattati! Reindirizzamento...`);
    } else if (hs.actionType === 'website') {
      const link = hs.targetUrl || company.website;
      window.open(link, '_blank');
      setActiveNotification(`🌐 Apertura Sito Ufficiale: ${link}`);
    } else if (hs.actionType === 'phone') {
      window.location.href = `tel:${company.phone}`;
      setActiveNotification(`📞 Avvio Chiamata a ${company.name} (${company.phone})`);
    } else if (hs.actionType === 'product') {
      setActiveProductModal(hs.productId || company.products[0]?.id || 'p1');
    } else if (hs.actionType === 'info') {
      setActiveNotification(`ℹ️ ${hs.description || hs.label}`);
    }

    setTimeout(() => {
      setActiveNotification(null);
    }, 4500);
  };

  const getHotspotIcon = (type: string) => {
    switch (type) {
      case 'scene-change':
        return <DoorOpen className="w-5 h-5 text-yellow-300 fill-yellow-400/20" />;
      case 'bonus-power':
        return <Zap className="w-5 h-5 text-black fill-black" />;
      case 'website':
        return <Globe className="w-4 h-4 text-cyan-300" />;
      case 'product':
        return <ShoppingBag className="w-4 h-4 text-emerald-300" />;
      case 'phone':
        return <Phone className="w-4 h-4 text-yellow-300" />;
      default:
        return <Info className="w-4 h-4 text-amber-300" />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 w-screen h-screen bg-black overflow-hidden select-none animate-in fade-in duration-300"
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Header Overlay */}
      <div className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-4 bg-black/80 backdrop-blur-xl p-4 rounded-3xl border border-yellow-500/40 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-3">
          <img
            src={company.logo}
            alt={company.name}
            className="w-12 h-12 rounded-2xl object-cover border-2 border-yellow-500 bg-black shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-yellow-400">
                VIRTUAL TOUR 360°
              </span>
              {company.verified && <CheckCircle2 className="w-4 h-4 text-yellow-400" />}
            </div>
            <h2 className="text-sm sm:text-lg font-light tracking-wide text-white uppercase flex items-center gap-2">
              <span>{company.name}</span>
              <span className="text-yellow-400 font-bold text-xs bg-yellow-500/20 px-2.5 py-0.5 rounded-full border border-yellow-500/40">
                {activeScene.name}
              </span>
            </h2>
          </div>
        </div>

        {/* Action Buttons: Fullscreen, Direct Bonus-Power & Close */}
        <div className="flex items-center gap-2">
          {bonusPowerPoints > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-xs font-mono font-bold">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>+{bonusPowerPoints} Punti Power!</span>
            </div>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="px-3 py-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-yellow-300 hover:text-yellow-200 border border-yellow-500/40 rounded-2xl flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider transition-all"
            title="Schermo Intero 360°"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span className="hidden md:inline">Esci Schermo Intero</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span className="hidden md:inline">Schermo Intero</span>
              </>
            )}
          </button>

          <a
            href={company.bonusPowerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center gap-1.5 transition-all transform hover:scale-105"
          >
            <Zap className="w-4 h-4 fill-black" />
            <span className="hidden sm:inline">Bonus-Power</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-zinc-900/90 hover:bg-black text-white/80 hover:text-white border border-white/20 flex items-center justify-center transition-all"
            title="Chiudi Virtual Tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Floating 2D Mini-Map & Visual Cone Overlay */}
      <div className="absolute top-24 right-4 z-40">
        <VirtualTourMiniMap
          scenes={tourScenes}
          activeSceneId={activeSceneId}
          currentYaw={currentYaw}
          floorPlanUrl={virtualTour.floorPlanUrl}
          onSelectScene={(sId) => {
            const sc = tourScenes.find((s) => s.id === sId);
            setActiveSceneId(sId);
            if (sc) {
              setActiveNotification(`🚪 Ti sei spostato in: ${sc.name}`);
            }
          }}
        />
      </div>

      {/* Interactive 3D Hotspot Buttons Rendered on top of 360 View */}
      {screenHotspots.map(({ hotspot, x, y, visible }) => {
        if (!visible) return null;
        if (x < -50 || x > window.innerWidth + 50 || y < -50 || y > window.innerHeight + 50) return null;

        const isDoor = hotspot.actionType === 'scene-change';
        const isBonusPower = hotspot.actionType === 'bonus-power';

        return (
          <div
            key={hotspot.id}
            style={{ left: `${x}px`, top: `${y}px` }}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 interactive-hotspot-ui pointer-events-auto"
          >
            <button
              onClick={() => handleHotspotClick(hotspot)}
              className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-full shadow-[0_0_25px_rgba(0,0,0,0.8)] border transition-all transform hover:scale-110 active:scale-95 ${
                isDoor
                  ? 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 text-black border-yellow-100 font-extrabold shadow-[0_0_35px_rgba(255,215,0,0.9)]'
                  : isBonusPower
                  ? 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 text-black border-yellow-200 font-extrabold shadow-[0_0_30px_rgba(255,215,0,0.8)]'
                  : 'bg-black/85 text-white border-yellow-500/60 hover:border-yellow-400'
              }`}
            >

              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  isDoor || isBonusPower
                    ? 'bg-black text-yellow-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {getHotspotIcon(hotspot.actionType)}
              </span>

              <span className="text-xs tracking-wider uppercase font-extrabold whitespace-nowrap">
                {hotspot.label}
              </span>

              {hotspot.points ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-black text-yellow-300 border border-yellow-500/40">
                  +{hotspot.points} PT
                </span>
              ) : null}
            </button>
          </div>
        );
      })}

      {/* Notification Banner when room changes or hotspot clicked */}
      {activeNotification && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 bg-zinc-950 border-2 border-yellow-500 px-6 py-3 rounded-2xl shadow-[0_0_40px_rgba(212,175,55,0.5)] text-yellow-300 font-bold text-xs uppercase tracking-wider flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <Footprints className="w-5 h-5 text-yellow-400 animate-bounce" />
          <span>{activeNotification}</span>
        </div>
      )}

      {/* Product Highlight Modal when clicking product hotspot */}
      {activeProductModal && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#080808] border-2 border-yellow-500 rounded-3xl max-w-md w-full p-6 space-y-4 text-white relative shadow-2xl">
            <button
              onClick={() => setActiveProductModal(null)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest block">
              Prodotto in Vetrina 360°
            </span>

            {company.products.length > 0 ? (
              <div className="space-y-3">
                <img
                  src={company.products[0].image}
                  alt={company.products[0].name}
                  className="w-full h-48 rounded-2xl object-cover border border-white/10"
                />
                <h3 className="text-lg font-bold text-white">{company.products[0].name}</h3>
                <p className="text-xs text-white/70">{company.products[0].description}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-black text-yellow-400">{company.products[0].price}</span>
                  <a
                    href={company.bonusPowerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5"
                  >
                    <span>Acquista con Bonus-Power</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-xs text-white/60">Contatta l'azienda per richiedere informazioni su questo articolo.</p>
            )}
          </div>
        </div>
      )}

      {/* Floating Bottom Navigation Instructions & Room Switcher Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 bg-black/85 backdrop-blur-md px-5 py-3 rounded-2xl border border-yellow-500/30 text-xs text-white/70 shadow-2xl">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-yellow-400" />
          <span className="hidden lg:inline text-[11px]">Trascina col mouse/dito per ruotare a 360°. Clicca sulle porte per cambiare stanza!</span>
        </div>

        {/* Room Switcher Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-1 shrink-0">
            <Layers className="w-3.5 h-3.5" />
            <span>Ambienti Tour ({tourScenes.length}):</span>
          </span>

          {tourScenes.map((scene) => {
            const isActive = scene.id === activeSceneId;
            return (
              <button
                key={scene.id}
                onClick={() => {
                  setActiveSceneId(scene.id);
                  setActiveNotification(`🚪 Ti sei spostato in: ${scene.name}`);
                }}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-yellow-500 text-black border-yellow-300 font-extrabold shadow-[0_0_15px_rgba(212,175,55,0.6)]'
                    : 'bg-zinc-900/90 hover:bg-zinc-800 text-white/80 hover:text-yellow-300 border-white/15'
                }`}
              >
                <DoorOpen className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-yellow-400'}`} />
                <span>{scene.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
