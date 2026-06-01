import React from 'react';
import { useVortexStore } from '../store/useVortexStore';
import type { Task } from '../store/useVortexStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckSquare, Target, Edit2, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function TaskCard({ task, isExpanded, onToggleExpand }: TaskCardProps) {
  const { 
    patchTaskStatus, 
    deleteTask,
    setActiveDrawerTaskId,
    setFocusedTaskId
  } = useVortexStore();

  // Math for subtasks
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  const subtaskPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const handleCheckboxClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering accordion toggle
    const newStatus = task.status === 'Done' ? 'Todo' : 'Done';
    await patchTaskStatus(task._id, newStatus);
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Wipe this task record?')) {
      await deleteTask(task._id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDrawerTaskId(task._id);
  };

  const handleFocusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFocusedTaskId(task._id);
  };

  // Due date format
  const formatDueDate = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  // Priority color guides
  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case 'High': return 'bg-vortex-danger';
      case 'Low': return 'bg-slate-700';
      default: return 'bg-vortex-primary';
    }
  };

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`workspace-segment rounded-xl overflow-hidden cursor-pointer select-none relative ${isExpanded ? 'workspace-segment-active' : 'hover:bg-[#0f111f] hover:border-white/5 shadow-razor'}`}
      onClick={onToggleExpand}
    >
      {/* Laser horizontal highlight if expanded */}
      {isExpanded && (
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-vortex-primary shadow-earned-primary" />
      )}

      {/* COLLAPSED / HEADER STRIP */}
      <div className="flex items-center justify-between p-3.5 relative z-10 select-none">
        <div className="flex items-center space-x-3.5 min-w-0 flex-1">
          
          {/* Action Checkbox outline */}
          <button
            onClick={handleCheckboxClick}
            className="text-slate-600 hover:text-slate-400 shrink-0 transition-colors duration-150 p-0.5"
          >
            {task.status === 'Done' ? (
              <CheckCircle2 className="w-4.5 h-4.5 text-vortex-success" />
            ) : (
              <Circle className="w-4.5 h-4.5 text-slate-700 hover:text-slate-500" />
            )}
          </button>

          {/* Title */}
          <h4 className={`text-xs font-medium truncate select-none leading-none transition-colors ${task.status === 'Done' ? 'line-through text-slate-600' : 'text-slate-200 group-hover:text-white'}`}>
            {task.title}
          </h4>
        </div>

        {/* METADATA ACTIONS */}
        <div className="flex items-center space-x-4 shrink-0 select-none text-[10px] font-mono">
          
          {/* Priority Bullet */}
          <div className="flex items-center space-x-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(task.priority)}`} />
            <span className="text-[8px] text-slate-500 uppercase tracking-widest hidden sm:inline">{task.priority}</span>
          </div>

          {/* Due date */}
          {task.dueDate && (
            <span className="text-slate-600 uppercase flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-slate-600 mr-1" />
              <span>{formatDueDate(task.dueDate)}</span>
            </span>
          )}

          {/* Collapse/Expand Arrow */}
          <span className="text-slate-600">
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </div>
      </div>

      {/* EXPANDED CONTENT DRAWER */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="border-t border-vortex-border/40 bg-[#07080f]/40 relative z-10 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              
              {/* Description */}
              {task.description ? (
                <div className="space-y-1">
                  <span className="text-[8px] font-mono tracking-widest text-slate-600 uppercase">Scope parameter logs</span>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    {task.description}
                  </p>
                </div>
              ) : (
                <p className="text-[10px] font-mono text-slate-600 uppercase italic">No scope parameters recorded.</p>
              )}

              {/* Subtasks Progress */}
              {totalSubtasks > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[8px] font-mono text-slate-500">
                    <span className="flex items-center space-x-1">
                      <CheckSquare className="w-3 h-3 text-slate-600" />
                      <span>SUBTASKS COMPLETED</span>
                    </span>
                    <span>{completedSubtasks} OF {totalSubtasks} ({subtaskPercent}%)</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${subtaskPercent}%` }}
                      className="h-full rounded-full bg-vortex-primary" 
                    />
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-between border-t border-vortex-border/30 pt-3 select-none">
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {task.tags?.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="text-[8px] font-mono uppercase bg-white/5 border border-white/5 px-2 py-0.5 rounded text-slate-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Micro Buttons */}
                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={handleDeleteClick}
                    className="p-2 rounded-lg bg-white/2 hover:bg-vortex-danger/5 hover:text-vortex-danger text-slate-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleEditClick}
                    className="p-2 rounded-lg bg-white/2 hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleFocusClick}
                    className="py-1.5 px-3 rounded-lg bg-vortex-primary/10 border border-vortex-primary/30 text-vortex-secondary text-[9px] font-mono font-bold flex items-center space-x-1 hover:bg-vortex-primary/20 transition-all shadow-earned-primary/5"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>ZEN FOCUS</span>
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
