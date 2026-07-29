import { DESTINATION_COORDS, LODGES, seedItinerary } from "./seed-data";

export type PlaceCategory =
  | "all"
  | "beach"
  | "food"
  | "family"
  | "outdoors"
  | "museum";

export interface PlaceCard {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm: number;
  category: Exclude<PlaceCategory, "all">;
  rate: number | null;
  kinds?: string;
}

export interface PlaceDetail extends PlaceCard {
  description: string | null;
  imageUrl: string | null;
  address: string | null;
  wikipediaExtract: string | null;
  wikipediaUrl: string | null;
  wikidata: string | null;
}

const CATEGORY_KINDS: Record<Exclude<PlaceCategory, "all">, string> = {
  beach: "beaches",
  food: "foods,restaurants",
  family: "amusement_parks,water_parks,picnic_site,playgrounds",
  outdoors: "natural,parks,view_points,lighthouses",
  museum: "museums,cultural,historic",
};

export const RADIUS_OPTIONS = [
  { miles: 5, meters: 8047, label: "5 mi" },
  { miles: 15, meters: 24140, label: "15 mi" },
  { miles: 30, meters: 48280, label: "30 mi" },
] as const;

export function milesToMeters(miles: number): number {
  const match = RADIUS_OPTIONS.find((r) => r.miles === miles);
  return match?.meters ?? Math.round(miles * 1609.34);
}

