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
      <header className="h-12 flex items-center justify-between px-4 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary/20 flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-sm font-semibold tracking-tight">
            <span className="text-gradient">CFG Analyzer</span>
          </h1>
          <span className="text-xs text-muted-foreground font-mono hidden sm:inline">v1.0</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggleAbout}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-secondary"
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
          className="bg-card border-b border-border px-6 py-4 overflow-hidden"
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
            <button onClick={onToggleAbout} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default NavBar;
