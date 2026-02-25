import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Info } from 'lucide-react';
import krsLogo from '@/assets/krs-logo.png';
import { useNavigate } from 'react-router-dom';

interface NavBarProps {
  showAbout?: boolean;
  onToggleAbout?: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ darkMode, onToggleDarkMode }) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 flex items-center justify-center px-5 border-b flex-shrink-0 relative bg-card border-border shadow-[var(--card-shadow)]">
      {/* Accent gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'var(--gradient-primary)' }} />

      {/* Centered title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/25 shadow-md overflow-hidden">
          <img src={krsLogo} alt="KRS Logo" className="w-8 h-8 object-contain" />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            <span className="text-gradient">KRS Ambiguity Checker</span>
          </h1>
          <p className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">
            Grammar Analysis & Resolution
          </p>
        </div>
      </motion.div>

      {/* Right controls */}
      <div className="absolute right-4 flex items-center gap-1">
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-200"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={() => navigate('/about')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-secondary/80"
        >
          <Info className="w-4 h-4" />
          <span className="hidden sm:inline">About</span>
        </button>
      </div>
    </header>
  );
};

export default NavBar;
