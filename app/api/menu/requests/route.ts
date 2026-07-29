import { NextResponse } from "next/server";
import type { MealType } from "@/lib/types";
import {
  createAnonServerClient,
  createServiceClient,
} from "@/lib/supabase/server";

const ALLOWED_MEALS: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export async function GET() {
  const supabase = createAnonServerClient();
  if (!supabase) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabase
    .from("meal_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const body = await request.json();
  const tripId = body.tripId as string | undefined;
  const requesterName = (body.requesterName as string | undefined)?.trim();
  const mealType = body.mealType as MealType | undefined;
  const dayDate = (body.dayDate as string | null | undefined) || null;
  const title = (body.title as string | undefined)?.trim();
  const notes = ((body.notes as string | undefined) || "").trim() || null;

  if (!tripId || !requesterName || !title || !mealType) {
    return NextResponse.json(
      { error: "Name, meal type, and meal idea are required" },
      { status: 400 }
    );
  }

  if (!ALLOWED_MEALS.includes(mealType)) {
    return NextResponse.json({ error: "Invalid meal type" }, { status: 400 });
  }

  if (title.length > 120 || requesterName.length > 80) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Supabase is not configured. Add credentials to .env.local to save meal requests.",
      },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from("meal_requests")
    .insert({
      trip_id: tripId,
      requester_name: requesterName,
      meal_type: mealType,
      day_date: dayDate,
      title,
      notes,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const id = body.id as string | undefined;
  const action = body.action as "promote" | "decline" | undefined;
  const dayDateOverride =
    ((body.dayDate as string | undefined) || "").trim() || null;

  if (!id || !action) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Supabase is not configured. Add credentials to .env.local to manage meal requests.",
      },
      { status: 503 }
    );
  }

  const { data: existing, error: fetchError } = await supabase
    .from("meal_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (action === "decline") {
    const { data, error } = await supabase
      .from("meal_requests")
      .update({ status: "declined" })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ request: data });
  }

  if (action === "promote") {
    if (existing.status === "approved") {
      return NextResponse.json(
        { error: "This request is already on the planned menu" },
        { status: 400 }
      );
    }

    const dayDate = dayDateOverride || existing.day_date;
    if (!dayDate) {
      return NextResponse.json(
        { error: "Pick a day before adding to the planned menu" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MEALS.includes(existing.meal_type as MealType)) {
      return NextResponse.json({ error: "Invalid meal type" }, { status: 400 });
    }

    // Once family starts planning from requests, drop leftover seed rows
    // (menu-1…menu-8) so real planned meals replace mock data — never
    // delete promoted rows (menu-req-…).
    const { data: existingMenu } = await supabase
      .from("menu_items")
      .select("id")
      .like("id", "menu-%")
      .not("id", "like", "menu-req-%");

    const seedIds = (existingMenu ?? [])
      .map((row) => row.id as string)
      .filter((id) => /^menu-\d+$/.test(id));

    if (seedIds.length) {
      await supabase.from("menu_items").delete().in("id", seedIds);
    }

    const { count } = await supabase
      .from("menu_items")
      .select("*", { count: "exact", head: true })
      .eq("trip_id", existing.trip_id)
      .eq("day_date", dayDate);

    const descriptionParts = [
      existing.notes,
      `Requested by ${existing.requester_name}`,
    ].filter(Boolean);

    const { data: menuItem, error: insertError } = await supabase
      .from("menu_items")
      .insert({
        id: `menu-req-${existing.id}`,
        trip_id: existing.trip_id,
        day_date: dayDate,
        meal_type: existing.meal_type,
        title: existing.title,
        description: descriptionParts.join(" · "),
        sort_order: (count ?? 0) + 1,
      })
      .select()
      .single();

    if (insertError) {
      // Retry without fixed id if conflict
      if (insertError.code === "23505") {
        const { data: retryItem, error: retryError } = await supabase
          .from("menu_items")
          .insert({
            id: `menu-req-${crypto.randomUUID()}`,
            trip_id: existing.trip_id,
            day_date: dayDate,
            meal_type: existing.meal_type,
            title: existing.title,
            description: descriptionParts.join(" · "),
            sort_order: (count ?? 0) + 1,
          })
          .select()
          .single();

        if (retryError) {
          return NextResponse.json(
            { error: retryError.message },
            { status: 500 }
          );
        }

        await supabase
          .from("meal_requests")
          .update({ status: "approved", day_date: dayDate })
          .eq("id", id);

        return NextResponse.json({
          request: { ...existing, status: "approved", day_date: dayDate },
          menuItem: retryItem,
          replacedSeed: seedIds.length > 0,
        });
      }

      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const { data: updatedRequest, error: updateError } = await supabase
      .from("meal_requests")
      .update({ status: "approved", day_date: dayDate })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      request: updatedRequest,
      menuItem,
      replacedSeed: seedIds.length > 0,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
