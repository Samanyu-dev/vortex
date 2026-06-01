import React, { useState, useRef } from 'react';
import { useVortexStore } from '../store/useVortexStore';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Settings as SettingsIcon, ShieldCheck, Database, Sliders, SlidersHorizontal, RefreshCw } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function Settings() {
  const { user, token, fetchTasks } = useVortexStore();

  const [blurStrength, setBlurStrength] = useState(16);
  const [ambientGlow, setAmbientGlow] = useState(80);
  const [reSeeding, setReSeeding] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Stagger inputs
  useGSAP(() => {
    gsap.fromTo('.settings-stagger',
      { opacity: 0, x: -15 },
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
    );
  }, { scope: containerRef });

  const handleReSeed = () => {
    setReSeeding(true);
    setTimeout(() => {
      fetchTasks();
      setReSeeding(false);
      
      // Border color green glow feedback
      gsap.fromTo('.resync-bullet',
        { scale: 1.5, opacity: 1 },
        { scale: 1, opacity: 0.5, duration: 1, ease: 'power2.out' }
      );
    }, 1200);
  };

  return (
    <div ref={containerRef} className="flex-1 flex flex-col h-screen overflow-y-auto no-scrollbar p-6 select-none max-w-4xl">
      
      {/* HEADER */}
      <header className="mb-8 shrink-0">
        <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2">
          <SettingsIcon className="w-6 h-6 text-vortex-secondary" />
          <span>Core Matrix Config</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Calibrate dashboard parameters and security node links.</p>
      </header>

      {/* BLOCKS ROW */}
      <div className="space-y-6">
        
        {/* SECTION 1: SYSTEM LINK */}
        <div className="settings-stagger glass-panel rounded-2xl p-6 border border-white/5 shadow-glass space-y-4">
          <h3 className="text-xs font-bold font-mono tracking-widest text-slate-400 uppercase flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-vortex-secondary animate-pulse" />
            <span>SECURITY DECRYPTION CORE</span>
          </h3>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-slate-500">Core Node Node ID</span>
              <span className="font-mono text-slate-300 select-all">{user?.id || 'VX-UNKNOWN-NODE'}</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-slate-500">Node Signature</span>
              <span className="font-mono text-slate-300 truncate max-w-xs select-all">{token || 'NO_LINK_ESTABLISHED'}</span>
            </div>

            <div className="flex items-center justify-between pb-1">
              <span className="text-slate-500">Cryptography Standard</span>
              <span className="font-mono text-vortex-secondary font-bold">JWT (RSA-SHA256)</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: CALIBRATION SLIDERS */}
        <div className="settings-stagger glass-panel rounded-2xl p-6 border border-white/5 shadow-glass space-y-5">
          <h3 className="text-xs font-bold font-mono tracking-widest text-slate-400 uppercase flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-vortex-primary animate-pulse" />
            <span>AESTHETIC DEVIATION CALIBRATION</span>
          </h3>

          <div className="space-y-4 pt-2">
            
            {/* Slider 1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Backdrop Spotlight Blur Strength</span>
                <span className="font-mono text-vortex-primary font-bold">{blurStrength}px</span>
              </div>
              <input
                type="range"
                min="4"
                max="40"
                value={blurStrength}
                onChange={(e) => setBlurStrength(Number(e.target.value))}
                className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer focus:outline-none"
              />
            </div>

            {/* Slider 2 */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Ambient Aurora Glow Intensity</span>
                <span className="font-mono text-vortex-secondary font-bold">{ambientGlow}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={ambientGlow}
                onChange={(e) => setAmbientGlow(Number(e.target.value))}
                className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer focus:outline-none"
              />
            </div>

          </div>
        </div>

        {/* SECTION 3: SYSTEM SYNC */}
        <div className="settings-stagger glass-panel rounded-2xl p-6 border border-white/5 shadow-glass space-y-4">
          <h3 className="text-xs font-bold font-mono tracking-widest text-slate-400 uppercase flex items-center space-x-2">
            <Database className="w-4 h-4 text-vortex-success animate-pulse" />
            <span>CORE REGISTRY CONTROL</span>
          </h3>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-slate-200">Re-align core database registers</h4>
              <p className="text-[10px] text-slate-500 max-w-sm">
                Triggers a master resynchronisation sequence. Safely pulls down new task matrices.
              </p>
            </div>

            <button
              onClick={handleReSeed}
              disabled={reSeeding}
              className="py-2 px-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white text-xs font-semibold font-mono tracking-wider flex items-center space-x-2 transition-all relative overflow-hidden active:scale-95 shrink-0"
            >
              <span className="resync-bullet w-1.5 h-1.5 rounded-full bg-vortex-success opacity-50 shrink-0" />
              {reSeeding ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>SYNCING</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>RESYNC</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
