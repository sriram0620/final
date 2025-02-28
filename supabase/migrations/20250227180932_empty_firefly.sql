/*
  # Create geofences table

  1. New Tables
    - `geofences`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `lat` (float, latitude)
      - `lng` (float, longitude)
      - `radius` (float, radius in meters)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `geofences` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS geofences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  lat float NOT NULL,
  lng float NOT NULL,
  radius float NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Geofences are viewable by everyone"
  ON geofences
  FOR SELECT
  TO public
  USING (true);