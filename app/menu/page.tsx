"use client";

import { useState } from "react";
import { MealRequestSection } from "@/components/MealRequestSection";
import { PlannedMeals } from "@/components/PlannedMeals";
import { PageHero } from "@/components/PageHero";

export default function MenuPage() {
  const [planRefreshKey, setPlanRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <PageHero
        title="Daily Menu"
        subtitle="What's cooking Aug 5–11 · request your favorites"
      />

      <MealRequestSection
        onPlanChanged={() => setPlanRefreshKey((k) => k + 1)}
      />

      <PlannedMeals refreshKey={planRefreshKey} />
    </div>
  );
}
