"use client";

import { useEffect, useState } from "react";
import { Sun, Waves } from "lucide-react";
import type { CoastalConditions } from "@/lib/coastal";

interface CoastalConditionsCardProps {
  compact?: boolean;
  data?: CoastalConditions | null;
}

export function CoastalConditionsCard({
  compact = false,
  data: initial,
}: CoastalConditionsCardProps) {
  const [data, setData] = useState<CoastalConditions | null>(initial ?? null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (initial) return;
    let cancelled = false;

    fetch("/api/coastal")
      .then(async (res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((payload: CoastalConditions) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [initial]);

  if (failed) {
    return compact ? null : (
      <div className="card-surface rounded-3xl px-5 py-4 text-sm text-muted">
        Coastal conditions unavailable right now.
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className={`card-surface ${
          compact ? "rounded-2xl px-4 py-3" : "rounded-3xl px-5 py-6"
        } text-sm text-muted`}
      >
        Loading coastal conditions...
      </div>
    );
  }

  if (compact) {
    return (
      <div className="card-surface flex items-center gap-3 rounded-2xl px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Waves className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{data.beachDayLabel}</p>
          <p className="truncate text-xs text-muted">
            {data.nextHigh
              ? `High ${data.nextHigh.time}`
              : "Tides updating"}
            {data.waveHeightFt != null ? ` · Waves ${data.waveHeightFt} ft` : ""}
          </p>
        </div>
        {data.uvIndex != null && (
          <div className="text-right text-xs text-muted">
            <p className="flex items-center gap-1 justify-end">
              <Sun className="h-3 w-3" /> UV {data.uvIndex}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="card-surface overflow-hidden rounded-3xl">
      <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-5 py-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Coastal Conditions
        </p>
        <p className="mt-2 font-serif text-2xl font-semibold">
          {data.beachDayLabel}
        </p>
        <p className="mt-1 text-xs text-muted">
          Tides via {data.tideStation}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-left">
          <div className="rounded-2xl bg-surface/80 px-3 py-3">
            <p className="text-[10px] uppercase tracking-wide text-muted">
              Next high
            </p>
            <p className="mt-1 text-sm font-semibold">
              {data.nextHigh
                ? `${data.nextHigh.time} · ${data.nextHigh.heightFt.toFixed(1)} ft`
                : "—"}
            </p>
          </div>
          <div className="rounded-2xl bg-surface/80 px-3 py-3">
            <p className="text-[10px] uppercase tracking-wide text-muted">
              Next low
            </p>
            <p className="mt-1 text-sm font-semibold">
              {data.nextLow
                ? `${data.nextLow.time} · ${data.nextLow.heightFt.toFixed(1)} ft`
                : "—"}
            </p>
          </div>
          <div className="rounded-2xl bg-surface/80 px-3 py-3">
            <p className="text-[10px] uppercase tracking-wide text-muted">
              Wave height
            </p>
            <p className="mt-1 text-sm font-semibold">
              {data.waveHeightFt != null ? `${data.waveHeightFt} ft` : "—"}
            </p>
          </div>
          <div className="rounded-2xl bg-surface/80 px-3 py-3">
            <p className="text-[10px] uppercase tracking-wide text-muted">
              UV index
            </p>
            <p className="mt-1 text-sm font-semibold">
              {data.uvIndex != null ? data.uvIndex : "—"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CoastalWidget({ compact = false }: { compact?: boolean }) {
  return <CoastalConditionsCard compact={compact} />;
}
