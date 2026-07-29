"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { useArrival } from "@/components/ArrivalProvider";

/**
 * Fixed dual-theme scenic background with arrival zoom + subtle scroll parallax.
 * Light = sunset beach; Dark = island/underwater.
 * Portaled to document.body so page stacking (body > * z-index) can't bury it.
 */
export function ThemeBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const introPlayed = useRef(false);
  const [mounted, setMounted] = useState(false);
  const { arrived, markArrived } = useArrival();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Arrival: zoom out of the scene as if approaching the destination
  // Wait until portaled DOM exists (mounted) before reading rootRef
  useEffect(() => {
    if (!mounted) return;
    const root = rootRef.current;
    if (!root || introPlayed.current) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const alreadyArrived =
      arrived || sessionStorage.getItem("zwetsch-arrived") === "1";

    if (reduceMotion || alreadyArrived) {
      introPlayed.current = true;
      root.classList.add("theme-scene--settled");
      markArrived();
      return;
    }

    introPlayed.current = true;
    const panels = root.querySelectorAll<HTMLElement>(".theme-scene__panel");
    const art = root.querySelectorAll<HTMLElement>(".theme-scene__art");
    const accents = root.querySelectorAll<HTMLElement>(".theme-scene__accent");
    const veil = root.querySelectorAll<HTMLElement>(".theme-scene__veil");

    gsap.set(root, { opacity: 1 });
    gsap.set(art, { scale: 1.22, y: 48, transformOrigin: "50% 40%" });
    gsap.set(accents, { scale: 1.35, y: 80, opacity: 0 });
    gsap.set(veil, { opacity: 0.15 });
    gsap.set(panels, { filter: "blur(10px) brightness(1.05)" });

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        root.classList.add("theme-scene--settled");
        markArrived();
      },
    });

    tl.to(art, { scale: 1, y: 0, duration: 1.55, ease: "power3.out" }, 0)
      .to(
        accents,
        { scale: 1, y: 0, opacity: 1, duration: 1.35, ease: "power3.out" },
        0.15
      )
      .to(panels, { filter: "none", duration: 1.2 }, 0.1)
      .to(veil, { opacity: 1, duration: 0.9 }, 0.45);

    return () => {
      tl.kill();
    };
    // Intentionally depends on mounted only — intro should not restart on arrival flips
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Subtle scroll parallax after settling
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !arrived) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    const far = root.querySelectorAll<HTMLElement>('[data-parallax="far"]');
    const mid = root.querySelectorAll<HTMLElement>('[data-parallax="mid"]');
    const near = root.querySelectorAll<HTMLElement>('[data-parallax="near"]');

    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const max = 120;
      const clamped = Math.min(y, 2000);

      far.forEach((el) => {
        el.style.transform = `translate3d(0, ${clamped * 0.04}px, 0)`;
      });
      mid.forEach((el) => {
        el.style.transform = `translate3d(0, ${Math.min(clamped * 0.1, max)}px, 0)`;
      });
      near.forEach((el) => {
        el.style.transform = `translate3d(0, ${Math.min(clamped * 0.18, max * 1.4)}px, 0)`;
      });
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [arrived]);

  if (!mounted) return null;

  return createPortal(
    <div ref={rootRef} className="theme-scene" aria-hidden="true">
      {/* Light — sunset beach */}
      <div className="theme-scene__panel theme-scene__panel--light">
        <div className="theme-scene__art" data-parallax="far">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/themes/light-sunset.svg"
            alt=""
            className="theme-scene__svg"
            draggable={false}
          />
        </div>
        <div className="theme-scene__accent" data-parallax="near">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/themes/light-sunset.png"
            alt=""
            className="theme-scene__stamp"
            draggable={false}
          />
        </div>
        <div className="theme-scene__veil theme-scene__veil--light" />
      </div>

      {/* Dark — underwater island */}
      <div className="theme-scene__panel theme-scene__panel--dark">
        <div className="theme-scene__art" data-parallax="far">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/themes/dark-ocean.svg"
            alt=""
            className="theme-scene__svg"
            draggable={false}
          />
        </div>
        <div className="theme-scene__accent" data-parallax="mid">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/themes/dark-ocean.png"
            alt=""
            className="theme-scene__stamp theme-scene__stamp--dark"
            draggable={false}
          />
        </div>
        <div className="theme-scene__veil theme-scene__veil--dark" />
      </div>
    </div>,
    document.body
  );
}
