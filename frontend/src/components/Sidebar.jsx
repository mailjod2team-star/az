import React from 'react';
import { motion } from 'framer-motion';

export const Sidebar = ({ activeView, onNavigate }) => {
  const menuItems = [
    { id: 'soc-dashboard', icon: 'fa-chart-line', label: 'Tổng quan' },
    { id: 'profiles', icon: 'fa-user', label: 'Profiles' },
    { id: 'workflow', icon: 'fa-diagram-project', label: 'Workflow' },
    { id: 'settings', icon: 'fa-gear', label: 'Cài đặt' },
  ];

  return (
    <motion.div
      className="w-52 bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 backdrop-blur-sm border-r border-emerald-600 h-screen flex flex-col shadow-md"
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex-1 overflow-y-auto min-h-0">
        <nav className="p-3 space-y-1.5">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all font-medium text-sm ${
                activeView === item.id
                  ? 'bg-white text-emerald-700 shadow-md border border-white'
                  : 'text-white hover:bg-emerald-400 hover:shadow-sm'
              }`}
              whileHover={{ x: activeView === item.id ? 0 : 3 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                activeView === item.id 
                  ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600' 
                  : 'bg-white/20'
              }`}>
                <i className={`fa-solid ${item.icon} text-sm ${
                  activeView === item.id ? 'text-white' : 'text-white'
                }`} />
              </div>
              <span>{item.label}</span>
            </motion.button>
          ))}
        </nav>
      </div>
      
      {/* Bottom Section */}
      <div className="p-3 border-t border-emerald-400">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2.5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-900/50">
              <i className="fa-solid fa-user text-xs" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-800">Admin</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-[10px] text-emerald-600 font-medium">Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
