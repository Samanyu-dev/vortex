import React, { useState, useEffect, useRef } from 'react';
import { useVortexStore } from '../store/useVortexStore';
import type { Task } from '../store/useVortexStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, Terminal, AlertCircle } from 'lucide-react';

export default function CommandPalette() {
  const { tasks, setActiveDrawerTaskId } = useVortexStore();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }

      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredTasks = query.trim() === ''
    ? tasks.slice(0, 5)
    : tasks.filter(task => {
        const matchesTitle = task.title.toLowerCase().includes(query.toLowerCase());
        const matchesDesc = task.description?.toLowerCase().includes(query.toLowerCase()) || false;
        const matchesTags = task.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase())) || false;
        const matchesStatus = task.status.toLowerCase().includes(query.toLowerCase());
        return matchesTitle || matchesDesc || matchesTags || matchesStatus;
      });

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

  useEffect(() => {
    if (resultsRef.current) {
      const activeEl = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleSelect = (task: Task) => {
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
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-[#020204]/85 pointer-events-auto"
          />

          {/* Palette Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-full max-w-xl bg-[#0c0d16] border border-white/5 shadow-spotlight rounded-xl flex flex-col pointer-events-auto overflow-hidden relative z-10"
          >
            {/* SEARCH INPUT */}
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
                placeholder="Search work register..."
                className="flex-1 bg-transparent border-none text-slate-200 placeholder:text-slate-700 text-xs focus:outline-none focus:ring-0"
              />
              <span className="text-[8px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase select-none">
                {query.trim() === '' ? 'RECENT' : `${filteredTasks.length} NODES`}
              </span>
            </div>

            {/* RESULTS */}
            <div 
              ref={resultsRef}
              className="max-h-64 overflow-y-auto no-scrollbar p-2 space-y-1 bg-[#090a10]"
            >
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, idx) => {
                  const isSelected = selectedIndex === idx;

                  return (
                    <button
                      key={task._id}
                      onClick={() => handleSelect(task)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all duration-150 border ${isSelected ? 'bg-vortex-primary/10 border-vortex-primary/20 text-white' : 'bg-transparent border-transparent text-slate-500'}`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <Terminal className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-vortex-primary' : 'text-slate-700'}`} />
                        <div className="truncate">
                          <h4 className={`text-xs font-medium truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {task.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 select-none text-[8px] font-mono">
                        <span className="text-slate-600 uppercase">{task.priority}</span>
                        <span className="text-slate-600">//</span>
                        <span className="text-slate-500 uppercase">{task.status}</span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/5 rounded-lg select-none">
                  <AlertCircle className="w-6 h-6 text-slate-700 mb-2 animate-pulse" />
                  <h4 className="text-[10px] font-mono text-slate-500 uppercase">Registry clean</h4>
                </div>
              )}
            </div>

            {/* FOOTER KEYBOARD HINTS */}
            <footer className="px-4 py-2 bg-[#06070b] border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-slate-600 select-none shrink-0 uppercase tracking-wider">
              <span className="flex items-center space-x-1">
                <Compass className="w-3.5 h-3.5 text-vortex-primary" />
                <span>WORKSPACE REGISTRY QUERY</span>
              </span>
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <kbd className="px-1 bg-slate-900 border border-slate-700 text-slate-500 rounded">↓↑</kbd>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center space-x-1">
                  <kbd className="px-1 bg-slate-900 border border-slate-700 text-slate-400 rounded">Enter</kbd>
                  <span>Select</span>
                </span>
              </div>
            </footer>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
