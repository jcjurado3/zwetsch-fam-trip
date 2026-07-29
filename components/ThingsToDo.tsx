"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import {
  Building2,
  MapPin,
  Smile,
  Trees,
  Umbrella,
  Utensils,
} from "lucide-react";
import type { PlaceCard, PlaceCategory } from "@/lib/places";
import { RADIUS_OPTIONS } from "@/lib/places";

const CATEGORIES: { id: PlaceCategory; label: string; icon: typeof MapPin }[] =
  [
    { id: "all", label: "All", icon: MapPin },
    { id: "beach", label: "Beach", icon: Umbrella },
    { id: "food", label: "Food", icon: Utensils },
    { id: "family", label: "Family", icon: Smile },
    { id: "outdoors", label: "Outdoors", icon: Trees },
    { id: "museum", label: "Museum", icon: Building2 },
  ];

function formatDistance(km: number) {
  const miles = km * 0.621371;
  if (miles < 0.1) return "Nearby";
  return `${miles.toFixed(miles < 10 ? 1 : 0)} mi`;
}

interface ThingsToDoProps {
  showTitle?: boolean;
  defaultMiles?: number;
  onPlacesChange?: (places: PlaceCard[]) => void;
}

export function ThingsToDo({
  showTitle = true,
  defaultMiles = 15,
  onPlacesChange,
}: ThingsToDoProps) {
  const [miles, setMiles] = useState(defaultMiles);
  const [category, setCategory] = useState<PlaceCategory>("all");
  const [places, setPlaces] = useState<PlaceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/places?miles=${miles}&category=${category}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (cancelled) return;
        const next = (data.places ?? []) as PlaceCard[];
        setPlaces(next);
        onPlacesChange?.(next);
      })
      .catch(() => {
        if (!cancelled) {
          setPlaces([]);
          onPlacesChange?.([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [miles, category, onPlacesChange]);

  useGSAP(
    () => {
      if (!listRef.current || loading) return;
      const cards = listRef.current.querySelectorAll(".place-card");
      if (!cards.length) return;
      gsap.fromTo(
        cards,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power3.out",
        }
      );
    },
    { scope: listRef, dependencies: [places, loading] }
  );

  return (
    <section className="min-w-0 space-y-4">
      {showTitle && (
        <div>
          <h2 className="font-serif text-lg font-semibold">Things to do</h2>
          <p className="text-sm text-muted">
            Discover spots near Tampa & Sarasota lodges
          </p>
        </div>
      )}

      <div className="scroll-x-touch -mx-1 px-1 pb-1">
        {RADIUS_OPTIONS.map((option) => (
          <button
            key={option.miles}
            type="button"
            onClick={() => setMiles(option.miles)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              miles === option.miles
                ? "bg-primary text-white"
                : "border border-surface-border bg-surface text-muted"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="scroll-x-touch -mx-1 px-1 pb-1">
        {CATEGORIES.map((item) => {
          const Icon = item.icon;
          const active = category === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? "bg-primary/15 text-primary"
                  : "border border-surface-border bg-surface text-muted"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="card-surface rounded-3xl px-5 py-8 text-center text-sm text-muted">
          Finding nearby places...
        </div>
      ) : places.length === 0 ? (
        <div className="card-surface rounded-3xl px-5 py-8 text-center text-sm text-muted">
          No places found in this radius. Try a wider range.
        </div>
      ) : (
        <div ref={listRef} className="space-y-2">
          {places.map((place) => (
            <Link
              key={place.id}
              href={`/itinerary/places/${encodeURIComponent(place.id)}`}
              className="place-card card-surface flex items-center gap-3 rounded-2xl p-3 transition-transform active:scale-[0.98]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{place.name}</p>
                <p className="text-xs capitalize text-muted">
                  {place.category} · {formatDistance(place.distanceKm)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
