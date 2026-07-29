"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import type { MealType } from "@/lib/types";
import { SEED_TRIP_ID } from "@/lib/seed-data";
import { ExpandableFormShell } from "@/components/ExpandableFormShell";

const mealTypes: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

const tripDays = [
  { value: "2026-08-05", label: "Wed, Aug 5" },
  { value: "2026-08-06", label: "Thu, Aug 6" },
  { value: "2026-08-07", label: "Fri, Aug 7" },
  { value: "2026-08-08", label: "Sat, Aug 8" },
  { value: "2026-08-09", label: "Sun, Aug 9" },
  { value: "2026-08-10", label: "Mon, Aug 10" },
  { value: "2026-08-11", label: "Tue, Aug 11" },
];

interface MealRequestFormProps {
  onSubmitted?: () => void;
}

export function MealRequestForm({ onSubmitted }: MealRequestFormProps) {
  const [requesterName, setRequesterName] = useState("");
  const [mealType, setMealType] = useState<MealType>("dinner");
  const [dayDate, setDayDate] = useState("2026-08-05");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/menu/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: SEED_TRIP_ID,
          requesterName,
          mealType,
          dayDate: dayDate || null,
          title,
          notes: notes || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Could not submit request");
      }

      setTitle("");
      setNotes("");
      setSuccess(true);
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ExpandableFormShell label="Request a Meal">
      <form onSubmit={handleSubmit}>
        <p className="text-sm text-muted">
          Suggest something you want cooked or ordered this trip
        </p>

        <div className="mt-4 space-y-3">
          <input
            type="text"
            required
            placeholder="Your name"
            value={requesterName}
            onChange={(e) => setRequesterName(e.target.value)}
            className="w-full rounded-2xl border border-surface-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            disabled={submitting}
          />

          <input
            type="text"
            required
            placeholder="Meal idea (e.g. shrimp tacos)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-2xl border border-surface-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            disabled={submitting}
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType)}
              className="w-full rounded-2xl border border-surface-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              disabled={submitting}
            >
              {mealTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <select
              value={dayDate}
              onChange={(e) => setDayDate(e.target.value)}
              className="w-full rounded-2xl border border-surface-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              disabled={submitting}
            >
              {tripDays.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <textarea
            placeholder="Notes (allergies, preferences, restaurant name…)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-2xl border border-surface-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            disabled={submitting}
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        {success && (
          <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
            Request sent! We’ll add it to the plan.
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit request
            </>
          )}
        </button>
      </form>
    </ExpandableFormShell>
  );
}
