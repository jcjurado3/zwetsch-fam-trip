"use client";

import { ThemeProvider } from "next-themes";
import { GsapProvider } from "./GsapProvider";
import { ThemeBackground } from "@/components/ThemeBackground";
import { ArrivalProvider } from "@/components/ArrivalProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ArrivalProvider>
        <ThemeBackground />
        <GsapProvider>{children}</GsapProvider>
      </ArrivalProvider>
    </ThemeProvider>
  );
}
