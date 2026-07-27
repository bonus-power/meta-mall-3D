import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Company, Pavilion } from '../../types';
import { Search, ZoomIn, ZoomOut, RotateCcw, MapPin, ExternalLink, Globe, Sparkles, Maximize2, Minimize2 } from 'lucide-react';

interface GlobeMap3DProps {
  companies: Company[];
  pavilions: Pavilion[];
  onSelectCompany: (company: Company) => void;
}

export const GlobeMap3D: React.FC<GlobeMap3DProps> = ({ companies, pavilions, onSelectCompany }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredCompany, setHoveredCompany] = useState<Company | null>(null);
  const [selectedCompanyPin, setSelectedCompanyPin] = useState<Company | null>(null);
  const [currentAltitude, setCurrentAltitude] = useState<string>('12.500 km');
  const [isGlobeFullscreen, setIsGlobeFullscreen] = useState<boolean>(false);

  const toggleGlobeFullscreen = () => {
    if (!document.fullscreenElement) {
      if (mainContainerRef.current?.requestFullscreen) {
        mainContainerRef.current.requestFullscreen();
        setIsGlobeFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsGlobeFullscreen(false);
      }
    }
  };

  // Camera & Globe control refs
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isUserInteractingRef = useRef<boolean>(false);

  // Helper to format altitude from camera distance
  // Globe radius = 6 units (Earth radius = 6371 km)
  // cameraDistance ranges from 6.002 (200 meters) to 25.0 (25,000 km)
  const calculateAltitudeText = (dist: number) => {
    const minDist = 6.002;
    const maxDist = 25.0;
    const clamped = Math.max(minDist, Math.min(maxDist, dist));
    const factor = (clamped - 6.0) / (maxDist - 6.0);
    
    // Altitude in km: 0.2 km (200m) at min, 25,000 km at max
    const altKm = 0.2 + Math.pow(factor, 2) * 24999.8;
    
    if (altKm < 1.0) {
      const meters = Math.round(altKm * 1000);
      return `${meters} m`;
    } else {
      return `${altKm.toLocaleString('it-IT', { maximumFractionDigits: 0 })} km`;
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : (container.clientWidth || window.innerWidth);
    const height = rect.height > 0 ? rect.height : (container.clientHeight || window.innerHeight);

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04060f);

    // Starfield Background
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 1500;
    const starPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 400;
      starPositions[i + 1] = (Math.random() - 0.5) * 400;
      starPositions[i + 2] = (Math.random() - 0.5) * 400;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, transparent: true, opacity: 0.8 });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 1000);
    camera.position.set(0, 0, 18);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
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

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5ea, 2.0);
    dirLight.position.set(30, 20, 25);
    scene.add(dirLight);

    const backGlowLight = new THREE.DirectionalLight(0x00d8ff, 1.0);
    backGlowLight.position.set(-30, -20, -25);
    scene.add(backGlowLight);

    // 5. Globe Group
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // Texture Loader for Photorealistic Earth
    const textureLoader = new THREE.TextureLoader();

    // High-resolution real satellite Earth textures with reliable fallback
    const earthTextureUrl = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
    const earthBumpUrl = 'https://unpkg.com/three-globe/example/img/earth-topology.png';
    const earthCloudsUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png';

    // Base Earth Sphere
    const sphereGeo = new THREE.SphereGeometry(6, 96, 96);
    
    // Default Material while textures load
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0x1a3b5c,
      roughness: 0.6,
      metalness: 0.2,
    });

    const globeMesh = new THREE.Mesh(sphereGeo, globeMat);
    globeGroup.add(globeMesh);

    // Load satellite map
    textureLoader.load(
      earthTextureUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        globeMat.map = texture;
        globeMat.color = new THREE.Color(0xffffff);
        globeMat.needsUpdate = true;
      },
      undefined,
      () => {
        // Fallback satellite canvas generator if offline/failed
        const earthCanvas = document.createElement('canvas');
        earthCanvas.width = 2048;
        earthCanvas.height = 1024;
        const ctx = earthCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#0a1d37';
          ctx.fillRect(0, 0, 2048, 1024);
          ctx.fillStyle = '#224422';
          ctx.beginPath();
          ctx.arc(600, 300, 200, 0, Math.PI * 2);
          ctx.fill();
        }
        globeMat.map = new THREE.CanvasTexture(earthCanvas);
        globeMat.needsUpdate = true;
      }
    );

    // Load bump topography
    textureLoader.load(earthBumpUrl, (bumpTex) => {
      globeMat.bumpMap = bumpTex;
      globeMat.bumpScale = 0.08;
      globeMat.needsUpdate = true;
    });

    // Cloud Layer Sphere
    const cloudGeo = new THREE.SphereGeometry(6.08, 64, 64);
    const cloudMat = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    globeGroup.add(cloudMesh);

    textureLoader.load(earthCloudsUrl, (cloudTex) => {
      cloudMat.map = cloudTex;
      cloudMat.needsUpdate = true;
    });

    // Glowing Atmosphere Layer
    const atmosphereGeo = new THREE.SphereGeometry(6.25, 48, 48);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x00d8ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    // Lat/Lng conversion helper
    const latLngToVector3 = (lat: number, lng: number, radius = 6.08) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);

      return new THREE.Vector3(x, y, z);
    };

    // Filter Companies
    const q = searchQuery.toLowerCase().trim();
    const filteredComp = companies.filter((c) => {
      const matchesCategory = selectedCategory === 'all' || c.categoryId === selectedCategory;
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.subCategory.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });

    // 6. Create 3D Pins for Companies on Globe
    const pinsGroup = new THREE.Group();
    globeGroup.add(pinsGroup);

    filteredComp.forEach((comp) => {
      const pos = latLngToVector3(comp.lat, comp.lng, 6.05);
      const pGroup = new THREE.Group();
      pGroup.position.copy(pos);

      const pavilion = pavilions.find((p) => p.id === comp.categoryId);
      const pinHex = pavilion ? pavilion.color : '#ffd700';
      const pinColor = new THREE.Color(pinHex);

      // Pin stem
      const stemGeo = new THREE.CylinderGeometry(0.04, 0.01, 0.5, 12);
      const stemMat = new THREE.MeshStandardMaterial({ color: pinColor, metalness: 0.9, roughness: 0.1 });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
      pGroup.add(stemMesh);

      // Head Orb / Marker Badge
      const orbGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const orbMat = new THREE.MeshBasicMaterial({ color: pinColor });
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      const orbPos = pos.clone().add(pos.clone().normalize().multiplyScalar(0.3));
      orbMesh.position.copy(orbPos);
      orbMesh.userData = { companyId: comp.id, company: comp };
      pGroup.add(orbMesh);

      // Radar Pulse Ring around Pin
      const ringGeo = new THREE.RingGeometry(0.15, 0.28, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: pinColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize());
      ringMesh.name = 'radarRing';
      pGroup.add(ringMesh);

      pinsGroup.add(pGroup);
    });

    // 7. Touch & Mouse Interactions
    let isDragging = false;
    let prevPointer = { x: 0, y: 0 };
    let initialPinchDist = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      isUserInteractingRef.current = true;
      if ('touches' in e) {
        if (e.touches.length === 1) {
          prevPointer = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.touches.length === 2) {
          initialPinchDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
        }
      } else {
        prevPointer = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = 'touches' in e ? (e.touches[0] ? e.touches[0].clientX : 0) : e.clientX;
      const clientY = 'touches' in e ? (e.touches[0] ? e.touches[0].clientY : 0) : e.clientY;

      // Handle Pinch Zoom on Mobile
      if ('touches' in e && e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = initialPinchDist - dist;
        if (Math.abs(delta) > 2) {
          camera.position.z = Math.max(6.002, Math.min(25.0, camera.position.z + delta * 0.02));
          setCurrentAltitude(calculateAltitudeText(camera.position.z));
          initialPinchDist = dist;
        }
        return;
      }

      if (!isDragging) {
        // Raycast for hover tooltip
        const mouseVec = new THREE.Vector2(
          ((clientX - rect.left) / rect.width) * 2 - 1,
          -((clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseVec, camera);
        const intersects = raycaster.intersectObjects(pinsGroup.children, true);

        if (intersects.length > 0) {
          let cur: THREE.Object3D | null = intersects[0].object;
          while (cur) {
            if (cur.userData && cur.userData.company) {
              setHoveredCompany(cur.userData.company);
              renderer.domElement.style.cursor = 'pointer';
              return;
            }
            cur = cur.parent;
          }
        }
        setHoveredCompany(null);
        renderer.domElement.style.cursor = 'grab';
        return;
      }

      // Rotation dragging
      const deltaX = clientX - prevPointer.x;
      const deltaY = clientY - prevPointer.y;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;

      // Clamp X tilt to prevent gimbal lock
      globeGroup.rotation.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, globeGroup.rotation.x));

      prevPointer = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      isUserInteractingRef.current = true;
      const delta = e.deltaY * 0.008;
      // Allow zooming right down to 6.002 (200m altitude above 6.0 surface)
      camera.position.z = Math.max(6.002, Math.min(25.0, camera.position.z + delta));
      setCurrentAltitude(calculateAltitudeText(camera.position.z));
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouseVec = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouseVec, camera);
      const intersects = raycaster.intersectObjects(pinsGroup.children, true);

      if (intersects.length > 0) {
        let cur: THREE.Object3D | null = intersects[0].object;
        while (cur) {
          if (cur.userData && cur.userData.company) {
            const comp: Company = cur.userData.company;
            setSelectedCompanyPin(comp);
            break;
          }
          cur = cur.parent;
        }
      }
    };

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    container.addEventListener('touchstart', onPointerDown, { passive: true });
    container.addEventListener('touchmove', onPointerMove, { passive: true });
    container.addEventListener('touchend', onPointerUp, { passive: true });
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('click', onClick);

    // Resize
    const handleResize = () => {
      if (!container) return;
      const r = container.getBoundingClientRect();
      let w = r.width;
      let h = r.height;
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

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Animate radar pulse rings on pins
      pinsGroup.children.forEach((pGrp) => {
        const ring = pGrp.getObjectByName('radarRing') as THREE.Mesh;
        if (ring) {
          const s = 1 + Math.sin(time * 3 + pGrp.position.x) * 0.2;
          ring.scale.set(s, s, 1);
        }
      });

      // Gently rotate cloud layer independently
      if (cloudMesh) {
        cloudMesh.rotation.y += 0.0004;
      }

      // Gentle auto-rotation if user is not interacting
      if (!isDragging && !isUserInteractingRef.current) {
        globeGroup.rotation.y += 0.0015;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResizeThrottled);
      document.removeEventListener('fullscreenchange', handleResizeThrottled);
      document.removeEventListener('webkitfullscreenchange', handleResizeThrottled);
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('touchstart', onPointerDown);
      container.removeEventListener('touchmove', onPointerMove);
      container.removeEventListener('touchend', onPointerUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('click', onClick);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [companies, pavilions, selectedCategory, searchQuery]);

  // Handle Zoom Controls
  const handleZoomIn = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.max(6.002, cameraRef.current.position.z - 2.5);
    setCurrentAltitude(calculateAltitudeText(cameraRef.current.position.z));
    isUserInteractingRef.current = true;
  };

  const handleZoomOut = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.min(25.0, cameraRef.current.position.z + 2.5);
    setCurrentAltitude(calculateAltitudeText(cameraRef.current.position.z));
    isUserInteractingRef.current = true;
  };

  const handleResetGlobe = () => {
    if (!cameraRef.current || !globeGroupRef.current) return;
    cameraRef.current.position.set(0, 0, 18);
    globeGroupRef.current.rotation.set(0, 0, 0);
    setCurrentAltitude(calculateAltitudeText(18));
    setSelectedCompanyPin(null);
    isUserInteractingRef.current = false;
  };

  // Focus camera onto a specific company coordinate
  const focusOnCompany = (comp: Company) => {
    if (!globeGroupRef.current || !cameraRef.current) return;
    isUserInteractingRef.current = true;

    // Convert lat/lng into rotation angles for the globe
    const targetRotY = -((comp.lng + 180) * (Math.PI / 180)) + Math.PI / 2;
    const targetRotX = (comp.lat * Math.PI) / 180;

    globeGroupRef.current.rotation.y = targetRotY;
    globeGroupRef.current.rotation.x = targetRotX;

    // Zoom close to ground level (200m altitude = z near 6.3)
    cameraRef.current.position.z = 6.4;
    setCurrentAltitude(calculateAltitudeText(6.4));
    setSelectedCompanyPin(comp);
  };

  return (
    <div ref={mainContainerRef} className="fixed inset-0 w-screen h-screen bg-[#04060f] overflow-hidden flex flex-col font-sans select-none">
      {/* Top Header & Search Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-auto">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
          <input
            type="text"
            placeholder="Cerca per Azienda, Città (es. Milano)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/90 text-white placeholder-slate-400 text-xs font-semibold rounded-2xl border border-amber-500/40 focus:outline-none focus:border-amber-400 backdrop-blur-xl shadow-2xl transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap backdrop-blur-xl border ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-black border-amber-300 shadow-lg shadow-amber-500/30'
                : 'bg-slate-900/80 text-amber-300 border-amber-500/30 hover:bg-slate-800'
            }`}
          >
            🌍 Tutte le Aziende Globali ({companies.length})
          </button>
          {pavilions.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedCategory(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap backdrop-blur-xl border ${
                selectedCategory === p.id
                  ? 'bg-amber-400 text-black border-amber-300 shadow-md'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-amber-500/40'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Altitude Indicator & Navigation Controls */}
      <div className="absolute top-20 right-4 z-30 flex flex-col items-end gap-2 pointer-events-auto">
        <div className="bg-slate-950/90 backdrop-blur-xl px-3.5 py-1.5 rounded-xl border border-amber-500/40 text-amber-300 text-xs font-mono font-bold shadow-2xl flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Altezza: {currentAltitude}</span>
        </div>

        <div className="flex flex-col bg-slate-950/90 backdrop-blur-xl border border-amber-500/40 rounded-2xl shadow-2xl p-1 gap-1">
          <button
            onClick={toggleGlobeFullscreen}
            className="p-2 text-yellow-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Schermo Intero Mappamondo 3D"
          >
            {isGlobeFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <div className="h-px bg-white/10" />
          <button
            onClick={handleZoomIn}
            className="p-2 text-amber-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Zoom Avanti (fino a 200m)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-px bg-white/10" />
          <button
            onClick={handleZoomOut}
            className="p-2 text-amber-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Zoom Indietro"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-px bg-white/10" />
          <button
            onClick={handleResetGlobe}
            className="p-2 text-amber-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Recentra Terra 3D"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Result Dropdown List */}
      {searchQuery && (
        <div className="absolute top-16 left-4 z-40 w-full max-w-sm bg-slate-950/95 backdrop-blur-2xl border border-amber-500/50 rounded-2xl shadow-2xl p-2 max-h-60 overflow-y-auto pointer-events-auto">
          <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1">Risultati di Ricerca ({companies.length})</div>
          {companies
            .filter((c) =>
              c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.country.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((c) => (
              <button
                key={c.id}
                onClick={() => focusOnCompany(c)}
                className="w-full flex items-center justify-between p-2 hover:bg-amber-500/20 rounded-xl transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <img src={c.logo} alt={c.name} className="w-7 h-7 rounded-lg object-cover border border-amber-500/30" />
                  <div>
                    <div className="text-xs font-bold text-amber-300">{c.name}</div>
                    <div className="text-[10px] text-slate-400">📍 {c.address}, {c.city}, {c.country}</div>
                  </div>
                </div>
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              </button>
            ))}
        </div>
      )}

      {/* 3D Earth Globe Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Hover Info Tooltip */}
      {hoveredCompany && !selectedCompanyPin && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-slate-950/90 backdrop-blur-2xl border border-amber-500/50 p-3.5 rounded-2xl shadow-2xl flex items-center gap-3.5 max-w-md animate-in fade-in slide-in-from-bottom-2 pointer-events-auto">
          <img
            src={hoveredCompany.logo}
            alt={hoveredCompany.name}
            className="w-12 h-12 rounded-xl object-cover border border-amber-500/40"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-amber-300 font-extrabold text-xs truncate">{hoveredCompany.name}</h4>
            <p className="text-[11px] text-slate-300 truncate">
              📍 {hoveredCompany.address}, {hoveredCompany.city} ({hoveredCompany.country})
            </p>
            <p className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span>Espositatore Meta-TV 3D • Clicca per Entrare</span>
            </p>
          </div>
          <button
            onClick={() => onSelectCompany(hoveredCompany)}
            className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all whitespace-nowrap cursor-pointer active:scale-95"
          >
            Entra nello Store 3D
          </button>
        </div>
      )}

      {/* Selected Pin Detailed Modal Card */}
      {selectedCompanyPin && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-950/95 backdrop-blur-2xl border border-amber-500/60 p-4 sm:p-5 rounded-3xl shadow-[0_0_50px_rgba(255,215,0,0.3)] w-[calc(100vw-2rem)] max-w-md animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={selectedCompanyPin.logo}
                alt={selectedCompanyPin.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/60 shadow-md"
              />
              <div>
                <h3 className="text-amber-300 font-extrabold text-sm sm:text-base">{selectedCompanyPin.name}</h3>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{selectedCompanyPin.address}, {selectedCompanyPin.city}, {selectedCompanyPin.country}</span>
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-full border border-amber-500/40">
                  {selectedCompanyPin.subCategory}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedCompanyPin(null)}
              className="text-slate-400 hover:text-white text-sm font-bold p-1"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
            {selectedCompanyPin.description}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
            <button
              onClick={() => onSelectCompany(selectedCompanyPin)}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Entra nel Sito Virtuale 3D</span>
            </button>
            {selectedCompanyPin.website && (
              <a
                href={selectedCompanyPin.website}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 rounded-xl transition-all"
                title="Sito Web Esterno"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Control Instructions Banner */}
      <div className="absolute bottom-4 right-4 z-10 hidden md:flex items-center gap-2 text-[11px] text-amber-200/80 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-500/30 shadow-xl">
        <span>🖱️ Ruota la Terra • Scroll / Pinch per Zoomare fino a 200m • Clicca sui Punti per Entrare</span>
      </div>
    </div>
  );
};

