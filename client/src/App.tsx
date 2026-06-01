import React, { useEffect, useRef } from 'react';
import { useVortexStore } from './store/useVortexStore';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Login from './components/Login';
import DashboardLayout from './components/DashboardLayout';
import { CircleDot } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function App() {
  const { isAuthenticated, authLoading, checkAuth } = useVortexStore();
  const loaderRef = useRef<HTMLDivElement>(null);

  // Validate session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Loader animations
  useGSAP(() => {
    if (authLoading) {
      // Bounce the center indicator
      gsap.to('.loader-pulse', {
        scale: 1.2,
        opacity: 0.8,
        duration: 1.2,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1
      });
      // Stagger loader text letters
      gsap.fromTo('.loader-letter',
        { opacity: 0.2 },
        { opacity: 1, duration: 0.8, stagger: 0.05, ease: 'none', yoyo: true, repeat: -1 }
      );
    }
  }, [authLoading]);

  if (authLoading) {
    return (
      <div 
        ref={loaderRef} 
        className="w-screen h-screen bg-[#03050c] flex flex-col items-center justify-center text-slate-100 select-none overflow-hidden relative"
      >
        <div className="absolute inset-0 digital-grid opacity-20 pointer-events-none" />
        <div className="aurora-sphere absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-vortex-primary/10 rounded-full blur-[80px]" />
        
        <div className="relative z-10 flex flex-col items-center space-y-6 select-none">
          {/* Animated loading spinner core */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg 
              className="w-full h-full animate-spin-slow text-vortex-secondary filter drop-shadow-neon-secondary" 
              viewBox="0 0 100 100"
            >
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="80 120" />
            </svg>
            <CircleDot className="loader-pulse absolute w-6 h-6 text-vortex-primary filter drop-shadow-neon-primary" />
          </div>

          {/* Staggered load characters */}
          <div className="flex space-x-1 text-xs font-mono tracking-widest text-slate-400 uppercase select-none">
            {['I', 'n', 'i', 't', 'i', 'a', 'l', 'i', 's', 'i', 'n', 'g', ' ', 'T', 'e', 'l', 'e', 'm', 'e', 't', 'r', 'y'].map((char, idx) => (
              <span key={idx} className="loader-letter inline-block">
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <DashboardLayout /> : <Login />;
}
