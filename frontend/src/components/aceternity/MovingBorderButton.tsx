import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const MovingBorderButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    className?: string;
  }
> = ({ children, className = '', ...props }) => {
  const reduceMotion = useReducedMotion();

  return (
    <button
      {...props}
      className={`group relative inline-flex rounded-xl p-[1.5px] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:opacity-50 ${className}`}
    >
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-xl bg-[linear-gradient(120deg,#06b6d4,#a855f7,#22d3ee)]"
        animate={reduceMotion ? undefined : { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        style={{ backgroundSize: '200% 200%' }}
      />
      <span className="relative rounded-[10px] bg-white dark:bg-slate-950/90 text-slate-900 dark:text-slate-100 px-4 py-2 text-sm font-semibold w-full h-full">
        {children}
      </span>
    </button>
  );
};

export default MovingBorderButton;
