import React, { useRef } from 'react';
import { useVortexStore } from '../store/useVortexStore';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { BarChart3, TrendingUp, CheckCircle2, Percent, Activity } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function Analytics() {
  const { tasks, momentumScore, momentumDirection } = useVortexStore();

  const containerRef = useRef<HTMLDivElement>(null);

  // Compute metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const todoTasks = tasks.filter(t => t.status === 'Todo').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Stagger entry and count-up
  useGSAP(() => {
    gsap.fromTo('.analytics-stagger',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: 'power2.out' }
    );

    const counters = [
      { id: '.count-total', value: totalTasks },
      { id: '.count-done', value: completedTasks },
      { id: '.count-momentum', value: momentumScore, postfix: ' pts' }
    ];

    counters.forEach(c => {
      const el = document.querySelector(c.id);
      if (el) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: c.value,
          duration: 1.2,
          ease: 'power3.out',
          onUpdate: () => {
            el.innerHTML = `${Math.floor(obj.val)}${c.postfix || ''}`;
          }
        });
      }
    });

    gsap.fromTo('.chart-bar',
      { scaleY: 0 },
      { scaleY: 1, duration: 1, transformOrigin: 'bottom', stagger: 0.06, ease: 'power3.out', delay: 0.25 }
    );
  }, { scope: containerRef });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mockWeeklyData = [4, 6, 8, 5, 7, 3, 5];

  return (
    <div ref={containerRef} className="flex-1 flex flex-col h-screen overflow-y-auto no-scrollbar p-8 select-none max-w-5xl">
      
      {/* HEADER */}
      <header className="mb-8 shrink-0">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2 font-sans uppercase">
          <BarChart3 className="w-5 h-5 text-vortex-primary" />
          <span>Productivity Telemetry</span>
        </h2>
        <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-0.5">
          Dynamic momentum scoring index
        </p>
      </header>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        
        {/* Metric 1: Momentum */}
        <div className="analytics-stagger bg-[#0c0d16] border border-white/5 shadow-razor rounded-2xl p-5 flex items-center justify-between group relative">
          <div>
            <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">Momentum Index</span>
            <h3 className="count-momentum text-2xl font-black font-mono tracking-wide text-white mt-1">
              0 pts
            </h3>
            <p className="text-[9px] text-slate-500 mt-1 flex items-center space-x-1 font-mono uppercase">
              <TrendingUp className="w-3 h-3 text-vortex-primary" />
              <span>{momentumDirection === 'up' ? 'trajectory rising' : 'trajectory steady'}</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-vortex-primary/10 border border-vortex-primary/20 flex items-center justify-center text-vortex-primary">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Completed */}
        <div className="analytics-stagger bg-[#0c0d16] border border-white/5 shadow-razor rounded-2xl p-5 flex items-center justify-between group relative">
          <div>
            <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">Operations Completed</span>
            <h3 className="count-done text-2xl font-black font-mono tracking-wide text-white mt-1">
              0
            </h3>
            <p className="text-[9px] text-slate-500 mt-1 flex items-center space-x-1 font-mono uppercase">
              <CheckCircle2 className="w-3 h-3 text-vortex-success" />
              <span>Telemetry calibrated</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-vortex-success/10 border border-vortex-success/20 flex items-center justify-center text-vortex-success">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Rates */}
        <div className="analytics-stagger bg-[#0c0d16] border border-white/5 shadow-razor rounded-2xl p-5 flex items-center justify-between group relative">
          <div>
            <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">Completion Rate</span>
            <h3 className="text-2xl font-black font-mono tracking-wide text-white mt-1">
              {completionRate}%
            </h3>
            <p className="text-[9px] text-slate-500 mt-1 flex items-center space-x-1 font-mono uppercase">
              <Percent className="w-3 h-3 text-vortex-secondary" />
              <span>Operational velocity</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-vortex-secondary/10 border border-vortex-secondary/20 flex items-center justify-center text-vortex-secondary">
            <Percent className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* DETAILED CHARTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[300px]">
        
        {/* Weekly Chart */}
        <div className="analytics-stagger md:col-span-2 bg-[#0c0d16] border border-white/5 shadow-razor rounded-2xl p-6 flex flex-col justify-between overflow-hidden">
          <div className="shrink-0 mb-4 font-mono">
            <span className="text-[8px] tracking-widest text-slate-500 uppercase">Productivity Index</span>
            <h4 className="text-xs font-bold text-slate-300 uppercase mt-0.5">Weekly Operational Stream</h4>
          </div>

          <div className="flex-1 flex items-end justify-between h-44 border-b border-white/5 pb-2 px-4 relative mt-4 select-none">
            <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-white/2 pointer-events-none" />
            <div className="absolute inset-x-0 top-2/4 border-t border-dashed border-white/2 pointer-events-none" />
            <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-white/2 pointer-events-none" />

            {mockWeeklyData.map((val, idx) => {
              const maxVal = Math.max(...mockWeeklyData);
              const heightPercent = (val / maxVal) * 85;
              return (
                <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end relative group">
                  <span className="absolute -top-6 text-[8px] font-mono text-vortex-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 px-2 py-0.5 border border-white/10 rounded shadow-razor">
                    {val} ops
                  </span>

                  <div 
                    style={{ height: `${heightPercent}%` }}
                    className="chart-bar w-7 sm:w-8 bg-vortex-primary/20 hover:bg-vortex-primary/40 border border-vortex-primary/30 rounded-t-sm transition-colors cursor-pointer"
                  />
                  
                  <span className="text-[8px] font-mono text-slate-500 mt-2.5">
                    {daysOfWeek[idx].slice(0, 3).toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase Breakdown */}
        <div className="analytics-stagger bg-[#0c0d16] border border-white/5 shadow-razor rounded-2xl p-6 flex flex-col justify-between overflow-hidden">
          <div className="shrink-0 mb-4 font-mono">
            <span className="text-[8px] tracking-widest text-slate-500 uppercase">Sector Distribution</span>
            <h4 className="text-xs font-bold text-slate-300 uppercase mt-0.5">Matrix Calibration</h4>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center my-4 space-y-5">
            <div className="relative w-32 h-32 flex items-center justify-center">
              
              <div className="absolute text-center">
                <span className="text-xl font-mono font-black text-white leading-none">
                  {totalTasks}
                </span>
                <span className="text-[8px] font-mono text-slate-500 uppercase block mt-1">
                  TOTAL NODES
                </span>
              </div>

              {/* Glowing SVG circles */}
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  cx="64" 
                  cy="64" 
                  r="48" 
                  className="stroke-white/2 fill-none" 
                  strokeWidth="3.5" 
                />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="48" 
                  className="stroke-vortex-primary fill-none" 
                  strokeWidth="4" 
                  strokeDasharray="301.4"
                  strokeDashoffset={301.4 - (301.4 * (totalTasks > 0 ? (completedTasks / totalTasks) : 0))}
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>

            </div>

            {/* Keys */}
            <div className="grid grid-cols-3 gap-2 w-full text-center text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-[8px] font-mono text-slate-500 uppercase block">QUEUE</span>
                <span className="font-bold text-slate-300">{todoTasks}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] font-mono text-slate-500 uppercase block">FLIGHT</span>
                <span className="font-bold text-vortex-primary">{inProgressTasks}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] font-mono text-slate-500 uppercase block">DONE</span>
                <span className="font-bold text-vortex-success">{completedTasks}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
