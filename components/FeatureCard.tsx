"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { formatDayLabel, formatTime } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  subtitle?: string;
  time?: string | null;
  dayDate?: string;
  imageUrl?: string | null;
  href?: string;
  label?: string;
}

export function FeatureCard({
  title,
  subtitle,
  time,
  dayDate,
  imageUrl,
  href,
  label = "Today's Highlight",
}: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!cardRef.current) return;
      gsap.to(cardRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.1,
      });
    },
    { scope: cardRef }
  );

  const content = (
    <div
      ref={cardRef}
      className="animate-item card-surface relative overflow-hidden rounded-3xl"
    >
      <div className="relative aspect-[16/10] w-full">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/30 to-primary/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-white/80">
            {label}
          </span>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-white/80">{subtitle}</p>
          )}
          <div className="mt-2 flex items-center gap-3 text-sm text-white/90">
            {dayDate && <span>{formatDayLabel(dayDate)}</span>}
            {time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(time)}
              </span>
            )}
          </div>
        </div>
      </div>
      {href && (
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-sm font-medium text-primary">View details</span>
          <ArrowRight className="h-4 w-4 text-primary" />
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-transform active:scale-[0.98]">
        {content}
      </Link>
    );
  }

  return content;
}
