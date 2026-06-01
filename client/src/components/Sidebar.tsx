import React, { useRef } from 'react';
import { useVortexStore } from '../store/useVortexStore';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { LayoutDashboard, Compass, BarChart3, Settings, Play, Target, Plus, LogOut, CheckCircle2 } from 'lucide-react';

gsap.registerPlugin(useGSAP);

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { 
    user, 
    logout, 
    tasks, 
    focusedTaskId, 
    setFocusedTaskId,
    setCreateModalOpen,
    timerSeconds,
    timerIsRunning,
    timerSessionType
  } = useVortexStore();

  const sidebarRef = useRef<HTMLDivElement>(null);

  // Stagger reveal on mount
  useGSAP(() => {
    gsap.fromTo('.sidebar-stagger',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
    );
  }, { scope: sidebarRef });

  // Today's Progress Math
  const today = new Date().toISOString().split('T')[0];
  const finishedTasks = tasks.filter(t => t.status === 'Done').length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((finishedTasks / totalTasks) * 100) : 0;

  // Active focused task details
  const focusedTask = tasks.find(t => t._id === focusedTaskId);

  // Pomodoro formatted time string
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'My Tasks', icon: Compass },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div 
      ref={sidebarRef}
      className="w-72 border-r border-white/5 bg-[#03050b]/80 backdrop-blur-xl h-screen flex flex-col justify-between p-6 overflow-y-auto no-scrollbar z-20 shrink-0"
    >
      <div className="space-y-8">
        
        {/* LOGO: Interactive Vortex SVG Core */}
        <div className="flex items-center space-x-3 sidebar-stagger group cursor-pointer">
          <div className="relative w-11 h-11 flex items-center justify-center">
            {/* Spinning background halo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-vortex-primary to-vortex-secondary rounded-xl blur-md opacity-25 group-hover:opacity-75 transition-opacity duration-300" />
            <svg 
              className="w-10 h-10 animate-spin-slow text-vortex-primary filter drop-shadow-neon-primary" 
              viewBox="0 0 100 100"
            >
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="40" stroke="url(#logoGrad)" strokeWidth="6" fill="none" strokeDasharray="60 40" />
              <circle cx="50" cy="50" r="25" stroke="url(#logoGrad)" fill="none" strokeDasharray="30 20" strokeWidth="2" />
            </svg>
            <div className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              VORTEX
            </span>
            <span className="text-[9px] tracking-widest text-vortex-secondary font-mono">CORE_PORTAL</span>
          </div>
        </div>

        {/* PROFILE CARD */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 flex items-center space-x-3 sidebar-stagger hover:border-white/10 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-vortex-primary/40 to-vortex-accent/40 flex items-center justify-center border border-white/10 font-bold text-white shadow-glass">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'VX'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Vortex User'}</h4>
            <p className="text-[10px] text-slate-500 font-mono truncate">{user?.email || 'offline@nexus.com'}</p>
          </div>
        </div>

        {/* CREATE TASK TRIGGER */}
        <button
          onClick={() => setCreateModalOpen(true)}
          className="w-full sidebar-stagger py-3 px-4 rounded-xl bg-gradient-to-r from-vortex-primary to-vortex-accent hover:shadow-neon-primary text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all duration-300 transform hover:-translate-y-0.5 group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          <span>Orchestrate Task</span>
        </button>

        {/* PRIMARY NAVIGATION */}
        <nav className="space-y-1.5 sidebar-stagger">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-medium transition-all duration-300 relative group ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-vortex-secondary shadow-neon-secondary" />
                )}
                <Icon className={`w-4.5 h-4.5 transition-colors duration-300 ${isActive ? 'text-vortex-secondary' : 'text-slate-400 group-hover:text-vortex-secondary'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-6 pt-6 border-t border-white/5">
        
        {/* ACTIVE FOCUS SPOTLIGHT WIDGET */}
        {focusedTask && (
          <div className="glass-panel p-3.5 rounded-2xl border border-vortex-primary/20 bg-vortex-primary/5 sidebar-stagger relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-vortex-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] tracking-wider font-mono text-vortex-primary flex items-center space-x-1">
                <Target className="w-3 h-3 text-vortex-primary animate-pulse" />
                <span>FOCUS DRIFT</span>
              </span>
              <button 
                onClick={() => setFocusedTaskId(focusedTask._id)}
                className="text-[9px] font-mono text-vortex-secondary hover:underline flex items-center space-x-1"
              >
                <span>SPOTLIGHT</span>
              </button>
            </div>
            <h5 className="text-[11px] font-medium text-slate-200 truncate leading-snug">{focusedTask.title}</h5>
            
            {/* Countdown mini widget */}
            <div className="mt-2.5 flex items-center justify-between">
              <span className={`text-xs font-mono font-bold tracking-widest ${timerIsRunning ? 'text-vortex-secondary animate-pulse-slow' : 'text-slate-400'}`}>
                {formatTime(timerSeconds)}
              </span>
              <span className="text-[9px] font-mono text-slate-500 uppercase px-1.5 py-0.5 bg-white/5 rounded border border-white/5">
                {timerSessionType}
              </span>
            </div>
          </div>
        )}

        {/* CIRCULAR PROGRESS WIDGET: Today's Completion */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 flex items-center space-x-4 sidebar-stagger">
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            {/* Back circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                cx="24" 
                cy="24" 
                r="20" 
                className="stroke-white/5 fill-none" 
                strokeWidth="3.5" 
              />
              <circle 
                cx="24" 
                cy="24" 
                r="20" 
                className="stroke-vortex-secondary fill-none filter drop-shadow-neon-secondary" 
                strokeWidth="3.5" 
                strokeDasharray="125.6"
                strokeDashoffset={125.6 - (125.6 * progressPercent) / 100}
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
            </svg>
            <span className="absolute text-[10px] font-bold font-mono text-slate-200">
              {progressPercent}%
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-[11px] font-semibold text-slate-200">Sync complete</h5>
            <p className="text-[9px] text-slate-500 font-mono mt-0.5">
              {finishedTasks} of {totalTasks} ops finished
            </p>
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={logout}
          className="w-full py-2.5 px-4 rounded-xl border border-white/5 hover:border-vortex-danger/20 hover:bg-vortex-danger/5 text-slate-400 hover:text-vortex-danger text-xs font-semibold flex items-center justify-center space-x-2 transition-all duration-300 sidebar-stagger"
        >
          <LogOut className="w-4 h-4" />
          <span>Disconnect Node</span>
        </button>

      </div>
    </div>
  );
}
