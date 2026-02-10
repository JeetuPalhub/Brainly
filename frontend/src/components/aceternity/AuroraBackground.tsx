import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const blobs = [
  'from-cyan-500/35 via-sky-500/25 to-transparent',
  'from-fuchsia-500/30 via-violet-500/25 to-transparent',
  'from-emerald-400/25 via-teal-500/20 to-transparent'
];

const AuroraBackground: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-0">
        {blobs.map((gradient, index) => (
          <motion.div
            key={gradient}
            className={`absolute h-[35rem] w-[35rem] rounded-full bg-gradient-to-r blur-3xl ${gradient}`}
            style={{
              left: `${index * 20 - 10}%`,
              top: `${index * 15 - 20}%`
            }}
            animate={
              reduceMotion
                ? undefined
                : {
                    x: [0, 40, -20, 0],
                    y: [0, -30, 20, 0],
                    scale: [1, 1.1, 0.95, 1]
                  }
            }
            transition={{ duration: 14 + index * 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default AuroraBackground;
