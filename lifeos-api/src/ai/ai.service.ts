export interface FitnessContext {
  goal: 'gain' | 'lose' | 'maintain';
  heightCm?: number;
  weightKg?: number;
  age?: number;
  notes?: string;
}

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

export interface FitnessPlan {
  summary: string;
  workoutPlan: { days: WorkoutDay[] };
  mealPlan: MealPlan;
}

export interface AiService {
  generateFitnessPlan(context: FitnessContext): Promise<FitnessPlan>;
}

export const AI_SERVICE = Symbol('AI_SERVICE');
