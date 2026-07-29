# Zwetsch Family Trip — Database Reference

Supabase Postgres + Storage used by this app. Migrations live in `supabase/migrations/`.

**Primary trip id:** `trip-tampa-2026`  
**Access pattern:** public `SELECT` via anon key (RLS); writes via Next.js API using `SUPABASE_SERVICE_ROLE_KEY`.

---

## Entity relationship (overview)

```
trips
 ├── itinerary_items
 ├── menu_items
 ├── meal_requests
 ├── checklist_items
 └── media  →  storage bucket: vacation-media
```

---

## Tables

### `trips`

Trip metadata (home base for all child rows).

| Column | Type | Notes |
|--------|------|--------|
| `id` | `TEXT` PK | e.g. `trip-tampa-2026` |
| `title` | `TEXT` NOT NULL | |
| `destination` | `TEXT` NOT NULL | |
| `start_date` | `DATE` NOT NULL | |
| `end_date` | `DATE` NOT NULL | |
| `hero_image_url` | `TEXT` | optional |
| `created_at` | `TIMESTAMPTZ` | default `NOW()` |

**Used by:** `lib/supabase/data.ts`, FK parent for all other tables  
**Migration:** `001_initial.sql`  
**Seed:** `002_seed_data.sql`

---

### `itinerary_items`

Planned stops / schedule (Itinerary page).

| Column | Type | Notes |
|--------|------|--------|
| `id` | `TEXT` PK | |
| `trip_id` | `TEXT` FK → `trips` | `ON DELETE CASCADE` |
| `day_date` | `DATE` NOT NULL | |
| `sort_order` | `INTEGER` | default `0` |
| `time` | `TEXT` | optional |
| `title` | `TEXT` NOT NULL | |
| `location` | `TEXT` | |
| `description` | `TEXT` | |
| `image_url` | `TEXT` | |
| `lat` / `lng` | `DOUBLE PRECISION` | map markers |
| `visited` | `BOOLEAN` | default `false` |
| `created_at` | `TIMESTAMPTZ` | |

**Index:** `idx_itinerary_trip_day (trip_id, day_date, sort_order)`  
**API:** `GET/PATCH /api/itinerary`  
**Fallback:** `seedItinerary` in `lib/seed-data.ts` when empty / no Supabase  
**Migration:** `001_initial.sql` · **Seed:** `002_seed_data.sql`

---

### `menu_items`

Planned meals (Menu → Planned Meals).

| Column | Type | Notes |
|--------|------|--------|
| `id` | `TEXT` PK | seeds: `menu-1`…; promoted: `menu-req-{uuid}` |
| `trip_id` | `TEXT` FK → `trips` | |
| `day_date` | `DATE` NOT NULL | |
| `meal_type` | `TEXT` | `breakfast` \| `lunch` \| `dinner` \| `snack` |
| `title` | `TEXT` NOT NULL | |
| `description` | `TEXT` | |
| `sort_order` | `INTEGER` | default `0` |
| `created_at` | `TIMESTAMPTZ` | |

**Index:** `idx_menu_trip_day (trip_id, day_date, sort_order)`  
**API:** `GET /api/menu` · promote writes via `PATCH /api/menu/requests`  
**Fallback:** `seedMenu` when empty / no Supabase (`source: "seed"` \| `"database"`)  
**Migration:** `001_initial.sql` · **Seed:** `002_seed_data.sql`

---

### `meal_requests`

Family meal ideas (Menu → Family Requests).

| Column | Type | Notes |
|--------|------|--------|
| `id` | `UUID` PK | `gen_random_uuid()` |
| `trip_id` | `TEXT` FK → `trips` | |
| `requester_name` | `TEXT` NOT NULL | |
| `meal_type` | `TEXT` | same meal types as menu |
| `day_date` | `DATE` | optional until promote |
| `title` | `TEXT` NOT NULL | |
| `notes` | `TEXT` | |
| `status` | `TEXT` | `pending` \| `approved` \| `declined` |
| `created_at` | `TIMESTAMPTZ` | |

**Index:** `idx_meal_requests_trip (trip_id, created_at DESC)`  
**API:** `GET/POST/PATCH /api/menu/requests`  
- **Promote:** insert into `menu_items`, set status `approved`, delete leftover seed rows `menu-{n}`  
**Migration:** `003_meal_requests.sql`

---

### `checklist_items`

Family checklist (List page).

| Column | Type | Notes |
|--------|------|--------|
| `id` | `UUID` PK | |
| `trip_id` | `TEXT` FK → `trips` | |
| `title` | `TEXT` NOT NULL | |
| `notes` | `TEXT` | |
| `category` | `TEXT` | `packing` \| `groceries` \| `tasks` \| `general` |
| `assignee_name` | `TEXT` | |
| `completed` | `BOOLEAN` | default `false` |
| `sort_order` | `INTEGER` | default `0` |
| `created_at` | `TIMESTAMPTZ` | |

**Index:** `idx_checklist_trip (trip_id, completed, sort_order, created_at)`  
**API:** `GET/POST/PATCH/DELETE /api/checklist`  
**Fallback:** `seedChecklist` when empty / no Supabase; local-only inserts if service key missing  
**Migration:** `004_checklist.sql` (includes seed rows)

---

### `media`

Uploaded photos/videos metadata (Media page).

| Column | Type | Notes |
|--------|------|--------|
| `id` | `UUID` PK | |
| `trip_id` | `TEXT` FK → `trips` | |
| `file_path` | `TEXT` NOT NULL | path inside storage bucket |
| `caption` | `TEXT` | |
| `uploader_name` | `TEXT` | |
| `created_at` | `TIMESTAMPTZ` | |

**Index:** `idx_media_trip (trip_id, created_at DESC)`  
**API:** `GET /api/media` · `POST /api/media/upload`  
**Migration:** `001_initial.sql`

---

## Storage

| Bucket | Public | Purpose |
|--------|--------|---------|
| `vacation-media` | yes (intended) | Photo/video files |

**Public URL shape:**  
`{SUPABASE_URL}/storage/v1/object/public/vacation-media/{file_path}`  
(`lib/supabase/data.ts` → `getMediaPublicUrl`)

Create the bucket in the Supabase dashboard if not already present (commented hint in `001_initial.sql`).

---

## RLS summary

All app tables enable RLS with **public read** policies.  
**Inserts / updates / deletes** are expected through the **service role** in API routes (bypasses RLS).

| Table | Public SELECT | Writes |
|-------|---------------|--------|
| `trips` | ✓ | service role / seed |
| `itinerary_items` | ✓ | service role (`PATCH` visited) |
| `menu_items` | ✓ | service role (promote) |
| `meal_requests` | ✓ | service role |
| `checklist_items` | ✓ | service role |
| `media` | ✓ | service role (+ storage upload) |

---

## Migrations order

1. `001_initial.sql` — trips, itinerary, menu, media + RLS  
2. `002_seed_data.sql` — trip, itinerary, menu seeds  
3. `003_meal_requests.sql` — meal requests  
4. `004_checklist.sql` — checklist + seed rows  

---

## Env vars (Supabase)

| Variable | Role |
|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client/server reads |
| `SUPABASE_SERVICE_ROLE_KEY` | Server writes (never expose to browser) |
