import React, { useState, useEffect, useRef } from 'react';
import { useVortexStore } from '../store/useVortexStore';
import type { Task, Subtask } from '../store/useVortexStore';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { 
  X, Calendar, Plus, Trash2, CheckCircle2, Circle, 
  Clock, Tag, Eye, Save 
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

  // Sync state
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

  // Stagger entry
  useGSAP(() => {
    if (activeDrawerTaskId) {
      gsap.fromTo('.details-stagger',
        { opacity: 0, x: 12 },
        { opacity: 1, x: 0, duration: 0.45, stagger: 0.05, ease: 'power2.out', delay: 0.05 }
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
      gsap.fromTo(containerRef.current,
        { borderColor: 'rgba(16, 185, 129, 0.4)' },
        { borderColor: 'rgba(255, 255, 255, 0.05)', duration: 0.8 }
      );
    }
  };

  const handleDelete = async () => {
    if (confirm('Wipe this task record?')) {
      await deleteTask(task._id);
    }
  };

  const handleToggleSubtask = (index: number) => {
    const updated = [...subtasks];
    updated[index].completed = !updated[index].completed;
    setSubtasks(updated);

    if (updated[index].completed) {
      gsap.fromTo(`.det-subcheck-${index}`,
        { scale: 0.7, opacity: 0.5 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' }
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
      
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setActiveDrawerTaskId(null)}
        className="absolute inset-0 bg-[#020204]/80 pointer-events-auto"
      />

      {/* Drawer */}
      <motion.div
        ref={containerRef}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="w-full sm:w-[480px] h-full bg-[#0c0d16] border-l border-white/5 shadow-spotlight flex flex-col justify-between pointer-events-auto relative z-10"
      >
        
        {/* HEADER */}
        <header className="p-5 border-b border-white/5 flex items-center justify-between shrink-0 select-none">
          <button
            onClick={() => {
              setFocusedTaskId(task._id);
              setActiveDrawerTaskId(null);
            }}
            className="py-1.5 px-3 rounded-lg border border-vortex-primary/30 bg-vortex-primary/10 hover:bg-vortex-primary/20 text-vortex-secondary text-[9px] font-mono font-bold flex items-center space-x-1.5 transition-all shadow-earned-primary/5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>ZEN FOCUS COCKPIT</span>
          </button>
          
          <button
            onClick={() => setActiveDrawerTaskId(null)}
            className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          
          {/* Title */}
          <div className="space-y-1.5 details-stagger">
            <label className="text-[8px] font-mono tracking-widest text-slate-500 uppercase">Operation Identifier</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-md font-bold border-b border-transparent hover:border-white/5 focus:border-vortex-primary/30 text-white placeholder:text-slate-700 pb-1 focus:outline-none transition-colors"
            />
          </div>

          {/* Selectors Grid */}
          <div className="grid grid-cols-2 gap-4 details-stagger bg-white/1 px-4 py-3 rounded-xl border border-white/5">
            
            {/* Status Select */}
            <div className="space-y-1">
              <span className="text-[8px] font-mono tracking-widest text-slate-500 uppercase">State status</span>
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

            {/* Priority Select */}
            <div className="space-y-1">
              <span className="text-[8px] font-mono tracking-widest text-slate-500 uppercase">Priority Lock</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-transparent text-xs text-slate-300 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="Low" className="bg-slate-950 text-slate-400">Low Priority</option>
                <option value="Medium" className="bg-slate-950 text-vortex-primary">Medium Priority</option>
                <option value="High" className="bg-slate-950 text-vortex-danger">High Priority</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1 col-span-2 pt-2 border-t border-white/5">
              <span className="text-[8px] font-mono tracking-widest text-slate-500 uppercase flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-slate-500" />
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

          {/* Description */}
          <div className="space-y-1.5 details-stagger">
            <label className="text-[8px] font-mono tracking-widest text-slate-500 uppercase">Scope parameters / Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Record task parameters or logs..."
              rows={4}
              className="w-full workspace-input rounded-xl p-3 text-xs text-slate-300 placeholder:text-slate-700 leading-relaxed focus:outline-none"
            />
          </div>

          {/* Subtasks */}
          <div className="space-y-3 details-stagger border-t border-white/5 pt-5">
            <label className="text-[8px] font-mono tracking-widest text-slate-500 uppercase">Subtask running protocols</label>

            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Declare new sub-operation..."
                className="flex-1 workspace-input rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-700 focus:outline-none"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-lg bg-vortex-primary flex items-center justify-center hover:bg-vortex-primary/95 text-white transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
              {subtasks.map((sub, index) => (
                <div
                  key={sub._id || index}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/2 border border-white/5 transition-all text-xs"
                >
                  <button
                    onClick={() => handleToggleSubtask(index)}
                    className="flex items-center space-x-3 text-left flex-1 min-w-0"
                  >
                    <span className={`det-subcheck-${index} shrink-0`}>
                      {sub.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-vortex-success" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-700" />
                      )}
                    </span>
                    <span className={`truncate leading-relaxed flex-1 ${sub.completed ? 'line-through text-slate-600' : 'text-slate-300'}`}>
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

          {/* Tags */}
          <div className="space-y-3 details-stagger border-t border-white/5 pt-5">
            <label className="text-[8px] font-mono tracking-widest text-slate-500 uppercase">CLASSIFICATION BADGES</label>

            <form onSubmit={handleAddTag} className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Declare category label..."
                className="flex-1 workspace-input rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-700 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 text-[9px] font-mono font-bold bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/5 transition-all"
              >
                ATTACH
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5">
              {tags.map((t, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-1 bg-white/5 border border-white/5 pl-2.5 pr-1.5 py-0.5 rounded-full text-[8px] font-mono uppercase text-slate-400 hover:border-vortex-danger/30 transition-all cursor-pointer"
                  onClick={() => handleRemoveTag(t)}
                >
                  <span>{t}</span>
                  <X className="w-2 h-2 text-slate-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          {task.activities && task.activities.length > 0 && (
            <div className="space-y-3.5 details-stagger border-t border-white/5 pt-5">
              <label className="text-[8px] font-mono tracking-widest text-slate-500 uppercase">DYNAMIC TELEMETRY STREAM</label>

              <div className="space-y-2.5 relative border-l border-white/5 pl-4 ml-2 max-h-40 overflow-y-auto no-scrollbar py-1">
                {task.activities.map((act, index) => (
                  <div key={act._id || index} className="relative text-[10px] space-y-0.5 leading-relaxed">
                    <div className="absolute -left-[20px] top-1 w-1.5 h-1.5 rounded-full bg-vortex-primary" />
                    <p className="text-slate-400 font-medium">{act.text}</p>
                    <p className="text-[8px] font-mono text-slate-600">{formatTime(act.time)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* FOOTER CONTROL */}
        <footer className="p-5 border-t border-white/5 bg-slate-950/20 flex items-center justify-between shrink-0 select-none">
          <button
            onClick={handleDelete}
            className="py-2 px-4 rounded-xl border border-white/5 hover:border-vortex-danger/30 hover:bg-vortex-danger/5 text-slate-500 hover:text-vortex-danger text-xs font-semibold font-mono flex items-center space-x-1.5 transition-all shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="py-2 px-5 rounded-xl bg-vortex-primary hover:bg-vortex-primary/95 text-white text-xs font-semibold font-mono flex items-center space-x-1.5 transition-all active:scale-95 shadow-razor"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Commit</span>
          </button>
        </footer>

      </motion.div>
    </div>
  );
}
