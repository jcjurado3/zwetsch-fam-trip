"use client";

import { useEffect, useState } from "react";
import { FlightStatusCard } from "@/components/FlightStatusCard";
import type { FlightStatus } from "@/lib/flights";

interface FlightStatusWidgetProps {
  compact?: boolean;
  /** Filter to a single flight IATA, e.g. UA1010 */
  flightIata?: string;
  /** Filter by itinerary item id */
  itineraryId?: string;
}

export function FlightStatusWidget({
  compact = false,
  flightIata,
  itineraryId,
}: FlightStatusWidgetProps) {
  const [flights, setFlights] = useState<FlightStatus[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (flightIata) params.set("flight", flightIata);

    fetch(`/api/flights${params.toString() ? `?${params}` : ""}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("flights failed");
        return res.json();
      })
      .then((data: FlightStatus[]) => {
        if (cancelled) return;
        const filtered = itineraryId
          ? data.filter((f) => f.itineraryId === itineraryId)
          : data;
        setFlights(filtered);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [flightIata, itineraryId]);

  if (failed) {
    return compact ? null : (
      <div className="card-surface rounded-3xl px-5 py-4 text-sm text-muted">
        Flight status unavailable right now.
      </div>
    );
  }

  if (!flights) {
    return (
      <div
        className={`card-surface ${
          compact ? "rounded-2xl px-4 py-3" : "rounded-3xl px-5 py-6"
        } text-sm text-muted`}
      >
        Loading flights...
      </div>
    );
  }

  if (!flights.length) return null;

  return <FlightStatusCard flights={flights} compact={compact} />;
}
