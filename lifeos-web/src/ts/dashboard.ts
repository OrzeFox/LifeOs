import type { Habit } from './habits';
import type { FinanceSummary } from './finances';
import type { Meal } from './routine';

export interface EnergyData {
  level: number | null;
}

export interface DashboardData {
  date: string;
  habits: Habit[];
  summary: FinanceSummary;
  energy: EnergyData | null;
  meals: Meal[];
}
