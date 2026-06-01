import React, { useEffect, useRef } from 'react';
import { useVortexStore } from '../store/useVortexStore';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { BarChart3, TrendingUp, CheckCircle, Percent, Clock } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function Analytics() {
  const { tasks } = useVortexStore();

  const containerRef = useRef<HTMLDivElement>(null);

  // Compute metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const todoTasks = tasks.filter(t => t.status === 'Todo').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Stagger loading dashboard card elements and run GSAP count-up animations!
  useGSAP(() => {
    // Reveal Cards
    gsap.fromTo('.analytics-card',
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
    );

    // GSAP Count-up Effects
    const counters = [
      { id: '.count-total', value: totalTasks },
      { id: '.count-done', value: completedTasks },
      { id: '.count-rate', value: completionRate, postfix: '%' }
    ];

    counters.forEach(c => {
      const el = document.querySelector(c.id);
      if (el) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: c.value,
          duration: 1.5,
          ease: 'power3.out',
          onUpdate: () => {
            el.innerHTML = `${Math.floor(obj.val)}${c.postfix || ''}`;
          }
        });
      }
    });

    // Animate weekly bar heights
    gsap.fromTo('.chart-bar',
      { scaleY: 0 },
      { scaleY: 1, duration: 1.2, transformOrigin: 'bottom', stagger: 0.08, ease: 'power4.out', delay: 0.3 }
    );
  }, { scope: containerRef });

  // Weekly Trend Mocking (computed based on active due dates or static distribution)
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mockWeeklyData = [4, 6, 8, 5, 7, 3, 5]; // number of operations completed

  return (
    <div ref={containerRef} className="flex-1 flex flex-col h-screen overflow-y-auto no-scrollbar p-6 select-none">
      
      {/* HEADER */}
      <header className="mb-8 shrink-0">
        <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-vortex-secondary" />
          <span>Quantum Telemetry Analytics</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Real-time productivity telemetry tracking.</p>
      </header>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        
        {/* Metric 1 */}
        <div className="analytics-card glass-panel rounded-2xl p-5 border border-white/5 shadow-glass flex items-center justify-between group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-vortex-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div>
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Tasks Orchestrated</span>
            <h3 className="count-total text-3xl font-black font-mono tracking-wide text-white mt-1">
              0
            </h3>
            <p className="text-[10px] text-slate-500 mt-1 flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-vortex-secondary" />
              <span>Telemetry fully mapped</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-vortex-secondary/10 border border-vortex-secondary/20 flex items-center justify-center text-vortex-secondary shadow-neon-secondary/10">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="analytics-card glass-panel rounded-2xl p-5 border border-white/5 shadow-glass flex items-center justify-between group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-vortex-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div>
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Completed Ops</span>
            <h3 className="count-done text-3xl font-black font-mono tracking-wide text-white mt-1">
              0
            </h3>
            <p className="text-[10px] text-slate-500 mt-1 flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-vortex-success" />
              <span>Ops sync successful</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-vortex-success/10 border border-vortex-success/20 flex items-center justify-center text-vortex-success shadow-neon-success/10">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="analytics-card glass-panel rounded-2xl p-5 border border-white/5 shadow-glass flex items-center justify-between group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-vortex-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div>
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Orchestration Rate</span>
            <h3 className="count-rate text-3xl font-black font-mono tracking-wide text-white mt-1">
              0%
            </h3>
            <p className="text-[10px] text-slate-500 mt-1 flex items-center space-x-1">
              <Percent className="w-3 h-3 text-vortex-primary animate-pulse" />
              <span>Velocity calibration rate</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-vortex-primary/10 border border-vortex-primary/20 flex items-center justify-center text-vortex-primary shadow-neon-primary/10">
            <Percent className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* DETAILED CHARTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[300px]">
        
        {/* Weekly Productivity SVG Chart (Takes 2 cols) */}
        <div className="analytics-card md:col-span-2 glass-panel rounded-3xl p-6 border border-white/5 shadow-glass flex flex-col justify-between overflow-hidden">
          <div className="shrink-0 mb-4">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Operational Output Log</span>
            <h4 className="text-sm font-semibold text-slate-200 mt-0.5">Weekly Productivity Matrix</h4>
          </div>

          {/* SVG Wave Bar Chart */}
          <div className="flex-1 flex items-end justify-between h-48 border-b border-white/5 pb-2 px-4 relative mt-4 select-none">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-white/5 pointer-events-none" />
            <div className="absolute inset-x-0 top-2/4 border-t border-dashed border-white/5 pointer-events-none" />
            <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-white/5 pointer-events-none" />

            {mockWeeklyData.map((val, idx) => {
              const maxVal = Math.max(...mockWeeklyData);
              const heightPercent = (val / maxVal) * 90;
              return (
                <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end relative group">
                  
                  {/* Hover count bubble */}
                  <span className="absolute -top-6 text-[9px] font-mono text-vortex-secondary font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-2 py-0.5 border border-white/10 rounded shadow-glass">
                    {val} tasks
                  </span>

                  {/* Dynamic Gradient Bar */}
                  <div 
                    style={{ height: `${heightPercent}%` }}
                    className="chart-bar w-7 sm:w-10 bg-gradient-to-t from-vortex-primary/40 to-vortex-secondary rounded-t-lg shadow-neon-secondary/20 relative cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 rounded-t-lg transition-opacity" />
                  </div>
                  
                  <span className="text-[9px] font-mono text-slate-500 mt-2 rotate-12 sm:rotate-0">
                    {daysOfWeek[idx].slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase State Ratio Breakdown (Circular SVG) */}
        <div className="analytics-card glass-panel rounded-3xl p-6 border border-white/5 shadow-glass flex flex-col justify-between overflow-hidden">
          <div className="shrink-0 mb-4">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Phase Distribution</span>
            <h4 className="text-sm font-semibold text-slate-200 mt-0.5">Task Queue Calibration</h4>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center my-4 space-y-6">
            <div className="relative w-36 h-36 flex items-center justify-center">
              
              {/* Central text */}
              <div className="absolute text-center">
                <span className="text-2xl font-black font-mono text-white leading-none">
                  {totalTasks}
                </span>
                <span className="text-[8px] font-mono text-slate-500 uppercase block mt-1">
                  TOTAL OPS
                </span>
              </div>

              {/* Glowing SVG circles layered representing sectors */}
              <svg className="w-full h-full transform -rotate-90">
                {/* Todo Sector */}
                <circle 
                  cx="72" 
                  cy="72" 
                  r="56" 
                  className="stroke-vortex-secondary fill-none filter drop-shadow-neon-secondary" 
                  strokeWidth="6" 
                  strokeDasharray="351.6"
                  strokeDashoffset={351.6 - (351.6 * (totalTasks > 0 ? (todoTasks / totalTasks) : 0))}
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
                
                {/* In Progress Sector */}
                <circle 
                  cx="72" 
                  cy="72" 
                  r="45" 
                  className="stroke-vortex-primary fill-none filter drop-shadow-neon-primary" 
                  strokeWidth="5" 
                  strokeDasharray="282.6"
                  strokeDashoffset={282.6 - (282.6 * (totalTasks > 0 ? (inProgressTasks / totalTasks) : 0))}
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />

                {/* Done Sector */}
                <circle 
                  cx="72" 
                  cy="72" 
                  r="34" 
                  className="stroke-vortex-success fill-none filter drop-shadow-neon-success" 
                  strokeWidth="4" 
                  strokeDasharray="213.5"
                  strokeDashoffset={213.5 - (213.5 * (totalTasks > 0 ? (completedTasks / totalTasks) : 0))}
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>

            </div>

            {/* Color key guide */}
            <div className="grid grid-cols-3 gap-2 w-full text-center">
              <div className="space-y-0.5">
                <span className="text-[8px] font-mono text-slate-500 uppercase block">TODO</span>
                <span className="text-xs font-bold text-vortex-secondary font-mono">{todoTasks}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] font-mono text-slate-500 uppercase block">IN FLIGHT</span>
                <span className="text-xs font-bold text-vortex-primary font-mono">{inProgressTasks}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] font-mono text-slate-500 uppercase block">DONE</span>
                <span className="text-xs font-bold text-vortex-success font-mono">{completedTasks}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
