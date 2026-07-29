"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";

  if (!mounted) {
    return (
      <button
        type="button"
        className="theme-toggle"
        aria-label="Toggle theme"
        disabled
      >
        <span className="theme-toggle__track" />
        <span className="theme-toggle__knob" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`theme-toggle ${isDark ? "theme-toggle--dark" : "theme-toggle--light"}`}
      aria-label={
        isDark ? "Switch to Sunny Beach (light mode)" : "Switch to Night Ocean (dark mode)"
      }
      aria-pressed={isDark}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__cloud theme-toggle__cloud--a" />
        <span className="theme-toggle__cloud theme-toggle__cloud--b" />
        <span className="theme-toggle__cloud theme-toggle__cloud--c" />
        <span className="theme-toggle__star theme-toggle__star--a" />
        <span className="theme-toggle__star theme-toggle__star--b" />
        <span className="theme-toggle__star theme-toggle__star--c" />
        <span className="theme-toggle__star theme-toggle__star--d" />
      </span>
      <span className="theme-toggle__knob" aria-hidden="true">
        <span className="theme-toggle__sun" />
        <span className="theme-toggle__moon" />
      </span>
    </button>
  );
}
