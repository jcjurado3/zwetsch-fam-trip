import { NextResponse } from "next/server";
import type { ChecklistCategory } from "@/lib/types";
import { seedChecklist, SEED_TRIP_ID } from "@/lib/seed-data";
import {
  createAnonServerClient,
  createServiceClient,
} from "@/lib/supabase/server";

const ALLOWED_CATEGORIES: ChecklistCategory[] = [
  "packing",
  "groceries",
  "tasks",
  "general",
];

export async function GET() {
  const supabase = createAnonServerClient();
  if (!supabase) {
    return NextResponse.json(seedChecklist);
  }

  const { data, error } = await supabase
    .from("checklist_items")
    .select("*")
    .order("completed", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data?.length) {
    return NextResponse.json(seedChecklist);
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const tripId = (body.tripId as string | undefined) || SEED_TRIP_ID;
  const title = (body.title as string | undefined)?.trim();
  const notes = ((body.notes as string | undefined) || "").trim() || null;
  const category = (body.category as ChecklistCategory | undefined) || "general";
  const assigneeName =
    ((body.assigneeName as string | undefined) || "").trim() || null;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  if (title.length > 160) {
    return NextResponse.json({ error: "Title too long" }, { status: 400 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    // Local-only fallback when Supabase is not configured
    const localItem = {
      id: `local-${crypto.randomUUID()}`,
      trip_id: tripId,
      title,
      notes,
      category,
      assignee_name: assigneeName,
      completed: false,
      sort_order: 100,
      created_at: new Date().toISOString(),
      localOnly: true,
    };
    return NextResponse.json(localItem, { status: 201 });
  }

  const { data, error } = await supabase
    .from("checklist_items")
    .insert({
      trip_id: tripId,
      title,
      notes,
      category,
      assignee_name: assigneeName,
      completed: false,
      sort_order: 100,
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
  const completed = body.completed as boolean | undefined;

  if (!id || typeof completed !== "boolean") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ success: true, localOnly: true, id, completed });
  }

  const { error } = await supabase
    .from("checklist_items")
    .update({ completed })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ success: true, localOnly: true, id });
  }

  const { error } = await supabase.from("checklist_items").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
