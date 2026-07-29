import { NextResponse } from "next/server";
import { seedItinerary, SEED_TRIP_ID } from "@/lib/seed-data";
import {
  createAnonServerClient,
  createServiceClient,
} from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAnonServerClient();
  if (!supabase) {
    return NextResponse.json(seedItinerary);
  }

  const { data, error } = await supabase
    .from("itinerary_items")
    .select("*")
    .order("day_date", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data?.length) {
    return NextResponse.json(seedItinerary);
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const tripId = (body.tripId as string | undefined) || SEED_TRIP_ID;
  const title = (body.title as string | undefined)?.trim();
  const dayDate = (body.dayDate as string | undefined)?.trim();
  const time = ((body.time as string | undefined) || "").trim() || null;
  const location = ((body.location as string | undefined) || "").trim() || null;
  const description =
    ((body.description as string | undefined) || "").trim() || null;
  const latRaw = body.lat;
  const lngRaw = body.lng;
  const lat =
    latRaw === null || latRaw === undefined || latRaw === ""
      ? null
      : Number(latRaw);
  const lng =
    lngRaw === null || lngRaw === undefined || lngRaw === ""
      ? null
      : Number(lngRaw);

  if (!title || !dayDate) {
    return NextResponse.json(
      { error: "Title and day are required" },
      { status: 400 }
    );
  }

  if (title.length > 160) {
    return NextResponse.json({ error: "Title too long" }, { status: 400 });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayDate)) {
    return NextResponse.json({ error: "Invalid day" }, { status: 400 });
  }

  const safeLat = lat != null && Number.isFinite(lat) ? lat : null;
  const safeLng = lng != null && Number.isFinite(lng) ? lng : null;

  const supabase = createServiceClient();
  if (!supabase) {
    const localItem = {
      id: `local-it-${crypto.randomUUID()}`,
      trip_id: tripId,
      day_date: dayDate,
      sort_order: 100,
      time,
      title,
      location,
      description,
      image_url: null,
      lat: safeLat,
      lng: safeLng,
      visited: false,
      created_at: new Date().toISOString(),
      localOnly: true,
    };
    return NextResponse.json(localItem, { status: 201 });
  }

  const { count } = await supabase
    .from("itinerary_items")
    .select("*", { count: "exact", head: true })
    .eq("trip_id", tripId)
    .eq("day_date", dayDate);

  const id = `it-${crypto.randomUUID().slice(0, 8)}`;

  const { data, error } = await supabase
    .from("itinerary_items")
    .insert({
      id,
      trip_id: tripId,
      day_date: dayDate,
      sort_order: (count ?? 0) + 1,
      time,
      title,
      location,
      description,
      image_url: null,
      lat: safeLat,
      lng: safeLng,
      visited: false,
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
  const { id, visited } = body as { id?: string; visited?: boolean };

  if (!id || typeof visited !== "boolean") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ success: true, localOnly: true });
  }

  const { error } = await supabase
    .from("itinerary_items")
    .update({ visited })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
