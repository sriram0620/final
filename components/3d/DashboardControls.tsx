"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/modernCard';
import { 
  LayoutDashboard, 
  Clock, 
  Globe, 
  Maximize,
  Minimize,
  Info,
  Settings,
  HelpCircle
} from 'lucide-react';

type ViewType = 'overview' | 'attendance' | 'map';

interface DashboardControlsProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isLoaded: boolean;
}

export default function DashboardControls({ 
  currentView, 
  onViewChange,
  isLoaded
}: DashboardControlsProps) {
  const [expanded, setExpanded] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  
  const views: { id: ViewType; label: string; icon: React.ReactNode; description: string }[] = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: 'Complete view of your workspace and attendance data'
    },
    { 
      id: 'attendance', 
      label: 'Attendance', 
      icon: <Clock className="w-5 h-5" />,
      description: 'Focus on attendance panel and time tracking'
    },
    { 
      id: 'map', 
      label: 'Locations', 
      icon: <Globe className="w-5 h-5" />,
      description: 'View team locations and office distribution'
    },
  ];

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);
  
  if (!isLoaded) return null;
  
  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden transition-all duration-300 animate-slide-up">
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <h3 className="text-sm font-semibold text-white/80 px-2">
              Dashboard Controls
            </h3>
            <div className="ml-2 px-2 py-0.5 bg-blue-900/50 rounded-full text-xs text-blue-300 font-mono">
              {currentTime}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white/90"
              title="Help"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
            <button 
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white/90"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button 
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white/90"
              title="Info"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white/90"
              title={expanded ? "Minimize" : "Expand"}
            >
              {expanded ? (
                <Minimize className="w-3.5 h-3.5" />
              ) : (
                <Maximize className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
        
        {expanded && (
          <>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {views.map((view) => (
                <button
                  key={view.id}
                  onClick={() => onViewChange(view.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-300 ${
                    currentView === view.id
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-900/30'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                    currentView === view.id
                      ? 'bg-white/20'
                      : 'bg-white/5'
                  }`}>
                    {view.icon}
                  </div>
                  <span className="text-xs font-medium">{view.label}</span>
                </button>
              ))}
            </div>
            
            <div className="bg-white/5 rounded-lg p-2 text-xs text-white/70">
              <p>{views.find(v => v.id === currentView)?.description}</p>
            </div>
          </>
        )}
        
        <div className="flex justify-between items-center mt-3 text-xs text-white/60">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-400 mr-1 animate-pulse"></div>
            <span>System active</span>
          </div>
          <div>
            <span className="font-mono">v1.0.0</span>
          </div>
        </div>
      </div>
    </Card>
  );
}