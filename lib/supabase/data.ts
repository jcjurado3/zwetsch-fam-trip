import type { ItineraryItem, MediaItem, MenuItem, Trip } from "../types";
import {
  seedItinerary,
  seedMenu,
  seedTrip,
} from "../seed-data";
import { createAnonServerClient } from "./server";

export async function getTrip(): Promise<Trip | null> {
  const supabase = createAnonServerClient();
  if (!supabase) return seedTrip;

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .order("start_date", { ascending: true })
    .limit(1)
    .single();

  if (error || !data) return seedTrip;
  return data as Trip;
}

export async function getItineraryItems(): Promise<ItineraryItem[]> {
  const supabase = createAnonServerClient();
  if (!supabase) return seedItinerary;

  const { data, error } = await supabase
    .from("itinerary_items")
    .select("*")
    .order("day_date", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error || !data?.length) return seedItinerary;
  return data as ItineraryItem[];
}

export async function getItineraryItem(id: string): Promise<ItineraryItem | null> {
  const items = await getItineraryItems();
  return items.find((item) => item.id === id) ?? null;
}

export async function getMenuItems(): Promise<MenuItem[]> {
  const supabase = createAnonServerClient();
  if (!supabase) return seedMenu;

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .order("day_date", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error || !data?.length) return seedMenu;
  return data as MenuItem[];
}

export async function getMediaItems(): Promise<MediaItem[]> {
  const supabase = createAnonServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as MediaItem[];
}

export function getMediaPublicUrl(filePath: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return filePath;
  return `${url}/storage/v1/object/public/vacation-media/${filePath}`;
}
