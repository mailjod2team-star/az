import React from 'react';
import { motion } from 'framer-motion';

export const Sidebar = ({ activeView, onNavigate }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'fa-home', label: 'Tổng quan', color: 'emerald' },
    { id: 'cashier', icon: 'fa-cash-register', label: 'Thu ngân', color: 'blue' },
    { id: 'booking', icon: 'fa-calendar-check', label: 'Đặt lịch', color: 'purple' },
    { id: 'customers', icon: 'fa-users', label: 'Khách hàng', color: 'pink' },
    { id: 'membership', icon: 'fa-id-card', label: 'Thẻ thành viên', color: 'amber' },
    { id: 'services', icon: 'fa-cut', label: 'Dịch vụ', color: 'teal' },
    { id: 'products', icon: 'fa-box', label: 'Sản phẩm', color: 'orange' },
    { id: 'inventory', icon: 'fa-warehouse', label: 'Kho hàng', color: 'slate' },
    { id: 'voucher', icon: 'fa-ticket', label: 'Khuyến mãi', color: 'rose' },
    { id: 'marketing', icon: 'fa-bullhorn', label: 'Marketing', color: 'fuchsia' },
    { id: 'expense', icon: 'fa-receipt', label: 'Chi phí', color: 'red' },
    { id: 'revenue', icon: 'fa-chart-line', label: 'Doanh thu', color: 'emerald' },
    { id: 'reports', icon: 'fa-chart-bar', label: 'Báo cáo', color: 'violet' },
    { id: 'settings', icon: 'fa-cog', label: 'Cài đặt', color: 'gray' },
  ];

  return (
    <motion.div
      className="w-52 bg-gradient-to-br from-emerald-50 via-white to-teal-50 backdrop-blur-sm border-r-4 border-gray-400 h-full flex flex-col shadow-sm relative"
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        <nav className="p-2 pb-8 space-y-0.5">
          {/* Tổng quan */}
          {menuItems.slice(0, 1).map((item) => (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all font-medium text-sm ${
                activeView === item.id
                  ? 'bg-white text-gray-700 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:bg-gray-200/50 hover:shadow-sm'
              }`}
              whileHover={{ x: activeView === item.id ? 0 : 3 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                activeView === item.id 
                  ? 'bg-emerald-100' 
                  : 'bg-gray-200/70'
              }`}>
                <i className={`fa-solid ${item.icon} text-sm ${
                  activeView === item.id ? 'text-emerald-600' : 'text-gray-600'
                }`} />
              </div>
              <span>{item.label}</span>
            </motion.button>
          ))}

          {/* Divider - Giao dịch */}
          <div className="pt-3 pb-2 px-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Giao dịch</p>
          </div>
          {menuItems.slice(1, 3).map((item) => (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all font-medium text-sm ${
                activeView === item.id
                  ? 'bg-white text-gray-700 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:bg-gray-200/50 hover:shadow-sm'
              }`}
              whileHover={{ x: activeView === item.id ? 0 : 3 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                activeView === item.id 
                  ? 'bg-emerald-100' 
                  : 'bg-gray-200/70'
              }`}>
                <i className={`fa-solid ${item.icon} text-sm ${
                  activeView === item.id ? 'text-emerald-600' : 'text-gray-600'
                }`} />
              </div>
              <span>{item.label}</span>
            </motion.button>
          ))}

          {/* Divider - Khách hàng */}
          <div className="pt-3 pb-2 px-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Khách hàng</p>
          </div>
          {menuItems.slice(3, 5).map((item) => (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all font-medium text-sm ${
                activeView === item.id
                  ? 'bg-white text-gray-700 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:bg-gray-200/50 hover:shadow-sm'
              }`}
              whileHover={{ x: activeView === item.id ? 0 : 3 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                activeView === item.id 
                  ? 'bg-emerald-100' 
                  : 'bg-gray-200/70'
              }`}>
                <i className={`fa-solid ${item.icon} text-sm ${
                  activeView === item.id ? 'text-emerald-600' : 'text-gray-600'
                }`} />
              </div>
              <span>{item.label}</span>
            </motion.button>
          ))}

          {/* Divider - Sản phẩm & Kho */}
          <div className="pt-3 pb-2 px-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Sản phẩm & Kho</p>
          </div>
          {menuItems.slice(5, 8).map((item) => (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all font-medium text-sm ${
                activeView === item.id
                  ? 'bg-white text-gray-700 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:bg-gray-200/50 hover:shadow-sm'
              }`}
              whileHover={{ x: activeView === item.id ? 0 : 3 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                activeView === item.id 
                  ? 'bg-emerald-100' 
                  : 'bg-gray-200/70'
              }`}>
                <i className={`fa-solid ${item.icon} text-sm ${
                  activeView === item.id ? 'text-emerald-600' : 'text-gray-600'
                }`} />
              </div>
              <span>{item.label}</span>
            </motion.button>
          ))}

          {/* Divider - Marketing */}
          <div className="pt-3 pb-2 px-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Marketing</p>
          </div>
          {menuItems.slice(8, 10).map((item) => (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all font-medium text-sm ${
                activeView === item.id
                  ? 'bg-white text-gray-700 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:bg-gray-200/50 hover:shadow-sm'
              }`}
              whileHover={{ x: activeView === item.id ? 0 : 3 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                activeView === item.id 
                  ? 'bg-emerald-100' 
                  : 'bg-gray-200/70'
              }`}>
                <i className={`fa-solid ${item.icon} text-sm ${
                  activeView === item.id ? 'text-emerald-600' : 'text-gray-600'
                }`} />
              </div>
              <span>{item.label}</span>
            </motion.button>
          ))}

          {/* Divider - Tài chính */}
          <div className="pt-3 pb-2 px-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tài chính</p>
          </div>
          {menuItems.slice(10, 13).map((item) => (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all font-medium text-sm ${
                activeView === item.id
                  ? 'bg-white text-gray-700 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:bg-gray-200/50 hover:shadow-sm'
              }`}
              whileHover={{ x: activeView === item.id ? 0 : 3 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                activeView === item.id 
                  ? 'bg-emerald-100' 
                  : 'bg-gray-200/70'
              }`}>
                <i className={`fa-solid ${item.icon} text-sm ${
                  activeView === item.id ? 'text-emerald-600' : 'text-gray-600'
                }`} />
              </div>
              <span>{item.label}</span>
            </motion.button>
          ))}

          {/* Divider - Khác */}
          <div className="pt-3 pb-2 px-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Khác</p>
          </div>
          {menuItems.slice(13).map((item) => (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all font-medium text-sm ${
                activeView === item.id
                  ? 'bg-white text-gray-700 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:bg-gray-200/50 hover:shadow-sm'
              }`}
              whileHover={{ x: activeView === item.id ? 0 : 3 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                activeView === item.id 
                  ? 'bg-emerald-100' 
                  : 'bg-gray-200/70'
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

      {/* Footer - Hòm thư góp ý */}
      <div className="p-3 border-t border-gray-200 bg-white/50">
        <motion.button
          onClick={() => onNavigate('feedback')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium text-sm shadow-sm transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <i className="fa-solid fa-envelope text-sm" />
          <span>Hòm thư góp ý</span>
        </motion.button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </motion.div>
  );
};