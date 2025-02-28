"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/modernCard';
import { Geofence } from '@/types/supabase';

export default function GeofenceStatus() {
  const [currentPosition, setCurrentPosition] = useState<GeolocationCoordinates | null>(null);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [currentGeofence, setCurrentGeofence] = useState<Geofence | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch geofences
    const fetchGeofences = async () => {
      try {
        const response = await fetch('/api/getGeofences');
        if (!response.ok) {
          throw new Error('Failed to fetch geofences');
        }
        const data = await response.json();
        setGeofences(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchGeofences();

    // Get user's location
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
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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

  if (loading) {
    return <div className="text-center p-4">Loading geofence data...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Geofence Status</h2>
      
      {currentPosition ? (
        <div>
          <p className="mb-2">
            Your current location: {currentPosition.latitude.toFixed(6)}, {currentPosition.longitude.toFixed(6)}
          </p>
          
          {currentGeofence ? (
            <div className="p-3 bg-green-100 text-green-800 rounded-md">
              You are inside the <strong>{currentGeofence.name}</strong> geofence.
            </div>
          ) : (
            <div className="p-3 bg-yellow-100 text-yellow-800 rounded-md">
              You are not inside any geofence.
            </div>
          )}
          
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Available Geofences:</h3>
            <ul className="space-y-2">
              {geofences.map((fence) => (
                <li key={fence.id} className="p-2 border rounded">
                  {fence.name} (radius: {fence.radius}m)
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center text-amber-500">
          Waiting for location data...
        </div>
      )}
    </Card>
  );
}