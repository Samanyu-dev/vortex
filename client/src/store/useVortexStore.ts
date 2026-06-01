import { create } from 'zustand';

const API_BASE_URL = 'http://localhost:5001/api';

// Interface structures
export interface Subtask {
  _id?: string;
  title: string;
  completed: boolean;
}

export interface Activity {
  _id?: string;
  text: string;
  time: string;
}

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  tags: string[];
  subtasks: Subtask[];
  activities: Activity[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

interface VortexStore {
  // Auth State
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  
  // Tasks State
  tasks: Task[];
  tasksLoading: boolean;
  tasksError: string | null;
  
  // UI Interactive States
  focusedTaskId: string | null;
  activeDrawerTaskId: string | null;
  isCreateModalOpen: boolean;
  searchQuery: string;
  selectedTag: string;
  selectedPriority: string;
  
  // Momentum Engine
  momentumScore: number;
  momentumDirection: 'up' | 'down' | 'stable';
  
  // Pomodoro Focus Timer State
  timerSeconds: number;
  timerOriginalDuration: number;
  timerIsRunning: boolean;
  timerSessionType: 'work' | 'break';

  // Auth Actions
  register: (name: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearAuthError: () => void;

  // Task Actions
  fetchTasks: () => Promise<void>;
  createTask: (taskData: Partial<Task>) => Promise<boolean>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<boolean>;
  patchTaskStatus: (id: string, status: 'Todo' | 'In Progress' | 'Done') => Promise<void>;
  deleteTask: (id: string) => Promise<boolean>;

  // UI State Actions
  setFocusedTaskId: (id: string | null) => void;
  setActiveDrawerTaskId: (id: string | null) => void;
  setCreateModalOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string) => void;
  setSelectedPriority: (priority: string) => void;

  // Pomodoro Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (durationMinutes?: number) => void;
  tickTimer: () => void;
  setTimerSessionType: (type: 'work' | 'break') => void;
}

// Helper to calculate momentum score based on task completions, ratios, and streaks
const calculateMomentum = (tasks: Task[], prevScore: number = 75): { score: number; direction: 'up' | 'down' | 'stable' } => {
  const total = tasks.length;
  if (total === 0) return { score: 50, direction: 'stable' };

  const completed = tasks.filter(t => t.status === 'Done').length;
  const inFlight = tasks.filter(t => t.status === 'In Progress').length;
  
  // Ratios
  const completionRatio = completed / total;
  const inFlightRatio = inFlight / total;

  // Calculate score between 10 and 99
  // 60% weight on completion, 20% on in-flight, and 20% bonus streak/load factor
  const baseScore = (completionRatio * 60) + (inFlightRatio * 20) + 15;
  const finalScore = Math.max(10, Math.min(99, Math.round(baseScore)));

  let direction: 'up' | 'down' | 'stable' = 'stable';
  if (finalScore > prevScore) direction = 'up';
  else if (finalScore < prevScore) direction = 'down';

  return { score: finalScore, direction };
};

export const useVortexStore = create<VortexStore>((set, get) => ({
  // Auth Defaults
  token: localStorage.getItem('vortex_jwt_token'),
  user: null,
  isAuthenticated: false,
  authLoading: true,
  authError: null,

  // Tasks Defaults
  tasks: [],
  tasksLoading: false,
  tasksError: null,

  // UI Interactive Defaults
  focusedTaskId: null,
  activeDrawerTaskId: null,
  isCreateModalOpen: false,
  searchQuery: '',
  selectedTag: 'All',
  selectedPriority: 'All',

  // Momentum Defaults
  momentumScore: 75,
  momentumDirection: 'stable',

  // Timer Defaults
  timerSeconds: 25 * 60,
  timerOriginalDuration: 25 * 60,
  timerIsRunning: false,
  timerSessionType: 'work',

  // ----------------------------------------------------
  // AUTH ACTIONS
  // ----------------------------------------------------
  clearAuthError: () => set({ authError: null }),

  checkAuth: async () => {
    const { token } = get();
    if (!token) {
      set({ isAuthenticated: false, authLoading: false });
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Token verification failed');
      }
      
      const userData = await response.json();
      set({
        user: userData,
        isAuthenticated: true,
        authLoading: false
      });
      // Fetch tasks on successful authentication
      get().fetchTasks();
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      localStorage.removeItem('vortex_jwt_token');
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        authLoading: false
      });
    }
  },

  register: async (name, email, password) => {
    set({ authLoading: true, authError: null });
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      localStorage.setItem('vortex_jwt_token', data.token);
      set({
        token: data.token,
        user: data.user,
        isAuthenticated: true,
        authLoading: false
      });
      
      // Load user's seeded tasks
      get().fetchTasks();
      return true;
    } catch (err: any) {
      set({ authError: err.message, authLoading: false });
      return false;
    }
  },

  login: async (email, password) => {
    set({ authLoading: true, authError: null });
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication mismatch');
      }

      localStorage.setItem('vortex_jwt_token', data.token);
      set({
        token: data.token,
        user: data.user,
        isAuthenticated: true,
        authLoading: false
      });
      
      // Load user tasks
      get().fetchTasks();
      return true;
    } catch (err: any) {
      set({ authError: err.message, authLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('vortex_jwt_token');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      tasks: [],
      focusedTaskId: null,
      activeDrawerTaskId: null,
      timerIsRunning: false,
      momentumScore: 75,
      momentumDirection: 'stable'
    });
  },

  // ----------------------------------------------------
  // TASK ACTIONS
  // ----------------------------------------------------
  fetchTasks: async () => {
    const { token, momentumScore } = get();
    if (!token) return;

    set({ tasksLoading: true, tasksError: null });
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve task matrix');
      }

      const tasksData = await response.json();
      const momentum = calculateMomentum(tasksData, momentumScore);

      set({ 
        tasks: tasksData, 
        tasksLoading: false,
        momentumScore: momentum.score,
        momentumDirection: momentum.direction
      });
    } catch (err: any) {
      set({ tasksError: err.message, tasksLoading: false });
    }
  },

  createTask: async (taskData) => {
    const { token, tasks, momentumScore } = get();
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Could not instantiate task');
      }

      const createdTask = await response.json();
      const updatedTasks = [createdTask, ...tasks];
      const momentum = calculateMomentum(updatedTasks, momentumScore);

      set({
        tasks: updatedTasks,
        momentumScore: momentum.score,
        momentumDirection: momentum.direction
      });
      return true;
    } catch (err) {
      console.error('Failed to create task:', err);
      return false;
    }
  },

  updateTask: async (id, taskData) => {
    const { token, tasks, momentumScore } = get();
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Could not update task');
      }

      const updatedTask = await response.json();
      const updatedTasks = tasks.map(t => t._id === id ? updatedTask : t);
      const momentum = calculateMomentum(updatedTasks, momentumScore);

      set({
        tasks: updatedTasks,
        momentumScore: momentum.score,
        momentumDirection: momentum.direction
      });
      return true;
    } catch (err) {
      console.error('Failed to update task:', err);
      return false;
    }
  },

  patchTaskStatus: async (id, status) => {
    const { token, tasks, momentumScore } = get();
    if (!token) return;

    // Optimistic Update for fluid status shift
    const originalTasks = [...tasks];
    const optimisticTasks = tasks.map(t => {
      if (t._id === id) {
        const activities = [...t.activities, {
          _id: Math.random().toString(),
          text: `Status shifted: ${t.status} → ${status}`,
          time: new Date().toISOString()
        }];
        return { ...t, status, activities };
      }
      return t;
    });
    
    const optMomentum = calculateMomentum(optimisticTasks, momentumScore);

    set({
      tasks: optimisticTasks,
      momentumScore: optMomentum.score,
      momentumDirection: optMomentum.direction
    });

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('API patch failed');
      }

      const updatedTask = await response.json();
      const confirmedTasks = get().tasks.map(t => t._id === id ? updatedTask : t);
      const finalMomentum = calculateMomentum(confirmedTasks, get().momentumScore);
      
      set({
        tasks: confirmedTasks,
        momentumScore: finalMomentum.score,
        momentumDirection: finalMomentum.direction
      });
    } catch (err) {
      console.error('Optimistic state patch failed, reverting:', err);
      set({ tasks: originalTasks });
    }
  },

  deleteTask: async (id) => {
    const { token, tasks, momentumScore } = get();
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Wipe operation failed');
      }

      const updatedTasks = tasks.filter(t => t._id !== id);
      const momentum = calculateMomentum(updatedTasks, momentumScore);

      set({
        tasks: updatedTasks,
        momentumScore: momentum.score,
        momentumDirection: momentum.direction,
        focusedTaskId: get().focusedTaskId === id ? null : get().focusedTaskId,
        activeDrawerTaskId: get().activeDrawerTaskId === id ? null : get().activeDrawerTaskId
      });
      return true;
    } catch (err) {
      console.error('Failed to wipe task:', err);
      return false;
    }
  },

  // ----------------------------------------------------
  // UI ACTIONS
  // ----------------------------------------------------
  setFocusedTaskId: (id) => set({ focusedTaskId: id }),
  setActiveDrawerTaskId: (id) => set({ activeDrawerTaskId: id }),
  setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTag: (tag) => set({ selectedTag: tag }),
  setSelectedPriority: (priority) => set({ selectedPriority: priority }),

  // ----------------------------------------------------
  // POMODORO TIMER ACTIONS
  // ----------------------------------------------------
  startTimer: () => set({ timerIsRunning: true }),
  pauseTimer: () => set({ timerIsRunning: false }),
  resetTimer: (durationMinutes) => {
    const duration = durationMinutes ? durationMinutes * 60 : get().timerOriginalDuration;
    set({
      timerSeconds: duration,
      timerOriginalDuration: duration,
      timerIsRunning: false
    });
  },
  tickTimer: () => set((state) => {
    if (state.timerSeconds <= 1) {
      const nextType = state.timerSessionType === 'work' ? 'break' : 'work';
      const duration = nextType === 'work' ? 25 * 60 : 5 * 60;
      
      // Increment momentum on completing a Focus deep work session!
      let newScore = state.momentumScore;
      let newDir = state.momentumDirection;
      if (state.timerSessionType === 'work') {
        newScore = Math.min(99, state.momentumScore + 5);
        if (newScore > state.momentumScore) newDir = 'up';
      }

      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } catch (err) {}

      return {
        timerSeconds: duration,
        timerOriginalDuration: duration,
        timerIsRunning: false,
        timerSessionType: nextType,
        momentumScore: newScore,
        momentumDirection: newDir
      };
    }
    return { timerSeconds: state.timerSeconds - 1 };
  }),
  setTimerSessionType: (type) => {
    const duration = type === 'work' ? 25 * 60 : 5 * 60;
    set({
      timerSessionType: type,
      timerSeconds: duration,
      timerOriginalDuration: duration,
      timerIsRunning: false
    });
  }
}));
