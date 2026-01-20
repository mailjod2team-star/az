import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedLogo = () => {
  return (
    <motion.div
      className="flex items-center ml-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="relative flex items-center"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <img 
          src="https://i.ibb.co/4v1zHkQ/logo-dearpos.png" 
          alt="POS Logo" 
          className="h-28 w-28 object-contain"
        />
      </motion.div>
    </motion.div>
  );
};
