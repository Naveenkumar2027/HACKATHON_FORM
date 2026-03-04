import React, { useEffect, useRef } from 'react';
import { createTimeline } from 'animejs';

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
        <img
          src="/robotics-club-logo.png"
          alt="Robotics Club"
          className="w-48 h-48 md:w-64 md:h-64 object-contain"
          style={{ clipPath: 'circle(48%)' }}
        />
        <p className="mt-6 text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase">
          THE ROBOTICS CLUB
        </p>
        <p className="mt-2 text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">
          &quot;WHERE IDEAS ARE ASSEMBLED&quot;
        </p>
      </div>
    </div>
  );
};

export default Intro;
