import { NextResponse } from "next/server";
import { createAnonServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAnonServerClient();
  if (!supabase) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
