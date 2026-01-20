import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const LoadingScreen = ({ onLoadingComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        if (onLoadingComplete) {
          onLoadingComplete();
        }
      }, 300);
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
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
          {/* Professional POS Logo Animation */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="relative"
          >
            <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Outer Ring - Rotating */}
              <circle cx="100" cy="100" r="80" fill="none" stroke="url(#mainGradient)" strokeWidth="3" opacity="0.3">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 100 100"
                  to="360 100 100"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Middle Ring - Counter Rotating */}
              <circle cx="100" cy="100" r="65" fill="none" stroke="url(#accentGradient)" strokeWidth="2" opacity="0.4" strokeDasharray="10 5">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="360 100 100"
                  to="0 100 100"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* POS Terminal Icon */}
              <g transform="translate(100, 100)">
                {/* Screen */}
                <rect x="-35" y="-40" width="70" height="50" rx="4" fill="url(#mainGradient)" filter="url(#glow)">
                  <animate attributeName="opacity" values="1;0.8;1" dur="2s" repeatCount="indefinite" />
                </rect>
                
                {/* Screen Display */}
                <rect x="-30" y="-35" width="60" height="40" rx="2" fill="#ffffff" opacity="0.9" />
                
                {/* Animated Display Lines */}
                <rect x="-25" y="-30" width="50" height="4" rx="2" fill="#10b981">
                  <animate attributeName="width" values="50;35;50" dur="1.5s" repeatCount="indefinite" />
                </rect>
                <rect x="-25" y="-22" width="40" height="3" rx="1.5" fill="#34d399" opacity="0.8" />
                <rect x="-25" y="-15" width="45" height="3" rx="1.5" fill="#6ee7b7" opacity="0.6" />

                {/* Card Reader Slot */}
                <rect x="-35" y="15" width="70" height="12" rx="2" fill="#047857" opacity="0.8" />
                <rect x="-30" y="17" width="60" height="8" rx="1" fill="#065f46" />

                {/* Keypad Buttons */}
                <circle cx="-20" cy="35" r="3" fill="#d1fae5">
                  <animate attributeName="fill" values="#d1fae5;#10b981;#d1fae5" dur="0.8s" begin="0s" repeatCount="indefinite" />
                </circle>
                <circle cx="-7" cy="35" r="3" fill="#d1fae5">
                  <animate attributeName="fill" values="#d1fae5;#10b981;#d1fae5" dur="0.8s" begin="0.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="6" cy="35" r="3" fill="#d1fae5">
                  <animate attributeName="fill" values="#d1fae5;#10b981;#d1fae5" dur="0.8s" begin="0.4s" repeatCount="indefinite" />
                </circle>
                <circle cx="19" cy="35" r="3" fill="#d1fae5">
                  <animate attributeName="fill" values="#d1fae5;#10b981;#d1fae5" dur="0.8s" begin="0.6s" repeatCount="indefinite" />
                </circle>

                {/* Receipt Paper - Animated */}
                <g>
                  <rect x="-12" y="-55" width="24" height="15" rx="1" fill="#ffffff" stroke="#10b981" strokeWidth="2">
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      values="0,0; 0,-5; 0,0"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </rect>
                  <line x1="-8" y1="-50" x2="8" y2="-50" stroke="#10b981" strokeWidth="1.5" />
                  <line x1="-8" y1="-46" x2="8" y2="-46" stroke="#34d399" strokeWidth="1" />
                  <line x1="-8" y1="-43" x2="5" y2="-43" stroke="#6ee7b7" strokeWidth="1" />
                </g>
              </g>
            </svg>
          </motion.div>

          {/* Brand Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              DEAR POS
            </h1>
            <p className="text-sm text-gray-500 font-medium tracking-wider">GIẢI PHÁP BÁN HÀNG CHUYÊN NGHIỆP</p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 w-80"
          >
            <div className="relative">
              {/* Background */}
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                {/* Progress Fill */}
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-full relative"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                    style={{
                      animation: 'shimmer 1.5s infinite',
                      backgroundSize: '200% 100%'
                    }}
                  />
                </motion.div>
              </div>
              
              {/* Percentage */}
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-gray-500 font-medium">Đang khởi động...</span>
                <span className="text-sm font-bold text-emerald-600">{Math.round(progress)}%</span>
              </div>
            </div>
          </motion.div>

          {/* Loading Dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center space-x-2 mt-6"
          >
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          </motion.div>

          {/* Add CSS animation for shimmer */}
          <style>{`
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};