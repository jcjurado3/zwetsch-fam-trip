"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";

interface ExpandableFormShellProps {
  label: string;
  children: React.ReactNode;
  /** Called when shell opens/closes */
  onOpenChange?: (open: boolean) => void;
}

export function ExpandableFormShell({
  label,
  children,
  onOpenChange,
}: ExpandableFormShellProps) {
  const [open, setOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function setExpanded(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  useGSAP(
    () => {
      const shell = shellRef.current;
      const content = contentRef.current;
      const trigger = triggerRef.current;
      if (!shell || !content || !trigger) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduceMotion) {
        gsap.set(shell, {
          width: open ? "100%" : 56,
          height: open ? "auto" : 56,
          borderRadius: open ? 24 : 999,
        });
        gsap.set(content, {
          opacity: open ? 1 : 0,
          display: open ? "block" : "none",
        });
        gsap.set(trigger, { opacity: open ? 0 : 1 });
        return;
      }

      if (open) {
        gsap.set(content, { display: "block", opacity: 0, y: 12 });
        const targetHeight = content.scrollHeight + 40; // padding allowance

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.to(trigger, { opacity: 0, scale: 0.6, duration: 0.2 })
          .to(
            shell,
            {
              width: "100%",
              height: targetHeight,
              borderRadius: 24,
              duration: 0.55,
            },
            "-=0.05"
          )
          .to(
            content,
            {
              opacity: 1,
              y: 0,
              duration: 0.35,
            },
            "-=0.25"
          )
          .add(() => {
            // Allow natural growth after morph (e.g. validation messages)
            gsap.set(shell, { height: "auto" });
          });
      } else {
        const currentHeight = shell.offsetHeight;
        gsap.set(shell, { height: currentHeight });

        gsap
          .timeline({ defaults: { ease: "power3.inOut" } })
          .to(content, { opacity: 0, y: 8, duration: 0.2 })
          .to(
            shell,
            {
              width: 56,
              height: 56,
              borderRadius: 999,
              duration: 0.45,
            },
            "-=0.05"
          )
          .to(
            trigger,
            { opacity: 1, scale: 1, duration: 0.25 },
            "-=0.2"
          )
          .add(() => {
            gsap.set(content, { display: "none" });
          });
      }
    },
    { dependencies: [open], scope: shellRef }
  );

  return (
    <div className="flex justify-center">
      <div
        ref={shellRef}
        className={`relative flex items-center justify-center overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.14)] ${
          open ? "card-surface" : "bg-primary text-white"
        }`}
        style={{
          width: 56,
          height: 56,
          borderRadius: 999,
        }}
      >
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setExpanded(true)}
          className={`absolute inset-0 z-10 flex items-center justify-center text-white transition-transform active:scale-95 ${
            open ? "pointer-events-none" : ""
          }`}
          aria-expanded={open}
          aria-label={label}
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>

        <div ref={contentRef} className="w-full p-5" style={{ display: "none" }}>
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                New
              </p>
              <h2 className="font-serif text-lg font-semibold text-foreground">
                {label}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-surface-border text-muted transition-colors hover:text-foreground"
              aria-label="Close form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
