export type Goal = 'gain' | 'lose' | 'maintain' | null;

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface UserContext {
  userId: string;
  generatedAt: string;
  range: { from: string; to: string };
  profile: {
    id: string;
    name: string;
    goal: Goal;
    heightCm: number | null;
    weightKg: number | null;
    age: number | null;
  };
  sleep: {
    lastNight: { durationHours: number; sleepAt: string; wakeAt: string } | null;
    avgHours7d: number;
    avgHours30d: number;
    trend: 'improving' | 'declining' | 'stable';
    lowSleepStreak: number;
  };
  gym: {
    last7dCount: number;
    last30dCount: number;
    lastWorkoutDate: string | null;
    daysSinceLastWorkout: number | null;
    streakDays: number;
    minutesLast7d: number;
  };
  nutrition: {
    todayTotals: MacroTotals;
    avgCalories7d: number;
    mealsToday: number;
  };
  habits: {
    today: { total: number; completed: number };
    last7dCompletionRate: number;
    missedDaysStreak: number;
    streaks: { habitId: string; name: string; streak: number }[];
  };
  finance: {
    monthSpent: number;
    monthIncome: number;
    monthRemaining: number;
    weekSpent: number;
    weeklyAvgSpend: number;
    overWeeklyAvg: boolean;
  };
  events: {
    today: { id: string; title: string; startAt: string; category: string | null }[];
    next7d: number;
    workoutScheduledToday: boolean;
  };
}
