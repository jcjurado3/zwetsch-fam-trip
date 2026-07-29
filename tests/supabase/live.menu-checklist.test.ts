import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const hasAnon = Boolean(url && anonKey);
const hasService = Boolean(url && serviceKey);

function anonClient(): SupabaseClient {
  return createClient(url!, anonKey!);
}

function serviceClient(): SupabaseClient {
  return createClient(url!, serviceKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

describe.runIf(hasAnon)("Supabase live — Menu page data", () => {
  it("can read menu_items (Planned Meals)", async () => {
    const { data, error } = await anonClient()
      .from("menu_items")
      .select("id, trip_id, day_date, meal_type, title")
      .limit(5);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("can read meal_requests (Family Requests)", async () => {
    const { data, error } = await anonClient()
      .from("meal_requests")
      .select("id, trip_id, title, status, meal_type")
      .limit(5);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe.runIf(hasAnon)("Supabase live — List page data", () => {
  it("can read checklist_items", async () => {
    const { data, error } = await anonClient()
      .from("checklist_items")
      .select("id, trip_id, title, category, completed")
      .limit(5);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe.runIf(hasService)("Supabase live — Menu + List writes", () => {
  it("can insert and delete a temporary meal request", async () => {
    const client = serviceClient();
    const { data: trip } = await client
      .from("trips")
      .select("id")
      .eq("id", "trip-tampa-2026")
      .maybeSingle();

    if (!trip) {
      expect(trip).toBeNull();
      return;
    }

    const { data, error } = await client
      .from("meal_requests")
      .insert({
        trip_id: "trip-tampa-2026",
        requester_name: "Vitest",
        meal_type: "snack",
        title: `test-meal-${Date.now()}`,
        status: "pending",
      })
      .select("id")
      .single();

    expect(error).toBeNull();
    expect(data?.id).toBeTruthy();

    const { error: deleteError } = await client
      .from("meal_requests")
      .delete()
      .eq("id", data!.id);

    expect(deleteError).toBeNull();
  });

  it("can insert and delete a temporary checklist item", async () => {
    const client = serviceClient();
    const { data: trip } = await client
      .from("trips")
      .select("id")
      .eq("id", "trip-tampa-2026")
      .maybeSingle();

    if (!trip) {
      expect(trip).toBeNull();
      return;
    }

    const { data, error } = await client
      .from("checklist_items")
      .insert({
        trip_id: "trip-tampa-2026",
        title: `test-check-${Date.now()}`,
        category: "general",
        completed: false,
        sort_order: 999,
      })
      .select("id")
      .single();

    expect(error).toBeNull();
    expect(data?.id).toBeTruthy();

    const { error: deleteError } = await client
      .from("checklist_items")
      .delete()
      .eq("id", data!.id);

    expect(deleteError).toBeNull();
  });
});
