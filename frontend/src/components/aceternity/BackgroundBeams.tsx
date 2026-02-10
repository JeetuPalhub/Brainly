import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const beamOffsets = [8, 18, 33, 47, 62, 79, 91];

const BackgroundBeams: React.FC<{ className?: string }> = ({ className = '' }) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
      {beamOffsets.map((offset, idx) => (
        <motion.span
          key={offset}
          className="absolute top-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-300/45 to-transparent"
          style={{ left: `${offset}%` }}
          animate={reduceMotion ? undefined : { opacity: [0.25, 0.9, 0.25], scaleY: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2.8 + idx * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

export default BackgroundBeams;
