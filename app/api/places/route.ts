import { NextResponse } from "next/server";
import {
  fetchNearbyPlaces,
  milesToMeters,
  type PlaceCategory,
} from "@/lib/places";

const VALID_CATEGORIES: PlaceCategory[] = [
  "all",
  "beach",
  "food",
  "family",
  "outdoors",
  "museum",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const miles = Number(searchParams.get("miles") ?? "5");
  const categoryParam = (searchParams.get("category") ?? "all") as PlaceCategory;
  const category = VALID_CATEGORIES.includes(categoryParam)
    ? categoryParam
    : "all";

  const safeMiles = [5, 15, 30].includes(miles) ? miles : 5;
  const places = await fetchNearbyPlaces({
    radiusMeters: milesToMeters(safeMiles),
    category,
    limit: 30,
  });

  return NextResponse.json(
    {
      center: { lat: 34.4898, lng: -77.4335 },
      miles: safeMiles,
      category,
      places,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    }
  );
}
