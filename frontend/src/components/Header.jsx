import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedLogo } from './AnimatedLogo';
import { NotificationSidebar } from './NotificationSidebar';

export const Header = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <>
      <motion.header
        className="h-16 bg-white border-b border-emerald-100 flex items-center justify-between px-6 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <AnimatedLogo />

        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => setIsNotificationOpen(true)}
            className="p-2.5 hover:bg-emerald-50 rounded-lg transition-colors relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fa-solid fa-bell text-xl text-gray-600 group-hover:text-emerald-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </motion.button>

          <motion.button
            className="p-2.5 hover:bg-emerald-50 rounded-lg transition-colors relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fa-brands fa-telegram text-xl text-gray-600 group-hover:text-emerald-600" />
          </motion.button>

          <div className="flex items-center gap-2 ml-4 border-l border-gray-200 pl-4">
            <motion.button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fa-solid fa-minus text-gray-600" />
            </motion.button>
            <motion.button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fa-regular fa-square text-gray-600" />
            </motion.button>
            <motion.button
              className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fa-solid fa-xmark text-gray-600" />
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
