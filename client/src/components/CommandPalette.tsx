import React, { useState, useEffect, useRef } from 'react';
import { useVortexStore } from '../store/useVortexStore';
import type { Task } from '../store/useVortexStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, Terminal, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

export default function CommandPalette() {
  const { tasks, setActiveDrawerTaskId, setFocusedTaskId } = useVortexStore();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Global keydown listeners for shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle with CMD+K or CTRL+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }

      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter tasks based on query
  const filteredTasks = query.trim() === ''
    ? tasks.slice(0, 5) // Show top 5 recent tasks by default
    : tasks.filter(task => {
        const matchesTitle = task.title.toLowerCase().includes(query.toLowerCase());
        const matchesDesc = task.description?.toLowerCase().includes(query.toLowerCase()) || false;
        const matchesTags = task.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase())) || false;
        const matchesStatus = task.status.toLowerCase().includes(query.toLowerCase());
        return matchesTitle || matchesDesc || matchesTags || matchesStatus;
      });

  // Handle arrow key navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredTasks.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredTasks.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredTasks.length) % filteredTasks.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(filteredTasks[selectedIndex]);
    }
  };

  // Scroll active element into view
  useEffect(() => {
    if (resultsRef.current) {
      const activeEl = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleSelect = (task: Task) => {
    // Open task details
    setActiveDrawerTaskId(task._id);
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 select-none pointer-events-none"
          onKeyDown={handleKeyDown}
        >
          {/* Blur backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-[#020309]/80 backdrop-blur-md pointer-events-auto"
          />

          {/* Palette Content Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-full max-w-xl glass-panel rounded-2xl border border-white/10 shadow-glass flex flex-col pointer-events-auto overflow-hidden relative z-10 bg-[#040612]/95"
          >
            <div className="scanner-line absolute top-0 left-0 right-0 h-8 opacity-10 pointer-events-none" />

            {/* SEARCH INPUT BAR */}
            <div className="flex items-center space-x-3 px-4 py-3.5 border-b border-white/5 relative">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Scan quantum registers (search title, tags, status)..."
                className="flex-1 bg-transparent border-none text-slate-200 placeholder:text-slate-600 text-xs focus:outline-none focus:ring-0"
              />
              <span className="text-[9px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase select-none">
                {query.trim() === '' ? 'RECENT' : `${filteredTasks.length} RESULTS`}
              </span>
            </div>

            {/* RESULTS VIEW */}
            <div 
              ref={resultsRef}
              className="max-h-72 overflow-y-auto no-scrollbar p-2 space-y-1 bg-[#03050c]/60"
            >
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, idx) => {
                  const isSelected = selectedIndex === idx;
                  const statusColors = task.status === 'Done' 
                    ? 'text-vortex-success bg-vortex-success/10' 
                    : task.status === 'In Progress' 
                    ? 'text-vortex-primary bg-vortex-primary/10' 
                    : 'text-vortex-secondary bg-vortex-secondary/10';

                  return (
                    <button
                      key={task._id}
                      onClick={() => handleSelect(task)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all duration-200 border ${isSelected ? 'bg-vortex-primary/10 border-vortex-primary/30 shadow-neon-primary/10 text-white' : 'bg-transparent border-transparent text-slate-400'}`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <Terminal className={`w-4 h-4 shrink-0 ${isSelected ? 'text-vortex-secondary' : 'text-slate-600'}`} />
                        <div className="truncate">
                          <h4 className={`text-xs font-semibold leading-normal ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-md">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2.5 shrink-0 select-none">
                        {/* Task Priority */}
                        <span className={`text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-white/5 font-bold text-slate-500`}>
                          {task.priority}
                        </span>

                        {/* Task Status */}
                        <span className={`text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border border-white/5 font-bold ${statusColors}`}>
                          {task.status}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/5 rounded-xl">
                  <AlertCircle className="w-8 h-8 text-slate-600 animate-pulse mb-2" />
                  <h4 className="text-[11px] font-semibold text-slate-400">Scan sector empty</h4>
                  <p className="text-[9px] text-slate-600 max-w-[180px] mt-1 leading-relaxed">
                    No registry matches your sequence description.
                  </p>
                </div>
              )}
            </div>

            {/* KEYBOARD HOTKEYS INFO FOOTER */}
            <footer className="px-4 py-2 bg-slate-950/80 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-slate-500 select-none shrink-0">
              <span className="flex items-center space-x-1">
                <Compass className="w-3.5 h-3.5 text-vortex-primary animate-pulse" />
                <span>VORTEX OS COMMANDS</span>
              </span>
              <div className="flex items-center space-x-3.5">
                <span className="flex items-center space-x-1">
                  <kbd className="px-1 bg-slate-900 border border-slate-700 text-slate-400 rounded">↓↑</kbd>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center space-x-1">
                  <kbd className="px-1 bg-slate-900 border border-slate-700 text-slate-400 rounded">Enter</kbd>
                  <span>Select</span>
                </span>
                <span className="flex items-center space-x-1">
                  <kbd className="px-1 bg-slate-900 border border-slate-700 text-slate-400 rounded">Esc</kbd>
                  <span>Wipe</span>
                </span>
              </div>
            </footer>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
