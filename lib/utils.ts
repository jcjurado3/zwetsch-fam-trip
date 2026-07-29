import type { ItineraryItem } from "./types";

export function formatDateRange(start: string, end: string): string {
  const startDate = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return `${startDate.toLocaleDateString("en-US", opts)} – ${endDate.toLocaleDateString("en-US", opts)}`;
}

export function formatDayLabel(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(time: string | null): string {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getNextItineraryItem(items: ItineraryItem[]) {
  const unvisited = items.filter((item) => !item.visited);
  if (!unvisited.length) return items[0];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = unvisited
    .filter((item) => new Date(`${item.day_date}T12:00:00`) >= today)
    .sort((a, b) => {
      const dayCmp = a.day_date.localeCompare(b.day_date);
      if (dayCmp !== 0) return dayCmp;
      return a.sort_order - b.sort_order;
    });

  return upcoming[0] ?? unvisited[0];
}

export function groupByDay<T extends { day_date: string }>(items: T[]) {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    if (!groups[item.day_date]) groups[item.day_date] = [];
    groups[item.day_date].push(item);
  }
  return groups;
}
