import React from 'react';

interface HeaderProps {
  onLogoClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-center py-3 px-4 bg-black/60 backdrop-blur-md border-b border-white/5">
      <button
        type="button"
        onClick={onLogoClick}
        className="flex items-center gap-3 bg-transparent border-none cursor-pointer text-inherit"
      >
        <img
          src="/robotics-club-logo.png"
          alt="Robotics Club"
          className="h-10 w-10 md:h-12 md:w-12 object-contain"
          style={{ mixBlendMode: 'screen' }}
        />
        <span className="font-mono text-xs md:text-sm font-bold tracking-widest text-white uppercase">
          Robotics Club
        </span>
      </button>
    </header>
  );
};

export default Header;
