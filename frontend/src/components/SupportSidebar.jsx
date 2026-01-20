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
            className="fixed right-0 top-16 bottom-0 w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                  <i className="fa-solid fa-headset text-emerald-600" />
                  Hỗ trợ khách hàng
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Chọn kênh hỗ trợ phù hợp với bạn
                </p>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="fa-solid fa-xmark text-xl text-gray-700" />
              </motion.button>
            </div>

            {/* Support Info */}
            <div className="px-6 py-4 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-clock !text-white text-xl" style={{ color: 'white' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Thời gian hỗ trợ</p>
                  <p className="text-xs text-gray-600">24/7 - Luôn sẵn sàng hỗ trợ bạn</p>
                </div>
              </div>
            </div>

            {/* Support Platforms List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
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
                    className="block p-4 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${platform.color} p-0.5 flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <div className="w-full h-full bg-white rounded-xl p-1.5 overflow-hidden">
                          <img 
                            src={platform.icon} 
                            alt={platform.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br ${platform.color}"><i class="fa-solid fa-comments text-white text-xl"></i></div>`;
                            }}
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                            {platform.name}
                          </h3>
                          {platform.available && (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              Online
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {platform.description}
                        </p>
                      </div>

                      {/* Arrow Icon */}
                      <motion.div
                        className="text-gray-400 group-hover:text-emerald-600 transition-colors"
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
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2">
                  Cần hỗ trợ khẩn cấp?
                </p>
                <motion.a
                  href="tel:1900xxxx"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
                >
                  <i className="fa-solid fa-phone-volume" />
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
