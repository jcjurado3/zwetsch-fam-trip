"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatDayLabel } from "@/lib/utils";
import { mealToneClass } from "@/lib/item-tones";
import type { MenuItem, MealType } from "@/lib/types";

const mealLabels: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

const mealOrder: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

interface MenuDaySectionProps {
  dayDate: string;
  items: MenuItem[];
  defaultOpen?: boolean;
}

export function MenuDaySection({
  dayDate,
  items,
  defaultOpen = false,
}: MenuDaySectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      gsap.to(sectionRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power3.out",
      });
    },
    { scope: sectionRef }
  );

  // Set initial accordion state without animating
  useGSAP(
    () => {
      const content = contentRef.current;
      const chevron = chevronRef.current;
      if (!content) return;

      if (open) {
        gsap.set(content, { height: "auto", opacity: 1 });
      } else {
        gsap.set(content, { height: 0, opacity: 0 });
      }
      if (chevron) {
        gsap.set(chevron, { rotation: open ? 180 : 0 });
      }
    },
    { scope: sectionRef }
  );

  useGSAP(
    () => {
      const content = contentRef.current;
      const inner = innerRef.current;
      const chevron = chevronRef.current;
      if (!content || !inner) return;

      // Skip the first run — initial state is set above
      if (!hasAnimated.current) {
        hasAnimated.current = true;
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      gsap.killTweensOf([content, chevron, ...content.querySelectorAll(".meal-row")]);

      if (reduceMotion) {
        gsap.set(content, {
          height: open ? "auto" : 0,
          opacity: open ? 1 : 0,
        });
        if (chevron) gsap.set(chevron, { rotation: open ? 180 : 0 });
        return;
      }

      if (open) {
        gsap.set(content, { height: 0, opacity: 0 });
        const target = inner.offsetHeight;

        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
        tl.to(content, {
          height: target,
          opacity: 1,
          duration: 0.4,
        })
          .to(
            chevron,
            { rotation: 180, duration: 0.35, ease: "power2.out" },
            0
          )
          .fromTo(
            content.querySelectorAll(".meal-row"),
            { opacity: 0, y: 10 },
            {
              opacity: 1,
              y: 0,
              duration: 0.28,
              stagger: 0.05,
              ease: "power2.out",
            },
            "-=0.2"
          )
          .add(() => {
            gsap.set(content, { height: "auto" });
          });
      } else {
        const tl = gsap.timeline({ defaults: { ease: "power2.in" } });
        tl.to(content.querySelectorAll(".meal-row"), {
          opacity: 0,
          y: -6,
          duration: 0.18,
          stagger: 0.03,
        })
          .to(
            content,
            {
              height: 0,
              opacity: 0,
              duration: 0.32,
            },
            "-=0.05"
          )
          .to(
            chevron,
            { rotation: 0, duration: 0.3, ease: "power2.in" },
            0
          );
      }
    },
    { dependencies: [open], scope: sectionRef }
  );

  const grouped = mealOrder
    .map((type) => ({
      type,
      meals: items.filter((item) => item.meal_type === type),
    }))
    .filter((group) => group.meals.length > 0);

  return (
    <div
      ref={sectionRef}
      className="animate-item card-surface overflow-hidden rounded-3xl"
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <h3 className="font-serif text-lg font-semibold">
            {formatDayLabel(dayDate)}
          </h3>
          <p className="text-xs text-muted">
            {items.length} meal{items.length !== 1 ? "s" : ""} planned
          </p>
        </div>
        <span ref={chevronRef} className="inline-flex text-muted">
          <ChevronDown className="h-5 w-5" />
        </span>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{
          height: defaultOpen ? "auto" : 0,
          opacity: defaultOpen ? 1 : 0,
        }}
      >
        <div ref={innerRef} className="space-y-4 px-5 pb-5">
          {grouped.map((group) => {
            const tone = mealToneClass(group.type);
            return (
              <div key={group.type} className={`meal-row ${tone}`}>
                <h4
                  className={`tone-label mb-2 text-xs font-semibold uppercase tracking-wider ${tone}`}
                >
                  {mealLabels[group.type]}
                </h4>
                <div className="space-y-2">
                  {group.meals.map((meal) => (
                    <div
                      key={meal.id}
                      className={`tone-item rounded-2xl border px-4 py-3 ${tone}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium">{meal.title}</p>
                        <span className={`tone-chip shrink-0 ${tone}`}>
                          {mealLabels[group.type]}
                        </span>
                      </div>
                      {meal.description && (
                        <p className="mt-1 text-sm text-muted">
                          {meal.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
