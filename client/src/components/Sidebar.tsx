import React from 'react';
import { useVortexStore } from '../store/useVortexStore';
import { Compass, BarChart3, Settings, LogOut, Disc, LayoutDashboard } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { 
    user, 
    logout, 
    focusedTaskId
  } = useVortexStore();

  // If in Focus Zen mode, completely collapse sidebar to 0 width and hide it
  if (focusedTaskId) {
    return <div className="w-0 opacity-0 pointer-events-none transition-all duration-500" />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Workspace', icon: Compass },
    { id: 'analytics', label: 'Momentum', icon: BarChart3 },
    { id: 'settings', label: 'Parameters', icon: Settings },
  ];

  return (
    <aside 
      className="w-16 hover:w-64 bg-[#0a0b12] border-r border-vortex-border h-screen flex flex-col justify-between py-6 px-3.5 transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] group z-20 shrink-0 select-none relative"
    >
      <div className="space-y-12">
        
        {/* LOGO: Arc Browser outline style */}
        <div className="flex items-center space-x-4 pl-1 group/logo cursor-pointer select-none">
          <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
            <Disc className="w-6 h-6 text-slate-400 group-hover/logo:text-vortex-primary group-hover/logo:rotate-180 transition-all duration-700" />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-vortex-primary" />
          </div>
          <span className="font-bold text-sm tracking-widest text-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase select-none font-mono">
            VORTEX
          </span>
        </div>

        {/* PRIMARY NAVIGATION */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-2 py-2.5 rounded-lg text-xs transition-all duration-200 relative group/btn ${isActive ? 'bg-vortex-primary/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded bg-vortex-primary" />
                )}
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-vortex-primary' : 'text-slate-500 group-hover/btn:text-slate-300'}`} />
                <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium truncate">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">
        
        {/* PROFILE WIDGET */}
        <div className="flex items-center px-1.5 py-1 select-none">
          <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0 uppercase select-none">
            {user?.name ? user.name[0] : 'V'}
          </div>
          <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 min-w-0">
            <h4 className="text-[10px] font-bold text-slate-400 truncate leading-none uppercase tracking-wide">{user?.name || 'Vortex'}</h4>
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={logout}
          className="w-full flex items-center px-2 py-2.5 rounded-lg text-xs text-slate-600 hover:text-vortex-danger hover:bg-vortex-danger/5 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium truncate">
            Disconnect
          </span>
        </button>

      </div>
    </aside>
  );
}