export function categorizeKinds(kinds?: string): Exclude<PlaceCategory, "all"> {
  const k = (kinds ?? "").toLowerCase();
  if (k.includes("beach")) return "beach";
  if (k.includes("food") || k.includes("restaurant") || k.includes("cafe"))
    return "food";
  if (
    k.includes("museum") ||
    k.includes("cultural") ||
    k.includes("historic") ||
    k.includes("architecture")
  )
    return "museum";
  if (
    k.includes("amusement") ||
    k.includes("water_park") ||
    k.includes("playground") ||
    k.includes("picnic")
  )
    return "family";
  return "outdoors";
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getSeedPlaces(
  radiusMeters = 24140,
  category: PlaceCategory = "all"
): PlaceCard[] {
  const curated: PlaceCard[] = [
    {
      id: "seed-lodge-tampa",
      name: "Tampa Lodge",
      lat: 27.9323,
      lng: -82.4566,
      distanceKm: 0,
      category: "family",
      rate: 3,
    },
    {
      id: "seed-lodge-sarasota",
      name: "Sarasota Lodge",
      lat: 27.336,
      lng: -82.5205,
      distanceKm: 0,
      category: "family",
      rate: 3,
    },
    {
      id: "seed-clearwater-beach",
      name: "Clearwater Beach",
      lat: 27.9778,
      lng: -82.827,
      distanceKm: 0,
      category: "beach",
      rate: 3,
    },
    {
      id: "seed-busch-gardens",
      name: "Busch Gardens Tampa Bay",
      lat: 28.0372,
      lng: -82.4194,
      distanceKm: 0,
      category: "family",
      rate: 3,
    },
    {
      id: "seed-pin-chasers",
      name: "Pin Chasers",
      lat: 28.0325,
      lng: -82.4678,
      distanceKm: 0,
      category: "family",
      rate: 2,
    },
    {
      id: "seed-riverwalk",
      name: "Tampa Riverwalk",
      lat: 27.9456,
      lng: -82.4598,
      distanceKm: 0,
      category: "outdoors",
      rate: 3,
    },
    {
      id: "seed-florida-aquarium",
      name: "The Florida Aquarium",
      lat: 27.9443,
      lng: -82.4451,
      distanceKm: 0,
      category: "museum",
      rate: 3,
    },
    {
      id: "seed-olivia",
      name: "Olivia",
      lat: 27.942,
      lng: -82.458,
      distanceKm: 0,
      category: "food",
      rate: 2,
    },
    {
      id: "seed-siesta-key",
      name: "Siesta Key Beach",
      lat: 27.267,
      lng: -82.5525,
      distanceKm: 0,
      category: "beach",
      rate: 3,
    },
    ...seedItinerary
      .filter((item) => item.lat && item.lng)
      .map((item) => ({
        id: `seed-${item.id}`,
        name: item.title,
        lat: item.lat!,
        lng: item.lng!,
        distanceKm: 0,
        category: categorizeKinds(item.location ?? undefined),
        rate: null as number | null,
      })),
  ];

  const unique = new Map<string, PlaceCard>();
  for (const place of curated) {
    const distanceKm = haversineKm(
      DESTINATION_COORDS.lat,
      DESTINATION_COORDS.lng,
      place.lat,
      place.lng
    );
    const withDistance = { ...place, distanceKm };
    const isLodge = place.id.startsWith("seed-lodge-");
    // Always keep trip lodges, even when outside the nearby radius filter
    if (isLodge || distanceKm * 1000 <= radiusMeters) {
      unique.set(place.name.toLowerCase(), withDistance);
    }
  }

  let places = Array.from(unique.values());
  if (category !== "all") {
    places = places.filter((p) => p.category === category);
  }
  return places.sort((a, b) => a.distanceKm - b.distanceKm);
}

interface OpenTripMapRadiusItem {
  xid: string;
  name: string;
  dist: number;
  rate?: number;
  kinds?: string;
  point?: { lat: number; lon: number };
}

interface OpenTripMapDetail {
  xid: string;
  name: string;
  kinds?: string;
  rate?: number;
  wikidata?: string;
  wikipedia?: string;
  wikipedia_extracts?: { text?: string; title?: string };
  image?: string;
  preview?: { source?: string };
  address?: {
    road?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  point?: { lat: number; lon: number };
}

export async function fetchNearbyPlaces(options: {
  radiusMeters?: number;
  category?: PlaceCategory;
  limit?: number;
}): Promise<PlaceCard[]> {
  const radiusMeters = options.radiusMeters ?? 8047;
  const category = options.category ?? "all";
  const limit = options.limit ?? 24;
  const apiKey = process.env.OPENTRIPMAP_API_KEY;

  if (!apiKey) {
    return getSeedPlaces(radiusMeters, category).slice(0, limit);
  }

  const kinds =
    category === "all"
      ? "interesting_places,beaches,museums,foods,natural,parks"
      : CATEGORY_KINDS[category];

  const params = new URLSearchParams({
    radius: String(radiusMeters),
    lon: String(DESTINATION_COORDS.lng),
    lat: String(DESTINATION_COORDS.lat),
    kinds,
    rate: "1",
    format: "json",
    limit: String(limit),
    apikey: apiKey,
  });

  try {
    const res = await fetch(
      `https://api.opentripmap.com/0.1/en/places/radius?${params}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      return getSeedPlaces(radiusMeters, category).slice(0, limit);
    }

    const data = (await res.json()) as OpenTripMapRadiusItem[];
    const places = (data ?? [])
      .filter((item) => item.name && item.point)
      .map((item) => {
        const lat = item.point!.lat;
        const lng = item.point!.lon;
        return {
          id: item.xid,
          name: item.name,
          lat,
          lng,
          distanceKm:
            typeof item.dist === "number"
              ? item.dist / 1000
              : haversineKm(
                  DESTINATION_COORDS.lat,
                  DESTINATION_COORDS.lng,
                  lat,
                  lng
                ),
          category: categorizeKinds(item.kinds),
          rate: item.rate ?? null,
          kinds: item.kinds,
        } satisfies PlaceCard;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);

    if (!places.length) {
      return getSeedPlaces(radiusMeters, category).slice(0, limit);
    }

    return places;
  } catch {
    return getSeedPlaces(radiusMeters, category).slice(0, limit);
  }
}

export async function fetchPlaceDetail(
  xid: string
): Promise<PlaceDetail | null> {
  if (xid.startsWith("seed-")) {
    const seed = getSeedPlaces(100000).find((p) => p.id === xid);
    if (!seed) return null;

    const lodge = LODGES.find(
      (l) =>
        xid === `seed-${l.id}` ||
        xid === `seed-lodge-${l.city.toLowerCase()}` ||
        seed.name === l.name
    );

    return {
      ...seed,
      description: lodge
        ? `Family lodge for the Tampa trip — ${lodge.address}.`
        : `A local favorite near ${DESTINATION_COORDS.label}.`,
      imageUrl: null,
      address: lodge?.address ?? DESTINATION_COORDS.label,
      wikipediaExtract: null,
      wikipediaUrl: null,
      wikidata: null,
    };
  }

  const apiKey = process.env.OPENTRIPMAP_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const res = await fetch(
      `https://api.opentripmap.com/0.1/en/places/xid/${encodeURIComponent(xid)}?apikey=${apiKey}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;

    const data = (await res.json()) as OpenTripMapDetail;
    if (!data?.name || !data.point) return null;

    const addressParts = [
      data.address?.road,
      data.address?.city,
      data.address?.state,
    ].filter(Boolean);

    return {
      id: data.xid,
      name: data.name,
      lat: data.point.lat,
      lng: data.point.lon,
      distanceKm: haversineKm(
        DESTINATION_COORDS.lat,
        DESTINATION_COORDS.lng,
        data.point.lat,
        data.point.lon
      ),
      category: categorizeKinds(data.kinds),
      rate: data.rate ?? null,
      kinds: data.kinds,
      description: data.wikipedia_extracts?.text ?? null,
      imageUrl: data.preview?.source ?? data.image ?? null,
      address: addressParts.join(", ") || null,
      wikipediaExtract: data.wikipedia_extracts?.text ?? null,
      wikipediaUrl: data.wikipedia
        ? `https://en.wikipedia.org/wiki/${encodeURIComponent(
            data.wikipedia.replace(/^en:/, "")
          )}`
        : null,
      wikidata: data.wikidata ?? null,
    };
  } catch {
    return null;
  }
}
