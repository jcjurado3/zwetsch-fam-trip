export type FlightDirection = "inbound" | "outbound";

export interface TripFlight {
  id: string;
  itineraryId: string;
  label: string;
  direction: FlightDirection;
  airlineIata: string;
  flightNumber: string;
  flightIata: string;
  date: string;
  departureIata: string | null;
  arrivalIata: string | null;
  /** Local clock times used as planned placeholders, HH:mm */
  scheduledDepartureLocal: string | null;
  scheduledArrivalLocal: string | null;
}

export interface FlightStatus {
  id: string;
  itineraryId: string;
  label: string;
  direction: FlightDirection;
  flightIata: string;
  date: string;
  status: string;
  statusSource: "live" | "scheduled";
  departure: {
    airport: string | null;
    iata: string | null;
    scheduled: string | null;
    estimated: string | null;
    actual: string | null;
    delayMinutes: number | null;
    terminal: string | null;
    gate: string | null;
  };
  arrival: {
    airport: string | null;
    iata: string | null;
    scheduled: string | null;
    estimated: string | null;
    actual: string | null;
    delayMinutes: number | null;
    terminal: string | null;
    gate: string | null;
  };
  updatedAt: string;
  trackerUrl: string;
  unitedUrl: string;
  message: string | null;
}

/** Known trip flights for Zwetsch Tampa Edition */
export const TRIP_FLIGHTS: TripFlight[] = [
  {
    id: "flight-in",
    itineraryId: "it-1",
    label: "Fly In — UA 1010",
    direction: "inbound",
    airlineIata: "UA",
    flightNumber: "1010",
    flightIata: "UA1010",
    date: "2026-08-05",
    departureIata: null,
    arrivalIata: "TPA",
    scheduledDepartureLocal: "09:40",
    scheduledArrivalLocal: "15:14",
  },
  {
    id: "flight-out",
    itineraryId: "it-13",
    label: "Fly Out — UA 498",
    direction: "outbound",
    airlineIata: "UA",
    flightNumber: "498",
    flightIata: "UA498",
    date: "2026-08-11",
    departureIata: "TPA",
    arrivalIata: null,
    scheduledDepartureLocal: "16:16",
    scheduledArrivalLocal: "18:16",
  },
];

interface AviationstackFlight {
  flight_date?: string;
  flight_status?: string;
  departure?: {
    airport?: string | null;
    iata?: string | null;
    scheduled?: string | null;
    estimated?: string | null;
    actual?: string | null;
    delay?: number | null;
    terminal?: string | null;
    gate?: string | null;
  };
  arrival?: {
    airport?: string | null;
    iata?: string | null;
    scheduled?: string | null;
    estimated?: string | null;
    actual?: string | null;
    delay?: number | null;
    terminal?: string | null;
    gate?: string | null;
  };
  flight?: {
    iata?: string | null;
    number?: string | null;
  };
}

function flightAwareUrl(flight: TripFlight): string {
  // FlightAware search by airline + number + date
  return `https://www.flightaware.com/live/flight/${flight.airlineIata}${flight.flightNumber}`;
}

function unitedUrl(flight: TripFlight): string {
  return `https://www.united.com/en/us/flightstatus/details/${flight.airlineIata}${flight.flightNumber}/${flight.date.replaceAll("-", "")}/TPA`;
}

function scheduledFallback(
  flight: TripFlight,
  message: string | null
): FlightStatus {
  const isOutbound = flight.direction === "outbound";
  return {
    id: flight.id,
    itineraryId: flight.itineraryId,
    label: flight.label,
    direction: flight.direction,
    flightIata: flight.flightIata,
    date: flight.date,
    status: "scheduled",
    statusSource: "scheduled",
    departure: {
      airport: isOutbound ? "Tampa International Airport" : null,
      iata: flight.departureIata,
      scheduled: flight.scheduledDepartureLocal
        ? `${flight.date}T${flight.scheduledDepartureLocal}:00`
        : null,
      estimated: null,
      actual: null,
      delayMinutes: null,
      terminal: null,
      gate: null,
    },
    arrival: {
      airport: !isOutbound ? "Tampa International Airport" : null,
      iata: flight.arrivalIata,
      scheduled: flight.scheduledArrivalLocal
        ? `${flight.date}T${flight.scheduledArrivalLocal}:00`
        : null,
      estimated: null,
      actual: null,
      delayMinutes: null,
      terminal: null,
      gate: null,
    },
    updatedAt: new Date().toISOString(),
    trackerUrl: flightAwareUrl(flight),
    unitedUrl: unitedUrl(flight),
    message,
  };
}

function normalizeStatus(raw: string | undefined): string {
  return (raw ?? "scheduled").toLowerCase();
}

function pickMatchingFlight(
  data: AviationstackFlight[],
  tripFlight: TripFlight
): AviationstackFlight | null {
  if (!data.length) return null;

  // Never fall back to another day's UA1010/UA498 — those are different routes.
  const byDate = data.filter((f) => f.flight_date === tripFlight.date);
  if (!byDate.length) return null;

  if (tripFlight.arrivalIata) {
    const match = byDate.find(
      (f) => f.arrival?.iata?.toUpperCase() === tripFlight.arrivalIata
    );
    if (match) return match;
  }
  if (tripFlight.departureIata) {
    const match = byDate.find(
      (f) => f.departure?.iata?.toUpperCase() === tripFlight.departureIata
    );
    if (match) return match;
  }

  return byDate[0] ?? null;
}

