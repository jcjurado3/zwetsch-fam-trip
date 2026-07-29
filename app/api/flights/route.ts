import { NextResponse } from "next/server";
import { fetchTripFlightStatuses } from "@/lib/flights";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const flight = searchParams.get("flight") ?? undefined;

  try {
    const statuses = await fetchTripFlightStatuses(flight);
    return NextResponse.json(statuses, {
      headers: {
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch flight status" },
      { status: 502 }
    );
  }
}
