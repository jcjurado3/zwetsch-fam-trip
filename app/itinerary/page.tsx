"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { CalendarDays, LayoutGrid, Map } from "lucide-react";
import { ItineraryAddForm } from "@/components/ItineraryAddForm";
import { ItineraryCalendar } from "@/components/ItineraryCalendar";
import { ItineraryCard } from "@/components/ItineraryCard";
import { PageHero } from "@/components/PageHero";
import { StaggerContainer } from "@/components/StaggerContainer";
import { WeatherWidget } from "@/components/WeatherWidget";
import { CoastalWidget } from "@/components/CoastalConditions";
import { ThingsToDo } from "@/components/ThingsToDo";
import type { ItineraryItem } from "@/lib/types";
import { seedItinerary } from "@/lib/seed-data";

const LOCAL_ITINERARY_KEY = "zwetsch-itinerary-local";

type ViewMode = "list" | "calendar";

function loadLocalItems(): ItineraryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_ITINERARY_KEY);
    return raw ? (JSON.parse(raw) as ItineraryItem[]) : [];
  } catch {
    return [];
  }
}

function saveLocalItems(items: ItineraryItem[]) {
  localStorage.setItem(LOCAL_ITINERARY_KEY, JSON.stringify(items));
}

export default function ItineraryPage() {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const mapBtnRef = useRef<HTMLButtonElement>(null);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [view, setView] = useState<ViewMode>("calendar");

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/itinerary");
      const data = res.ok
        ? ((await res.json()) as ItineraryItem[])
        : seedItinerary;
      const locals = loadLocalItems().filter(
        (local) => !data.some((item) => item.id === local.id)
      );
      const merged = [...data, ...locals].sort((a, b) => {
        const dayCmp = a.day_date.localeCompare(b.day_date);
        if (dayCmp !== 0) return dayCmp;
        return a.sort_order - b.sort_order;
      });
      setItems(merged);
    } catch {
      setItems([...seedItinerary, ...loadLocalItems()]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useGSAP(
    () => {
      if (!pageRef.current) return;
      gsap.fromTo(
        pageRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }
      );
    },
    { scope: pageRef }
  );

  const openMap = () => {
    if (navigating) return;
    setNavigating(true);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion || !pageRef.current) {
      router.push("/itinerary/map");
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: "power2.in" },
      onComplete: () => router.push("/itinerary/map"),
    });

    if (mapBtnRef.current) {
      tl.to(mapBtnRef.current, {
        scale: 0.94,
        duration: 0.12,
      }).to(mapBtnRef.current, {
        scale: 1.02,
        duration: 0.18,
        ease: "power2.out",
      });
    }

    tl.to(
      pageRef.current,
      {
        opacity: 0,
        y: -28,
        scale: 0.985,
        duration: 0.38,
      },
      "-=0.05"
    );
  };

  const handleToggleVisited = async (id: string, visited: boolean) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, visited } : item))
    );

    if (String(id).startsWith("local-it-")) {
      saveLocalItems(
        loadLocalItems().map((row) =>
          row.id === id ? { ...row, visited } : row
        )
      );
    }

    try {
      await fetch("/api/itinerary", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, visited }),
      });
    } catch {
      fetchItems();
    }
  };

  const handleCreated = (item: ItineraryItem) => {
    if (String(item.id).startsWith("local-it-") || "localOnly" in item) {
      const next = [...loadLocalItems(), item];
      saveLocalItems(next);
    }
    setItems((prev) =>
      [...prev, item].sort((a, b) => {
        const dayCmp = a.day_date.localeCompare(b.day_date);
        if (dayCmp !== 0) return dayCmp;
        return a.sort_order - b.sort_order;
      })
    );
    setView("calendar");
  };

  const featured = items.find((item) => !item.visited) ?? items[0];
  const gridItems = items.filter((item) => item.id !== featured?.id);

  return (
    <div ref={pageRef} className="space-y-6">
      <PageHero
        title="Itinerary"
        subtitle="Aug 5–11 · Tampa Bay adventures"
      />

      <WeatherWidget compact />
      <CoastalWidget compact />

      <ItineraryAddForm onCreated={handleCreated} />

      <div
        className="flex rounded-2xl border border-surface-border bg-surface p-1"
        role="tablist"
        aria-label="Itinerary view"
      >
        <button
          type="button"
          role="tab"
          aria-selected={view === "list"}
          onClick={() => setView("list")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
            view === "list"
              ? "bg-primary text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          List
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "calendar"}
          onClick={() => setView("calendar")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
            view === "calendar"
              ? "bg-primary text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          Calendar
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted">Loading...</div>
      ) : view === "calendar" ? (
        <ItineraryCalendar items={items} />
      ) : (
        <StaggerContainer className="space-y-6">
          {featured && (
            <ItineraryCard
              item={featured}
              variant="featured"
              onToggleVisited={handleToggleVisited}
            />
          )}

          {gridItems.length > 0 && (
            <div>
              <h2 className="animate-item mb-3 font-serif text-lg font-semibold">
                All Stops
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {gridItems.map((item) => (
                  <ItineraryCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </StaggerContainer>
      )}

      <button
        ref={mapBtnRef}
        type="button"
        onClick={openMap}
        disabled={navigating}
        aria-label="Open map"
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_28px_color-mix(in_srgb,var(--primary)_35%,transparent)] transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        <Map className="h-5 w-5" />
        View trip map
      </button>

      <ThingsToDo defaultMiles={15} />
    </div>
  );
}
