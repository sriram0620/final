/*
  # Create attendance table

  1. New Tables
    - `attendance`
      - `id` (uuid, primary key)
      - `user_id` (text, user identifier)
      - `location` (text, location name)
      - `checkin_time` (timestamp)
      - `checkout_time` (timestamp, nullable)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `attendance` table
    - Add policy for public read/write access
*/

CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  location text NOT NULL,
  checkin_time timestamptz NOT NULL,
  checkout_time timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attendance records are viewable by everyone"
  ON attendance
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Attendance records can be inserted by anyone"
  ON attendance
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Attendance records can be updated by anyone"
  ON attendance
  FOR UPDATE
  TO public
  USING (true);