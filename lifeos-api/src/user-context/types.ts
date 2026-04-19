import type { MacroTotals } from '../nutrition/nutrition.service';

export type DateRange = { from: string; to: string };

export interface ProfileSnapshot {
  id: string;
  name: string;
  goal: 'gain' | 'lose' | 'maintain' | null;
  heightCm: number | null;
  weightKg: number | null;
  age: number | null;
}

export interface SleepSnapshot {
  lastNight: { durationHours: number; sleepAt: string; wakeAt: string } | null;
  avgHours7d: number;
  avgHours30d: number;
  trend: 'improving' | 'declining' | 'stable';
  lowSleepStreak: number;     // consecutive days < 6h
}

export interface GymSnapshot {
  last7dCount: number;
  last30dCount: number;
  lastWorkoutDate: string | null;
  daysSinceLastWorkout: number | null;
  streakDays: number;          // consecutive days with workout
  minutesLast7d: number;
}

export interface NutritionSnapshot {
  todayTotals: MacroTotals;
  avgCalories7d: number;
  mealsToday: number;
}

export interface HabitsSnapshot {
  today: { total: number; completed: number };
  last7dCompletionRate: number;  // 0..1
  missedDaysStreak: number;      // consecutive days where 0 habits completed
  streaks: { habitId: string; name: string; streak: number }[];
}

export interface FinanceSnapshot {
  monthSpent: number;
  monthIncome: number;
  monthRemaining: number;
  weekSpent: number;
  weeklyAvgSpend: number;
  overWeeklyAvg: boolean;
}

export interface EventsSnapshot {
  today: { id: string; title: string; startAt: string; category?: string | null }[];
  next7d: number;
  workoutScheduledToday: boolean;
}

export interface JournalSnapshot {
  today: { mood: number; energyLevel: number; notes: string | null } | null;
  avgMood7d: number;
  avgEnergy7d: number;
  lowMoodStreak: number;
  entries7d: number;
}

export interface UserContext {
  userId: string;
  generatedAt: string;
  range: DateRange;
  profile: ProfileSnapshot;
  sleep: SleepSnapshot;
  gym: GymSnapshot;
  nutrition: NutritionSnapshot;
  habits: HabitsSnapshot;
  finance: FinanceSnapshot;
  events: EventsSnapshot;
  journal: JournalSnapshot;
}
