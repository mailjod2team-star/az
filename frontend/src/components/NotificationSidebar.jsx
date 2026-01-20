import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationSidebar = ({ isOpen, onClose }) => {
  const notifications = [
    {
      id: 1,
      type: 'success',
      icon: 'fa-circle-check',
      title: 'Profile đã được tạo',
      message: 'Profile #12345 đã được tạo thành công',
      time: '5 phút trước',
      unread: true
    },
    {
      id: 2,
      type: 'warning',
      icon: 'fa-triangle-exclamation',
      title: 'Cảnh báo proxy',
      message: 'Proxy 192.168.1.1 đang gặp sự cố',
      time: '15 phút trước',
      unread: true
    },
    {
      id: 3,
      type: 'info',
      icon: 'fa-circle-info',
      title: 'Cập nhật hệ thống',
      message: 'Phiên bản mới v2.0.1 đã có sẵn',
      time: '1 giờ trước',
      unread: false
    },
    {
      id: 4,
      type: 'success',
      icon: 'fa-circle-check',
      title: 'Workflow hoàn thành',
      message: 'Workflow "Auto Login" đã chạy thành công',
      time: '2 giờ trước',
      unread: false
    },
    {
      id: 5,
      type: 'error',
      icon: 'fa-circle-xmark',
      title: 'Lỗi kết nối',
      message: 'Không thể kết nối đến server backup',
      time: '3 giờ trước',
      unread: false
    }
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      case 'info':
      default:
        return 'text-blue-500';
    }
  };

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
            className="fixed right-0 top-16 bottom-0 w-80 bg-card border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <i className="fa-solid fa-bell text-primary text-sm" />
                  Thông báo
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bạn có 2 thông báo chưa đọc
                </p>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              >
                <i className="fa-solid fa-xmark text-lg text-muted-foreground" />
              </motion.button>
            </div>

            {/* Actions */}
            <div className="px-4 py-2 border-b border-border flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
              >
                Đánh dấu đã đọc
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-xs px-2.5 py-1 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors"
              >
                Xóa
              </motion.button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer ${
                    notification.unread ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex gap-2.5">
                    {/* Icon */}
                    <div className={`mt-0.5 ${getTypeColor(notification.type)}`}>
                      <i className={`fa-solid ${notification.icon} text-base`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-xs flex items-center gap-1.5">
                          {notification.title}
                          {notification.unread && (
                            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                          )}
                        </h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
