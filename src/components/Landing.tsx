import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { createTimeline, stagger } from 'animejs';
import { Calendar, Trophy, Users, Clock, ChevronRight } from 'lucide-react';

interface LandingProps {
  onRegisterClick: () => void;
}

const Landing: React.FC<LandingProps> = ({ onRegisterClick }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const titleText = "WIRED\u00A0WEEKEND";
    let timeoutId: NodeJS.Timeout;
    
    if (titleRef.current) {
      titleRef.current.innerText = "";
    }

    let i = 0;
    const typeWriter = () => {
      if (i < titleText.length) {
        if (titleRef.current) {
          titleRef.current.innerText += titleText.charAt(i);
        }
        i++;
        timeoutId = setTimeout(typeWriter, 100);
      }
    };

    typeWriter();

    createTimeline({ defaults: { ease: 'outExpo' } })
      .add(taglineRef.current, {
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 800,
        delay: 1500,
      });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10 md:py-20">
      <div className="system-activity-indicator hidden md:block" />
      
      <div className="flex flex-col items-center mb-6 md:mb-8">
        <img 
          src="/robotics-club-logo.png" 
          alt="Robotics Club Logo" 
          className="w-24 h-24 md:w-48 md:h-48 object-contain mb-2 md:mb-4"
          style={{ mixBlendMode: 'screen', clipPath: 'circle(48%)' }}
        />
        <p className="text-neon-green font-mono text-[10px] md:text-sm tracking-[0.3em] md:tracking-[0.5em] uppercase font-bold">
          THE DATASCIENCE CLUB
        </p>
      </div>

      <div className="text-center mb-10 md:mb-16">
        <h1 
          ref={titleRef} 
          className="text-4xl sm:text-6xl md:text-9xl font-bold tracking-normal neon-text uppercase font-typewriter min-h-[1.2em] leading-tight whitespace-pre"
        >
          WIRED WEEKEND
        </h1>
        <p 
          ref={taglineRef} 
          className="mt-2 md:mt-4 text-xs sm:text-lg md:text-2xl font-mono font-light tracking-[0.1em] sm:tracking-[0.3em] text-white/40 uppercase opacity-0"
        >
          THINK IT FRIDAY, SHIP IT MONDAY
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="max-w-4xl w-full glass-panel p-6 md:p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-green/50 to-transparent" />
        
        <div className="space-y-8">
          <section>
            <h2 className="text-lg md:text-xl font-mono font-bold text-neon-green mb-3 md:mb-4 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-neon-green" />
              SYSTEM_MISSION_LOG
            </h2>
            <p className="text-base md:text-lg text-white/70 leading-relaxed font-light">
              Ready to turn your "what-ifs" into "it-works"? The Robotics Club of Data Science is proud to present <span className="text-neon-green font-mono font-medium">Wired Weekend</span>, a high-octane 48-hour hackathon designed exclusively for 4th-semester students.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="p-6 rounded-sm bg-black/40 border border-white/5 hover:border-neon-green/30 transition-all group">
              <Calendar className="text-neon-green mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              <h3 className="font-mono text-sm font-bold mb-2">01_THE_REVEAL</h3>
              <p className="text-xs text-white/40">Friday, March 6: Problem Statement Drop & Brainstorming.</p>
            </div>
            <div className="p-6 rounded-sm bg-black/40 border border-white/5 hover:border-neon-green/30 transition-all group">
              <Clock className="text-neon-green mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              <h3 className="font-mono text-sm font-bold mb-2">02_THE_GRIND</h3>
              <p className="text-xs text-white/40">Sat – Sun: 48 hours to build, refine, and submit.</p>
            </div>
            <div className="p-6 rounded-sm bg-black/40 border border-white/5 hover:border-neon-green/30 transition-all group">
              <Trophy className="text-neon-green mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              <h3 className="font-mono text-sm font-bold mb-2">03_THE_SHOWCASE</h3>
              <p className="text-xs text-white/40">Monday, March 9: Final presentations to judges.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 sm:gap-8 pt-6 border-t border-white/5">
            <div className="flex items-center gap-3">
              <Users className="text-neon-cyan opacity-50" />
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Team_Size</p>
                <p className="font-mono text-sm">2 – 4 Members</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Trophy className="text-neon-cyan opacity-50" />
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Eligibility</p>
                <p className="font-mono text-sm">4th Sem Students</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 2 }}
        onClick={onRegisterClick}
        className="mt-10 md:mt-12 group btn-futuristic flex items-center justify-center gap-3 w-full sm:w-auto"
      >
        <span className="font-mono text-sm md:text-base">INITIALIZE_REGISTRATION</span>
        <ChevronRight className="group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </div>
  );
};

export default Landing;
