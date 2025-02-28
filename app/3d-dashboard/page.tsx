"use client";

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ThreeDDashboard from '@/components/3d/ThreeDDashboard';
import DashboardLoader from '@/components/3d/DashboardLoader';
import DashboardControls from '@/components/3d/DashboardControls';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function ThreeDDashboardPage() {
  // State management
  const [currentView, setCurrentView] = useState<'overview' | 'attendance' | 'map'>('overview');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [loadingState, setLoadingState] = useState({
    scene: false,
    models: false,
    interface: false
  });

  // Handle scene loading completion
  const handleSceneLoaded = () => {
    requestAnimationFrame(() => {
      setLoadingState(prev => ({ ...prev, scene: true }));
      
      setTimeout(() => {
        setLoadingState(prev => ({ ...prev, models: true }));
        setIsLoaded(true);
        
        requestAnimationFrame(() => {
          setLoadingState(prev => ({ ...prev, interface: true }));
          setShowLoader(false);
          
          setTimeout(() => {
            setShowIntro(false);
          }, 1000);
        });
      }, 500);
    });
  };

  // Handle view changes
  const handleViewChange = (view: 'overview' | 'attendance' | 'map') => {
    setCurrentView(view);
  };

  useEffect(() => {
    // Check if all required assets are loaded
    const allModelsLoaded = Object.values(loadingState).every(state => state);
    
    if (allModelsLoaded && showLoader) {
      // Add a small delay before hiding loader
      setTimeout(() => {
        setShowLoader(false);
      }, 500);
    }
  }, [loadingState, showLoader]);

  return (
    <main className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {/* Back button */}
      <Link 
        href="/"
        className="absolute top-4 left-4 z-50 flex items-center px-3 py-2 space-x-2 text-sm text-white/70 hover:text-white bg-white/10 rounded-lg backdrop-blur-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </Link>

      {/* Main 3D Scene */}
      <div className="absolute inset-0">
        <ErrorBoundary>
          <Suspense fallback={<DashboardLoader />}>
            <ThreeDDashboard 
              currentView={currentView}
              onSceneLoaded={handleSceneLoaded}
            />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
        <DashboardControls
          currentView={currentView}
          onViewChange={handleViewChange}
          isLoaded={isLoaded}
        />
      </div>

      {/* Loading Overlay */}
      {showLoader && (
        <div className="absolute inset-0 bg-gray-900/90 z-50 flex items-center justify-center">
          <DashboardLoader />
        </div>
      )}

      {/* Intro Animation */}
      {isLoaded && showIntro && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-blue-900/80 to-gray-900/80 backdrop-blur-sm">
          <div className="text-center space-y-4 animate-fade-in">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400">
              Welcome to 3D Dashboard
            </h2>
            <p className="text-white/70 max-w-md mx-auto">
              Explore your data in an immersive 3D environment. Use the controls below to switch between different views.
            </p>
          </div>
        </div>
      )}

      {/* Loading Status */}
      {!isLoaded && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center space-x-2 text-sm text-white/60">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Loading dashboard components...</span>
          </div>
        </div>
      )}
    </main>
  );
}