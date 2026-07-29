import { DESTINATION_COORDS } from "./seed-data";

export interface DayForecast {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
  windSpeedMax: number;
}

export interface WeatherSnapshot {
  location: string;
  temperature: number;
  feelsLike: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  precipitationProbability: number;
  updatedAt: string;
  daily: DayForecast[];
}

interface OpenMeteoResponse {
  current?: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    precipitation_probability?: number;
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
  };
}

const WEATHER_LABELS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Icy fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Light showers",
  81: "Showers",
  82: "Heavy showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Severe thunderstorm",
};

export function getWeatherLabel(code: number): string {
  return WEATHER_LABELS[code] ?? "Unknown";
}

export function getWeatherIconKey(
  code: number
): "sun" | "cloud-sun" | "cloud" | "fog" | "drizzle" | "rain" | "snow" | "storm" {
  if (code === 0) return "sun";
  if (code === 1 || code === 2) return "cloud-sun";
  if (code === 3) return "cloud";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 55) return "drizzle";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 95) return "storm";
  return "cloud";
}

export async function fetchDestinationWeather(
  lat = DESTINATION_COORDS.lat,
  lng = DESTINATION_COORDS.lng
): Promise<WeatherSnapshot | null> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    timezone: "America/New_York",
    forecast_days: "7",
  });

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
      { next: { revalidate: 1800 } }
    );

    if (!res.ok) return null;

    const data = (await res.json()) as OpenMeteoResponse;
    if (!data.current || !data.daily) return null;

    const daily: DayForecast[] = data.daily.time.map((date, i) => ({
      date,
      weatherCode: data.daily!.weather_code[i],
      tempMax: Math.round(data.daily!.temperature_2m_max[i]),
      tempMin: Math.round(data.daily!.temperature_2m_min[i]),
      precipitationProbability: data.daily!.precipitation_probability_max[i] ?? 0,
      windSpeedMax: Math.round(data.daily!.wind_speed_10m_max[i]),
    }));

    return {
      location: DESTINATION_COORDS.label,
      temperature: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      weatherCode: data.current.weather_code,
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      precipitationProbability:
        data.current.precipitation_probability ??
        daily[0]?.precipitationProbability ??
        0,
      updatedAt: new Date().toISOString(),
      daily,
    };
  } catch {
    return null;
  }
}
