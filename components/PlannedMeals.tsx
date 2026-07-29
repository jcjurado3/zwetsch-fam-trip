"use client";

import { useCallback, useEffect, useState } from "react";
import { MenuDaySection } from "@/components/MenuDaySection";
import type { MenuItem } from "@/lib/types";
import { groupByDay } from "@/lib/utils";

interface PlannedMealsProps {
  refreshKey: number;
}

export function PlannedMeals({ refreshKey }: PlannedMealsProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [source, setSource] = useState<"seed" | "database" | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/menu");
      if (!res.ok) throw new Error("Failed to load menu");
      const data = await res.json();
      setItems(data.items ?? []);
      setSource(data.source === "database" ? "database" : "seed");
    } catch {
      setItems([]);
      setSource(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu, refreshKey]);

  const grouped = groupByDay(items);
  const days = Object.keys(grouped).sort();

  if (loading) {
    return <p className="text-center text-sm text-muted">Loading menu...</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-lg font-semibold">Planned Meals</h2>
        <p className="text-sm text-muted">
          {source === "seed"
            ? "Showing sample menu — add a family request to the plan to replace it"
            : "Family planned meals"}
        </p>
      </div>

      {days.length === 0 ? (
        <div className="card-surface rounded-3xl p-8 text-center">
          <p className="text-muted">No meals planned yet.</p>
        </div>
      ) : (
        days.map((day, index) => (
          <MenuDaySection
            key={day}
            dayDate={day}
            items={grouped[day]}
            defaultOpen={index === 0}
          />
        ))
      )}
    </div>
  );
}
