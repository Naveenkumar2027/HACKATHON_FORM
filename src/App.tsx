import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import ThreeBackground from './components/ThreeBackground';
import Intro from './components/Intro';
import Landing from './components/Landing';
import Registration from './components/Registration';
import Header from './components/Header';

export default function App() {
  const [view, setView] = useState<'intro' | 'landing' | 'registration'>('intro');

  return (
    <div className="relative min-h-screen text-white font-sans selection:bg-neon-blue/30 selection:text-neon-blue">
      <ThreeBackground />

      {view !== 'intro' && <Header onLogoClick={() => setView('landing')} />}

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
    </div>
  );
}
