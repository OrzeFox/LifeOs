export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: Array<{ name: string; sets: number; reps: string; rest?: string }>;
}

export interface MealPlan {
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string[];
  kcalEstimate?: number;
}

export interface Recommendation {
  id: string;
  goal: 'gain' | 'lose' | 'maintain';
  heightCm?: number | null;
  weightKg?: number | null;
  aiProvider: string;
  summary: string;
  workoutPlan: { days: WorkoutDay[] };
  mealPlan: MealPlan;
  generatedAt: string;
}
