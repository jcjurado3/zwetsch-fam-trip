"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarPlus, Loader2, X } from "lucide-react";
import { MealRequestForm } from "./MealRequestForm";
import type { MealRequest } from "@/lib/types";
import { formatDayLabel } from "@/lib/utils";
import { mealToneClass } from "@/lib/item-tones";

const mealLabels: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

const tripDays = [
  { value: "2026-08-05", label: "Wed, Aug 5" },
  { value: "2026-08-06", label: "Thu, Aug 6" },
  { value: "2026-08-07", label: "Fri, Aug 7" },
  { value: "2026-08-08", label: "Sat, Aug 8" },
  { value: "2026-08-09", label: "Sun, Aug 9" },
  { value: "2026-08-10", label: "Mon, Aug 10" },
  { value: "2026-08-11", label: "Tue, Aug 11" },
];

interface MealRequestSectionProps {
  onPlanChanged?: () => void;
}

function MealRequestList({
  refreshKey,
  onPlanChanged,
}: {
  refreshKey: number;
  onPlanChanged?: () => void;
}) {
  const [requests, setRequests] = useState<MealRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dayPicks, setDayPicks] = useState<Record<string, string>>({});

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/menu/requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch {
      // keep empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests, refreshKey]);

  async function promote(request: MealRequest, dayDate?: string) {
    setBusyId(request.id);
    setError(null);
    try {
      const res = await fetch("/api/menu/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: request.id,
          action: "promote",
          dayDate: dayDate || request.day_date,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Could not add to plan");
      }
      await fetchRequests();
      onPlanChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add to plan");
    } finally {
      setBusyId(null);
    }
  }

  async function decline(request: MealRequest) {
    setBusyId(request.id);
    setError(null);
    try {
      const res = await fetch("/api/menu/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: request.id, action: "decline" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Could not decline request");
      }
      await fetchRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not decline");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <p className="text-center text-sm text-muted">Loading requests...</p>
    );
  }

  if (!requests.length) {
    return (
      <div className="card-surface rounded-3xl px-5 py-6 text-center">
        <p className="text-sm text-muted">No meal requests yet.</p>
      </div>
    );
  }

  const pending = requests.filter((r) => r.status === "pending");
  const resolved = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {pending.length > 0 && (
        <div className="space-y-2">
          {pending.map((request) => {
            const tone = mealToneClass(request.meal_type);
            return (
            <div
              key={request.id}
              className={`tone-item card-surface rounded-2xl border px-4 py-3 ${tone}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{request.title}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className={`tone-chip ${tone}`}>
                      {mealLabels[request.meal_type] ?? request.meal_type}
                    </span>
                    <span className="text-xs text-muted">
                      {request.day_date
                        ? formatDayLabel(request.day_date)
                        : "No day yet"}
                      {" · "}
                      {request.requester_name}
                    </span>
                  </div>
                  {request.notes && (
                    <p className="mt-1 text-sm text-muted">{request.notes}</p>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  pending
                </span>
              </div>

              {!request.day_date && (
                <select
                  value={dayPicks[request.id] ?? ""}
                  className="mt-3 w-full rounded-2xl border border-surface-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  onChange={(e) =>
                    setDayPicks((prev) => ({
                      ...prev,
                      [request.id]: e.target.value,
                    }))
                  }
                >
                  <option value="" disabled>
                    Choose a day to plan…
                  </option>
                  {tripDays.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={busyId === request.id}
                  onClick={() => {
                    const picked = request.day_date || dayPicks[request.id];
                    if (!picked) {
                      setError("Choose a day before adding to the plan");
                      return;
                    }
                    promote(request, picked);
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-primary py-2.5 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {busyId === request.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CalendarPlus className="h-3.5 w-3.5" />
                  )}
                  Add to plan
                </button>
                <button
                  type="button"
                  disabled={busyId === request.id}
                  onClick={() => decline(request)}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-surface-border text-muted disabled:opacity-60"
                  aria-label="Decline request"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {resolved.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Resolved
          </p>
          {resolved.map((request) => {
            const tone = mealToneClass(request.meal_type);
            return (
            <div
              key={request.id}
              className={`tone-item card-surface rounded-2xl border px-4 py-3 opacity-90 ${tone}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{request.title}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className={`tone-chip ${tone}`}>
                      {mealLabels[request.meal_type] ?? request.meal_type}
                    </span>
                    <span className="text-xs text-muted">
                      {request.day_date
                        ? formatDayLabel(request.day_date)
                        : ""}
                      {request.day_date ? " · " : ""}
                      {request.requester_name}
                    </span>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                    request.status === "approved"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/15 text-red-500"
                  }`}
                >
                  {request.status === "approved" ? "planned" : request.status}
                </span>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MealRequestSection({ onPlanChanged }: MealRequestSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <section className="space-y-4">
      <MealRequestForm onSubmitted={() => setRefreshKey((k) => k + 1)} />
      <div>
        <h2 className="mb-3 font-serif text-lg font-semibold">
          Family Requests
        </h2>
        <MealRequestList
          refreshKey={refreshKey}
          onPlanChanged={onPlanChanged}
        />
      </div>
    </section>
  );
}
