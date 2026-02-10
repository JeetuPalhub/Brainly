import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface AnimatedTabItem {
  id: string;
  label: string;
}

const AnimatedTabs: React.FC<{
  items: AnimatedTabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}> = ({ items, activeId, onChange, className = '' }) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className={`inline-flex flex-wrap gap-2 rounded-xl bg-slate-900/40 p-1 border border-white/10 ${className}`} role="tablist" aria-label="Content filters">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className="relative px-4 py-2 text-sm font-medium rounded-lg text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            {active && (
              <motion.span
                layoutId="active-tab"
                className="absolute inset-0 rounded-lg bg-cyan-500/20 border border-cyan-400/40"
                transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 350, damping: 28 }}
              />
            )}
            <span className="relative z-10">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default AnimatedTabs;
