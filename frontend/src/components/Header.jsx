import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedLogo } from './AnimatedLogo';

export const Header = () => {
  return (
    <motion.header
      className="h-16 bg-card border-b border-border flex items-center justify-between px-6"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <AnimatedLogo />

      <div className="flex items-center gap-3">
        <motion.button
          className="p-2 hover:bg-muted rounded-lg transition-colors relative group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <i className="fa-solid fa-bell text-xl text-muted-foreground group-hover:text-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
        </motion.button>

        <motion.button
          className="p-2 hover:bg-muted rounded-lg transition-colors relative group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <i className="fa-brands fa-telegram text-xl text-muted-foreground group-hover:text-foreground" />
        </motion.button>

        <div className="flex items-center gap-2 ml-4">
          <motion.button
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fa-solid fa-minus text-muted-foreground" />
          </motion.button>
          <motion.button
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fa-regular fa-square text-muted-foreground" />
          </motion.button>
          <motion.button
            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fa-solid fa-xmark text-muted-foreground" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};
