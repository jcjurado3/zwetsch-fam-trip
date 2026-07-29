"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, MapPin } from "lucide-react";
import type { PlaceDetail } from "@/lib/places";

export function PlaceDetailView({ xid }: { xid: string }) {
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch(`/api/places/${encodeURIComponent(xid)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data: PlaceDetail) => {
        if (!cancelled) setPlace(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [xid]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-4">
        <p className="text-sm text-muted">Loading place...</p>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4">
        <p className="text-muted">Place not found</p>
        <Link href="/itinerary" className="mt-4 text-primary">
          Back to itinerary
        </Link>
      </div>
    );
  }

  const miles = (place.distanceKm * 0.621371).toFixed(1);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background pb-10">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-primary/25 to-primary/5">
        {place.imageUrl ? (
          <Image
            src={place.imageUrl}
            alt={place.name}
            fill
            className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
            unoptimized
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        <Link
          href="/itinerary"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm safe-top"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="card-surface relative -mt-6 rounded-t-3xl px-5 pb-8 pt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          {place.category} · {miles} mi away
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">{place.name}</h1>
        {place.address && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
            <MapPin className="h-4 w-4 text-primary" />
            {place.address}
          </p>
        )}

        {(place.wikipediaExtract || place.description) && (
          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">
              About
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">
              {place.wikipediaExtract || place.description}
            </p>
            {place.wikipediaUrl && (
              <a
                href={place.wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
              >
                Read on Wikipedia
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </section>
        )}

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white"
        >
          Open in Maps
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
