export type GoalMetric =
  | 'sleep.avgHours'
  | 'gym.sessionsCount'
  | 'finance.monthSaved'
  | 'habits.completionRate'
  | 'journal.avgMood';

export type GoalOperator = 'gte' | 'lte';
export type GoalTimeframe = '7d' | '30d' | 'month';
export type GoalStatus = 'active' | 'completed' | 'failed' | 'paused' | 'archived';

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  metric: GoalMetric;
  operator: GoalOperator;
  target: number;
  timeframe: GoalTimeframe;
  targetDate: string | null;
  status: GoalStatus;
  createdAt: string;
  completedAt: string | null;
}

export interface GoalProgress {
  goal: Goal;
  currentValue: number;
  progress: number;
  met: boolean;
  distance: number;
}

export interface CreateGoalPayload {
  title: string;
  description?: string;
  metric: GoalMetric;
  operator: GoalOperator;
  target: number;
  timeframe: GoalTimeframe;
  targetDate?: string;
}

export const METRIC_LABELS: Record<GoalMetric, string> = {
  'sleep.avgHours': 'Horas de sueño promedio',
  'gym.sessionsCount': 'Entrenamientos',
  'finance.monthSaved': 'Ahorro mensual ($)',
  'habits.completionRate': 'Cumplimiento hábitos (%)',
  'journal.avgMood': 'Ánimo promedio',
};

export const TIMEFRAME_LABELS: Record<GoalTimeframe, string> = {
  '7d': 'Últimos 7 días',
  '30d': 'Últimos 30 días',
  'month': 'Mes actual',
};
