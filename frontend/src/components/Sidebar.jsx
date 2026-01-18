import React from 'react';
import { motion } from 'framer-motion';

export const Sidebar = ({ activeView, onNavigate }) => {
  const menuItems = [
    { id: 'soc-dashboard', icon: 'fa-chart-line', label: 'Tổng quan' },
    { id: 'proxy-list', icon: 'fa-list', label: 'Proxy List' },
    { id: 'forwarding', icon: 'fa-share', label: 'Forwarding List' },
    { id: 'share-code', icon: 'fa-code', label: 'Share Code' },
    { id: 'api-reference', icon: 'fa-book', label: 'API Reference' },
    { id: 'settings', icon: 'fa-gear', label: 'Settings' },
  ];

  return (
    <motion.div
      className="w-64 bg-card border-r border-border h-screen flex flex-col"
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex-1 overflow-y-auto min-h-0">
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeView === item.id
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <i className={`fa-solid ${item.icon} text-lg`} />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          ))}
        </nav>
      </div>
    </motion.div>
  );
};
