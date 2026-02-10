import React from 'react';
import { motion } from 'framer-motion';

const TextGenerateEffect: React.FC<{ words: string; className?: string }> = ({ words, className = '' }) => {
  const split = words.split(' ');

  return (
    <h1 className={className} aria-label={words}>
      {split.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04, duration: 0.25 }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
};

export default TextGenerateEffect;
