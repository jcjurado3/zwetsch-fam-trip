"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Clock, MapPin } from "lucide-react";
import type { ItineraryItem } from "@/lib/types";
import { formatTime, groupByDay } from "@/lib/utils";
import { seedTrip } from "@/lib/seed-data";

export const TRIP_DAYS = (() => {
  const days: string[] = [];
  const start = new Date(`${seedTrip.start_date}T12:00:00`);
  const end = new Date(`${seedTrip.end_date}T12:00:00`);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
})();

interface ItineraryCalendarProps {
  items: ItineraryItem[];
}

export function ItineraryCalendar({ items }: ItineraryCalendarProps) {
  const grouped = useMemo(() => groupByDay(items), [items]);
  const [selectedDay, setSelectedDay] = useState(
    TRIP_DAYS.find((day) => (grouped[day]?.length ?? 0) > 0) ?? TRIP_DAYS[0]
  );

  const dayItems = (grouped[selectedDay] ?? []).slice().sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    if (b.time) return 1;
    return a.sort_order - b.sort_order;
  });

  return (
    <div className="space-y-4">
      <div className="scroll-x-touch -mx-1 px-1 pb-1">
        {TRIP_DAYS.map((day) => {
          const date = new Date(`${day}T12:00:00`);
          const count = grouped[day]?.length ?? 0;
          const active = day === selectedDay;
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`flex min-w-[4.5rem] shrink-0 flex-col items-center rounded-2xl border px-3 py-2.5 transition-colors ${
                active
                  ? "border-primary bg-primary text-white"
                  : "border-surface-border bg-surface text-foreground"
              }`}
            >
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  active ? "text-white/80" : "text-muted"
                }`}
              >
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span className="mt-0.5 font-serif text-xl font-semibold leading-none">
                {date.getDate()}
              </span>
              <span
                className={`mt-1 text-[10px] font-medium ${
                  active ? "text-white/80" : "text-muted"
                }`}
              >
                {count} stop{count !== 1 ? "s" : ""}
              </span>
            </button>
          );
        })}
      </div>

      <div className="card-surface overflow-hidden rounded-3xl">
        <div className="border-b border-surface-border px-5 py-3">
          <h3 className="font-serif text-lg font-semibold">
            {new Date(`${selectedDay}T12:00:00`).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h3>
          <p className="text-xs text-muted">
            {dayItems.length
              ? "Timeline for this day"
              : "Nothing planned — add a stop below"}
          </p>
        </div>

        {dayItems.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted">
            No plans yet for this day.
          </div>
        ) : (
          <ol className="relative space-y-0 px-5 py-4">
            {dayItems.map((item, index) => (
              <li key={item.id} className="relative flex gap-3 pb-5 last:pb-1">
                {index < dayItems.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-[11px] top-7 w-px bg-surface-border"
                  />
                )}
                <span
                  className={`relative z-[1] mt-1 h-6 w-6 shrink-0 rounded-full border-2 ${
                    item.visited
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-primary bg-primary/20"
                  }`}
                />
                {String(item.id).startsWith("local-it-") ? (
                  <div className="min-w-0 flex-1 rounded-2xl border border-surface-border bg-background/50 px-3.5 py-3">
                    {item.time && (
                      <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-primary">
                        <Clock className="h-3 w-3" />
                        {formatTime(item.time)}
                      </p>
                    )}
                    <p
                      className={`font-medium ${
                        item.visited ? "text-muted line-through" : ""
                      }`}
                    >
                      {item.title}
                    </p>
                    {item.location && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <Link
                    href={`/itinerary/${item.id}`}
                    className="min-w-0 flex-1 rounded-2xl border border-surface-border bg-background/50 px-3.5 py-3 transition-transform active:scale-[0.99]"
                  >
                    {item.time && (
                      <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-primary">
                        <Clock className="h-3 w-3" />
                        {formatTime(item.time)}
                      </p>
                    )}
                    <p
                      className={`font-medium ${
                        item.visited ? "text-muted line-through" : ""
                      }`}
                    >
                      {item.title}
                    </p>
                    {item.location && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </p>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
