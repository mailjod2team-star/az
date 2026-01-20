import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const SupportSidebar = ({ isOpen, onClose }) => {
  const supportPlatforms = [
    {
      id: 1,
      name: 'Facebook',
      icon: 'https://customer-assets.emergentagent.com/job_7b84b5ba-8ccb-4a85-a235-912038ad3448/artifacts/m4zgcv88_facebook.webp',
      description: 'Liên hệ qua Facebook',
      link: 'https://m.me/your-page',
      color: 'from-blue-500 to-blue-700',
      available: true
    },
    {
      id: 2,
      name: 'Telegram',
      icon: 'https://customer-assets.emergentagent.com/job_7b84b5ba-8ccb-4a85-a235-912038ad3448/artifacts/akf06jeg_telegram.png',
      description: 'Liên hệ qua Telegram',
      link: 'https://t.me/your-channel',
      color: 'from-blue-400 to-blue-600',
      available: true
    },
    {
      id: 3,
      name: 'WeChat',
      icon: 'https://customer-assets.emergentagent.com/job_7b84b5ba-8ccb-4a85-a235-912038ad3448/artifacts/3a3kk2n1_wechat.png',
      description: 'Liên hệ qua WeChat',
      link: 'https://wechat.com/your-id',
      color: 'from-green-500 to-green-600',
      available: true
    },
    {
      id: 4,
      name: 'Zalo',
      icon: 'https://customer-assets.emergentagent.com/job_7b84b5ba-8ccb-4a85-a235-912038ad3448/artifacts/lcx1va0k_zalo.webp',
      description: 'Chat qua Zalo',
      link: 'https://zalo.me/your-id',
      color: 'from-blue-500 to-blue-700',
      available: true
    },
    {
      id: 5,
      name: 'Email Support',
      icon: 'https://customer-assets.emergentagent.com/job_7b84b5ba-8ccb-4a85-a235-912038ad3448/artifacts/gzvahue4_email.webp',
      description: 'Gửi email hỗ trợ',
      link: 'mailto:support@example.com',
      color: 'from-red-500 to-orange-500',
      available: true
    },
    {
      id: 6,
      name: 'Hotline',
      icon: 'https://customer-assets.emergentagent.com/job_7b84b5ba-8ccb-4a85-a235-912038ad3448/artifacts/e8e9tio2_hotline.png',
      description: 'Gọi hotline: 1900-xxxx',
      link: 'tel:1900xxxx',
      color: 'from-pink-500 to-pink-600',
      available: true
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-16 bottom-0 w-80 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                  <i className="fa-solid fa-headset text-emerald-600 text-sm" />
                  Hỗ trợ
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  Chọn kênh hỗ trợ
                </p>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="fa-solid fa-xmark text-lg text-gray-700" />
              </motion.button>
            </div>

            {/* Support Info */}
            <div className="px-4 py-3 bg-white border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-clock !text-white text-base" style={{ color: 'white' }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Thời gian hỗ trợ</p>
                  <p className="text-xs text-gray-600">24/7 - Luôn sẵn sàng</p>
                </div>
              </div>
            </div>

            {/* Support Platforms List */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-2">
                {supportPlatforms.map((platform, index) => (
                  <motion.a
                    key={platform.id}
                    href={platform.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="block p-3 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${platform.color} p-0.5 flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <div className="w-full h-full bg-white rounded-lg p-1 overflow-hidden">
                          <img 
                            src={platform.icon} 
                            alt={platform.name}
                            className="w-full h-full object-cover rounded"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br ${platform.color}"><i class="fa-solid fa-comments text-white text-sm"></i></div>`;
                            }}
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <h3 className="font-semibold text-xs text-gray-800 group-hover:text-emerald-600 transition-colors">
                            {platform.name}
                          </h3>
                          {platform.available && (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                              Online
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">
                          {platform.description}
                        </p>
                      </div>

                      {/* Arrow Icon */}
                      <motion.div
                        className="text-gray-400 group-hover:text-emerald-600 transition-colors text-xs"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <i className="fa-solid fa-arrow-right" />
                      </motion.div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2">
                  Cần hỗ trợ khẩn cấp?
                </p>
                <motion.a
                  href="tel:1900xxxx"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-semibold text-xs hover:shadow-lg transition-all"
                >
                  <i className="fa-solid fa-phone-volume text-xs" />
                  Gọi ngay: 1900-xxxx
                </motion.a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
