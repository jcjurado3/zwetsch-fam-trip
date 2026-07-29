"use client";

import { usePathname } from "next/navigation";
import { FloatingIslandNav } from "./FloatingIslandNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isDetailPage =
    pathname.startsWith("/itinerary/places/") ||
    (pathname.startsWith("/itinerary/") && pathname !== "/itinerary/map");

  if (isDetailPage) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col">
      <main className="min-w-0 flex-1 px-4 pt-6 pb-32 safe-top">{children}</main>
      <FloatingIslandNav />
    </div>
  );
}
