import { Injectable } from '@nestjs/common';
import { UserContextService } from '../user-context/user-context.service';
import type { UserContext } from '../user-context/types';
import type {
  FinancePrediction, GymPrediction, HabitsPrediction,
  PredictionSet, SleepPrediction, Trend,
} from './types';

function trendOf(recent: number, baseline: number, epsilon = 0.1): Trend {
  if (recent > baseline + epsilon) return 'up';
  if (recent < baseline - epsilon) return 'down';
  return 'stable';
}

@Injectable()
export class PredictionsService {
  constructor(private readonly context: UserContextService) {}

  async compute(userId: string): Promise<PredictionSet> {
    const ctx = await this.context.build(userId);
    return {
      userId,
      generatedAt: new Date().toISOString(),
      finance: this.finance(ctx),
      sleep: this.sleep(ctx),
      habits: this.habits(ctx),
      gym: this.gym(ctx),
    };
  }

  private finance(ctx: UserContext): FinancePrediction {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const dayOfMonth = today.getDate();
    const dailyAvg = dayOfMonth > 0 ? ctx.finance.monthSpent / dayOfMonth : 0;
    const daysLeft = daysInMonth - dayOfMonth;
    const projected = ctx.finance.monthSpent + dailyAvg * daysLeft;
    const remaining = ctx.finance.monthIncome - projected;
    const conf = Math.min(1, dayOfMonth / 10);
    return {
      monthEndProjectedRemaining: Math.round(remaining * 100) / 100,
      dailyAvgSpend: Math.round(dailyAvg * 100) / 100,
      projectionConfidence: Number(conf.toFixed(2)),
    };
  }

  private sleep(ctx: UserContext): SleepPrediction {
    const avg7 = ctx.sleep.avgHours7d;
    const avg30 = ctx.sleep.avgHours30d;
    const delta = avg7 - avg30;
    const projected = avg7 + delta * 0.5;
    return {
      avg7d: Number(avg7.toFixed(2)),
      avg30d: Number(avg30.toFixed(2)),
      projectedAvgNext7d: Number(Math.max(0, projected).toFixed(2)),
      trend: trendOf(avg7, avg30, 0.15),
    };
  }

  private habits(ctx: UserContext): HabitsPrediction {
    const rate = ctx.habits.last7dCompletionRate;
    const streakBoost = ctx.habits.missedDaysStreak > 0 ? -0.05 : 0;
    const projected = Math.max(0, Math.min(1, rate + streakBoost));
    return {
      last7dRate: Number(rate.toFixed(3)),
      projectedRateNext7d: Number(projected.toFixed(3)),
      trend: trendOf(projected, rate, 0.02),
    };
  }

  private gym(ctx: UserContext): GymPrediction {
    const last7 = ctx.gym.last7dCount;
    const last30 = ctx.gym.last30dCount;
    const weekly30 = last30 / 4;
    const projected = Math.round((last7 + weekly30) / 2);
    return {
      sessionsLast7d: last7,
      sessionsLast30d: last30,
      projectedSessionsNext7d: projected,
      trend: trendOf(last7, weekly30, 0.5),
    };
  }
}
