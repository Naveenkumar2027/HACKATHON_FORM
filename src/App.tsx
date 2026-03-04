import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import ThreeBackground from './components/ThreeBackground';
import Intro from './components/Intro';
import Landing from './components/Landing';
import Registration from './components/Registration';
import { MessageSquare, X, Send, Loader2, Bot } from 'lucide-react';
import { getAssistantResponse } from './services/geminiService';

export default function App() {
  const [view, setView] = useState<'intro' | 'landing' | 'registration'>('intro');

  return (
    <div className="relative min-h-screen text-white font-sans selection:bg-neon-blue/30 selection:text-neon-blue">
      <ThreeBackground />

      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <Intro key="intro" onComplete={() => setView('landing')} />
        )}

        {view === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <Landing onRegisterClick={() => setView('registration')} />
          </motion.div>
        )}

        {view === 'registration' && (
          <motion.div
            key="registration"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
          >
            <Registration onBack={() => setView('landing')} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Footer Overlay */}
      <footer className="fixed bottom-4 left-4 z-40 flex items-center gap-4 opacity-20 hover:opacity-100 transition-opacity">
        <div className="flex flex-col font-mono">
          <span className="text-[8px] uppercase tracking-[0.3em] font-bold">NODE_STATUS: SECURE</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            <span className="text-[7px] uppercase tracking-widest">UPLINK_ACTIVE // 0x7F000001</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
