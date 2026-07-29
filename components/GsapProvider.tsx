"use client";

import { useEffect } from "react";
import { registerGsapPlugins } from "@/lib/gsap/register";

export function GsapProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerGsapPlugins();
  }, []);

  return <>{children}</>;
}
