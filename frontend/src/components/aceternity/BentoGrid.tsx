import React from 'react';
import { motion } from 'framer-motion';

export const BentoGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>{children}</div>
);

export const BentoCard: React.FC<{
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, description, icon, className = '' }) => (
  <motion.article
    whileHover={{ y: -6 }}
    className={`rounded-2xl border border-white/20 bg-white/10 dark:bg-slate-900/50 backdrop-blur-xl p-5 ${className}`}
  >
    <div className="text-cyan-300 mb-3">{icon}</div>
    <h3 className="font-semibold text-lg text-slate-100">{title}</h3>
    <p className="text-sm text-slate-300 mt-2">{description}</p>
  </motion.article>
);
