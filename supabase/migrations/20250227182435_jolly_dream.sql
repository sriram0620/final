/*
  # Create location tracking table

  1. New Tables
    - `location_tracking`
      - `id` (uuid, primary key)
      - `user_id` (text, user identifier)
      - `lat` (float, latitude)
      - `lng` (float, longitude)
      - `timestamp` (timestamp)
      - `event_type` (text, 'check-in' or 'check-out')
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `location_tracking` table
    - Add policy for public read/write access
*/

CREATE TABLE IF NOT EXISTS location_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  lat float NOT NULL,
  lng float NOT NULL,
  timestamp timestamptz NOT NULL,
  event_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE location_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Location tracking records are viewable by everyone"
  ON location_tracking
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Location tracking records can be inserted by anyone"
  ON location_tracking
  FOR INSERT
  TO public
  WITH CHECK (true);