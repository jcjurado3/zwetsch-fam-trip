"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { WeatherWidget } from "@/components/WeatherWidget";
import { CoastalWidget } from "@/components/CoastalConditions";
import { ThingsToDo } from "@/components/ThingsToDo";
import { TripMap } from "@/components/TripMap";
import type { ItineraryItem } from "@/lib/types";
import type { PlaceCard } from "@/lib/places";
import { seedItinerary } from "@/lib/seed-data";

export default function ItineraryMapPage() {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [places, setPlaces] = useState<PlaceCard[]>([]);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    fetch("/api/itinerary")
      .then((res) => (res.ok ? res.json() : seedItinerary))
      .then(setItems)
      .catch(() => setItems(seedItinerary));
  }, []);

  useGSAP(
    () => {
      if (!pageRef.current) return;
      gsap.fromTo(
        pageRef.current,
        { opacity: 0, y: 28, scale: 0.985 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" }
      );
    },
    { scope: pageRef }
  );

  const goBack = () => {
    if (navigating) return;
    setNavigating(true);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion || !pageRef.current) {
      router.push("/itinerary");
      return;
    }

    gsap.to(pageRef.current, {
      opacity: 0,
      y: 24,
      scale: 0.985,
      duration: 0.35,
      ease: "power2.in",
      onComplete: () => router.push("/itinerary"),
    });
  };

  const withCoords = items.filter((item) => item.lat && item.lng);

  return (
    <div ref={pageRef} className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={navigating}
          aria-label="Back to itinerary"
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-surface-border disabled:opacity-60"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <PageHero title="Map" subtitle="Tampa + Sarasota lodges and nearby options" />
      </div>

      <WeatherWidget compact />
      <CoastalWidget compact />

      <TripMap itinerary={items} places={places} />

      <div className="card-surface rounded-3xl p-4">
        <h2 className="font-serif text-lg font-semibold">Stay Locations</h2>
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Tampa Lodge</p>
            <p className="mt-0.5 text-sm text-muted">
              901 Villa Venicia Way, Tampa, FL 33606
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=901+Villa+Venicia+Way,+Tampa,+FL+33606"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white"
            >
              Open in Maps
            </a>
          </div>
          <div className="border-t border-surface-border pt-3">
            <p className="text-sm font-semibold text-foreground">
              Sarasota Lodge
            </p>
            <p className="mt-0.5 text-sm text-muted">
              2704 Ringling Blvd, Sarasota, FL 34237
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=2704+Ringling+Blvd,+Sarasota,+FL+34237"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex rounded-xl border border-surface-border px-3 py-2 text-xs font-semibold text-foreground"
            >
              Open in Maps
            </a>
          </div>
        </div>
      </div>

      {withCoords.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-serif text-lg font-semibold">Itinerary Stops</h2>
          {withCoords.map((item, index) => (
            <Link
              key={item.id}
              href={`/itinerary/${item.id}`}
              className="card-surface flex items-center gap-3 rounded-2xl p-3 transition-transform active:scale-[0.98]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {index + 1}
              </span>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted">{item.location}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <ThingsToDo
        showTitle
        defaultMiles={15}
        onPlacesChange={setPlaces}
      />
    </div>
  );
}
