import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Panorama360 } from '../../types';

interface Panorama3DViewerProps {
  panoramas: Panorama360[];
}

export const Panorama3DViewer: React.FC<Panorama3DViewerProps> = ({ panoramas }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activePano, setActivePano] = useState<Panorama360>(panoramas[0] || {
    id: 'custom',
    title: 'Atrio Cristallo Meta-TV',
    category: 'Virtual Mall',
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1600&q=80',
    description: 'Ambiente panoramico 360° del centro commerciale.',
  });
  const [customImage, setCustomImage] = useState<string | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : (container.clientWidth || window.innerWidth);
    const height = rect.height > 0 ? rect.height : (container.clientHeight || window.innerHeight);

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0.1);

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

    // 4. Inner Panoramic Sphere
    const sphereGeo = new THREE.SphereGeometry(500, 60, 40);
    sphereGeo.scale(-1, 1, 1); // Invert faces inward

    const textureUrl = customImage || activePano.imageUrl;
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(textureUrl);

    const sphereMat = new THREE.MeshBasicMaterial({ map: texture });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphereMesh);

    // 5. Drag Controls to Look Around
    let isDragging = false;
    let lon = 0;
    let lat = 0;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouse.x;
      const deltaY = e.clientY - prevMouse.y;

      lon -= deltaX * 0.1;
      lat += deltaY * 0.1;
      lat = Math.max(-85, Math.min(85, lat));

      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const handleResize = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const w = rect.width > 0 ? rect.width : (container.clientWidth || window.innerWidth);
      const h = rect.height > 0 ? rect.height : (container.clientHeight || window.innerHeight);
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, true);
      }
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    // Render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Auto slow rotation removed for manual drag movement

      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);

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
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sphereGeo.dispose();
      sphereMat.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, [activePano, customImage]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <div className="fixed inset-0 w-screen h-screen bg-slate-950 overflow-hidden">
      {/* 3D Panorama WebGL Container or Embed Iframe */}
      {activePano.iframeUrl && !customImage ? (
        <iframe
          src={activePano.iframeUrl}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; vr"
          allowFullScreen
          title={activePano.title}
        />
      ) : (
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      )}

      {/* Panorama Selector Bar */}
      <div className="absolute top-20 sm:top-24 left-4 sm:left-6 right-4 sm:right-6 z-20 flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-amber-500/30 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="text-xl">🖼️</span>
          <div>
            <h3 className="text-amber-300 font-bold text-sm">{activePano.title}</h3>
            <p className="text-xs text-slate-300">{activePano.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {panoramas.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setCustomImage(null);
                setActivePano(p);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                activePano.id === p.id && !customImage
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-amber-500/40'
              }`}
            >
              {p.title}
            </button>
          ))}

          {/* Upload Custom 360 Panorama */}
          <label className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer shadow-md transition-all whitespace-nowrap flex items-center gap-1.5">
            <span>📷 Carica 360°</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div className="absolute bottom-4 right-6 z-10 text-xs text-slate-400 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800">
        🖱️ Trascina col mouse per esplorare l'ambiente a 360°
      </div>
    </div>
  );
};
