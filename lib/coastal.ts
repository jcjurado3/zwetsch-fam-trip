/** NOAA CO-OPS station for Clearwater Beach / Tampa Bay */
export const NOAA_TIDE_STATION = {
  id: "8726724",
  name: "Clearwater Beach, FL",
} as const;

export interface TideEvent {
  time: string;
  type: "H" | "L";
  heightFt: number;
}

export interface CoastalConditions {
  location: string;
  tideStation: string;
  nextHigh: TideEvent | null;
  nextLow: TideEvent | null;
  upcomingTides: TideEvent[];
  waveHeightFt: number | null;
  swellHeightFt: number | null;
  wavePeriodSec: number | null;
  uvIndex: number | null;
  beachDayLabel: string;
  updatedAt: string;
}

function formatTideTime(isoLike: string): string {
  // NOAA returns "2026-07-28 15:36"
  const date = new Date(isoLike.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return isoLike;
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function beachLabel(uv: number | null, waveFt: number | null): string {
  if (uv != null && uv >= 8) return "High UV — pack sunscreen";
  if (waveFt != null && waveFt >= 4) return "Choppy surf — watch conditions";
  if (uv != null && uv <= 3 && (waveFt == null || waveFt < 2))
    return "Calm beach day";
  if (waveFt != null && waveFt < 2) return "Good for swimming";
  return "Solid beach day";
}

async function fetchTides(): Promise<TideEvent[]> {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + 1);

  const begin = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const endStr = `${end.getFullYear()}${String(end.getMonth() + 1).padStart(2, "0")}${String(end.getDate()).padStart(2, "0")}`;

  const params = new URLSearchParams({
    product: "predictions",
    application: "zwetsch-fam-trip",
    begin_date: begin,
    end_date: endStr,
    datum: "MLLW",
    station: NOAA_TIDE_STATION.id,
    time_zone: "lst_ldt",
    units: "english",
    interval: "hilo",
    format: "json",
  });

  const res = await fetch(
    `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?${params}`,
    { next: { revalidate: 1800 } }
  );
  if (!res.ok) return [];

  const data = await res.json();
  const predictions = (data?.predictions ?? []) as {
    t: string;
    v: string;
    type: "H" | "L";
  }[];

  return predictions.map((p) => ({
    time: p.t,
    type: p.type,
    heightFt: Number.parseFloat(p.v),
  }));
}

async function fetchMarine(
  lat: number,
  lng: number
): Promise<{
  waveHeightFt: number | null;
  swellHeightFt: number | null;
  wavePeriodSec: number | null;
}> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: "wave_height,wave_period,swell_wave_height",
    length_unit: "imperial",
    timezone: "America/New_York",
  });

  const res = await fetch(
    `https://marine-api.open-meteo.com/v1/marine?${params}`,
    { next: { revalidate: 1800 } }
  );
  if (!res.ok) {
    return { waveHeightFt: null, swellHeightFt: null, wavePeriodSec: null };
  }

  const data = await res.json();
  const current = data?.current;
  return {
    waveHeightFt:
      typeof current?.wave_height === "number"
        ? Math.round(current.wave_height * 10) / 10
        : null,
    swellHeightFt:
      typeof current?.swell_wave_height === "number"
        ? Math.round(current.swell_wave_height * 10) / 10
        : null,
    wavePeriodSec:
      typeof current?.wave_period === "number"
        ? Math.round(current.wave_period)
        : null,
  };
}

async function fetchUv(lat: number, lng: number): Promise<number | null> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    daily: "uv_index_max",
    forecast_days: "1",
    timezone: "America/New_York",
  });

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    { next: { revalidate: 1800 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const value = data?.daily?.uv_index_max?.[0];
  return typeof value === "number" ? Math.round(value * 10) / 10 : null;
}

export async function fetchCoastalConditions(
  lat = 27.9506,
  lng = -82.4572
): Promise<CoastalConditions | null> {
  try {
    const [tides, marine, uvIndex] = await Promise.all([
      fetchTides(),
      fetchMarine(lat, lng),
      fetchUv(lat, lng),
    ]);

    const now = Date.now();
    const upcoming = tides.filter((t) => {
      const ts = new Date(t.time.replace(" ", "T")).getTime();
      return !Number.isNaN(ts) && ts >= now - 30 * 60 * 1000;
    });

    const nextHigh = upcoming.find((t) => t.type === "H") ?? null;
    const nextLow = upcoming.find((t) => t.type === "L") ?? null;

    return {
      location: "Tampa / Clearwater, FL",
      tideStation: NOAA_TIDE_STATION.name,
      nextHigh: nextHigh
        ? { ...nextHigh, time: formatTideTime(nextHigh.time) }
        : null,
      nextLow: nextLow
        ? { ...nextLow, time: formatTideTime(nextLow.time) }
        : null,
      upcomingTides: upcoming.slice(0, 4).map((t) => ({
        ...t,
        time: formatTideTime(t.time),
      })),
      waveHeightFt: marine.waveHeightFt,
      swellHeightFt: marine.swellHeightFt,
      wavePeriodSec: marine.wavePeriodSec,
      uvIndex,
      beachDayLabel: beachLabel(uvIndex, marine.waveHeightFt),
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
