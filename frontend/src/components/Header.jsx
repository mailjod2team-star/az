import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedLogo } from './AnimatedLogo';
import { NotificationSidebar } from './NotificationSidebar';
import { SupportSidebar } from './SupportSidebar';

export const Header = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  return (
    <>
      <motion.header
        className="h-16 bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-b border-gray-200 flex items-center justify-between pl-3 pr-6 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <AnimatedLogo />

        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => {
              setIsNotificationOpen(true);
              setIsSupportOpen(false);
            }}
            className="p-2.5 hover:bg-gray-200 rounded-lg transition-colors relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fa-solid fa-bell text-xl text-gray-700" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </motion.button>

          <motion.button
            onClick={() => {
              setIsSupportOpen(true);
              setIsNotificationOpen(false);
            }}
            className="p-2.5 hover:bg-gray-200 rounded-lg transition-colors relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fa-solid fa-headset text-xl text-gray-700" />
          </motion.button>

          <div className="flex items-center gap-2 ml-4 border-l border-gray-300 pl-4">
            <motion.button
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fa-solid fa-minus text-gray-700" />
            </motion.button>
            <motion.button
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fa-regular fa-square text-gray-700" />
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

      {/* Support Sidebar */}
      <SupportSidebar 
        isOpen={isSupportOpen} 
        onClose={() => setIsSupportOpen(false)} 
      />
    </>
  );
};