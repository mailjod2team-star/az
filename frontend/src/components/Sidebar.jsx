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
      className="w-64 bg-white border-r border-emerald-100 h-screen flex flex-col shadow-sm"
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex-1 overflow-y-auto min-h-0">
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                activeView === item.id
                  ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 text-white shadow-md shadow-emerald-200'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:shadow'
              }`}
              whileHover={{ x: activeView === item.id ? 0 : 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                activeView === item.id 
                  ? 'bg-white/20' 
                  : 'bg-gradient-to-br from-emerald-100 to-teal-100'
              }`}>
                <i className={`fa-solid ${item.icon} text-lg ${
                  activeView === item.id ? 'text-white' : 'text-emerald-600'
                }`} />
              </div>
              <span>{item.label}</span>
            </motion.button>
          ))}
        </nav>
      </div>
      
      {/* Bottom Section */}
      <div className="p-4 border-t border-emerald-100">
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-400 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-300">
              <i className="fa-solid fa-user" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Admin</p>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-emerald-600 font-medium">Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
