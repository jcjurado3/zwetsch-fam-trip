-- Family checklist items

CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('packing', 'groceries', 'tasks', 'general')),
  assignee_name TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklist_trip
  ON checklist_items(trip_id, completed, sort_order, created_at);

ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read checklist_items"
  ON checklist_items FOR SELECT USING (true);

-- Inserts/updates go through Next.js API with service role key

INSERT INTO checklist_items (id, trip_id, title, notes, category, assignee_name, completed, sort_order) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'trip-tampa-2026', 'Beach towels & sunscreen', 'Clearwater + Busch Gardens days', 'packing', NULL, false, 1),
  ('a1000000-0000-4000-8000-000000000002', 'trip-tampa-2026', 'Confirm UA 1010 & UA 498', 'Arrival and 4:16 pm departure', 'tasks', NULL, false, 2),
  ('a1000000-0000-4000-8000-000000000003', 'trip-tampa-2026', 'Rental car pickup Friday AM', NULL, 'tasks', NULL, false, 3),
  ('a1000000-0000-4000-8000-000000000004', 'trip-tampa-2026', 'Grocery / snack run', 'Beach cooler, pool snacks, kids favorites', 'groceries', NULL, false, 4),
  ('a1000000-0000-4000-8000-000000000005', 'trip-tampa-2026', 'Olivia birthday dinner — 5:30 pm Sun', 'Confirm reservation', 'tasks', NULL, false, 5),
  ('a1000000-0000-4000-8000-000000000006', 'trip-tampa-2026', 'Confirm lodge addresses', 'Tampa + Sarasota stays', 'tasks', NULL, false, 6)
ON CONFLICT (id) DO NOTHING;
