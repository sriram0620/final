"use client";

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/modernCard';
import { Geofence } from '@/types/supabase';

export default function GeofenceMonitor({ userId }: { userId: string }) {
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

  // Create a default geofence with the specified coordinates
  const defaultGeofence: Geofence = {
    id: 'default',
    name: 'Primary Monitoring Zone',
    lat: 12.835239990526295,
    lng: 80.13544605129297,
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
      } else {
        setLastCheckOut(now);
      }
      
      // Update total time inside calculation
      updateTotalTimeInside(inside, now);
    }
    
    previousStatusRef.current = inside;
  }, [currentPosition, primaryGeofence]);

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
      <Card className="w-full max-w-md mx-auto p-6">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2"></div>
          <p>Initializing geofence monitoring...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Geofence Monitor</h2>
      
      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-md">
          {error}
        </div>
      )}
      
      <div className={`p-3 mb-4 rounded-md ${
        isInsideGeofence 
          ? 'bg-green-100 text-green-800' 
          : 'bg-yellow-100 text-yellow-800'
      }`}>
        <p className="font-semibold">{statusMessage}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-100 p-3 rounded-md">
          <p className="text-sm text-gray-500">Current Status</p>
          <p className="font-semibold">
            {isInsideGeofence ? 'Inside' : 'Outside'}
          </p>
        </div>
        
        <div className="bg-gray-100 p-3 rounded-md">
          <p className="text-sm text-gray-500">Distance from Center</p>
          <p className="font-semibold">
            {distance !== null ? `${distance.toFixed(0)} meters` : 'Unknown'}
          </p>
        </div>
        
        <div className="bg-gray-100 p-3 rounded-md">
          <p className="text-sm text-gray-500">Last Check-in</p>
          <p className="font-semibold">{formatTime(lastCheckIn)}</p>
        </div>
        
        <div className="bg-gray-100 p-3 rounded-md">
          <p className="text-sm text-gray-500">Last Check-out</p>
          <p className="font-semibold">{formatTime(lastCheckOut)}</p>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md mb-4">
        <p className="text-sm text-blue-500 mb-1">Total Time Inside Today</p>
        <p className="text-xl font-bold text-blue-700">{totalTimeInside}</p>
      </div>
      
      {currentPosition && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Current Location</h3>
          <p className="text-sm">
            Latitude: {currentPosition.latitude.toFixed(6)}<br />
            Longitude: {currentPosition.longitude.toFixed(6)}<br />
            Accuracy: {currentPosition.accuracy.toFixed(1)} meters
          </p>
        </div>
      )}
      
      {primaryGeofence && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Geofence Details</h3>
          <p className="text-sm">
            Name: {primaryGeofence.name}<br />
            Center: {primaryGeofence.lat.toFixed(6)}, {primaryGeofence.lng.toFixed(6)}<br />
            Radius: {primaryGeofence.radius} meters
          </p>
        </div>
      )}
    </Card>
  );
}