"use client";

import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';

export default function DashboardLoader() {
  const { progress, active } = useProgress();
  const [loadingText, setLoadingText] = useState('Initializing scene...');
  const [dots, setDots] = useState('');

  // Animate the loading text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length < 3 ? prev + '.' : '');
    }, 400);

    return () => clearInterval(interval);
  }, []);

  // Update loading text based on progress
  useEffect(() => {
    if (progress < 10) {
      setLoadingText('Initializing scene');
    } else if (progress < 30) {
      setLoadingText('Loading 3D models');
    } else if (progress < 60) {
      setLoadingText('Setting up environment');
    } else if (progress < 90) {
      setLoadingText('Preparing dashboard');
    } else {
      setLoadingText('Almost ready');
    }
  }, [progress]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="mb-8">
        <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      
      <div className="relative w-64 h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-full"
          style={{ 
            width: `${progress}%`, 
            transition: 'width 0.3s ease-out',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite linear'
          }}
        />
      </div>
      
      <div className="text-sm text-blue-400 font-mono mb-2">
        {loadingText}{dots}
      </div>
      
      <div className="text-lg font-bold text-white">
        {Math.round(progress)}%
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}