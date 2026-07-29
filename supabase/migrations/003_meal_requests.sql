-- Meal requests from family members

CREATE TABLE IF NOT EXISTS meal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  day_date DATE,
  title TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_requests_trip
  ON meal_requests(trip_id, created_at DESC);

ALTER TABLE meal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read meal_requests"
  ON meal_requests FOR SELECT USING (true);

-- Inserts go through Next.js API with service role key
