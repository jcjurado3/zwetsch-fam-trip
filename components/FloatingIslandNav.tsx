"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import {
  CalendarDays,
  Camera,
  Home,
  ListChecks,
  Map,
  Menu,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/itinerary", label: "Plan", icon: CalendarDays },
  { href: "/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/checklist", label: "List", icon: ListChecks },
  { href: "/media", label: "Media", icon: Camera },
];

export function FloatingIslandNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const islandRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasAnimatedOpen = useRef(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reliable entrance — avoid GSAP revert leaving opacity at 0
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      setVisible(true);
      setOpen(true);
      return;
    }

    const show = window.setTimeout(() => setVisible(true), 40);
    const expand = window.setTimeout(() => setOpen(true), 420);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(expand);
    };
  }, []);

  useGSAP(
    () => {
      const island = islandRef.current;
      const content = contentRef.current;
      if (!island || !content) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduceMotion) {
        gsap.set(island, {
          width: open ? "auto" : 56,
          borderRadius: open ? 28 : 999,
        });
        gsap.set(content, { opacity: open ? 1 : 0, scaleX: open ? 1 : 0 });
        return;
      }

      if (open) {
        const fullWidth = Math.min(window.innerWidth - 32, 440);
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.to(island, {
          width: fullWidth,
          borderRadius: 28,
          duration: hasAnimatedOpen.current ? 0.45 : 0.65,
        })
          .to(
            content,
            {
              opacity: 1,
              scaleX: 1,
              duration: 0.35,
            },
            "-=0.25"
          )
          .fromTo(
            content.querySelectorAll(".island-item"),
            { opacity: 0, y: 10, scale: 0.85 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.35,
              stagger: 0.04,
              ease: "back.out(1.6)",
            },
            "-=0.2"
          );

        hasAnimatedOpen.current = true;
      } else if (hasAnimatedOpen.current) {
        // Only collapse after we've opened once — avoid mounting in a collapse tween
        gsap
          .timeline({ defaults: { ease: "power3.inOut" } })
          .to(content.querySelectorAll(".island-item"), {
            opacity: 0,
            y: 6,
            scale: 0.9,
            duration: 0.18,
            stagger: 0.02,
          })
          .to(
            content,
            {
              opacity: 0,
              scaleX: 0.85,
              duration: 0.2,
            },
            "-=0.05"
          )
          .to(
            island,
            {
              width: 56,
              borderRadius: 999,
              duration: 0.4,
            },
            "-=0.1"
          );
      }
    },
    { dependencies: [open], scope: islandRef }
  );

  if (!mounted) return null;

  return createPortal(
    <div
      className={`floating-island-root pointer-events-none !fixed inset-x-0 bottom-0 z-[100] flex justify-center px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] transition-[opacity,transform] duration-500 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
      style={{ position: "fixed" }}
    >
      <div
        ref={islandRef}
        className="floating-island pointer-events-auto relative flex h-14 items-center justify-center overflow-hidden border shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
        style={{
          width: 56,
          borderRadius: 999,
        }}
      >
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`absolute inset-0 z-10 flex items-center justify-center text-primary transition-opacity ${
            open ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          aria-label={open ? "Collapse navigation" : "Open navigation"}
        >
          <Menu className="h-6 w-6" />
        </button>

        <div
          ref={contentRef}
          className="flex w-full items-center gap-0.5 px-2 opacity-0"
          style={{ transformOrigin: "center" }}
        >
          <div className="flex min-w-0 flex-1 items-center justify-between">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`island-item floating-island__link flex flex-col items-center gap-0.5 rounded-2xl px-1.5 py-1.5 transition-colors ${
                    isActive ? "floating-island__link--active" : ""
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[9px] font-medium leading-none">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="island-item ml-1 flex shrink-0 items-center gap-1 border-l border-surface-border pl-1.5">
            <Link
              href="/itinerary/map"
              className={`floating-island__action flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                pathname === "/itinerary/map"
                  ? "floating-island__action--active"
                  : ""
              }`}
              aria-label="Map view"
            >
              <Map className="h-[18px] w-[18px]" />
            </Link>
            <div className="flex items-center px-0.5">
              <ThemeToggle />
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="floating-island__action flex h-9 w-9 items-center justify-center rounded-full transition-colors"
              aria-label="Collapse navigation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
