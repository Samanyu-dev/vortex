import React, { useState, useRef } from 'react';
import { useVortexStore } from '../store/useVortexStore';
import type { Task } from '../store/useVortexStore';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import TaskCard from './TaskCard';
import { Search, SlidersHorizontal, Plus, AlertCircle, CircleDot } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function TaskBoard() {
  const { 
    tasks, 
    tasksLoading, 
    tasksError, 
    fetchTasks,
    patchTaskStatus,
    setCreateModalOpen,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    selectedPriority,
    setSelectedPriority
  } = useVortexStore();

  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Stagger loading column blocks
  useGSAP(() => {
    if (!tasksLoading && tasks.length > 0) {
      gsap.fromTo('.column-panel',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' }
      );
    }
  }, [tasksLoading]);

  // Aggregate all tags from all tasks
  const allTags = ['All', ...Array.from(new Set(tasks.flatMap(t => t.tags || [])))];

  // Filtering Logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'All' || task.tags.includes(selectedTag);
    const matchesPriority = selectedPriority === 'All' || task.priority === selectedPriority;
    return matchesSearch && matchesTag && matchesPriority;
  });

  const columns: Array<{ id: 'Todo' | 'In Progress' | 'Done'; title: string; color: string; glow: string }> = [
    { id: 'Todo', title: 'Todo Queue', color: 'text-vortex-secondary', glow: 'border-vortex-secondary/20 shadow-neon-secondary/5' },
    { id: 'In Progress', title: 'In Flight', color: 'text-vortex-primary', glow: 'border-vortex-primary/20 shadow-neon-primary/5' },
    { id: 'Done', title: 'Complete Ops', color: 'text-vortex-success', glow: 'border-vortex-success/20 shadow-neon-success/5' }
  ];

  // HTML5 Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (hoveredColumn !== status) {
      setHoveredColumn(status);
    }
  };

  const handleDragLeave = () => {
    setHoveredColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, status: 'Todo' | 'In Progress' | 'Done') => {
    e.preventDefault();
    setHoveredColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const task = tasks.find(t => t._id === taskId);
    if (task && task.status !== status) {
      // Trigger instant GSAP drop feedback on drop zone
      gsap.fromTo(`.column-glow-${status}`,
        { opacity: 0.8, scale: 1.01 },
        { opacity: 0.15, scale: 1, duration: 0.8, ease: 'expo.out' }
      );
      
      // Update state
      await patchTaskStatus(taskId, status);
    }
  };

  return (
    <div ref={boardRef} className="flex-1 flex flex-col h-screen overflow-hidden p-6 relative">
      
      {/* SEARCH AND FILTERS TOOLBAR */}
      <header className="mb-6 space-y-4 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2">
              <span>Task Flow Engine</span>
              <span className="text-xs font-mono px-2 py-0.5 bg-white/5 rounded border border-white/5 text-vortex-secondary">
                ACTIVE
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Quantum task mapping matrix.</p>
          </div>
          
          {/* Quick command palette shortcut info */}
          <div className="hidden lg:flex items-center space-x-2 text-[10px] font-mono text-slate-500 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 select-none">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-slate-300 rounded shadow">⌘ K</kbd>
            <span>or</span>
            <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-slate-300 rounded shadow">Ctrl K</kbd>
            <span>to scan node</span>
          </div>
        </div>

        {/* Toolbar Inputs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks by index description..."
              className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
            />
          </div>

          {/* Priority filter */}
          <div className="flex items-center space-x-1.5 bg-white/5 p-1 rounded-xl border border-white/5 shrink-0 select-none">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 mx-2" />
            {['All', 'Low', 'Medium', 'High'].map(prio => (
              <button
                key={prio}
                onClick={() => setSelectedPriority(prio)}
                className={`px-2.5 py-1 text-[10px] font-medium rounded-lg transition-all duration-200 ${selectedPriority === prio ? 'bg-vortex-primary/20 border border-vortex-primary/40 text-white shadow-neon-primary/20' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {prio}
              </button>
            ))}
          </div>
        </div>

        {/* Tags filter line */}
        {allTags.length > 1 && (
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 shrink-0 select-none">
            <span className="text-[10px] font-mono text-slate-500 shrink-0">TAGS:</span>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-0.5 rounded-full text-[9px] font-medium tracking-wide uppercase border shrink-0 transition-all ${selectedTag === tag ? 'bg-vortex-secondary/15 border-vortex-secondary/40 text-vortex-secondary' : 'bg-transparent border-white/5 text-slate-400 hover:text-slate-200'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* CORE WORKSPACE GRID */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden select-none">
        {tasksLoading ? (
          // Skeletal columns shimmer loading state
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="glass-panel rounded-3xl p-5 flex flex-col h-full space-y-4">
              <div className="h-6 w-32 shimmer rounded-lg" />
              <div className="flex-1 space-y-4 pt-4 overflow-hidden">
                {Array.from({ length: 3 }).map((_, cIdx) => (
                  <div key={cIdx} className="h-28 shimmer rounded-2xl w-full" />
                ))}
              </div>
            </div>
          ))
        ) : tasksError ? (
          // Custom error states
          <div className="col-span-3 glass-panel rounded-3xl p-12 flex flex-col items-center justify-center text-center my-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-vortex-danger/10 border border-vortex-danger/30 flex items-center justify-center text-vortex-danger">
              <AlertCircle className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="font-semibold text-lg text-slate-200">Task Matrix destabilized</h3>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Connection lost: {tasksError}. Let's re-align core channels.
            </p>
            <button 
              onClick={fetchTasks}
              className="py-2.5 px-6 rounded-xl bg-vortex-primary hover:shadow-neon-primary text-white text-xs font-semibold transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Align Core Channel
            </button>
          </div>
        ) : (
          columns.map(col => {
            const columnTasks = filteredTasks.filter(t => t.status === col.id);
            const isHovered = hoveredColumn === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`column-panel glass-panel rounded-3xl p-5 flex flex-col h-full relative transition-all duration-500 overflow-hidden ${isHovered ? 'border-vortex-primary/30 bg-vortex-primary/2 shadow-neon-primary/10 scale-[1.01]' : 'border-white/5'}`}
              >
                
                {/* Drag target radial shimmer halo */}
                <div 
                  className={`column-glow-${col.id} absolute inset-0 bg-gradient-to-b from-vortex-primary/10 to-transparent transition-opacity duration-500 pointer-events-none opacity-0 ${isHovered ? 'opacity-100' : ''}`} 
                />

                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 z-10 shrink-0 select-none">
                  <div className="flex items-center space-x-2">
                    <CircleDot className={`w-3.5 h-3.5 ${col.color}`} />
                    <h3 className="font-bold text-xs tracking-wider text-slate-200 uppercase">{col.title}</h3>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 bg-white/5 border border-white/5 rounded-lg ${col.color}`}>
                    {columnTasks.length}
                  </span>
                </div>

                {/* Task card list container */}
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-3.5 pb-8 pr-1 z-10">
                  {columnTasks.length > 0 ? (
                    columnTasks.map(task => (
                      <TaskCard key={task._id} task={task} />
                    ))
                  ) : (
                    // Beautiful custom empty states inside column
                    <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/5 rounded-2xl select-none">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                        <Plus className="w-5 h-5 text-slate-600 animate-pulse" />
                      </div>
                      <h4 className="text-[11px] font-semibold text-slate-400">Zero operations in queue</h4>
                      <p className="text-[10px] text-slate-600 max-w-[150px] mt-1 leading-relaxed">
                        Add a task to ignite drift sequence.
                      </p>
                    </div>
                  )}
                </div>

                {/* Small active target halo border indicator */}
                <div 
                  className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-vortex-primary to-vortex-secondary transition-transform duration-500 origin-left scale-x-0 ${isHovered ? 'scale-x-100' : ''}`} 
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
