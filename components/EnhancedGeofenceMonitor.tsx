"use client";

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/modernCard';
import { Geofence } from '@/types/supabase';
import { MapPin, Clock, AlertCircle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export default function EnhancedGeofenceMonitor({ userId }: { userId: string }) {
  const [currentPosition, setCurrentPosition] = useState<GeolocationCoordinates | null>(null);
  const [primaryGeofence, setPrimaryGeofence] = useState<Geofence | null>(null);
  const [isInsideGeofence, setIsInsideGeofence] = useState<boolean>(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [lastCheckOut, setLastCheckOut] = useState<string | null>(null);
  const [totalTimeInside, setTotalTimeInside] = useState<string>("0h 0m");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>("Initializing...");
  const previousStatusRef = useRef<boolean | null>(null);
  const locationWatchId = useRef<number | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [animateStatus, setAnimateStatus] = useState<boolean>(false);

  // Create a default geofence with the specified coordinates
  const defaultGeofence: Geofence = {
    id: 'default',
    name: 'Primary Monitoring Zone',
    lat: 12.838857357767454,
    lng: 80.13777204197375,
    radius: 200,
    created_at: new Date().toISOString()
  };

  // Set the default geofence immediately
  useEffect(() => {
    setPrimaryGeofence(defaultGeofence);
    setLoading(false);
  }, []);

  // Start location tracking
  useEffect(() => {
    if (!primaryGeofence) return;
    
    const startLocationTracking = () => {
      if (navigator.geolocation) {
        // Clear any existing watch
        if (locationWatchId.current !== null) {
          navigator.geolocation.clearWatch(locationWatchId.current);
        }
        
        // Start watching position
        locationWatchId.current = navigator.geolocation.watchPosition(
          (position) => {
            setCurrentPosition(position.coords);
            setError(null);
          },
          (err) => {
            setError(`Geolocation error: ${err.message}`);
            setStatusMessage("GPS signal lost. Please check your location settings.");
            setLoading(false);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 10000, 
            maximumAge: 0 
          }
        );
      } else {
        setError('Geolocation is not supported by this browser');
        setStatusMessage("Your browser doesn't support geolocation.");
      }
    };
    
    startLocationTracking();
    
    // Set up periodic location updates (every 30 seconds)
    updateIntervalRef.current = setInterval(() => {
      if (navigator.geolocation && locationWatchId.current === null) {
        startLocationTracking();
      }
    }, 30000);
    
    return () => {
      // Clean up
      if (locationWatchId.current !== null) {
        navigator.geolocation.clearWatch(locationWatchId.current);
      }
      
      if (updateIntervalRef.current !== null) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [primaryGeofence]);

  // Calculate distance and check if inside geofence
  useEffect(() => {
    if (!currentPosition || !primaryGeofence) return;
    
    const calculatedDistance = calculateDistance(
      currentPosition.latitude,
      currentPosition.longitude,
      primaryGeofence.lat,
      primaryGeofence.lng
    );
    
    setDistance(calculatedDistance);
    
    const inside = calculatedDistance <= primaryGeofence.radius;
    
    // Only animate when status changes
    if (inside !== isInsideGeofence) {
      setAnimateStatus(true);
      setTimeout(() => setAnimateStatus(false), 1000);
    }
    
    setIsInsideGeofence(inside);
    
    // Update status message
    setStatusMessage(inside 
      ? `Inside geofence (${primaryGeofence.name})` 
      : `Outside geofence (${calculatedDistance.toFixed(0)}m from center)`
    );
    
    // Track boundary crossing
    if (previousStatusRef.current !== null && previousStatusRef.current !== inside) {
      const now = new Date().toISOString();
      if (inside) {
        setLastCheckIn(now);
        // Record check-in event in database
        recordLocationEvent(userId, 'check-in', currentPosition);
      } else {
        setLastCheckOut(now);
        // Record check-out event in database
        recordLocationEvent(userId, 'check-out', currentPosition);
      }
      
      // Update total time inside calculation
      updateTotalTimeInside(inside, now);
    }
    
    previousStatusRef.current = inside;
  }, [currentPosition, primaryGeofence, userId, isInsideGeofence]);

  // Record location event to database
  const recordLocationEvent = async (
    userId: string, 
    eventType: 'check-in' | 'check-out', 
    position: GeolocationCoordinates
  ) => {
    try {
      await fetch('/api/attendance/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userId,
          lat: position.latitude,
          lng: position.longitude,
          timestamp: new Date().toISOString(),
          event_type: eventType
        }),
      });
    } catch (err) {
      console.error('Failed to record location event:', err);
    }
  };

  // Calculate distance using Haversine formula
  const calculateDistance = (
    userLat: number, 
    userLng: number, 
    fenceLat: number, 
    fenceLng: number
  ): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (userLat * Math.PI) / 180;
    const φ2 = (fenceLat * Math.PI) / 180;
    const Δφ = ((fenceLat - userLat) * Math.PI) / 180;
    const Δλ = ((fenceLng - userLng) * Math.PI) / 180;

    const a = 
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  };

  // Local time tracking without API calls
  const timeInsideRef = useRef<number>(0);
  const lastCheckInTimeRef = useRef<Date | null>(null);
  
  const updateTotalTimeInside = (isInside: boolean, timestamp: string) => {
    const now = new Date(timestamp);
    
    if (isInside) {
      // Entering the geofence
      lastCheckInTimeRef.current = now;
    } else if (lastCheckInTimeRef.current) {
      // Exiting the geofence
      const timeSpent = now.getTime() - lastCheckInTimeRef.current.getTime();
      timeInsideRef.current += timeSpent;
      lastCheckInTimeRef.current = null;
      
      // Update the display
      updateTimeDisplay();
    }
  };
  
  const updateTimeDisplay = () => {
    // Calculate total time including current session if inside
    let totalMs = timeInsideRef.current;
    
    if (isInsideGeofence && lastCheckInTimeRef.current) {
      totalMs += new Date().getTime() - lastCheckInTimeRef.current.getTime();
    }
    
    // Convert to minutes
    const totalMinutes = Math.floor(totalMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    setTotalTimeInside(`${hours}h ${minutes}m`);
  };
  
  // Update time display every minute if inside geofence
  useEffect(() => {
    if (isInsideGeofence) {
      const interval = setInterval(updateTimeDisplay, 60000);
      return () => clearInterval(interval);
    }
  }, [isInsideGeofence]);

  // Format time for display
  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'None';
    
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-center py-8">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-3"></div>
          <p className="text-lg font-medium">Initializing geofence monitoring...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <MapPin className="mr-2 text-primary" />
          Geofence Monitor
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Real-time location tracking and attendance</p>
      </div>
      
      {error && (
        <div className="p-4 mb-4 bg-destructive/10 text-destructive rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      <div className={`p-4 mb-6 rounded-md transition-all duration-500 ${
        animateStatus ? 'scale-105' : ''
      } ${
        isInsideGeofence 
          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      }`}>
        <div className="flex items-center">
          {isInsideGeofence ? (
            <CheckCircle className="w-6 h-6 mr-3 flex-shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 mr-3 flex-shrink-0" />
          )}
          <p className="font-semibold">{statusMessage}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-secondary/50 p-4 rounded-md transition-all hover:bg-secondary duration-200">
          <p className="text-sm text-muted-foreground mb-1">Current Status</p>
          <p className="font-semibold text-lg flex items-center">
            {isInsideGeofence ? (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                Inside
              </>
            ) : (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                Outside
              </>
            )}
          </p>
        </div>
        
        <div className="bg-secondary/50 p-4 rounded-md transition-all hover:bg-secondary duration-200">
          <p className="text-sm text-muted-foreground mb-1">Distance</p>
          <p className="font-semibold text-lg">
            {distance !== null ? (
              <>
                <span className="text-primary">{distance.toFixed(0)}</span>
                <span className="text-sm ml-1">meters</span>
              </>
            ) : (
              'Unknown'
            )}
          </p>
        </div>
        
        <div className="bg-secondary/50 p-4 rounded-md transition-all hover:bg-secondary duration-200">
          <p className="text-sm text-muted-foreground mb-1">Last Check-in</p>
          <p className="font-semibold">
            {lastCheckIn ? (
              <span className="flex items-center text-green-600 dark:text-green-400">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(lastCheckIn)}
              </span>
            ) : (
              'None'
            )}
          </p>
        </div>
        
        <div className="bg-secondary/50 p-4 rounded-md transition-all hover:bg-secondary duration-200">
          <p className="text-sm text-muted-foreground mb-1">Last Check-out</p>
          <p className="font-semibold">
            {lastCheckOut ? (
              <span className="flex items-center text-red-600 dark:text-red-400">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(lastCheckOut)}
              </span>
            ) : (
              'None'
            )}
          </p>
        </div>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-500 dark:text-blue-300 mb-1">Total Time Inside Today</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalTimeInside}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-500 dark:text-blue-300" />
          </div>
        </div>
      </div>
      
      {currentPosition && (
        <div className="mt-4 bg-secondary/30 p-4 rounded-md">
          <h3 className="font-semibold mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-1 text-primary" />
            Current Location
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Latitude</p>
              <p className="font-mono">{currentPosition.latitude.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Longitude</p>
              <p className="font-mono">{currentPosition.longitude.toFixed(6)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Accuracy</p>
              <p>{currentPosition.accuracy.toFixed(1)} meters</p>
            </div>
          </div>
        </div>
      )}
      
      {primaryGeofence && (
        <div className="mt-4 bg-secondary/30 p-4 rounded-md">
          <h3 className="font-semibold mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-1 text-primary" />
            Geofence Details
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="col-span-2">
              <p className="text-muted-foreground">Name</p>
              <p>{primaryGeofence.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Center</p>
              <p className="font-mono">{primaryGeofence.lat.toFixed(6)}, {primaryGeofence.lng.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Radius</p>
              <p>{primaryGeofence.radius} meters</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
