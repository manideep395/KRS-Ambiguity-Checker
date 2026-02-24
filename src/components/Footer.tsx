import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer
      className="h-11 flex items-center justify-center px-5 border-t border-border/50 flex-shrink-0"
      style={{
        background: 'var(--gradient-primary)',
        boxShadow: '0 -2px 12px hsl(262 83% 58% / 0.15)',
      }}
    >
      <p className="text-xs font-medium text-white/80 tracking-wide" style={{ textShadow: '0 1px 2px hsl(0 0% 0% / 0.15)' }}>
        © 2026 KRS Innovators. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
