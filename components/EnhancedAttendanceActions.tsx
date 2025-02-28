"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/modernCard';
import { Geofence } from '@/types/supabase';
import { LogIn, LogOut, MapPin, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function EnhancedAttendanceActions({ userId }: { userId: string }) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkinTime, setCheckinTime] = useState<string | null>(null);
  const [checkoutTime, setCheckoutTime] = useState<string | null>(null);
  const [currentGeofence, setCurrentGeofence] = useState<Geofence | null>(null);
  const [currentPosition, setCurrentPosition] = useState<GeolocationCoordinates | null>(null);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [animateButton, setAnimateButton] = useState(false);

  // Fetch geofences and attendance status
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch geofences
        const geofencesResponse = await fetch('/api/getGeofences');
        if (!geofencesResponse.ok) {
          throw new Error('Failed to fetch geofences');
        }
        const geofencesData = await geofencesResponse.json();
        setGeofences(geofencesData);

        // Fetch attendance status
        const statusResponse = await fetch(`/api/attendance/status?email=${userId}`);
        if (!statusResponse.ok) {
          throw new Error('Failed to fetch attendance status');
        }
        const statusData = await statusResponse.json();
        
        if (statusData.success) {
          setIsCheckedIn(statusData.isCheckedIn);
          setCheckinTime(statusData.latestCheckin);
          setCheckoutTime(statusData.latestCheckout);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Get user's location
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentPosition(position.coords);
        },
        (err) => {
          setError(`Geolocation error: ${err.message}`);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError('Geolocation is not supported by this browser');
    }
  }, [userId]);

  // Check if user is inside any geofence
  useEffect(() => {
    if (currentPosition && geofences.length > 0) {
      let insideGeofence = null;
      let minDistance = Infinity;
      
      geofences.forEach(fence => {
        const dist = calculateDistance(
          currentPosition.latitude, 
          currentPosition.longitude, 
          fence.lat, 
          fence.lng
        );
        
        if (dist < minDistance) {
          minDistance = dist;
          if (dist <= fence.radius) {
            insideGeofence = fence;
          }
        }
      });
      
      setCurrentGeofence(insideGeofence);
      setDistance(minDistance);
    }
  }, [currentPosition, geofences]);

  // Calculate distance between two points using Haversine formula
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

  const handleCheckIn = async () => {
    if (!currentGeofence) {
      setError('You must be inside a geofence to check in');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      
      const response = await fetch('/api/attendance/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userId,
          location: currentGeofence.name,
          checkin_time: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsCheckedIn(true);
        setCheckinTime(new Date().toISOString());
        setError(null);
        setAnimateButton(true);
        setTimeout(() => setAnimateButton(false), 1000);
      } else {
        setError(data.message || 'Failed to check in');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during check-in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError(null);
      
      const response = await fetch('/api/attendance/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userId,
          checkout_time: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsCheckedIn(false);
        setCheckoutTime(new Date().toISOString());
        setError(null);
        setAnimateButton(true);
        setTimeout(() => setAnimateButton(false), 1000);
      } else {
        setError(data.message || 'Failed to check out');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during check-out');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'Not recorded';
    
    const date = new Date(timeString);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <Card className="w-full">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-3"></div>
          <p>Loading attendance data...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <Clock className="mr-2 text-primary" />
          Attendance Actions
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Check in and out of your workplace</p>
      </div>
      
      {error && (
        <div className="p-4 mb-4 bg-destructive/10 text-destructive rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-secondary/50 p-4 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <p className="font-semibold text-lg flex items-center">
                {isCheckedIn ? (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    Checked In
                  </>
                ) : (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                    Checked Out
                  </>
                )}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isCheckedIn ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {isCheckedIn ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            </div>
          </div>
        </div>
        
        <div className="bg-secondary/50 p-4 rounded-md">
          <p className="text-sm text-muted-foreground mb-1">Location</p>
          <p className="font-semibold flex items-center">
            <MapPin className="w-4 h-4 mr-1 text-primary" />
            {currentGeofence 
              ? `Inside ${currentGeofence.name}` 
              : `Outside (${distance ? `${distance.toFixed(0)}m away` : 'Unknown distance'})`}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center mr-3">
              <LogIn className="w-4 h-4 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm text-green-600 dark:text-green-300">Last Check-in</p>
              <p className="font-semibold">{formatTime(checkinTime)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center mr-3">
              <LogOut className="w-4 h-4 text-red-600 dark:text-red-300" />
            </div>
            <div>
              <p className="text-sm text-red-600 dark:text-red-300">Last Check-out</p>
              <p className="font-semibold">{formatTime(checkoutTime)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={handleCheckIn}
          disabled={isCheckedIn || !currentGeofence || actionLoading}
          className={`flex-1 py-3 px-4 rounded-md flex items-center justify-center font-medium transition-all duration-300 ${
            animateButton && !isCheckedIn ? 'scale-105' : ''
          } ${
            isCheckedIn || !currentGeofence || actionLoading
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white shadow hover:shadow-md'
          }`}
        >
          {actionLoading && !isCheckedIn ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          ) : (
            <LogIn className="w-5 h-5 mr-2" />
          )}
          Check In
        </button>
        
        <button
          onClick={handleCheckOut}
          disabled={!isCheckedIn || actionLoading}
          className={`flex-1 py-3 px-4 rounded-md flex items-center justify-center font-medium transition-all duration-300 ${
            animateButton && isCheckedIn ? 'scale-105' : ''
          } ${
            !isCheckedIn || actionLoading
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white shadow hover:shadow-md'
          }`}
        >
          {actionLoading && isCheckedIn ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          ) : (
            <LogOut className="w-5 h-5 mr-2" />
          )}
          Check Out
        </button>
      </div>
      
      {currentPosition && (
        <div className="mt-6 p-3 bg-secondary/30 rounded-md text-xs text-muted-foreground">
          <p>Current location: {currentPosition.latitude.toFixed(6)}, {currentPosition.longitude.toFixed(6)}</p>
          <p>Accuracy: ±{currentPosition.accuracy.toFixed(1)} meters</p>
        </div>
      )}
    </Card>
  );
}