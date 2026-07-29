"use client";

import { ThemeProvider } from "next-themes";
import { GsapProvider } from "./GsapProvider";
import { ThemeBackground } from "@/components/ThemeBackground";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ThemeBackground />
      <GsapProvider>{children}</GsapProvider>
    </ThemeProvider>
  );
}
