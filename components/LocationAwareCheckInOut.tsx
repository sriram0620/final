"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/modernCard';
import { Geofence } from '@/types/supabase';
import { LogIn, LogOut, MapPin, AlertCircle } from 'lucide-react';

type LocationAwareCheckInOutProps = {
  userId: string;
  userName?: string;
};

export default function LocationAwareCheckInOut({ userId, userName = 'User' }: LocationAwareCheckInOutProps) {
  const [currentPosition, setCurrentPosition] = useState<GeolocationCoordinates | null>(null);
  const [isInsideGeofence, setIsInsideGeofence] = useState<boolean>(false);
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [currentGeofence, setCurrentGeofence] = useState<Geofence | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("Initializing...");
  const [lastAction, setLastAction] = useState<{ type: string; time: string } | null>(null);

  // Fetch geofences and check current attendance status
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch geofences
        const geofencesResponse = await fetch('/api/getGeofences');
        if (!geofencesResponse.ok) {
          throw new Error('Failed to fetch geofences');
        }
        const geofencesData = await geofencesResponse.json();
        setGeofences(geofencesData);
        
        // Check current attendance status
        const statusResponse = await fetch(`/api/attendance/status?email=${userId}`);
        if (!statusResponse.ok) {
          throw new Error('Failed to fetch attendance status');
        }
        const statusData = await statusResponse.json();
        
        if (statusData.success) {
          setIsCheckedIn(statusData.isCheckedIn);
          if (statusData.isCheckedIn) {
            setLastAction({
              type: 'check-in',
              time: new Date(statusData.latestCheckin).toLocaleTimeString()
            });
          } else if (statusData.latestCheckout) {
            setLastAction({
              type: 'check-out',
              time: new Date(statusData.latestCheckout).toLocaleTimeString()
            });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [userId]);

  // Start location tracking
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentPosition(position.coords);
          setError(null);
        },
        (err) => {
          setError(`Geolocation error: ${err.message}`);
          setLoading(false);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
    }
  }, []);

  // Check if user is inside any geofence
  useEffect(() => {
    if (currentPosition && geofences.length > 0) {
      let inside = false;
      let closestGeofence: Geofence | null = null;
      let minDistance = Infinity;
      
      geofences.forEach((fence) => {
        const calculatedDistance = calculateDistance(
          currentPosition.latitude,
          currentPosition.longitude,
          fence.lat,
          fence.lng
        );
        
        if (calculatedDistance < minDistance) {
          minDistance = calculatedDistance;
          closestGeofence = fence;
        }
        
        if (calculatedDistance <= fence.radius) {
          inside = true;
        }
      });
      
      setIsInsideGeofence(inside);
      setCurrentGeofence(closestGeofence);
      setDistance(minDistance);
      
      // Update status message
      if (inside) {
        setStatusMessage(`Inside ${closestGeofence?.name || 'geofence'}`);
      } else {
        setStatusMessage(`Outside geofence (${minDistance.toFixed(0)}m from ${closestGeofence?.name || 'nearest point'})`);
      }
      
      // Track location for analytics
      if (userId) {
        trackLocation(inside);
      }
    }
  }, [currentPosition, geofences, userId]);

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

  // Track user location for analytics
  const trackLocation = async (isInside: boolean) => {
    if (!currentPosition) return;
    
    try {
      // Only track boundary crossings (entering or exiting)
      const eventType = isInside ? 'check-in' : 'check-out';
      
      await fetch('/api/attendance/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userId,
          lat: currentPosition.latitude,
          lng: currentPosition.longitude,
          timestamp: new Date().toISOString(),
          event_type: eventType
        }),
      });
    } catch (err) {
      console.error('Failed to track location:', err);
    }
  };

  const handleCheckIn = async () => {
    if (!currentPosition || !currentGeofence) {
      setError('Unable to determine your location accurately');
      return;
    }
    
    if (!isInsideGeofence) {
      setError('You must be inside a geofence to check in');
      return;
    }
    
    if (isCheckedIn) {
      setError('You are already checked in');
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
        setLastAction({
          type: 'check-in',
          time: new Date().toLocaleTimeString()
        });
      } else {
        throw new Error(data.message || 'Failed to check in');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during check-in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!isCheckedIn) {
      setError('You are not checked in');
      return;
    }
    
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
        setLastAction({
          type: 'check-out',
          time: new Date().toLocaleTimeString()
        });
      } else {
        throw new Error(data.message || 'Failed to check out');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during check-out');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = () => {
    if (isCheckedIn) {
      handleCheckOut();
    } else {
      handleCheckIn();
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto p-6">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2"></div>
          <p>Initializing location services...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Location-Aware Attendance</h2>
      
      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      <div className={`p-3 mb-4 rounded-md flex items-center ${
        isInsideGeofence 
          ? 'bg-green-100 text-green-800' 
          : 'bg-yellow-100 text-yellow-800'
      }`}>
        <MapPin className="w-5 h-5 mr-2" />
        <span>{statusMessage}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-100 p-3 rounded-md">
          <p className="text-sm text-gray-500">Status</p>
          <p className="font-semibold">
            {isCheckedIn ? 'Checked In' : 'Checked Out'}
          </p>
        </div>
        
        <div className="bg-gray-100 p-3 rounded-md">
          <p className="text-sm text-gray-500">Distance</p>
          <p className="font-semibold">
            {distance !== null ? `${distance.toFixed(0)} meters` : 'Unknown'}
          </p>
        </div>
      </div>
      
      {lastAction && (
        <div className="mb-6 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-500">Last Action</p>
          <p className="font-semibold">
            {lastAction.type === 'check-in' ? 'Checked in' : 'Checked out'} at {lastAction.time}
          </p>
        </div>
      )}
      
      <button
        onClick={handleAction}
        disabled={actionLoading || (!isInsideGeofence && !isCheckedIn)}
        className={`w-full py-3 rounded-md flex items-center justify-center font-medium transition-colors ${
          isCheckedIn
            ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300'
            : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-green-300'
        } disabled:cursor-not-allowed`}
      >
        {actionLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
        ) : isCheckedIn ? (
          <LogOut className="w-5 h-5 mr-2" />
        ) : (
          <LogIn className="w-5 h-5 mr-2" />
        )}
        {isCheckedIn ? 'Check Out' : 'Check In'}
      </button>
      
      {!isInsideGeofence && !isCheckedIn && (
        <p className="text-sm text-center mt-2 text-gray-500">
          You must be inside a geofence to check in
        </p>
      )}
      
      {currentPosition && (
        <div className="mt-6 text-xs text-gray-500">
          <p>Current coordinates: {currentPosition.latitude.toFixed(6)}, {currentPosition.longitude.toFixed(6)}</p>
          <p>Accuracy: ±{currentPosition.accuracy.toFixed(1)}m</p>
        </div>
      )}
    </Card>
  );
}