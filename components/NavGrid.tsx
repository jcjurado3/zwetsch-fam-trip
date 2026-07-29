"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import Link from "next/link";
import { useRef } from "react";
import {
  CalendarDays,
  Camera,
  ListChecks,
  UtensilsCrossed,
} from "lucide-react";

const items = [
  {
    href: "/itinerary",
    title: "Itinerary",
    description: "Day plans & stops",
    icon: CalendarDays,
    gradient: "from-blue-500/20 to-indigo-500/10",
  },
  {
    href: "/menu",
    title: "Daily Menu",
    description: "Meals for each day",
    icon: UtensilsCrossed,
    gradient: "from-orange-500/20 to-amber-500/10",
  },
  {
    href: "/checklist",
    title: "Checklist",
    description: "Packing & to-dos",
    icon: ListChecks,
    gradient: "from-emerald-500/20 to-teal-500/10",
  },
  {
    href: "/media",
    title: "Share Media",
    description: "Photos & videos",
    icon: Camera,
    gradient: "from-pink-500/20 to-rose-500/10",
  },
];

export function NavGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!gridRef.current) return;
      const items = gridRef.current.querySelectorAll(".nav-grid-item");
      if (!items.length) return;
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.2,
      });
    },
    { scope: gridRef }
  );

  return (
    <div ref={gridRef} className="grid grid-cols-2 gap-3">
      {items.map((item, index) => {
        const Icon = item.icon;
        const isOffset = index === 3;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-grid-item animate-item card-surface block rounded-3xl p-4 transition-transform active:scale-[0.97] ${
              isOffset ? "translate-y-2" : ""
            }`}
          >
            <div
              className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient}`}
            >
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-serif text-lg font-semibold">{item.title}</h3>
            <p className="mt-0.5 text-xs text-muted">{item.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
