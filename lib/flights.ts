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
  scheduledLocalTime: string | null;
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
    scheduledLocalTime: null,
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
    scheduledLocalTime: "16:16",
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
      scheduled: flight.scheduledLocalTime
        ? `${flight.date}T${flight.scheduledLocalTime}:00`
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
      scheduled: null,
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

  const byDate = data.filter((f) => f.flight_date === tripFlight.date);
  const pool = byDate.length ? byDate : data;

  if (tripFlight.arrivalIata) {
    const match = pool.find(
      (f) => f.arrival?.iata?.toUpperCase() === tripFlight.arrivalIata
    );
    if (match) return match;
  }
  if (tripFlight.departureIata) {
    const match = pool.find(
      (f) => f.departure?.iata?.toUpperCase() === tripFlight.departureIata
    );
    if (match) return match;
  }

  return pool[0] ?? null;
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
    date: live.flight_date ?? tripFlight.date,
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
    limit: "10",
  });

  // Free plan historically required HTTP; HTTPS works on paid — try HTTPS first.
  const urls = [
    `https://api.aviationstack.com/v1/flights?${params}`,
    `http://api.aviationstack.com/v1/flights?${params}`,
  ];

  let lastError: string | null = null;

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 21600 }, // 6h — spare free-tier quota
      });

      if (!res.ok) {
        lastError = `Aviationstack HTTP ${res.status}`;
        continue;
      }

      const json = (await res.json()) as {
        data?: AviationstackFlight[];
        error?: { message?: string; code?: number };
      };

      if (json.error?.message) {
        lastError = json.error.message;
        // Free plan HTTPS rejection → try HTTP next
        continue;
      }

      const match = pickMatchingFlight(json.data ?? [], tripFlight);
      if (!match) {
        return scheduledFallback(
          tripFlight,
          "Live status isn’t published yet — check closer to departure day."
        );
      }

      return fromLive(tripFlight, match);
    } catch {
      lastError = "Network error reaching Aviationstack";
    }
  }

  return scheduledFallback(
    tripFlight,
    lastError
      ? `Couldn’t refresh live status (${lastError}). Showing trip schedule.`
      : "Couldn’t refresh live status. Showing trip schedule."
  );
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
