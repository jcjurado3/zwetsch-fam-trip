"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Check, Clock, MapPin } from "lucide-react";
import { formatTime } from "@/lib/utils";
import type { ItineraryItem } from "@/lib/types";

interface ItineraryCardProps {
  item: ItineraryItem;
  variant?: "featured" | "grid";
  onToggleVisited?: (id: string, visited: boolean) => void;
}

export function ItineraryCard({
  item,
  variant = "grid",
  onToggleVisited,
}: ItineraryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!cardRef.current) return;
      gsap.to(cardRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power3.out",
      });
    },
    { scope: cardRef }
  );

  if (variant === "featured") {
    return (
      <div ref={cardRef} className="animate-item">
        <Link
          href={`/itinerary/${item.id}`}
          className="card-surface block overflow-hidden rounded-3xl transition-transform active:scale-[0.98]"
        >
          <div className="relative aspect-[16/10]">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 512px) 100vw, 512px"
              />
            ) : (
              <div className="h-full bg-gradient-to-br from-primary/30 to-primary/10" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleVisited?.(item.id, !item.visited);
              }}
              className={`absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-colors ${
                item.visited
                  ? "bg-emerald-500/90 text-white"
                  : "bg-black/40 text-white"
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              {item.visited ? "Visited" : "Mark visited"}
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {item.time && (
                <span className="flex items-center gap-1 text-sm text-white/90">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(item.time)}
                </span>
              )}
              <h2 className="mt-1 font-serif text-2xl font-semibold text-white">
                {item.title}
              </h2>
              {item.location && (
                <p className="mt-1 flex items-center gap-1 text-sm text-white/80">
                  <MapPin className="h-3.5 w-3.5" />
                  {item.location}
                </p>
              )}
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div ref={cardRef} className="animate-item">
      <Link
        href={`/itinerary/${item.id}`}
        className="card-surface block overflow-hidden rounded-2xl transition-transform active:scale-[0.97]"
      >
        <div className="relative aspect-[4/3]">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 256px) 50vw, 256px"
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-primary/20 to-primary/5" />
          )}
          {item.visited && (
            <div className="absolute right-2 top-2 rounded-full bg-emerald-500 p-1">
              <Check className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
        <div className="p-3">
          {item.time && (
            <span className="text-xs text-muted">{formatTime(item.time)}</span>
          )}
          <h3 className="mt-0.5 font-serif text-sm font-semibold leading-snug">
            {item.title}
          </h3>
        </div>
      </Link>
    </div>
  );
}
