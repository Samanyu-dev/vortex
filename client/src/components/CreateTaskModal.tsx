import React, { useState, useRef, useEffect } from 'react';
import { useVortexStore } from '../store/useVortexStore';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { X, ClipboardList, Tag, Sparkles } from 'lucide-react';

gsap.registerPlugin(useGSAP);

// Zod validation
const taskSchema = z.object({
  title: z.string().min(3, { message: "Identifier must be at least 3 characters long" }),
  description: z.string().optional(),
  status: z.enum(['Todo', 'In Progress', 'Done']),
  priority: z.enum(['Low', 'Medium', 'High']),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).default([])
});

export default function CreateTaskModal() {
  const { isCreateModalOpen, setCreateModalOpen, createTask } = useVortexStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Todo' | 'In Progress' | 'Done'>('Todo');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [dueDate, setDueDate] = useState('');
  
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const checkPathRef = useRef<SVGPathElement>(null);

  // Stagger inputs
  useGSAP(() => {
    if (isCreateModalOpen) {
      gsap.fromTo('.modal-stagger',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [isCreateModalOpen]);

  // Success draw checkmark
  useEffect(() => {
    if (showSuccess && checkPathRef.current) {
      const path = checkPathRef.current;
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;

      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 0.6,
        ease: 'power2.inOut',
        delay: 0.1
      });
    }
  }, [showSuccess]);

  if (!isCreateModalOpen) return null;

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    if (!tag || tags.includes(tag)) return;
    setTags([...tags, tag]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const validation = taskSchema.safeParse({
      title,
      description,
      status,
      priority,
      dueDate,
      tags
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    const success = await createTask({
      title,
      description,
      status,
      priority,
      dueDate,
      tags
    });

    if (success) {
      setShowSuccess(true);
      
      setTimeout(() => {
        setCreateModalOpen(false);
        setTitle('');
        setDescription('');
        setStatus('Todo');
        setPriority('Medium');
        setDueDate('');
        setTags([]);
        setShowSuccess(false);
        setIsSubmitting(false);
      }, 1300);
    } else {
      setIsSubmitting(false);
      setErrors({ global: "Could not sync sequence to database" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 select-none">
      
      {/* Dim backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !showSuccess && setCreateModalOpen(false)}
        className="absolute inset-0 bg-[#020204]/90 pointer-events-auto"
      />

      {/* Modal Box */}
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.97, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        className="w-full max-w-lg bg-[#0c0d16] border border-white/5 shadow-spotlight rounded-2xl flex flex-col pointer-events-auto overflow-hidden relative z-10 select-none"
      >
        
        {/* SUCCESS VIEW */}
        {showSuccess && (
          <div className="absolute inset-0 bg-[#0c0d16] z-20 flex flex-col items-center justify-center text-center p-8 select-none">
            <svg 
              className="w-16 h-16 text-vortex-primary mb-4" 
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            >
              <circle cx="50" cy="50" r="44" stroke="rgba(255, 255, 255, 0.02)" />
              <path 
                ref={checkPathRef}
                d="M32 52 L46 66 L68 36" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
            <h3 className="text-sm font-bold tracking-wider text-slate-100 font-mono">
              OPERATION INSTANTIATED
            </h3>
            <p className="text-[9px] text-slate-500 mt-1 font-mono tracking-widest uppercase">
              Telemetry registers synchronized
            </p>
          </div>
        )}

        {/* HEADER */}
        <header className="p-5 border-b border-white/5 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center space-x-3 text-slate-400">
            <ClipboardList className="w-4.5 h-4.5 text-vortex-primary" />
            <h3 className="font-bold text-xs tracking-wider uppercase font-mono text-slate-200">Declare Operation</h3>
          </div>
          <button
            onClick={() => setCreateModalOpen(false)}
            className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {errors.global && (
          <div className="bg-vortex-danger/10 border-b border-vortex-danger/20 text-vortex-danger px-6 py-2.5 text-xs text-center font-mono">
            {errors.global}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex-1 p-5 space-y-4 no-scrollbar">
          
          {/* Title */}
          <div className="flex flex-col space-y-1.5 modal-stagger">
            <label className="text-[8px] font-mono tracking-widest text-slate-500 uppercase">Operation Identifier</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Align plasma injectors"
              className={`w-full workspace-input rounded-xl py-2 px-3 text-xs text-slate-300 placeholder:text-slate-700 focus:outline-none ${errors.title ? 'border-vortex-danger/40 focus:border-vortex-danger/50' : ''}`}
            />
            {errors.title && (
              <span className="text-[10px] text-vortex-danger font-mono">{errors.title}</span>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col space-y-1.5 modal-stagger">
            <label className="text-[8px] font-mono tracking-widest text-slate-500 uppercase">Scope parameters / Logs</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Record task parameters or logs..."
              rows={3}
              className="w-full workspace-input rounded-xl py-2 px-3 text-xs text-slate-300 placeholder:text-slate-700 leading-relaxed focus:outline-none"
            />
          </div>

          {/* Selectors */}
          <div className="grid grid-cols-2 gap-4 modal-stagger bg-white/1 px-4 py-2.5 rounded-xl border border-white/5">
            
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
              <span className="text-[8px] font-mono tracking-widest text-slate-500 uppercase">Priority frequency</span>
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
          </div>

          {/* Due date */}
          <div className="flex flex-col space-y-1.5 modal-stagger">
            <label className="text-[8px] font-mono tracking-widest text-slate-500 uppercase">Expiration Chronology</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full workspace-input rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2 modal-stagger pt-3 border-t border-white/5">
            <label className="text-[8px] font-mono tracking-widest text-slate-500 uppercase flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              <span>CLASSIFICATION LABELS</span>
            </label>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Declare category label..."
                className="flex-1 workspace-input rounded-lg py-1.5 px-3 text-xs text-slate-200 placeholder:text-slate-700 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 text-[9px] font-mono font-bold bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/5 transition-all"
              >
                ATTACH
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-1 bg-white/5 border border-white/5 pl-2 pr-1 py-0.5 rounded-full text-[8px] font-mono uppercase text-slate-400 hover:border-vortex-danger/30 transition-all cursor-pointer"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <span>{tag}</span>
                  <X className="w-2 h-2 text-slate-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 modal-stagger border-t border-white/5 pt-4 select-none">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="py-2 px-4 rounded-xl border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white text-xs font-semibold font-mono transition-all"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-5 rounded-xl bg-vortex-primary hover:bg-vortex-primary/95 text-white text-xs font-semibold font-mono flex items-center space-x-1.5 transition-all active:scale-95 shadow-razor"
            >
              {isSubmitting ? (
                <span>Configuring...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>ENGAGE INDEX</span>
                </>
              )}
            </button>
          </div>

        </form>

      </motion.div>
    </div>
  );
}
