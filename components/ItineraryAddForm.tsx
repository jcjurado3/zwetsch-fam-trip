"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { ExpandableFormShell } from "@/components/ExpandableFormShell";
import { TRIP_DAYS } from "@/components/ItineraryCalendar";
import { SEED_TRIP_ID } from "@/lib/seed-data";
import type { ItineraryItem } from "@/lib/types";

interface ItineraryAddFormProps {
  onCreated: (item: ItineraryItem) => void;
}

export function ItineraryAddForm({ onCreated }: ItineraryAddFormProps) {
  const [title, setTitle] = useState("");
  const [dayDate, setDayDate] = useState(TRIP_DAYS[0] ?? "");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dayDate) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: SEED_TRIP_ID,
          title: title.trim(),
          dayDate,
          time: time || null,
          location: location.trim() || null,
          description: description.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not add stop");
      }

      onCreated(data as ItineraryItem);
      setTitle("");
      setTime("");
      setLocation("");
      setDescription("");
      setDayDate(TRIP_DAYS[0] ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add stop");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ExpandableFormShell label="Add a stop">
      <form onSubmit={handleSubmit}>
        <p className="text-sm text-muted">
          Add something to the trip plan — it shows up in list and calendar
        </p>

        <div className="mt-4 space-y-3">
          <input
            type="text"
            required
            placeholder="What are we doing?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-2xl border border-surface-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            disabled={submitting}
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              required
              value={dayDate}
              onChange={(e) => setDayDate(e.target.value)}
              className="w-full rounded-2xl border border-surface-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              disabled={submitting}
            >
              {TRIP_DAYS.map((day) => {
                const date = new Date(`${day}T12:00:00`);
                return (
                  <option key={day} value={day}>
                    {date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </option>
                );
              })}
            </select>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-2xl border border-surface-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              disabled={submitting}
            />
          </div>

          <input
            type="text"
            placeholder="Location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-2xl border border-surface-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            disabled={submitting}
          />

          <input
            type="text"
            placeholder="Notes (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-2xl border border-surface-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            disabled={submitting}
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add to itinerary
            </>
          )}
        </button>
      </form>
    </ExpandableFormShell>
  );
}
