"use client";

import { useEffect, useState } from "react";
import { WeatherCard } from "@/components/WeatherCard";
import type { WeatherSnapshot } from "@/lib/weather";

interface WeatherWidgetProps {
  compact?: boolean;
}

export function WeatherWidget({ compact = false }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/weather")
      .then(async (res) => {
        if (!res.ok) throw new Error("weather failed");
        return res.json();
      })
      .then((data: WeatherSnapshot) => {
        if (!cancelled) setWeather(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) {
    return compact ? null : (
      <div className="card-surface rounded-3xl px-5 py-4 text-sm text-muted">
        Weather unavailable right now.
      </div>
    );
  }

  if (!weather) {
    return (
      <div
        className={`card-surface ${
          compact ? "rounded-2xl px-4 py-3" : "rounded-3xl px-5 py-6"
        } text-sm text-muted`}
      >
        Loading weather...
      </div>
    );
  }

  return <WeatherCard weather={weather} compact={compact} />;
}
