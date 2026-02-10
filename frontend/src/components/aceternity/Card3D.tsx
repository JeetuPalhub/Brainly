import React, { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const Card3D: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const reduceMotion = useReducedMotion();
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const shadow = useMemo(() => `${-rotate.y / 2}px ${rotate.x / 2}px 30px rgba(14,165,233,0.25)`, [rotate]);

  const supportsHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  return (
    <motion.div
      onMouseMove={(event: React.MouseEvent<HTMLDivElement>) => {
        if (reduceMotion || !supportsHover) {
          return;
        }
        const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rotateX = -((y - rect.height / 2) / rect.height) * 14;
        const rotateY = ((x - rect.width / 2) / rect.width) * 14;
        setRotate({ x: rotateX, y: rotateY });
      }}
      onMouseLeave={() => setRotate({ x: 0, y: 0 })}
      style={
        reduceMotion || !supportsHover
          ? undefined
          : {
              transformStyle: 'preserve-3d',
              transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
              boxShadow: shadow
            }
      }
      className={`transition-transform duration-200 will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card3D;
