import type { InsightRule } from './rule.interface';

export const habitsMissedStreakRule: InsightRule = {
  id: 'habits.missed-streak',
  evaluate(ctx) {
    const streak = ctx.habits.missedDaysStreak;
    if (streak < 3) return null;

    return {
      ruleId: this.id,
      category: 'productivity',
      priority: streak >= 7 ? 'urgent' : 'warn',
      title: `${streak} días sin hábitos`,
      message: `Llevas ${streak} días consecutivos sin completar ningún hábito. Elige uno pequeño hoy para romper la inercia.`,
      data: { streak },
    };
  },
};
