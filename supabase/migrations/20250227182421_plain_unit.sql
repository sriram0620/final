/*
  # Add specific geofence for monitoring

  1. Changes
    - Add a specific geofence with coordinates 12.835239990526295, 80.13544605129297 and radius 200 meters
    - This will be the primary geofence for monitoring user location
*/

INSERT INTO geofences (name, lat, lng, radius)
VALUES ('Primary Monitoring Zone', 12.835239990526295, 80.13544605129297, 200);