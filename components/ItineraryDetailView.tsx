"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, Check, MapPin } from "lucide-react";
import { formatDayLabel, formatTime } from "@/lib/utils";
import type { ItineraryItem } from "@/lib/types";
import { WeatherWidget } from "@/components/WeatherWidget";
import { FlightStatusWidget } from "@/components/FlightStatusWidget";
import { getTripFlightByItineraryId } from "@/lib/flights";

export function ItineraryDetailView({ item }: { item: ItineraryItem }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const galleryImages = getGalleryImages(item);
  const tripFlight = getTripFlightByItineraryId(item.id);

  useGSAP(
    () => {
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.6, ease: "power2.out" }
        );
      }
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.6, delay: 0.15, ease: "power3.out" }
        );
      }
    },
    { scope: heroRef }
  );

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background">
      <div ref={heroRef} className="relative aspect-[4/3] w-full">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
            priority
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-primary/30 to-primary/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Link
          href="/itinerary"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm safe-top"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {item.visited && (
          <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white safe-top">
            <Check className="h-3.5 w-3.5" />
            Visited
          </div>
        )}
      </div>

      <div
        ref={contentRef}
        className="card-surface relative -mt-6 rounded-t-3xl px-5 pb-8 pt-6"
      >
        <div className="mb-1 text-sm text-muted">
          {formatDayLabel(item.day_date)}
          {item.time && ` · ${formatTime(item.time)}`}
        </div>
        <h1 className="font-serif text-3xl font-semibold">{item.title}</h1>
        {item.location && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
            <MapPin className="h-4 w-4 text-primary" />
            {item.location}
          </p>
        )}

        <div className="mt-5 space-y-3">
          {tripFlight && (
            <FlightStatusWidget
              compact
              flightIata={tripFlight.flightIata}
              itineraryId={item.id}
            />
          )}
          <WeatherWidget compact />
        </div>

        {item.description && (
          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">
              About
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">
              {item.description}
            </p>
          </section>
        )}

        {galleryImages.length > 0 && (
          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">
              Gallery
            </h2>
            <div className="scroll-x-touch mt-3 pb-2">
              {galleryImages.map((url, i) => (
                <div
                  key={i}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl"
                >
                  <Image
                    src={url}
                    alt={`${item.title} photo ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function getGalleryImages(item: ItineraryItem): string[] {
  if (!item.image_url) return [];
  const extras = [
    "https://images.unsplash.com/photo-1519046909334-b423bda76b09?w=400&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
  ];
  return [item.image_url, ...extras];
}
