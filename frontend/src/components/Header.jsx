import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedLogo } from './AnimatedLogo';
import { NotificationSidebar } from './NotificationSidebar';

export const Header = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <>
      <motion.header
        className="h-16 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 border-b border-emerald-600 flex items-center justify-between px-6 shadow-md"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <AnimatedLogo />

        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => setIsNotificationOpen(true)}
            className="p-2.5 hover:bg-emerald-400 rounded-lg transition-colors relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fa-solid fa-bell text-xl text-white" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </motion.button>

          <motion.button
            className="p-2.5 hover:bg-emerald-400 rounded-lg transition-colors relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fa-brands fa-telegram text-xl text-white" />
          </motion.button>

          <div className="flex items-center gap-2 ml-4 border-l border-emerald-400 pl-4">
            <motion.button
              className="p-2 hover:bg-emerald-400 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fa-solid fa-minus text-white" />
            </motion.button>
            <motion.button
              className="p-2 hover:bg-emerald-400 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fa-regular fa-square text-white" />
            </motion.button>
            <motion.button
              className="p-2 hover:bg-red-500 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fa-solid fa-xmark text-white" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Notification Sidebar */}
      <NotificationSidebar 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />
    </>
  );
};
