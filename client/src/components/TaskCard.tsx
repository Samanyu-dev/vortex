import React, { useRef, useState } from 'react';
import { useVortexStore } from '../store/useVortexStore';
import type { Task } from '../store/useVortexStore';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Calendar, ChevronRight, CheckSquare, Sparkles } from 'lucide-react';

gsap.registerPlugin(useGSAP);

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const { 
    focusedTaskId,
    setFocusedTaskId,
    activeDrawerTaskId, 
    setActiveDrawerTaskId 
  } = useVortexStore();

  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Math for subtasks
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  const subtaskPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Formatting due date
  const formatDueDate = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  // Get priority color mappings
  const getPriorityConfig = (prio: string) => {
    switch (prio) {
      case 'High':
        return { 
          bullet: 'bg-vortex-danger', 
          border: 'hover:border-vortex-danger/30 hover:shadow-neon-danger/10',
          text: 'text-vortex-danger' 
        };
      case 'Low':
        return { 
          bullet: 'bg-vortex-secondary', 
          border: 'hover:border-vortex-secondary/30 hover:shadow-neon-secondary/10',
          text: 'text-vortex-secondary' 
        };
      default:
        return { 
          bullet: 'bg-vortex-primary', 
          border: 'hover:border-vortex-primary/30 hover:shadow-neon-primary/10',
          text: 'text-vortex-primary' 
        };
    }
  };

  const prioConfig = getPriorityConfig(task.priority);

  // GSAP 3D Interactive Mouse Tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const bounds = card.getBoundingClientRect();
    const mouseX = e.clientX - bounds.left;
    const mouseY = e.clientY - bounds.top;

    // Normalize coordinates relative to card center (-0.5 to 0.5)
    const normalizedX = (mouseX / bounds.width) - 0.5;
    const normalizedY = (mouseY / bounds.height) - 0.5;

    // Apply rotation (tilt on X and Y, note X tilt is driven by mouse Y, and vice versa)
    gsap.to(card, {
      rotateY: normalizedX * 12,  // Y-axis rotation (left/right)
      rotateX: -normalizedY * 12, // X-axis rotation (up/down)
      scale: 1.025,
      z: 15, // Lift effect
      duration: 0.35,
      ease: 'power3.out',
      transformPerspective: 800,
      transformOrigin: 'center'
    });
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    // Smoothly spring back to normal
    gsap.to(card, {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      z: 0,
      duration: 0.5,
      ease: 'back.out(1.2)'
    });
  };

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', task._id);
    e.dataTransfer.effectAllowed = 'move';
    
    // GSAP dragging scale and rotation flare
    gsap.to(cardRef.current, {
      scale: 1.05,
      rotation: 1.5,
      opacity: 0.7,
      duration: 0.25,
      ease: 'power2.out'
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    
    // Spring back
    gsap.to(cardRef.current, {
      scale: 1,
      rotation: 0,
      opacity: 1,
      duration: 0.4,
      ease: 'back.out(1.5)'
    });
  };

  const isSelected = activeDrawerTaskId === task._id || focusedTaskId === task._id;

  return (
    <div
      ref={cardRef}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => setActiveDrawerTaskId(task._id)}
      style={{ transformStyle: 'preserve-3d' }}
      className={`glass-panel p-4.5 rounded-2xl border transition-colors duration-300 cursor-pointer select-none group relative overflow-hidden ${isSelected ? 'border-vortex-primary/50 bg-vortex-primary/5 shadow-neon-primary/20' : 'border-white/5 bg-white/2 hover:border-white/10 shadow-glass'} ${prioConfig.border}`}
    >
      
      {/* Laser light scanning line overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[scanHorizontal_1.5s_infinite] pointer-events-none" />

      {/* Top Header metadata */}
      <div className="flex items-center justify-between mb-2.5" style={{ transform: 'translateZ(10px)' }}>
        
        {/* Priority Badge */}
        <div className="flex items-center space-x-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${prioConfig.bullet} animate-pulse`} />
          <span className={`text-[9px] font-mono tracking-widest uppercase font-bold ${prioConfig.text}`}>
            {task.priority}
          </span>
        </div>

        {/* Action arrow indicator */}
        <ChevronRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" />
      </div>

      {/* Title & Description */}
      <div className="space-y-1.5" style={{ transform: 'translateZ(15px)' }}>
        <h4 className="font-semibold text-[13px] text-slate-200 leading-snug group-hover:text-white transition-colors">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Interactive Subtask Linear Progress */}
      {totalSubtasks > 0 && (
        <div className="mt-3.5 space-y-1.5" style={{ transform: 'translateZ(10px)' }}>
          <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
            <span className="flex items-center space-x-1">
              <CheckSquare className="w-3 h-3 text-vortex-secondary" />
              <span>SUBTASKS</span>
            </span>
            <span>{completedSubtasks}/{totalSubtasks}</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div 
              style={{ width: `${subtaskPercent}%`, transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
              className="h-full rounded-full bg-gradient-to-r from-vortex-primary to-vortex-secondary" 
            />
          </div>
        </div>
      )}

      {/* Footer Details: Tags, Due Date */}
      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 select-none" style={{ transform: 'translateZ(5px)' }}>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 max-w-[70%]">
          {task.tags?.slice(0, 2).map((tag, idx) => (
            <span 
              key={idx}
              className="text-[8px] tracking-wider font-mono font-bold uppercase bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Due date */}
        {task.dueDate && (
          <div className="flex items-center space-x-1.5 text-[9px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
            <Calendar className="w-3 h-3 text-vortex-secondary" />
            <span>{formatDueDate(task.dueDate)}</span>
          </div>
        )}
      </div>

    </div>
  );
}
