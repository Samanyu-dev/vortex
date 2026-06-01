import React, { useState, useEffect, useRef } from 'react';
import { useVortexStore } from '../store/useVortexStore';
import type { Task, Subtask } from '../store/useVortexStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { 
  X, Calendar, AlertTriangle, Plus, Trash2, CheckCircle2, Circle, 
  Clock, Tag, Eye, Save, CornerDownRight 
} from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function TaskDetails() {
  const { 
    tasks, 
    activeDrawerTaskId, 
    setActiveDrawerTaskId,
    updateTask,
    deleteTask,
    setFocusedTaskId
  } = useVortexStore();

  const task = tasks.find(t => t._id === activeDrawerTaskId);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [status, setStatus] = useState<'Todo' | 'In Progress' | 'Done'>('Todo');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state with selected task
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.dueDate || '');
      setTags(task.tags || []);
      setSubtasks(task.subtasks || []);
    }
  }, [task, activeDrawerTaskId]);

  // GSAP animation for slide staggers on enter
  useGSAP(() => {
    if (activeDrawerTaskId) {
      gsap.fromTo('.drawer-stagger',
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
      );
    }
  }, [activeDrawerTaskId]);

  if (!task) return null;

  const handleSave = async () => {
    setIsSaving(true);
    const success = await updateTask(task._id, {
      title,
      description,
      priority,
      status,
      dueDate,
      tags,
      subtasks
    });
    setIsSaving(false);
    
    if (success) {
      // Beautiful temporary GSAP green highlight on border
      gsap.fromTo(containerRef.current,
        { borderColor: 'rgba(34, 197, 94, 0.4)' },
        { borderColor: 'rgba(255, 255, 255, 0.08)', duration: 1 }
      );
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task._id);
    }
  };

  const handleToggleSubtask = (index: number) => {
    const updated = [...subtasks];
    const item = updated[index];
    item.completed = !item.completed;
    setSubtasks(updated);

    // Dynamic audit logs trigger
    const soundNode = document.getElementById(`subtask-chime-${index}`);
    if (item.completed) {
      // Animate checkmark scale POP
      gsap.fromTo(`.subcheck-${index}`,
        { scale: 0.7, opacity: 0.5 },
        { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' }
      );
    }
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSub: Subtask = {
      _id: Math.random().toString(36).substring(2, 9),
      title: newSubtaskTitle.trim(),
      completed: false
    };

    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');

    // GSAP append animation
    setTimeout(() => {
      gsap.fromTo('.subtask-item:last-child',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }, 50);
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, idx) => idx !== index));
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTag.trim().toLowerCase();
    if (!tag || tags.includes(tag)) return;
    setTags([...tags, tag]);
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const formatTime = (timeStr: string) => {
    const d = new Date(timeStr);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end pointer-events-none select-none">
      
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setActiveDrawerTaskId(null)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
      />

      {/* Drawer Container */}
      <motion.div
        ref={containerRef}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="w-full sm:w-[500px] h-full bg-[#03050c] border-l border-white/10 shadow-glass flex flex-col justify-between pointer-events-auto relative z-10"
      >
        
        {/* Hologram top scanner line */}
        <div className="scanner-line absolute top-0 left-0 right-0 h-10 opacity-10 pointer-events-none" />

        {/* HEADER PANEL */}
        <header className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => {
                setFocusedTaskId(task._id);
                setActiveDrawerTaskId(null);
              }}
              className="py-1.5 px-3 rounded-lg border border-vortex-primary/30 bg-vortex-primary/10 hover:bg-vortex-primary/25 text-vortex-secondary text-[10px] font-mono font-bold flex items-center space-x-1.5 transition-all shadow-neon-primary/10"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>ENGAGE SPOTLIGHT</span>
            </button>
          </div>
          
          <button
            onClick={() => setActiveDrawerTaskId(null)}
            className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* CENTRAL SCROLLABLE PANEL */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          
          {/* Title Area */}
          <div className="space-y-1.5 drawer-stagger">
            <label className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">Task Identifier</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-lg font-bold border-b border-transparent hover:border-white/10 focus:border-vortex-primary/50 text-slate-100 placeholder:text-slate-600 pb-1 focus:outline-none transition-colors"
            />
          </div>

          {/* Metadata Matrix Grid */}
          <div className="grid grid-cols-2 gap-4 drawer-stagger bg-white/1 px-4 py-3 rounded-2xl border border-white/5">
            
            {/* Status Selector */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">State Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-transparent text-xs text-slate-300 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="Todo" className="bg-slate-950 text-slate-300">Todo Queue</option>
                <option value="In Progress" className="bg-slate-950 text-slate-300">In Flight</option>
                <option value="Done" className="bg-slate-950 text-slate-300">Completed</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">Priority Lock</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-transparent text-xs text-slate-300 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="Low" className="bg-slate-950 text-vortex-secondary">Low Priority</option>
                <option value="Medium" className="bg-slate-950 text-vortex-primary">Medium Priority</option>
                <option value="High" className="bg-slate-950 text-vortex-danger">High Priority</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1 col-span-2 pt-2 border-t border-white/5">
              <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-vortex-secondary" />
                <span>EXPIRATION CHRONOLOGY</span>
              </span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-300 font-semibold focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Description Area */}
          <div className="space-y-1.5 drawer-stagger">
            <label className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">Index logs / Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Record task parameters or logs..."
              rows={4}
              className="w-full glass-input rounded-xl p-3 text-xs text-slate-300 placeholder:text-slate-700 leading-relaxed focus:outline-none"
            />
          </div>

          {/* Subtask Module */}
          <div className="space-y-3 drawer-stagger border-t border-white/5 pt-5">
            <label className="text-[9px] font-mono tracking-widest text-slate-500 uppercase flex items-center space-x-1">
              <CheckSquare className="w-3.5 h-3.5 text-vortex-secondary" />
              <span>SUBTASK RUNNING PROTOCOLS</span>
            </label>

            {/* Add Subtask trigger */}
            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Declare new sub-operation..."
                className="flex-1 glass-input rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-700 focus:outline-none"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-lg bg-vortex-primary flex items-center justify-center hover:shadow-neon-primary text-white transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
              {subtasks.map((sub, index) => (
                <div
                  key={sub._id || index}
                  className="subtask-item flex items-center justify-between p-2.5 rounded-lg bg-white/2 hover:bg-white/4 border border-white/5 transition-all text-xs"
                >
                  <button
                    onClick={() => handleToggleSubtask(index)}
                    className="flex items-center space-x-3 text-left flex-1 min-w-0"
                  >
                    <span className={`subcheck-${index} shrink-0`}>
                      {sub.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-vortex-secondary animate-[pulse_1s_alternate]" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                      )}
                    </span>
                    <span className={`truncate leading-relaxed transition-all ${sub.completed ? 'line-through text-slate-600' : 'text-slate-300'}`}>
                      {sub.title}
                    </span>
                  </button>
                  <button
                    onClick={() => handleRemoveSubtask(index)}
                    className="text-slate-600 hover:text-vortex-danger transition-colors p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tags module */}
          <div className="space-y-3 drawer-stagger border-t border-white/5 pt-5">
            <label className="text-[9px] font-mono tracking-widest text-slate-500 uppercase flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-vortex-secondary" />
              <span>CLASSIFICATION BADGES</span>
            </label>

            {/* Add Tag */}
            <form onSubmit={handleAddTag} className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Declare category label..."
                className="flex-1 glass-input rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-700 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 text-[10px] font-mono font-bold bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/5 transition-all"
              >
                ATTACH
              </button>
            </form>

            {/* Render active badges */}
            <div className="flex flex-wrap gap-1.5 select-none">
              {tags.map((t, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-1.5 bg-white/5 border border-white/5 pl-2.5 pr-1.5 py-0.5 rounded-full text-[9px] font-mono uppercase text-slate-300 hover:border-vortex-danger/30 transition-all cursor-pointer"
                  onClick={() => handleRemoveTag(t)}
                >
                  <span>{t}</span>
                  <X className="w-2.5 h-2.5 text-slate-500 hover:text-vortex-danger" />
                </div>
              ))}
            </div>
          </div>

          {/* Activity Logs Timeline */}
          {task.activities && task.activities.length > 0 && (
            <div className="space-y-3.5 drawer-stagger border-t border-white/5 pt-5">
              <label className="text-[9px] font-mono tracking-widest text-slate-500 uppercase flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-vortex-secondary" />
                <span>DYNAMIC TELEMETRY STREAM</span>
              </label>

              <div className="space-y-3 relative border-l border-white/5 pl-4 ml-2 max-h-48 overflow-y-auto no-scrollbar py-1">
                {task.activities.map((act, index) => (
                  <div key={act._id || index} className="relative text-[10px] space-y-0.5 leading-relaxed">
                    {/* Tiny bullet */}
                    <div className="absolute -left-[20px] top-1 w-2 h-2 rounded-full bg-vortex-primary border border-slate-900 shadow-neon-primary" />
                    <p className="text-slate-400 font-medium">{act.text}</p>
                    <p className="text-[8px] font-mono text-slate-600">{formatTime(act.time)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM CONTROLS FOOTER */}
        <footer className="p-6 border-t border-white/5 bg-slate-950/40 flex items-center justify-between shrink-0 select-none">
          <button
            onClick={handleDelete}
            className="py-2.5 px-4 rounded-xl border border-white/5 hover:border-vortex-danger/30 hover:bg-vortex-danger/5 text-slate-400 hover:text-vortex-danger text-xs font-semibold flex items-center space-x-2 transition-all duration-300 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Wipe Record</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-vortex-primary to-vortex-accent hover:shadow-neon-primary text-white text-xs font-semibold flex items-center space-x-2 transition-all duration-300 hover:-translate-y-0.5 shadow-glass"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Commit Decrypts</span>
          </button>
        </footer>

      </motion.div>
    </div>
  );
}
