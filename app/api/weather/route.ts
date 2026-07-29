import { NextResponse } from "next/server";
import { fetchDestinationWeather } from "@/lib/weather";

export async function GET() {
  const weather = await fetchDestinationWeather();

  if (!weather) {
    return NextResponse.json(
      { error: "Unable to fetch weather" },
      { status: 502 }
    );
  }

  return NextResponse.json(weather, {
    headers: {
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
