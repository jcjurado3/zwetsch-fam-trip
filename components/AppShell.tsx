"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FloatingIslandNav } from "./FloatingIslandNav";
import { useArrival } from "@/components/ArrivalProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { arrived, markArrived } = useArrival();
  const mainRef = useRef<HTMLElement>(null);
  const revealedForPath = useRef<string | null>(null);

  const isDetailPage =
    pathname.startsWith("/itinerary/places/") ||
    (pathname.startsWith("/itinerary/") && pathname !== "/itinerary/map");

  // Failsafe: never leave the UI stuck waiting for the intro
  useEffect(() => {
    if (arrived) return;
    const timer = window.setTimeout(() => markArrived(), 2500);
    return () => window.clearTimeout(timer);
  }, [arrived, markArrived]);

  // Reveal page cards after arrival (nav handles its own entrance)
  useEffect(() => {
    if (isDetailPage || !arrived || !mainRef.current) return;
    if (revealedForPath.current === pathname) return;
    revealedForPath.current = pathname;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const main = mainRef.current;
    const sections = Array.from(main.children) as HTMLElement[];

    if (reduceMotion) {
      gsap.set([main, ...sections], {
        clearProps: "all",
        opacity: 1,
        y: 0,
        scale: 1,
      });
      return;
    }

    gsap.set(main, { opacity: 1 });
    gsap.set(sections, { opacity: 0, y: 36, scale: 0.98 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(sections, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.65,
      stagger: 0.1,
    });

    return () => {
      tl.kill();
    };
  }, [arrived, pathname, isDetailPage]);

  if (isDetailPage) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        className={`mx-auto flex min-h-full w-full max-w-lg flex-col ${
          arrived ? "page-arrived" : "page-arriving"
        }`}
      >
        <main
          ref={mainRef}
          className="page-content min-w-0 flex-1 px-4 pb-32"
        >
          {arrived ? children : null}
        </main>
      </div>
      {/* Outside content shell so `fixed` stays pinned to the viewport */}
      {arrived && <FloatingIslandNav />}
    </>
  );
}
