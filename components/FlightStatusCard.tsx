"use client";

import type { ReactNode } from "react";
import { ExternalLink, Plane, PlaneLanding, PlaneTakeoff } from "lucide-react";
import type { FlightStatus } from "@/lib/flights";
import {
  formatFlightClock,
  formatFlightStatusLabel,
} from "@/lib/flights";

function statusTone(status: string): string {
  switch (status) {
    case "active":
      return "bg-sky-500/15 text-sky-700 dark:text-sky-300";
    case "landed":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
    case "cancelled":
    case "diverted":
    case "incident":
      return "bg-rose-500/15 text-rose-700 dark:text-rose-300";
    case "delayed":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
    default:
      return "bg-primary/10 text-primary";
  }
}

function EndpointRow({
  icon,
  title,
  airport,
  iata,
  time,
  delayMinutes,
  terminal,
  gate,
}: {
  icon: ReactNode;
  title: string;
  airport: string | null;
  iata: string | null;
  time: string | null;
  delayMinutes: number | null;
  terminal: string | null;
  gate: string | null;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          {title}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-foreground">
          {airport ?? iata ?? "—"}
          {airport && iata ? (
            <span className="ml-1.5 font-normal text-muted">({iata})</span>
          ) : null}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {time ?? "Time TBD"}
          {delayMinutes != null && delayMinutes > 0
            ? ` · +${delayMinutes} min delay`
            : ""}
          {terminal ? ` · Term ${terminal}` : ""}
          {gate ? ` · Gate ${gate}` : ""}
        </p>
      </div>
    </div>
  );
}

interface FlightStatusCardProps {
  flights: FlightStatus[];
  compact?: boolean;
}

export function FlightStatusCard({
  flights,
  compact = false,
}: FlightStatusCardProps) {
  if (!flights.length) return null;

  if (compact && flights.length === 1) {
    const flight = flights[0];
    const time =
      formatFlightClock(flight.departure.estimated) ??
      formatFlightClock(flight.departure.scheduled) ??
      formatFlightClock(flight.arrival.estimated) ??
      formatFlightClock(flight.arrival.scheduled);

    return (
      <div className="card-surface rounded-2xl px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Plane className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">{flight.flightIata}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusTone(flight.status)}`}
              >
                {formatFlightStatusLabel(flight.status)}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted">
              {flight.label}
              {time ? ` · ${time}` : ""}
            </p>
          </div>
          <a
            href={flight.trackerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary"
            aria-label="Open FlightAware"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <section className="card-surface rounded-3xl p-5">
      <div className="flex items-center gap-2">
        <Plane className="h-5 w-5 text-primary" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Flights
          </p>
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Trip flight status
          </h2>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {flights.map((flight) => {
          const depTime =
            formatFlightClock(flight.departure.actual) ??
            formatFlightClock(flight.departure.estimated) ??
            formatFlightClock(flight.departure.scheduled);
          const arrTime =
            formatFlightClock(flight.arrival.actual) ??
            formatFlightClock(flight.arrival.estimated) ??
            formatFlightClock(flight.arrival.scheduled);

          return (
            <article
              key={flight.id}
              className="rounded-2xl border border-surface-border bg-surface-solid/60 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {flight.flightIata}
                    <span className="ml-2 font-normal text-muted">
                      {flight.label}
                    </span>
                  </p>
                  <p className="text-xs text-muted">{flight.date}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusTone(flight.status)}`}
                >
                  {formatFlightStatusLabel(flight.status)}
                  {flight.statusSource === "scheduled" ? " · planned" : ""}
                </span>
              </div>

              <div className="mt-3 space-y-3">
                <EndpointRow
                  icon={<PlaneTakeoff className="h-4 w-4" />}
                  title="Departure"
                  airport={flight.departure.airport}
                  iata={flight.departure.iata}
                  time={depTime}
                  delayMinutes={flight.departure.delayMinutes}
                  terminal={flight.departure.terminal}
                  gate={flight.departure.gate}
                />
                <EndpointRow
                  icon={<PlaneLanding className="h-4 w-4" />}
                  title="Arrival"
                  airport={flight.arrival.airport}
                  iata={flight.arrival.iata}
                  time={arrTime}
                  delayMinutes={flight.arrival.delayMinutes}
                  terminal={flight.arrival.terminal}
                  gate={flight.arrival.gate}
                />
              </div>

              {flight.message && (
                <p className="mt-3 text-xs text-muted">{flight.message}</p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={flight.trackerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-hover"
                >
                  FlightAware
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <a
                  href={flight.unitedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-surface-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-primary/5"
                >
                  United status
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
