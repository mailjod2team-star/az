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
          src="https://customer-assets.emergentagent.com/job_bd815a3c-e79b-4e10-b3a0-61ed914d218f/artifacts/stzltl0n_logo.png" 
          alt="DEAR POS Logo" 
          className="h-14 w-14 object-contain"
        />
      </motion.div>
    </motion.div>
  );
};
