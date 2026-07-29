import type { ChecklistCategory, MealType } from "@/lib/types";

const checklistTones: Record<ChecklistCategory, string> = {
  packing: "tone-packing",
  groceries: "tone-groceries",
  tasks: "tone-tasks",
  general: "tone-general",
};

const mealTones: Record<MealType, string> = {
  breakfast: "tone-breakfast",
  lunch: "tone-lunch",
  dinner: "tone-dinner",
  snack: "tone-snack",
};

export function checklistToneClass(category: ChecklistCategory | string) {
  return checklistTones[category as ChecklistCategory] ?? checklistTones.general;
}

export function mealToneClass(mealType: MealType | string) {
  return mealTones[mealType as MealType] ?? mealTones.snack;
}
