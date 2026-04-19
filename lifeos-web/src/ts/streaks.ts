export interface HabitStreak {
  habitId: string;
  name: string;
  color: string;
  current: number;
  longest: number;
}

export interface StreakRecord {
  current: number;
  longest: number;
}

export interface StreakSummary {
  habits: HabitStreak[];
  gym: StreakRecord;
  sleep: StreakRecord & { thresholdHours: number };
  journal: StreakRecord;
}
