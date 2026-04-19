import type { Habit } from './habits';
import type { FinanceSummary } from './finances';
import type { Meal } from './routine';

export interface EnergyData {
  level: number | null;
}

export interface EnergyWeeklyDay {
  date: string;
  level: number | null;
}

export interface EnergyWeekly {
  start: string;
  end: string;
  days: EnergyWeeklyDay[];
  average: number;
  best: number;
  worst: number;
  loggedDays: number;
}

export interface DashboardData {
  date: string;
  habits: Habit[];
  summary: FinanceSummary;
  energy: EnergyData | null;
  energyWeekly?: EnergyWeekly;
  meals: Meal[];
}
