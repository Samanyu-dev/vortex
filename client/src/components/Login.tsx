import React, { useState, useEffect, useRef } from 'react';
import { useVortexStore } from '../store/useVortexStore';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login, register, authError, clearAuthError } = useVortexStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);

  // Clear errors when toggling tabs
  useEffect(() => {
    clearAuthError();
    setErrorMsg(null);
  }, [isRegister]);

  // Sync auth errors from store
  useEffect(() => {
    if (authError) {
      setErrorMsg(authError);
      setSubmitting(false);
    }
  }, [authError]);

  // GSAP Left-side Particles Canvas animation
  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number; alpha: number }> = [];

    const handleResize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = canvas.parentElement?.clientHeight || 800;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Populate particles
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    // Animate
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#050816';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        // Boundary bounce
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124, 58, 237, ${p.alpha})`;
        ctx.fill();

        // Line threshold
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p2.x - p.x, p2.y - p.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const lineAlpha = (1 - dist / 100) * 0.15;
            ctx.strokeStyle = `rgba(6, 182, 212, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    // Floating Demo Task Cards tilt loop
    gsap.to(card1Ref.current, {
      y: '-=15',
      rotation: '+=1.5',
      duration: 3.5,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1
    });

    gsap.to(card2Ref.current, {
      y: '+=15',
      rotation: '-=1.5',
      duration: 4.2,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1
    });

    // Form element staggers
    gsap.fromTo('.stagger-fade', 
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' }
    );

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, { scope: containerRef });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      setErrorMsg('All parameters required');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    let success = false;
    if (isRegister) {
      success = await register(name, email, password);
    } else {
      success = await login(email, password);
    }

    if (!success) {
      setSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen flex text-slate-100 overflow-hidden relative select-none">
      
      {/* LEFT PANEL: Animated Ecosystem Canvas */}
      <div className="hidden lg:flex w-1/2 relative bg-vortex-bg border-r border-white/5 flex-col justify-between p-12 overflow-hidden z-10">
        
        {/* Background glow structures */}
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-vortex-primary/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-vortex-secondary/10 rounded-full blur-[100px] pointer-events-none" />
        
        {/* GSAP Particle Field Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center space-x-3 stagger-fade">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-vortex-primary to-vortex-secondary p-[1px] shadow-neon-primary animate-pulse-slow">
            <div className="w-full h-full rounded-xl bg-vortex-bg flex items-center justify-center font-bold text-lg text-white">
              V
            </div>
          </div>
          <span className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            VORTEX
          </span>
        </div>

        {/* Dynamic Floating Preview Cards */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center w-full min-h-[350px]">
          
          {/* Card 1 */}
          <div 
            ref={card1Ref}
            className="absolute left-10 top-0 w-72 glass-panel p-5 rounded-2xl border border-white/10 shadow-glass"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] tracking-widest text-vortex-secondary font-mono bg-vortex-secondary/10 px-2 py-0.5 rounded border border-vortex-secondary/20">
                ENGINEERING
              </span>
              <span className="text-[10px] text-slate-400 font-mono">T-MINUS 4D</span>
            </div>
            <h4 className="font-medium text-sm text-slate-200 leading-snug">Calibrate warp drive coils</h4>
            <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
              Align plasma injectors and run dynamic diagnostics across all three sub-space channels.
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
              <div className="flex -space-x-1.5">
                <div className="w-5 h-5 rounded-full bg-vortex-primary flex items-center justify-center text-[9px] font-bold">JD</div>
              </div>
              <span className="text-[10px] text-vortex-danger font-medium flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-vortex-danger animate-ping mr-1" /> HIGH PRIORITY
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div 
            ref={card2Ref}
            className="absolute right-10 bottom-0 w-72 glass-panel p-5 rounded-2xl border border-white/10 shadow-glass"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] tracking-widest text-vortex-primary font-mono bg-vortex-primary/10 px-2 py-0.5 rounded border border-vortex-primary/20">
                SYSTEM CORE
              </span>
              <span className="text-[10px] text-slate-400 font-mono">ACTIVE</span>
            </div>
            <h4 className="font-medium text-sm text-slate-200 leading-snug">Refactor quantum state manager</h4>
            <div className="mt-4 flex items-center justify-between">
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-vortex-primary to-vortex-secondary w-[66%] h-full rounded-full" />
              </div>
              <span className="text-[10px] font-mono ml-3 text-slate-300">66%</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 stagger-fade">
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            "Turn tasks into momentum."
          </p>
          <p className="text-xs text-slate-500 mt-2 font-mono">VORTEX OS v1.0.0 // PROTOCOL_ENGAGED</p>
        </div>
      </div>

      {/* RIGHT PANEL: Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-20 relative bg-[#03050c] z-10">
        
        {/* Glow sphere */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-vortex-primary/5 rounded-full blur-[100px] pointer-events-none z-0" />
        
        <div className="w-full max-w-md flex flex-col space-y-8 z-10">
          
          {/* Header Mobile Title */}
          <div className="flex lg:hidden flex-col items-center text-center stagger-fade">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-vortex-primary to-vortex-secondary p-[1px] shadow-neon-primary mb-3">
              <div className="w-full h-full rounded-xl bg-vortex-bg flex items-center justify-center font-bold text-xl text-white">
                V
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              VORTEX
            </h1>
            <p className="text-xs text-slate-400 mt-1">Turn tasks into momentum</p>
          </div>

          <div className="flex flex-col space-y-2 text-center lg:text-left stagger-fade">
            <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              {isRegister ? 'Create Account' : 'Initialize Session'}
            </h2>
            <p className="text-sm text-slate-400">
              {isRegister 
                ? 'Register to initiate quantum task orchestration.' 
                : 'Authenticate access credentials to bridge workspace.'}
            </p>
          </div>

          {/* Form container */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-glass stagger-fade relative overflow-hidden">
            <div className="scanner-line absolute left-0 right-0 h-1/2 opacity-30 pointer-events-none" />

            {/* TAB SELECTOR */}
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/5 mb-6 relative">
              <button
                onClick={() => setIsRegister(false)}
                className={`flex-1 text-center py-2 text-sm font-medium rounded-lg transition-colors duration-200 relative z-10 ${!isRegister ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {!isRegister && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute inset-0 bg-gradient-to-r from-vortex-primary/30 to-vortex-secondary/30 border border-vortex-primary/50 rounded-lg -z-10 shadow-neon-primary" 
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                Access Key
              </button>
              <button
                onClick={() => setIsRegister(true)}
                className={`flex-1 text-center py-2 text-sm font-medium rounded-lg transition-colors duration-200 relative z-10 ${isRegister ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {isRegister && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute inset-0 bg-gradient-to-r from-vortex-primary/30 to-vortex-secondary/30 border border-vortex-primary/50 rounded-lg -z-10 shadow-neon-primary" 
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                Enlist Core
              </button>
            </div>

            {/* ERROR DISPLAY */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-vortex-danger/10 border border-vortex-danger/30 text-vortex-danger px-4 py-3 rounded-xl text-xs mb-5 flex items-start space-x-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-vortex-danger mt-1.5 flex-shrink-0 animate-pulse" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AUTH FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {isRegister && (
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">Core ID / Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jean-Luc Picard"
                      className="w-full glass-input rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col space-y-1.5">
                <label className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">Network Address / Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@nexus.core"
                    className="w-full glass-input rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">Decryption Hash / Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Trigger */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-6 bg-gradient-to-r from-vortex-primary to-vortex-accent hover:to-vortex-secondary text-white font-medium text-sm py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 hover:shadow-neon-primary disabled:opacity-50 relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Orchestrating...</span>
                  </>
                ) : (
                  <>
                    <span>{isRegister ? 'Enlist Core Terminal' : 'Access Dashboard'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

            </form>
          </div>

          <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 stagger-fade">
            <ShieldCheck className="w-4 h-4 text-vortex-secondary animate-pulse-slow" />
            <span>Secure node link secured with RSA/SHA256 Encryption.</span>
          </div>

        </div>
      </div>
    </div>
  );
}
