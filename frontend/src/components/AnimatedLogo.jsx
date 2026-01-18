import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedLogo = () => {
  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="w-24 h-24 object-contain"
        />
      </motion.div>
    </motion.div>
  );
};
