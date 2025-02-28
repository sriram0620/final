/*
  # Seed geofences table with sample data
*/

INSERT INTO geofences (name, lat, lng, radius)
VALUES 
  ('Office Headquarters', 37.7749, -122.4194, 100),
  ('Downtown Branch', 37.7833, -122.4167, 75),
  ('Tech Park', 37.7833, -122.4000, 150);