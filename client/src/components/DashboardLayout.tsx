import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TaskBoard from './TaskBoard';
import Analytics from './Analytics';
import Settings from './Settings';
import TaskDetails from './TaskDetails';
import FocusMode from './FocusMode';
import CreateTaskModal from './CreateTaskModal';
import CommandPalette from './CommandPalette';
import { AnimatePresence } from 'framer-motion';

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
        return <TaskBoard />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        // By default dashboard shows the TaskBoard. This maps beautifully!
        return <TaskBoard />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-vortex-bg relative select-none">
      
      {/* Dynamic Background Auroras */}
      <div className="aurora-sphere absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-vortex-primary/10 opacity-30 select-none pointer-events-none" />
      <div className="aurora-sphere absolute bottom-[10%] right-[20%] w-[600px] h-[600px] rounded-full bg-vortex-secondary/10 opacity-30 select-none pointer-events-none" />
      
      {/* SIDEBAR NAVIGATION */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* CENTRAL workspace CONTENT SCROLLPORT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute inset-0 digital-grid opacity-30 pointer-events-none" />
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {renderContent()}
        </div>
      </main>

      {/* OVERLAY WIDGETS AND DRAWERS */}
      <AnimatePresence>
        
        {/* Task details drawers */}
        <TaskDetails />

        {/* Focus Mode Immersive Spotlight Cockpit */}
        <FocusMode />

        {/* Zod forms task modal */}
        <CreateTaskModal />

        {/* Global fuzzy scanner Cmd+K command palette */}
        <CommandPalette />

      </AnimatePresence>

    </div>
  );
}
