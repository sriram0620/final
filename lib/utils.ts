import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Calculate distance between two points using Haversine formula
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = 
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

// Format time for display
export function formatTime(timeString: string | null, includeSeconds = true): string {
  if (!timeString) return 'N/A';
  
  const date = new Date(timeString);
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: true 
  });
}

// Format date for display
export function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString([], { 
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Format duration in milliseconds to human-readable format
export function formatDuration(milliseconds: number): string {
  const totalMinutes = Math.floor(milliseconds / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours}h ${minutes}m`;
}

// Check if a point is inside a geofence
export function isInsideGeofence(
  userLat: number, 
  userLng: number, 
  fenceLat: number, 
  fenceLng: number, 
  radius: number
): boolean {
  const distance = calculateDistance(userLat, userLng, fenceLat, fenceLng);
  return distance <= radius;
}