import React, { useEffect, useRef } from 'react';
import { useVortexStore } from '../store/useVortexStore';
import type { Task } from '../store/useVortexStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { X, Play, Pause, RotateCcw, Target, CheckCircle2, Circle, Sparkles } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function FocusMode() {
  const { 
    tasks, 
    focusedTaskId, 
    setFocusedTaskId,
    updateTask,
    timerSeconds,
    timerOriginalDuration,
    timerIsRunning,
    timerSessionType,
    startTimer,
    pauseTimer,
    resetTimer,
    tickTimer,
    setTimerSessionType
  } = useVortexStore();

  const task = tasks.find(t => t._id === focusedTaskId);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tick interval hook
  useEffect(() => {
    let intervalId: any;
    if (timerIsRunning) {
      intervalId = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [timerIsRunning]);

  // Stagger entry
  useGSAP(() => {
    if (focusedTaskId) {
      gsap.fromTo('.zen-stagger',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, [focusedTaskId]);

  if (!task) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progressRatio = timerSeconds / timerOriginalDuration;

  const handleToggleSubtask = async (subIndex: number) => {
    const updatedSubtasks = [...(task.subtasks || [])];
    updatedSubtasks[subIndex].completed = !updatedSubtasks[subIndex].completed;

    if (updatedSubtasks[subIndex].completed) {
      gsap.fromTo(`.zen-subcheck-${subIndex}`,
        { scale: 0.7, opacity: 0.5 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' }
      );
    }

    await updateTask(task._id, {
      subtasks: updatedSubtasks
    });
  };

  const playTone = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 select-none">
      
      {/* Immersive Absolute Dim Blackout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setFocusedTaskId(null)}
        className="absolute inset-0 bg-[#020204]/98 pointer-events-auto"
      />

      {/* Zen Spotlight Container */}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        className="w-full max-w-4xl h-[520px] bg-[#0c0d16] border border-white/5 shadow-spotlight rounded-2xl flex flex-col md:flex-row pointer-events-auto overflow-hidden relative z-10 select-none"
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={() => setFocusedTaskId(null)}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT COMPARTMENT: ZEN CLOCK */}
        <div className="w-full md:w-1/2 p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 relative bg-[#07080f]/40 shrink-0">
          
          <div className="absolute top-8 left-8 flex items-center space-x-2 text-[8px] font-mono tracking-widest text-slate-500 zen-stagger">
            <Target className="w-3.5 h-3.5 text-vortex-primary animate-pulse" />
            <span>ZEN FOCUS ACTIVE</span>
          </div>

          {/* TIMER GRAPHICS */}
          <div className="relative w-48 h-48 flex items-center justify-center zen-stagger select-none my-6">
            
            {/* Spinning background thin ring */}
            <div className="absolute inset-0 rounded-full border border-white/2" />

            {/* Glowing SVG countdown ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                cx="96" 
                cy="96" 
                r="72" 
                className="stroke-white/2 fill-none" 
                strokeWidth="2.5" 
              />
              <circle 
                cx="96" 
                cy="96" 
                r="72" 
                className="stroke-vortex-primary fill-none" 
                strokeWidth="3.5" 
                strokeDasharray="452.1"
                strokeDashoffset={452.1 * (1 - progressRatio)}
                strokeLinecap="round"
                style={{ 
                  transition: 'stroke-dashoffset 1s linear' 
                }}
              />
            </svg>

            {/* Timer readouts */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-mono font-black tracking-widest text-white leading-none">
                {formatTime(timerSeconds)}
              </span>
              <span className="text-[8px] font-mono text-slate-500 tracking-widest uppercase mt-2">
                {timerSessionType} Mode
              </span>
            </div>
          </div>

          {/* CYCLE CHANGER TABS */}
          <div className="flex p-0.5 bg-white/5 rounded-lg border border-white/5 mb-6 zen-stagger select-none relative z-10 text-[9px] font-mono">
            <button
              onClick={() => {
                setTimerSessionType('work');
                playTone();
              }}
              className={`px-3 py-1.5 rounded-md transition-all font-bold ${timerSessionType === 'work' ? 'bg-vortex-primary/10 border border-vortex-primary/20 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              FOCUS WORK
            </button>
            <button
              onClick={() => {
                setTimerSessionType('break');
                playTone();
              }}
              className={`px-3 py-1.5 rounded-md transition-all font-bold ${timerSessionType === 'break' ? 'bg-vortex-primary/10 border border-vortex-primary/20 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              CHILL BREAK
            </button>
          </div>

          {/* CONTROLS BUTTONS */}
          <div className="flex items-center space-x-4 zen-stagger z-10">
            <button
              onClick={() => {
                resetTimer();
                playTone();
              }}
              className="w-9 h-9 rounded-lg border border-white/5 bg-white/2 hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all transform active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                if (timerIsRunning) pauseTimer();
                else startTimer();
                playTone();
              }}
              className="w-12 h-12 rounded-xl bg-vortex-primary flex items-center justify-center hover:bg-vortex-primary/95 text-white transition-all transform active:scale-95 shadow-razor"
            >
              {timerIsRunning ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 fill-white ml-0.5" />
              )}
            </button>
          </div>

        </div>

        {/* RIGHT COMPARTMENT: ACTIVE WORK LISTS */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-between overflow-y-auto no-scrollbar">
          
          <div className="space-y-6">
            
            {/* Headers */}
            <div className="flex items-center space-x-2.5 zen-stagger">
              <span className="text-[8px] font-mono tracking-widest text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase font-bold">
                {task.status}
              </span>
              <span className="text-slate-700 text-xs">//</span>
              <span className="text-[8px] font-mono text-slate-500 font-bold tracking-widest uppercase bg-white/5 border border-white/5 px-2 py-0.5 rounded">
                {task.priority} PRIOR
              </span>
            </div>

            {/* Task Info */}
            <div className="space-y-2 zen-stagger">
              <h2 className="text-xl font-bold tracking-tight text-white leading-snug">
                {task.title}
              </h2>
              {task.description && (
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {task.description}
                </p>
              )}
            </div>

            {/* Subtask lists */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="space-y-3.5 zen-stagger border-t border-white/5 pt-5">
                <label className="text-[8px] font-mono tracking-widest text-slate-500 uppercase flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-vortex-primary" />
                  <span>Sub-operation parameters</span>
                </label>

                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                  {task.subtasks.map((sub, idx) => (
                    <button
                      key={sub._id || idx}
                      onClick={() => handleToggleSubtask(idx)}
                      className="w-full flex items-start space-x-3 p-3 rounded-xl bg-white/2 border border-white/5 hover:bg-white/4 text-left transition-all text-xs"
                    >
                      <span className={`zen-subcheck-${idx} shrink-0 mt-0.5`}>
                        {sub.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-vortex-success" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                        )}
                      </span>
                      <span className={`truncate leading-relaxed flex-1 ${sub.completed ? 'line-through text-slate-600' : 'text-slate-300'}`}>
                        {sub.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* zen footer */}
          <footer className="mt-8 border-t border-white/5 pt-4 text-[9px] font-mono text-slate-600 zen-stagger select-none uppercase tracking-wide">
            Calibrate focus loop. Strip distraction variables.
          </footer>

        </div>

      </motion.div>
    </div>
  );
}