function fromLive(
  tripFlight: TripFlight,
  live: AviationstackFlight
): FlightStatus {
  return {
    id: tripFlight.id,
    itineraryId: tripFlight.itineraryId,
    label: tripFlight.label,
    direction: tripFlight.direction,
    flightIata: tripFlight.flightIata,
    date: tripFlight.date,
    status: normalizeStatus(live.flight_status),
    statusSource: "live",
    departure: {
      airport: live.departure?.airport ?? null,
      iata: live.departure?.iata ?? tripFlight.departureIata,
      scheduled: live.departure?.scheduled ?? null,
      estimated: live.departure?.estimated ?? null,
      actual: live.departure?.actual ?? null,
      delayMinutes:
        typeof live.departure?.delay === "number" ? live.departure.delay : null,
      terminal: live.departure?.terminal ?? null,
      gate: live.departure?.gate ?? null,
    },
    arrival: {
      airport: live.arrival?.airport ?? null,
      iata: live.arrival?.iata ?? tripFlight.arrivalIata,
      scheduled: live.arrival?.scheduled ?? null,
      estimated: live.arrival?.estimated ?? null,
      actual: live.arrival?.actual ?? null,
      delayMinutes:
        typeof live.arrival?.delay === "number" ? live.arrival.delay : null,
      terminal: live.arrival?.terminal ?? null,
      gate: live.arrival?.gate ?? null,
    },
    updatedAt: new Date().toISOString(),
    trackerUrl: flightAwareUrl(tripFlight),
    unitedUrl: unitedUrl(tripFlight),
    message: null,
  };
}

async function fetchAviationstackFlight(
  tripFlight: TripFlight,
  accessKey: string
): Promise<FlightStatus> {
  const params = new URLSearchParams({
    access_key: accessKey,
    flight_iata: tripFlight.flightIata,
    // Always look up the trip date — never default to "today"
    flight_date: tripFlight.date,
    limit: "10",
  });

  if (tripFlight.arrivalIata) {
    params.set("arr_iata", tripFlight.arrivalIata);
  }
  if (tripFlight.departureIata) {
    params.set("dep_iata", tripFlight.departureIata);
  }

  // Free plan: HTTP only. Paid: HTTPS. Prefer HTTP first so free keys succeed.
  const urls = [
    `http://api.aviationstack.com/v1/flights?${params}`,
    `https://api.aviationstack.com/v1/flights?${params}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 21600 }, // 6h — spare free-tier quota
        redirect: "manual", // avoid HTTP→HTTPS upgrade killing free-plan calls
      });

      const json = (await res.json().catch(() => null)) as {
        data?: AviationstackFlight[];
        error?: { message?: string; code?: string | number };
      } | null;

      if (!res.ok || !json) continue;

      if (json.error?.message) {
        // Free HTTPS restriction → try next URL; other plan/date limits → quiet schedule
        if (
          String(json.error.code) === "https_access_restricted" ||
          /https/i.test(json.error.message)
        ) {
          continue;
        }
        return scheduledFallback(tripFlight, null);
      }

      const match = pickMatchingFlight(json.data ?? [], tripFlight);
      if (!match) continue;

      return fromLive(tripFlight, match);
    } catch {
      // network / redirect blocked — try next URL
    }
  }

  // Quiet planned card — don't surface HTTP 403 / plan errors to the family
  return scheduledFallback(tripFlight, null);
}

export function getTripFlightByItineraryId(
  itineraryId: string
): TripFlight | undefined {
  return TRIP_FLIGHTS.find((f) => f.itineraryId === itineraryId);
}

export async function fetchTripFlightStatuses(
  flightIata?: string
): Promise<FlightStatus[]> {
  const accessKey = process.env.AVIATIONSTACK_API_KEY?.trim();
  const flights = flightIata
    ? TRIP_FLIGHTS.filter(
        (f) => f.flightIata.toUpperCase() === flightIata.toUpperCase()
      )
    : TRIP_FLIGHTS;

  if (!flights.length) return [];

  if (!accessKey) {
    return flights.map((f) =>
      scheduledFallback(
        f,
        "Add AVIATIONSTACK_API_KEY to .env.local for live status."
      )
    );
  }

  return Promise.all(
    flights.map((flight) => fetchAviationstackFlight(flight, accessKey))
  );
}

export function formatFlightClock(isoLike: string | null): string | null {
  if (!isoLike) return null;
  // Accept "2026-08-11T16:16:00" or "2026-08-11T16:16:00+00:00"
  const date = new Date(isoLike);
  if (Number.isNaN(date.getTime())) {
    const timePart = isoLike.includes("T") ? isoLike.split("T")[1] : isoLike;
    const match = timePart.match(/^(\d{1,2}):(\d{2})/);
    if (!match) return null;
    const hour = Number(match[1]);
    const minute = match[2];
    const period = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${minute} ${period}`;
  }
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatFlightStatusLabel(status: string): string {
  const map: Record<string, string> = {
    scheduled: "Scheduled",
    active: "In the air",
    landed: "Landed",
    cancelled: "Cancelled",
    incident: "Incident",
    diverted: "Diverted",
    delayed: "Delayed",
  };
  return map[status] ?? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
