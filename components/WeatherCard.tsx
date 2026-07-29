"use client";

import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Sun,
  Wind,
} from "lucide-react";
import type { WeatherSnapshot } from "@/lib/weather";
import { getWeatherIconKey, getWeatherLabel } from "@/lib/weather";

function WeatherIcon({
  code,
  className = "h-8 w-8",
}: {
  code: number;
  className?: string;
}) {
  const key = getWeatherIconKey(code);
  const props = { className };

  switch (key) {
    case "sun":
      return <Sun {...props} />;
    case "cloud-sun":
      return <CloudSun {...props} />;
    case "cloud":
      return <Cloud {...props} />;
    case "fog":
      return <CloudFog {...props} />;
    case "drizzle":
    case "rain":
      return <CloudRain {...props} />;
    case "snow":
      return <CloudSnow {...props} />;
    case "storm":
      return <CloudLightning {...props} />;
    default:
      return <Cloud {...props} />;
  }
}

function formatShortDay(dateStr: string) {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

interface WeatherCardProps {
  weather: WeatherSnapshot;
  compact?: boolean;
}

export function WeatherCard({ weather, compact = false }: WeatherCardProps) {
  if (compact) {
    return (
      <div className="card-surface flex items-center gap-3 rounded-2xl px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <WeatherIcon code={weather.weatherCode} className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {weather.temperature}°F · {getWeatherLabel(weather.weatherCode)}
          </p>
          <p className="truncate text-xs text-muted">{weather.location}</p>
        </div>
        <div className="text-right text-xs text-muted">
          <p>Feels {weather.feelsLike}°</p>
          <p>{weather.windSpeed} mph</p>
        </div>
      </div>
    );
  }

  const tripDays = weather.daily.slice(0, 4);

  return (
    <section className="card-surface overflow-hidden rounded-3xl">
      <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-5 py-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Live Weather
        </p>
        <div className="mt-3 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-primary shadow-sm">
            <WeatherIcon code={weather.weatherCode} className="h-8 w-8" />
          </div>
          <div>
            <p className="font-serif text-4xl font-semibold tracking-tight">
              {weather.temperature}°
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {getWeatherLabel(weather.weatherCode)}
            </p>
            <p className="mt-0.5 text-xs text-muted">{weather.location}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-surface/80 px-3 py-2">
            <p className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wide text-muted">
              <Droplets className="h-3 w-3" /> Humidity
            </p>
            <p className="mt-1 text-sm font-semibold">{weather.humidity}%</p>
          </div>
          <div className="rounded-2xl bg-surface/80 px-3 py-2">
            <p className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wide text-muted">
              <Wind className="h-3 w-3" /> Wind
            </p>
            <p className="mt-1 text-sm font-semibold">{weather.windSpeed} mph</p>
          </div>
          <div className="rounded-2xl bg-surface/80 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-muted">
              Feels like
            </p>
            <p className="mt-1 text-sm font-semibold">{weather.feelsLike}°</p>
          </div>
        </div>
      </div>

      {tripDays.length > 0 && (
        <div className="border-t border-surface-border px-5 py-4 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            Forecast
          </p>
          <div className="grid grid-cols-4 gap-2">
            {tripDays.map((day) => (
              <div
                key={day.date}
                className="flex flex-col items-center rounded-2xl bg-background/70 px-2 py-3 text-center"
              >
                <span className="text-[10px] font-medium text-muted">
                  {formatShortDay(day.date)}
                </span>
                <WeatherIcon
                  code={day.weatherCode}
                  className="my-2 h-4 w-4 text-primary"
                />
                <span className="text-xs font-semibold">
                  {day.tempMax}°
                </span>
                <span className="text-[10px] text-muted">{day.tempMin}°</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
