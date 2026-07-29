import { NextResponse } from "next/server";
import { seedMenu } from "@/lib/seed-data";
import { createAnonServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAnonServerClient();
  if (!supabase) {
    return NextResponse.json({ items: seedMenu, source: "seed" });
  }

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .order("day_date", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data?.length) {
    return NextResponse.json({ items: seedMenu, source: "seed" });
  }

  return NextResponse.json({ items: data, source: "database" });
}
