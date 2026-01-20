import React from 'react';
import { motion } from 'framer-motion';

export const Sidebar = ({ activeView, onNavigate }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'fa-home', label: 'Tổng quan' },
    { id: 'booking', icon: 'fa-calendar-check', label: 'Đặt lịch' },
    { id: 'customers', icon: 'fa-users', label: 'Khách hàng' },
    { id: 'services', icon: 'fa-scissors', label: 'Dịch vụ' },
    { id: 'staff', icon: 'fa-user-tie', label: 'Nhân viên' },
    { id: 'revenue', icon: 'fa-chart-line', label: 'Doanh thu' },
    { id: 'products', icon: 'fa-box', label: 'Sản phẩm' },
    { id: 'reports', icon: 'fa-file-alt', label: 'Báo cáo' },
  ];

  return (
    <motion.div
      className="w-52 bg-gray-100 backdrop-blur-sm border-r border-gray-200 h-screen flex flex-col shadow-sm"
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
                  ? 'bg-white text-gray-700 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:bg-gray-200 hover:shadow-sm'
              }`}
              whileHover={{ x: activeView === item.id ? 0 : 3 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                activeView === item.id 
                  ? 'bg-emerald-100' 
                  : 'bg-gray-200'
              }`}>
                <i className={`fa-solid ${item.icon} text-sm ${
                  activeView === item.id ? 'text-emerald-600' : 'text-gray-600'
                }`} />
              </div>
              <span>{item.label}</span>
            </motion.button>
          ))}
        </nav>
      </div>
    </motion.div>
  );
};