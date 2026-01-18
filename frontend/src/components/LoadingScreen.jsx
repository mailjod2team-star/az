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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
        >
          <div className="w-96 h-96">
            <svg viewBox="0 0 500 500" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <circle 
                cx="250" 
                cy="250" 
                r="200" 
                fill="none" 
                stroke="url(#gradient1)" 
                strokeWidth="2" 
                strokeDasharray="10 5" 
                className="animate-spin-slow origin-center" 
                style={{ transformOrigin: '250px 250px' }}
              />
              <circle 
                cx="250" 
                cy="250" 
                r="150" 
                fill="none" 
                stroke="url(#gradient2)" 
                strokeWidth="2" 
                strokeDasharray="8 4" 
                className="animate-spin-reverse origin-center" 
                style={{ transformOrigin: '250px 250px' }}
              />
              {/* Animated Eye Icon */}
              <g className="animate-pulse-slow">
                {/* Eye Outer Shape */}
                <ellipse 
                  cx="250" 
                  cy="250" 
                  rx="80" 
                  ry="50" 
                  fill="url(#gradient3)" 
                  opacity="0.3"
                />
                <ellipse 
                  cx="250" 
                  cy="250" 
                  rx="80" 
                  ry="50" 
                  fill="none"
                  stroke="#10b981" 
                  strokeWidth="3"
                  opacity="0.6"
                />
                
                {/* Eye White */}
                <ellipse 
                  cx="250" 
                  cy="250" 
                  rx="70" 
                  ry="40" 
                  fill="#ffffff" 
                  opacity="0.9"
                />
                
                {/* Animated Iris - moves around */}
                <g>
                  <ellipse 
                    cx="250" 
                    cy="250" 
                    rx="25" 
                    ry="25" 
                    fill="url(#irisGradient)"
                  >
                    {/* Animation: Look Right, Look Left, Look Up, Look Down, Center */}
                    <animate 
                      attributeName="cx" 
                      values="250;270;230;250;250;270;230;250" 
                      dur="8s" 
                      repeatCount="indefinite"
                    />
                    <animate 
                      attributeName="cy" 
                      values="250;250;250;235;265;250;250;250" 
                      dur="8s" 
                      repeatCount="indefinite"
                    />
                  </ellipse>
                  
                  {/* Pupil - follows iris */}
                  <circle 
                    cx="250" 
                    cy="250" 
                    r="10" 
                    fill="#000000"
                  >
                    <animate 
                      attributeName="cx" 
                      values="250;270;230;250;250;270;230;250" 
                      dur="8s" 
                      repeatCount="indefinite"
                    />
                    <animate 
                      attributeName="cy" 
                      values="250;250;250;235;265;250;250;250" 
                      dur="8s" 
                      repeatCount="indefinite"
                    />
                  </circle>
                  
                  {/* Light reflection in pupil */}
                  <circle 
                    cx="250" 
                    cy="250" 
                    r="4" 
                    fill="#ffffff"
                    opacity="0.8"
                  >
                    <animate 
                      attributeName="cx" 
                      values="252;272;232;252;252;272;232;252" 
                      dur="8s" 
                      repeatCount="indefinite"
                    />
                    <animate 
                      attributeName="cy" 
                      values="247;247;247;232;262;247;247;247" 
                      dur="8s" 
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              </g>
              {/* Orbit dots removed */}
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#34d399" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#34d399" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
                </linearGradient>
                <radialGradient id="gradient3">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="irisGradient">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
