"use client";

import { useEffect, useRef } from "react";

/**
 * Fixed dual-theme scenic background with subtle scroll parallax.
 * Light = sunset beach; Dark = island/underwater.
 */
export function ThemeBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

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
  }, []);

  return (
    <div
      ref={rootRef}
      className="theme-scene"
      aria-hidden="true"
    >
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
    </div>
  );
}
