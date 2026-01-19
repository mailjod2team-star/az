import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const LoadingScreen = ({ onLoadingComplete }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50"
        >
          <div className="w-80 h-80 flex flex-col items-center justify-center">
            {/* POS Cash Register SVG Animation - Green Theme */}
            <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Cash Register Base */}
              <g className="animate-bounce-in">
                {/* Main Body - Green Gradient */}
                <defs>
                  <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#6ee7b7" />
                  </linearGradient>
                  <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                  <linearGradient id="buttonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                
                <rect x="80" y="180" width="240" height="140" rx="8" fill="url(#bodyGradient)" stroke="#059669" strokeWidth="2"/>
                
                {/* Screen */}
                <rect x="100" y="200" width="200" height="50" rx="4" fill="url(#screenGradient)" stroke="#047857" strokeWidth="2"/>
                
                {/* Screen Display - Animated Text */}
                <g className="animate-pulse-slow">
                  <rect x="110" y="210" width="180" height="30" rx="2" fill="#6ee7b7" opacity="0.9"/>
                  <text x="200" y="232" textAnchor="middle" fill="#047857" fontSize="18" fontWeight="bold" fontFamily="monospace">
                    LOADING
                  </text>
                </g>
                
                {/* Number Pad - Green Theme */}
                {/* Row 1 */}
                <circle cx="120" cy="280" r="8" fill="#d1fae5" stroke="#10b981" strokeWidth="1"/>
                <circle cx="150" cy="280" r="8" fill="#d1fae5" stroke="#10b981" strokeWidth="1"/>
                <circle cx="180" cy="280" r="8" fill="#d1fae5" stroke="#10b981" strokeWidth="1"/>
                <circle cx="210" cy="280" r="8" fill="#d1fae5" stroke="#10b981" strokeWidth="1"/>
                
                {/* Row 2 */}
                <circle cx="120" cy="300" r="8" fill="#d1fae5" stroke="#10b981" strokeWidth="1"/>
                <circle cx="150" cy="300" r="8" fill="#d1fae5" stroke="#10b981" strokeWidth="1"/>
                <circle cx="180" cy="300" r="8" fill="#d1fae5" stroke="#10b981" strokeWidth="1"/>
                <circle cx="210" cy="300" r="8" fill="#d1fae5" stroke="#10b981" strokeWidth="1"/>
                
                {/* Large OK Button with Animation */}
                <rect x="240" y="270" width="60" height="40" rx="4" fill="url(#buttonGradient)" stroke="#059669" strokeWidth="2">
                  <animate attributeName="fill" values="url(#buttonGradient);#34d399;url(#buttonGradient)" dur="1.5s" repeatCount="indefinite"/>
                </rect>
                <text x="270" y="295" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">OK</text>
              </g>
              
              {/* Cash Drawer - Animated */}
              <g className="animate-cash-drawer">
                <rect x="90" y="330" width="220" height="30" rx="4" fill="#64748b" stroke="#475569" strokeWidth="2"/>
                <rect x="100" y="338" width="40" height="10" rx="2" fill="#cbd5e1"/>
              </g>
              
              {/* Receipt Paper - Animated */}
              <g className="animate-receipt-print">
                <rect x="170" y="140" width="60" height="40" rx="2" fill="#ffffff" stroke="#d1fae5" strokeWidth="2"/>
                <line x1="180" y1="150" x2="220" y2="150" stroke="#10b981" strokeWidth="2"/>
                <line x1="180" y1="157" x2="220" y2="157" stroke="#6ee7b7" strokeWidth="1.5"/>
                <line x1="180" y1="164" x2="220" y2="164" stroke="#6ee7b7" strokeWidth="1.5"/>
                <line x1="180" y1="171" x2="210" y2="171" stroke="#6ee7b7" strokeWidth="1.5"/>
              </g>
              
              {/* Coins Animation - Green */}
              <g className="animate-float">
                <circle cx="50" cy="250" r="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" opacity="0.8"/>
                <circle cx="350" cy="230" r="10" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" opacity="0.8"/>
              </g>
              
              {/* Dollar Signs - Green */}
              <g className="animate-pulse-slow">
                <text x="350" y="270" fill="#10b981" fontSize="32" fontWeight="bold" opacity="0.7">$</text>
                <text x="40" y="210" fill="#34d399" fontSize="28" fontWeight="bold" opacity="0.7">$</text>
              </g>
            </svg>
          </div>
          
          {/* Loading Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-center"
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              Đang tải hệ thống
            </h2>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
