import React from 'react';
import { motion } from 'framer-motion';
import { Info, X, Moon, Sun, Shield } from 'lucide-react';

interface NavBarProps {
  showAbout: boolean;
  onToggleAbout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ showAbout, onToggleAbout, darkMode, onToggleDarkMode }) => {
  return (
    <>
      <header className="h-16 flex items-center justify-center px-5 border-b border-border/50 flex-shrink-0 relative"
        style={{
          background: 'var(--gradient-primary)',
          boxShadow: '0 4px 20px hsl(262 83% 58% / 0.3), 0 1px 3px hsl(0 0% 0% / 0.1)',
        }}
      >
        {/* Centered title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold tracking-tight text-white" style={{ textShadow: '0 1px 3px hsl(0 0% 0% / 0.2)' }}>
              KRS Ambiguity Checker
            </h1>
            <p className="text-[10px] text-white/70 font-medium tracking-widest uppercase">
              Grammar Analysis & Resolution
            </p>
          </div>
        </motion.div>

        {/* Right controls */}
        <div className="absolute right-4 flex items-center gap-1">
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggleAbout}
            className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-all duration-200 px-2.5 py-1.5 rounded-lg hover:bg-white/10"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">About</span>
          </button>
        </div>
      </header>

      {/* About Panel */}
      {showAbout && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-strong border-b border-border px-6 py-4 overflow-hidden"
        >
          <div className="max-w-3xl mx-auto flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">About KRS Ambiguity Checker</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A web-based tool for detecting and resolving ambiguity in context-free grammars.
                Uses heuristic analysis including expression ambiguity detection, dangling else identification,
                prefix conflict detection, and FIRST/FOLLOW set computation. Supports automated transformations
                including operator precedence restructuring, left recursion elimination, and left factoring.
              </p>
              <p className="text-xs text-muted-foreground/70">
                Note: General CFG ambiguity is undecidable. This tool detects common patterns but cannot guarantee completeness.
              </p>
            </div>
            <button onClick={onToggleAbout} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-secondary/80">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default NavBar;
