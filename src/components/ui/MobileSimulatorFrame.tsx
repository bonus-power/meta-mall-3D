import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Monitor, RotateCw, Copy, Check, Tablet, Maximize2, ExternalLink } from 'lucide-react';

interface MobileSimulatorFrameProps {
  children: React.ReactNode;
  onClose?: () => void;
  fovLevel?: number;
  onFovChange?: (level: number) => void;
}

export const MobileSimulatorFrame: React.FC<MobileSimulatorFrameProps> = ({
  children,
  onClose,
  fovLevel = 100,
  onFovChange,
}) => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [deviceModel, setDeviceModel] = useState<'iphone' | 'android' | 'tablet'>('iphone');
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(0.7); // Default ~0.7 to ensure full phone fits on screen
  const [autoScale, setAutoScale] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dimensions based on device and orientation
  const getDeviceDimensions = () => {
    if (deviceModel === 'tablet') {
      return orientation === 'portrait' ? { w: 768, h: 1024 } : { w: 1024, h: 768 };
    }
    if (deviceModel === 'android') {
      return orientation === 'portrait' ? { w: 380, h: 800 } : { w: 800, h: 380 };
    }
    // iPhone 15 default
    return orientation === 'portrait' ? { w: 390, h: 844 } : { w: 844, h: 390 };
  };

  const dims = getDeviceDimensions();

  // Calculate auto-fit scale based on available container dimensions
  useEffect(() => {
    if (!autoScale) return;

    const calculateFit = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      if (!clientWidth || !clientHeight) return;

      const padding = 40; // Total padding
      const availW = clientWidth - padding;
      const availH = clientHeight - padding;

      const scaleX = availW / dims.w;
      const scaleY = availH / dims.h;
      const fitScale = Math.min(scaleX, scaleY, 1.0);

      // Clamp fitScale nicely
      setZoomLevel(Math.max(0.2, Math.min(fitScale, 1.0)));
    };

    calculateFit();
    window.addEventListener('resize', calculateFit);
    return () => window.removeEventListener('resize', calculateFit);
  }, [autoScale, dims.w, dims.h]);

  const handleCopyLink = () => {
    const mobileUrl = `${window.location.origin}${window.location.pathname}?view=mobile`;
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-2xl flex flex-col md:flex-row items-stretch justify-between overflow-hidden text-white select-none">
      
      {/* SIDEBAR CONTROLS PANEL (Positioned on the Left for easy demo access) */}
      <aside className="w-full md:w-80 bg-slate-900/90 border-b md:border-b-0 md:border-r border-slate-800/80 p-4 md:p-6 flex flex-col justify-between gap-6 shrink-0 z-30 shadow-2xl overflow-y-auto">
        <div className="space-y-6">
          {/* Header Title */}
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2.5 bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-300 rounded-2xl text-black font-extrabold shadow-lg shadow-amber-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-wider uppercase flex items-center gap-2">
                Simulatore Mobile
                <span className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] rounded-full font-bold">
                  3D LIVE
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Anteprima fedele smartphone
              </p>
            </div>
          </div>

          {/* Section 1: Device Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider block">
              Dispositivo Demo
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setDeviceModel('iphone')}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  deviceModel === 'iphone' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>iPhone</span>
              </button>

              <button
                onClick={() => setDeviceModel('android')}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  deviceModel === 'android' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Android</span>
              </button>

              <button
                onClick={() => setDeviceModel('tablet')}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  deviceModel === 'tablet' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tablet className="w-4 h-4" />
                <span>Tablet</span>
              </button>
            </div>
          </div>

          {/* Section 2: Orientation Toggle */}
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider block">
              Orientamento Schermo
            </label>
            <button
              onClick={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all flex items-center justify-between text-xs font-bold text-slate-200"
            >
              <div className="flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-yellow-400" />
                <span>{orientation === 'portrait' ? 'Verticale (Portrait)' : 'Orizzontale (Landscape)'}</span>
              </div>
              <span className="text-[10px] text-slate-400">{dims.w} x {dims.h}px</span>
            </button>
          </div>

          {/* Section 3: 3D Mall Zoom Controls inside Smartphone Screen */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider block">
                ZOOM CENTRO COMMERCIALE 3D
              </label>
            </div>

            <select
              value={fovLevel}
              onChange={(e) => onFovChange?.(parseFloat(e.target.value))}
              className="w-full bg-slate-950 text-amber-300 font-bold border border-amber-500/40 rounded-xl px-3 py-2.5 text-xs focus:outline-none cursor-pointer shadow-inner"
            >
              <option value={100}>100% - Dimensione Normale 3D</option>
              <option value={85}>85% - Rimpiccolito (Vista Più Ampia)</option>
              <option value={75}>75% - Medio Rimpiccolito (Consigliato)</option>
              <option value={50}>50% - Molto Rimpiccolito (Panoramica)</option>
              <option value={25}>25% - Miniatura (Super Panoramica)</option>
              <option value={10}>10% - Ultra Rimpiccolito (Vista Totale 10%)</option>
              <option value={125}>125% - Ingrandito / Zoom In</option>
            </select>
            <p className="text-[10px] text-slate-400 italic">
              Rimpiccolisce o ingrandisce il centro 3D dentro lo schermo del cellulare senza rimpiccolire la scocca dello smartphone.
            </p>
          </div>

          {/* Section 4: Share / Test Real Mobile */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider block">
              Prova su Cellulare Reale
            </label>
            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
              <span>{copied ? 'Link Copiato in Appunti!' : 'Copia Link Mobile'}</span>
            </button>
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-slate-400 break-all flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{window.location.origin}?view=mobile</span>
            </div>
          </div>
        </div>

        {/* Exit Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider"
          >
            <Monitor className="w-4 h-4 text-red-400" />
            <span>Esci e Torna al Desktop</span>
          </button>
        )}
      </aside>

      {/* CENTER VIEWPORT: SMARTPHONE FRAME CONTAINER */}
      <main ref={containerRef} className="flex-1 w-full h-full flex items-center justify-center p-4 overflow-hidden relative bg-slate-950/60">
        <div
          className="relative transition-all duration-300 ease-out shadow-[0_0_90px_rgba(245,158,11,0.2)] rounded-[44px] border-[10px] border-slate-800 bg-black flex flex-col overflow-hidden shrink-0"
          style={{
            width: `${dims.w}px`,
            height: `${dims.h}px`,
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Top Notch / Dynamic Island */}
          {deviceModel === 'iphone' && orientation === 'portrait' && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-end px-2 gap-1.5 border border-slate-800/60 shadow-md pointer-events-none">
              <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-800" />
              <div className="w-2 h-2 bg-blue-900/80 rounded-full" />
            </div>
          )}

          {/* Status Bar */}
          <div className="w-full h-7 bg-slate-950 text-slate-300 text-[10px] font-bold flex items-center justify-between px-6 shrink-0 z-40 border-b border-white/5 pointer-events-none">
            <span>09:41</span>
            <div className="flex items-center gap-2 text-[9px] text-slate-400">
              <span>5G</span>
              <span>100% 🔋</span>
            </div>
          </div>

          {/* Smartphone Screen Viewport Content */}
          <div className="flex-1 w-full relative overflow-hidden bg-black">
            {children}
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="w-full h-5 bg-slate-950 flex items-center justify-center shrink-0 z-40 pointer-events-none">
            <div className="w-32 h-1 bg-slate-600 rounded-full" />
          </div>
        </div>
      </main>
    </div>
  );
};
