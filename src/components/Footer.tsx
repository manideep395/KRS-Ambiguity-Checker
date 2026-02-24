import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="h-11 flex items-center justify-center px-5 border-t flex-shrink-0 bg-card border-border shadow-[0_-2px_8px_hsl(var(--border)/0.3)] relative">
      {/* Accent gradient line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'var(--gradient-primary)' }} />
      <p className="text-xs font-medium text-muted-foreground tracking-wide">
        © 2026 KRS Innovators. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
