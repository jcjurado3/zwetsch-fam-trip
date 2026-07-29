export interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  hero_image_url: string | null;
}

export interface ItineraryItem {
  id: string;
  trip_id: string;
  day_date: string;
  sort_order: number;
  time: string | null;
  title: string;
  location: string | null;
  description: string | null;
  image_url: string | null;
  lat: number | null;
  lng: number | null;
  visited: boolean;
  created_at: string;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MenuItem {
  id: string;
  trip_id: string;
  day_date: string;
  meal_type: MealType;
  title: string;
  description: string | null;
  sort_order: number;
}

export interface MediaItem {
  id: string;
  trip_id: string;
  file_path: string;
  caption: string | null;
  uploader_name: string | null;
  created_at: string;
}

export type MealRequestStatus = "pending" | "approved" | "declined";

export interface MealRequest {
  id: string;
  trip_id: string;
  requester_name: string;
  meal_type: MealType;
  day_date: string | null;
  title: string;
  notes: string | null;
  status: MealRequestStatus;
  created_at: string;
}

export type ChecklistCategory = "packing" | "groceries" | "tasks" | "general";

export interface ChecklistItem {
  id: string;
  trip_id: string;
  title: string;
  notes: string | null;
  category: ChecklistCategory;
  assignee_name: string | null;
  completed: boolean;
  sort_order: number;
  created_at: string;
}
