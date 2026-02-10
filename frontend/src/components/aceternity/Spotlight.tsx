import React from 'react';

const Spotlight: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.24),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.20),transparent_38%)] ${className}`}
    />
  );
};

export default Spotlight;
