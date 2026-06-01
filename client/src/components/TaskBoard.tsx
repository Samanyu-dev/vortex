import React, { useState } from 'react';
import { useVortexStore } from '../store/useVortexStore';
import type { Task } from '../store/useVortexStore';
import TaskCard from './TaskCard';
import { Search, Compass, SlidersHorizontal, ArrowUp, ArrowDown, Activity, Play, Plus } from 'lucide-react';

export default function TaskBoard() {
  const { 
    tasks, 
    tasksLoading, 
    tasksError, 
    fetchTasks,
    searchQuery,
    setSearchQuery,
    selectedPriority,
    setSelectedPriority,
    momentumScore,
    momentumDirection,
    setCreateModalOpen
  } = useVortexStore();

  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Filtering Logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === 'All' || task.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  const sections: Array<{ id: 'Todo' | 'In Progress' | 'Done'; title: string; color: string }> = [
    { id: 'Todo', title: 'In Queue', color: 'text-slate-500' },
    { id: 'In Progress', title: 'In Flight', color: 'text-vortex-primary' },
    { id: 'Done', title: 'Completed', color: 'text-vortex-success' }
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden p-8 select-none">
      
      {/* MOMENTUM & TELEMETRY HEADER */}
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 select-none">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans uppercase">
            Active Workspace
          </h1>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-0.5">
            Quantum priority operational stream
          </p>
        </div>

        {/* MOMENTUM ENGINE READOUT */}
        <div className="flex items-center space-x-4 bg-[#0a0b12] border border-vortex-border px-4 py-2.5 rounded-xl select-none font-mono">
          <div className="flex flex-col">
            <span className="text-[8px] tracking-widest text-slate-500 uppercase">Momentum Score</span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <Activity className="w-3.5 h-3.5 text-vortex-primary animate-pulse" />
              <span className="text-sm font-bold text-slate-100">{momentumScore}</span>
            </div>
          </div>
          <div className="h-6 w-[1px] bg-white/5" />
          <div className="flex flex-col">
            <span className="text-[8px] tracking-widest text-slate-500 uppercase">Trajectory</span>
            <div className="flex items-center space-x-1 mt-0.5">
              {momentumDirection === 'up' ? (
                <>
                  <ArrowUp className="w-3.5 h-3.5 text-vortex-success" />
                  <span className="text-[10px] font-bold text-vortex-success uppercase tracking-wider">RISING</span>
                </>
              ) : momentumDirection === 'down' ? (
                <>
                  <ArrowDown className="w-3.5 h-3.5 text-vortex-danger" />
                  <span className="text-[10px] font-bold text-vortex-danger uppercase tracking-wider">FALLING</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mr-1.5" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">STEADY</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* FILTER BAR */}
      <section className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 select-none">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search active work indexes..."
            className="w-full workspace-input rounded-xl py-2 px-10 text-xs text-slate-300 placeholder:text-slate-700 focus:outline-none"
          />
        </div>

        {/* Priority Badge */}
        <div className="flex items-center space-x-1 bg-white/1 p-1 rounded-xl border border-vortex-border select-none">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600 mx-2 shrink-0" />
          {['All', 'Low', 'Medium', 'High'].map(prio => (
            <button
              key={prio}
              onClick={() => setSelectedPriority(prio)}
              className={`px-3 py-1 text-[10px] font-mono rounded-lg transition-all ${selectedPriority === prio ? 'bg-vortex-primary/10 border border-vortex-primary/20 text-white font-bold' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {prio}
            </button>
          ))}
        </div>

        {/* Create Task Button */}
        <button
          onClick={() => setCreateModalOpen(true)}
          className="py-2 px-4 rounded-xl bg-vortex-primary hover:bg-vortex-primary/95 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all select-none font-mono shrink-0 shadow-razor"
        >
          <Plus className="w-4 h-4" />
          <span>ADD OPERATION</span>
        </button>
      </section>

      {/* FLOW WORKSPACE PORT */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pb-12">
        {tasksLoading ? (
          // Skeletal Stream
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-12 w-full skeleton-shimmer bg-white/2 rounded-xl" />
            ))}
          </div>
        ) : tasksError ? (
          <div className="text-center py-12">
            <p className="text-xs text-vortex-danger">Telemetry connection error: {tasksError}</p>
          </div>
        ) : (
          sections.map(sec => {
            const secTasks = filteredTasks.filter(t => t.status === sec.id);

            return (
              <div key={sec.id} className="space-y-3">
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-vortex-border pb-2 shrink-0 select-none">
                  <h3 className={`text-[10px] font-mono tracking-widest uppercase font-bold ${sec.color}`}>
                    {sec.title}
                  </h3>
                  <span className="text-[9px] font-mono text-slate-500">
                    {secTasks.length} NODES
                  </span>
                </div>

                {/* Vertical segments listing */}
                <div className="space-y-2">
                  {secTasks.length > 0 ? (
                    secTasks.map(task => (
                      <TaskCard 
                        key={task._id} 
                        task={task} 
                        isExpanded={expandedTaskId === task._id}
                        onToggleExpand={() => setExpandedTaskId(expandedTaskId === task._id ? null : task._id)}
                      />
                    ))
                  ) : (
                    <div className="py-4 text-center border border-dashed border-vortex-border rounded-xl">
                      <p className="text-[10px] font-mono text-slate-600 uppercase">Queue quiet</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
