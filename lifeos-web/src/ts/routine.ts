export type MealType = 'desayuno' | 'almuerzo' | 'cena' | 'snack' | 'merienda' | 'otro';

export const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'desayuno',  label: 'Desayuno' },
  { value: 'almuerzo',  label: 'Almuerzo' },
  { value: 'cena',      label: 'Cena' },
  { value: 'snack',     label: 'Snack' },
  { value: 'merienda',  label: 'Merienda' },
  { value: 'otro',      label: 'Otro' },
];

export const TIME_SLOTS: { value: string; label: string }[] = [
  { value: '07:00', label: 'Mañana · 7:00' },
  { value: '10:00', label: 'Media mañana · 10:00' },
  { value: '12:30', label: 'Mediodía · 12:30' },
  { value: '15:30', label: 'Tarde · 15:30' },
  { value: '19:00', label: 'Noche · 19:00' },
  { value: '21:00', label: 'Noche tardía · 21:00' },
];

export interface Nutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface Meal extends Nutrition {
  id: string;
  mealType: MealType;
  scheduledTime?: string;
  description?: string;
  date: string;
}

export interface MealForm {
  mealType: MealType;
  scheduledTime: string;
  description: string;
  date: string;
}

export interface DailyTotals extends Required<Nutrition> {}

export interface DailySummary {
  date: string;
  meals: Meal[];
  totals: DailyTotals;
}
