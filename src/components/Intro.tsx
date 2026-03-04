import React, { useEffect, useRef } from 'react';
import { createTimeline } from 'animejs';
import { Cpu } from 'lucide-react';

interface IntroProps {
  onComplete: () => void;
}

const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  const logoRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeline = createTimeline({
      onComplete: () => onComplete(),
    });

    timeline
      .add(logoRef.current, {
        opacity: [0, 1],
        scale: [0.8, 1],
        filter: ['blur(10px)', 'blur(0px)'],
        duration: 1500,
        ease: 'easeInOutQuad',
      })
      .add(logoRef.current, {
        boxShadow: ['0 0 0px rgba(0, 243, 255, 0)', '0 0 50px rgba(0, 243, 255, 0.5)'],
        duration: 1000,
        ease: 'easeInOutQuad',
      })
      .add(containerRef.current, {
        opacity: [1, 0],
        duration: 1000,
        delay: 1500,
        ease: 'easeInOutQuad',
      });

    return () => {
      timeline.pause();
    };
  }, [onComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="system-activity-indicator" />
      <div ref={logoRef} className="flex flex-col items-center opacity-0">
        <div className="relative p-8 rounded-sm bg-neon-green/5 border border-neon-green/20 shadow-neon-green/10 shadow-2xl">
          <Cpu size={80} className="text-neon-green opacity-80" />
          <div className="absolute inset-0 rounded-sm holographic opacity-10" />
        </div>
        <h2 className="mt-6 text-2xl font-mono font-bold tracking-[0.5em] text-neon-green uppercase">
          Robotics Club
        </h2>
        <p className="mt-2 text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase">
          Secure Data Science Node // 4th Semester
        </p>
      </div>
    </div>
  );
};

export default Intro;
