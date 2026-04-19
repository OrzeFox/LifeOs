export type Trend = 'up' | 'down' | 'stable';

export interface FinancePrediction {
  monthEndProjectedRemaining: number;
  dailyAvgSpend: number;
  projectionConfidence: number;  // 0..1
}

export interface SleepPrediction {
  avg7d: number;
  avg30d: number;
  projectedAvgNext7d: number;
  trend: Trend;
}

export interface HabitsPrediction {
  last7dRate: number;
  projectedRateNext7d: number;
  trend: Trend;
}

export interface GymPrediction {
  sessionsLast7d: number;
  sessionsLast30d: number;
  projectedSessionsNext7d: number;
  trend: Trend;
}

export interface PredictionSet {
  userId: string;
  generatedAt: string;
  finance: FinancePrediction;
  sleep: SleepPrediction;
  habits: HabitsPrediction;
  gym: GymPrediction;
}
