"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/modernCard';
import { Geofence } from '@/types/supabase';

export default function AttendanceActions({ userId }: { userId: string }) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkinTime, setCheckinTime] = useState<string | null>(null);
  const [checkoutTime, setCheckoutTime] = useState<string | null>(null);
  const [currentGeofence, setCurrentGeofence] = useState<Geofence | null>(null);
  const [currentPosition, setCurrentPosition] = useState<GeolocationCoordinates | null>(null);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const insideGeofence = geofences.find((fence) => 
        isInsideGeofence(
          currentPosition.latitude, 
          currentPosition.longitude, 
          fence.lat, 
          fence.lng, 
          fence.radius
        )
      );
      
      setCurrentGeofence(insideGeofence || null);
    }
  }, [currentPosition, geofences]);

  // Calculate distance between two points using Haversine formula
  const isInsideGeofence = (
    userLat: number, 
    userLng: number, 
    fenceLat: number, 
    fenceLng: number, 
    radius: number
  ): boolean => {
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

    return distance <= radius;
  };

  const handleCheckIn = async () => {
    if (!currentGeofence) {
      setError('You must be inside a geofence to check in');
      return;
    }

    try {
      setLoading(true);
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
      } else {
        setError(data.message || 'Failed to check in');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during check-in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
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
      } else {
        setError(data.message || 'Failed to check out');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during check-out');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'N/A';
    return new Date(timeString).toLocaleTimeString();
  };

  if (loading) {
    return <div className="text-center p-4">Loading attendance data...</div>;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Attendance Actions</h2>
      
      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <p className="mb-1"><strong>Status:</strong> {isCheckedIn ? 'Checked In' : 'Checked Out'}</p>
        {checkinTime && <p className="mb-1"><strong>Last Check-in:</strong> {formatTime(checkinTime)}</p>}
        {checkoutTime && <p className="mb-1"><strong>Last Check-out:</strong> {formatTime(checkoutTime)}</p>}
      </div>
      
      <div className="mb-4">
        <p className="mb-1">
          <strong>Current Location:</strong> {currentPosition 
            ? `${currentPosition.latitude.toFixed(6)}, ${currentPosition.longitude.toFixed(6)}` 
            : 'Waiting for location...'}
        </p>
        <p className="mb-1">
          <strong>Geofence Status:</strong> {currentGeofence 
            ? `Inside ${currentGeofence.name}` 
            : 'Not inside any geofence'}
        </p>
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={handleCheckIn}
          disabled={isCheckedIn || !currentGeofence || loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Check In
        </button>
        
        <button
          onClick={handleCheckOut}
          disabled={!isCheckedIn || loading}
          className="px-4 py-2 bg-red-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Check Out
        </button>
      </div>
    </Card>
  );
}