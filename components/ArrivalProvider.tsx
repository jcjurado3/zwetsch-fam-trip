"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const SESSION_KEY = "zwetsch-arrived";

type ArrivalContextValue = {
  /** True once the “getting there” intro has finished (or was skipped). */
  arrived: boolean;
  markArrived: () => void;
};

const ArrivalContext = createContext<ArrivalContextValue>({
  arrived: false,
  markArrived: () => {},
});

export function useArrival() {
  return useContext(ArrivalContext);
}

export function ArrivalProvider({ children }: { children: React.ReactNode }) {
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion || sessionStorage.getItem(SESSION_KEY) === "1") {
      setArrived(true);
    }
  }, []);

  const markArrived = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setArrived(true);
  }, []);

  const value = useMemo(
    () => ({ arrived, markArrived }),
    [arrived, markArrived]
  );

  return (
    <ArrivalContext.Provider value={value}>{children}</ArrivalContext.Provider>
  );
}
