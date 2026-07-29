-- Seed data for Zwetsch Family Trip — Tampa Edition 2026
-- Run after 001_initial.sql
-- Trip: Aug 5 arrival – Aug 11 departure, Tampa, FL

INSERT INTO trips (id, title, destination, start_date, end_date, hero_image_url)
VALUES (
  'trip-tampa-2026',
  'Zwetsch Family Trip - Tampa Edition',
  'Tampa, Florida',
  '2026-08-05',
  '2026-08-11',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destination = EXCLUDED.destination,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  hero_image_url = EXCLUDED.hero_image_url;

INSERT INTO itinerary_items (id, trip_id, day_date, sort_order, time, title, location, description, image_url, lat, lng, visited) VALUES
  ('it-1', 'trip-tampa-2026', '2026-08-05', 1, NULL, 'Fly In — UA 1010', 'Tampa International Airport (TPA)', 'Arrive in Tampa on United UA 1010. Settle into lodging and shake off travel day.', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80', 27.9755, -82.5332, false),
  ('it-2', 'trip-tampa-2026', '2026-08-05', 2, '20:00', 'Clearwater Beach at Night', 'Clearwater Beach, FL', 'Wednesday night at Clearwater Beach — famously clear Gulf water and evening vibes.', 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&q=80', 27.9778, -82.827, false),
  ('it-3', 'trip-tampa-2026', '2026-08-06', 1, '18:00', 'Pin Chasers with Connor & Mia', 'Pin Chasers, Tampa', 'Bowling night with Connor and Mia at 6:00 pm.', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', 28.0325, -82.4678, false),
  ('it-4', 'trip-tampa-2026', '2026-08-07', 1, '09:00', 'Pick Up Rental Car', 'Tampa Lodge area', 'Grab the rental car in the morning before beach time.', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80', 27.9323, -82.4566, false),
  ('it-5', 'trip-tampa-2026', '2026-08-07', 2, '11:00', 'Beach Day', 'Clearwater Beach / Gulf Beaches', 'Spend the day on the beach before heading south.', 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800&q=80', 27.9778, -82.827, false),
  ('it-6', 'trip-tampa-2026', '2026-08-07', 3, '16:30', 'Drive to Sarasota Lodge', '2704 Ringling Blvd, Sarasota, FL 34237', 'Leave for Sarasota late afternoon for the weekend with Manon and Nicole.', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80', 27.336, -82.5205, false),
  ('it-7', 'trip-tampa-2026', '2026-08-08', 1, '09:00', 'Farmers Market', 'Sarasota Farmers Market', 'Saturday morning farmers market — fresh finds and local energy.', 'https://images.unsplash.com/photo-1488459716781-31db52582b45?w=800&q=80', 27.3364, -82.5431, false),
  ('it-8', 'trip-tampa-2026', '2026-08-08', 2, '12:00', 'Sarasota Day with Manon & Nicole', 'Sarasota, FL', 'Hang out in Sarasota with Manon and Nicole for the afternoon.', 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80', 27.3364, -82.5307, false),
  ('it-9', 'trip-tampa-2026', '2026-08-09', 1, '09:30', 'Return to Tampa Lodge', '901 Villa Venicia Way, Tampa, FL 33606', 'Leave Sarasota in the morning and head back to the Tampa lodge.', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80', 27.9323, -82.4566, false),
  ('it-10', 'trip-tampa-2026', '2026-08-09', 2, '17:30', 'Birthday Dinner at Olivia', 'Olivia, Tampa', 'Birthday dinner at Olivia — reservation at 5:30 pm.', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', 27.942, -82.458, false),
  ('it-11', 'trip-tampa-2026', '2026-08-10', 1, '10:00', 'Busch Gardens', 'Busch Gardens Tampa Bay', 'Theme-park day — rides, animals, and Florida heat. Pack sunscreen and water.', 'https://images.unsplash.com/photo-1569880153113-76e33fc52d5f?w=800&q=80', 28.0372, -82.4194, false),
  ('it-12', 'trip-tampa-2026', '2026-08-11', 1, '10:00', 'Pool Day', 'Tampa Lodge', 'Easy pool time before afternoon departure.', 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80', 27.9323, -82.4566, false),
  ('it-13', 'trip-tampa-2026', '2026-08-11', 2, '16:16', 'Fly Out — UA 498', 'Tampa International Airport (TPA)', 'Departure on United UA 498 at 4:16 pm. Leave for TPA with buffer for security.', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80', 27.9755, -82.5332, false)
ON CONFLICT (id) DO UPDATE SET
  day_date = EXCLUDED.day_date,
  sort_order = EXCLUDED.sort_order,
  time = EXCLUDED.time,
  title = EXCLUDED.title,
  location = EXCLUDED.location,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng;

DELETE FROM menu_items WHERE trip_id = 'trip-tampa-2026';

INSERT INTO menu_items (id, trip_id, day_date, meal_type, title, description, sort_order) VALUES
  ('menu-1', 'trip-tampa-2026', '2026-08-05', 'dinner', 'Arrival Dinner', 'Easy first-night meal after the flight into Tampa.', 1),
  ('menu-2', 'trip-tampa-2026', '2026-08-06', 'breakfast', 'Home Breakfast', 'Eggs, fruit, and coffee before a mellow Tampa day.', 1),
  ('menu-3', 'trip-tampa-2026', '2026-08-06', 'dinner', 'Pre-Bowling Bites', 'Casual dinner before Pin Chasers with Connor and Mia.', 2),
  ('menu-4', 'trip-tampa-2026', '2026-08-07', 'lunch', 'Beach Lunch', 'Sandwiches, chips, and cold drinks for beach day.', 1),
  ('menu-5', 'trip-tampa-2026', '2026-08-08', 'breakfast', 'Farmers Market Finds', 'Pastries, fruit, and coffee from the morning market.', 1),
  ('menu-6', 'trip-tampa-2026', '2026-08-08', 'dinner', 'Sarasota Dinner', 'Dinner out in Sarasota with Manon and Nicole.', 2),
  ('menu-7', 'trip-tampa-2026', '2026-08-09', 'dinner', 'Birthday Dinner at Olivia', 'Celebration dinner — on the itinerary at 5:30 pm!', 1),
  ('menu-8', 'trip-tampa-2026', '2026-08-10', 'lunch', 'Busch Gardens Midday', 'Park snacks and a proper lunch break in the shade.', 1),
  ('menu-9', 'trip-tampa-2026', '2026-08-11', 'breakfast', 'Departure Breakfast', 'Quick breakfast before pool time and the flight home.', 1)
ON CONFLICT (id) DO NOTHING;
