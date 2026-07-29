import { NextResponse } from "next/server";
import { fetchCoastalConditions } from "@/lib/coastal";
import { DESTINATION_COORDS } from "@/lib/seed-data";

export async function GET() {
  const coastal = await fetchCoastalConditions(
    DESTINATION_COORDS.lat,
    DESTINATION_COORDS.lng
  );

  if (!coastal) {
    return NextResponse.json(
      { error: "Unable to fetch coastal conditions" },
      { status: 502 }
    );
  }

  return NextResponse.json(coastal, {
    headers: {
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
