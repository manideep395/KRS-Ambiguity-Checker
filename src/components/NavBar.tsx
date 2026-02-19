import React from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Info, X, Moon, Sun } from 'lucide-react';

interface NavBarProps {
  showAbout: boolean;
  onToggleAbout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ showAbout, onToggleAbout, darkMode, onToggleDarkMode }) => {
  return (
    <>
      <header className="h-13 flex items-center justify-between px-5 border-b border-border glass-strong flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shadow-md" style={{ boxShadow: '0 2px 8px hsl(var(--primary) / 0.2)' }}>
            <GitBranch className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">
              <span className="text-gradient">CFG Analyzer</span>
            </h1>
            <span className="text-[10px] text-muted-foreground font-mono hidden sm:block">Ambiguity Detection & Resolution</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-200"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggleAbout}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-all duration-200 px-2.5 py-1.5 rounded-lg hover:bg-secondary/80"
          >
            <Info className="w-3.5 h-3.5" />
            <span>About</span>
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
              <h2 className="text-sm font-semibold text-foreground">About CFG Ambiguity Analyzer</h2>
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
