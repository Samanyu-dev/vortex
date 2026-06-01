import React, { useEffect, useRef } from 'react';
import { useVortexStore } from '../store/useVortexStore';
import type { Task } from '../store/useVortexStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { 
  X, Play, Pause, RotateCcw, Target, ShieldAlert, CheckCircle2, 
  Circle, ChevronRight, Volume2, Sparkles 
} from 'lucide-react';

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

  // Interval hook to tick timer when running
  useEffect(() => {
    let intervalId: any;
    if (timerIsRunning) {
      intervalId = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [timerIsRunning]);

  // Stagger entry animations for focus elements
  useGSAP(() => {
    if (focusedTaskId) {
      gsap.fromTo('.focus-stagger',
        { opacity: 0, scale: 0.95, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
      );
    }
  }, [focusedTaskId]);

  if (!task) return null;

  // Format countdown string
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Timer circle calculations
  const progressRatio = timerSeconds / timerOriginalDuration;
  const strokeDashoffset = 251.2 * (1 - progressRatio);

  const handleToggleSubtask = async (subIndex: number) => {
    const updatedSubtasks = [...(task.subtasks || [])];
    updatedSubtasks[subIndex].completed = !updatedSubtasks[subIndex].completed;

    // Trigger scale animation on check
    if (updatedSubtasks[subIndex].completed) {
      gsap.fromTo(`.focus-subcheck-${subIndex}`,
        { scale: 0.7, opacity: 0.5 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' }
      );
    }

    // Save back to backend immediately
    await updateTask(task._id, {
      subtasks: updatedSubtasks
    });
  };

  // Quick audio test
  const playTone = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5 Note
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      
      {/* Immersive Dim Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setFocusedTaskId(null)}
        className="absolute inset-0 bg-[#020309]/95 backdrop-blur-lg pointer-events-auto"
      />

      {/* Futuristic Spotlight Cockpit Window */}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 28, stiffness: 180 }}
        className="w-full max-w-4xl h-[560px] glass-panel rounded-3xl border border-white/10 shadow-glass flex flex-col md:flex-row pointer-events-auto overflow-hidden relative z-10 select-none"
      >
        <div className="scanner-line absolute top-0 left-0 right-0 h-10 opacity-15 pointer-events-none" />

        {/* CLOSE BUTTON */}
        <button
          onClick={() => setFocusedTaskId(null)}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT COLUMN: ACTIVE TIMER UNIT */}
        <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 relative bg-[#040612]/60 shrink-0">
          
          <div className="absolute top-8 left-8 flex items-center space-x-2 text-[10px] font-mono tracking-widest text-vortex-secondary focus-stagger">
            <Target className="w-3.5 h-3.5 text-vortex-secondary animate-pulse" />
            <span>QUANTUM COCKPIT ACTIVE</span>
          </div>

          {/* TIMER DIAL CONTAINER */}
          <div className="relative w-56 h-56 flex items-center justify-center focus-stagger select-none my-6">
            
            {/* Spinning background energy ring */}
            <div className="absolute inset-0 rounded-full border border-vortex-primary/10 animate-[spin_30s_linear_infinite]" />
            <div className="absolute inset-4 rounded-full border border-dashed border-vortex-secondary/5 animate-[spin_18s_linear_infinite_reverse]" />

            {/* Glowing SVG countdown ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                cx="112" 
                cy="112" 
                r="80" 
                className="stroke-white/5 fill-none" 
                strokeWidth="4" 
              />
              <circle 
                cx="112" 
                cy="112" 
                r="80" 
                className="stroke-vortex-primary fill-none filter drop-shadow-neon-primary" 
                strokeWidth="5" 
                strokeDasharray="251.2"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ 
                  strokeDasharray: '502.4', 
                  strokeDashoffset: `${502.4 - (502.4 * progressRatio)}`, 
                  transition: 'stroke-dashoffset 1s linear' 
                }}
              />
            </svg>

            {/* Timer Counter */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-mono font-black tracking-widest text-slate-100 animate-pulse-slow">
                {formatTime(timerSeconds)}
              </span>
              <span className="text-[9px] font-mono text-vortex-secondary tracking-widest uppercase mt-1">
                {timerSessionType} MODE
              </span>
            </div>
          </div>

          {/* TIMER CYCLE CHANGER */}
          <div className="flex p-0.5 bg-white/5 rounded-xl border border-white/5 mb-6 focus-stagger select-none relative z-10">
            <button
              onClick={() => {
                setTimerSessionType('work');
                playTone();
              }}
              className={`px-4 py-1.5 text-[10px] font-mono font-bold tracking-wider rounded-lg transition-all ${timerSessionType === 'work' ? 'bg-vortex-primary/20 border border-vortex-primary/30 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              DEEP WORK
            </button>
            <button
              onClick={() => {
                setTimerSessionType('break');
                playTone();
              }}
              className={`px-4 py-1.5 text-[10px] font-mono font-bold tracking-wider rounded-lg transition-all ${timerSessionType === 'break' ? 'bg-vortex-secondary/20 border border-vortex-secondary/30 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              CHILL BREAK
            </button>
          </div>

          {/* CONTROL TOGGLES */}
          <div className="flex items-center space-x-6 focus-stagger z-10">
            
            {/* Reset */}
            <button
              onClick={() => {
                resetTimer();
                playTone();
              }}
              className="w-10 h-10 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all transform active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={() => {
                if (timerIsRunning) pauseTimer();
                else startTimer();
                playTone();
              }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-vortex-primary to-vortex-accent flex items-center justify-center hover:shadow-neon-primary text-white transition-all transform active:scale-95 shadow-glass"
            >
              {timerIsRunning ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 fill-white ml-0.5" />
              )}
            </button>

            {/* Mini sound check */}
            <button
              onClick={playTone}
              className="w-10 h-10 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all transform active:scale-95"
            >
              <Volume2 className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* RIGHT COLUMN: TASK DETAILS PANEL */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-between overflow-y-auto no-scrollbar">
          
          <div className="space-y-6">
            
            {/* Stage / Metadata Indicators */}
            <div className="flex items-center space-x-2.5 focus-stagger">
              <span className="text-[9px] font-mono tracking-widest text-vortex-secondary bg-vortex-secondary/10 px-2 py-0.5 rounded border border-vortex-secondary/20 uppercase font-bold">
                {task.status}
              </span>
              <span className="text-slate-600 text-xs">//</span>
              <span className="text-[9px] font-mono text-vortex-primary font-bold tracking-widest uppercase bg-vortex-primary/10 border border-vortex-primary/20 px-2 py-0.5 rounded">
                {task.priority} PRIOR
              </span>
            </div>

            {/* Core Task Content */}
            <div className="space-y-2 focus-stagger">
              <h2 className="text-xl font-bold tracking-tight text-white leading-snug">
                {task.title}
              </h2>
              {task.description && (
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {task.description}
                </p>
              )}
            </div>

            {/* Focused subtask checkbox panel */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="space-y-3.5 focus-stagger border-t border-white/5 pt-5">
                <label className="text-[9px] font-mono tracking-widest text-slate-500 uppercase flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-vortex-secondary" />
                  <span>Sub-operations parameters</span>
                </label>

                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                  {task.subtasks.map((sub, idx) => (
                    <button
                      key={sub._id || idx}
                      onClick={() => handleToggleSubtask(idx)}
                      className="w-full flex items-start space-x-3 p-3 rounded-xl bg-white/2 border border-white/5 hover:bg-white/4 text-left transition-all text-xs"
                    >
                      <span className={`focus-subcheck-${idx} shrink-0 mt-0.5`}>
                        {sub.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-vortex-secondary animate-pulse" />
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

          {/* Quick tips footer */}
          <footer className="mt-8 border-t border-white/5 pt-4 flex items-center space-x-2 text-[10px] font-mono text-slate-500 focus-stagger select-none">
            <ShieldAlert className="w-3.5 h-3.5 text-vortex-primary animate-pulse" />
            <span>Deep work mode is designed to lock out distractions. Engage.</span>
          </footer>

        </div>

      </motion.div>
    </div>
  );
}
