"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { MapPin } from "lucide-react";
import { useRef } from "react";
import { formatDateRange } from "@/lib/utils";

interface BrandHeroProps {
  destination?: string;
  startDate?: string;
  endDate?: string;
}

export function BrandHero({
  destination,
  startDate,
  endDate,
}: BrandHeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduceMotion) {
        gsap.set(
          [yearRef.current, titleRef.current, lineRef.current, metaRef.current],
          { opacity: 1, y: 0, scaleX: 1 }
        );
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        yearRef.current,
        { opacity: 0, y: 16, letterSpacing: "0.35em" },
        { opacity: 1, y: 0, letterSpacing: "0.2em", duration: 0.7 }
      )
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.35"
        )
        .fromTo(
          lineRef.current,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.55, transformOrigin: "center" },
          "-=0.35"
        )
        .fromTo(
          metaRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.2"
        );

      // Soft looping shimmer on the accent line
      gsap.to(lineRef.current, {
        backgroundPosition: "200% center",
        duration: 2.8,
        ease: "none",
        repeat: -1,
      });
    },
    { scope: rootRef }
  );

  return (
    <header ref={rootRef} className="relative overflow-hidden rounded-3xl card-surface px-4 py-6">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/5" />
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl"
        style={{ background: "var(--glow-a)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full blur-3xl"
        style={{ background: "var(--glow-b)" }}
      />

      <div className="relative px-1 py-2 text-center">
        <span
          ref={yearRef}
          className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-primary opacity-0"
        >
          2026
        </span>

        <h1
          ref={titleRef}
          className="mt-2 font-brand text-[2.35rem] font-normal leading-[1.05] tracking-[-0.02em] text-foreground opacity-0 sm:text-[2.75rem]"
        >
          Zwetsch Family
          <br />
          Trip
        </h1>

        <div
          ref={lineRef}
          className="mx-auto mt-4 h-[2px] w-24 origin-center rounded-full opacity-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, var(--primary), color-mix(in srgb, var(--primary) 35%, transparent), var(--primary))",
            backgroundSize: "200% 100%",
          }}
        />

        <div ref={metaRef} className="mt-4 space-y-1 opacity-0">
          {destination && (
            <p className="flex items-center justify-center gap-1.5 text-sm text-muted">
              <MapPin className="h-4 w-4 text-primary" />
              {destination}
            </p>
          )}
          {startDate && endDate && (
            <p className="text-sm text-muted">
              {formatDateRange(startDate, endDate)}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
