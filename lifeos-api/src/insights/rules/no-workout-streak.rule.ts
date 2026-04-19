import type { InsightRule } from './rule.interface';

const THRESHOLD_DAYS = 4;

export const noWorkoutStreakRule: InsightRule = {
  id: 'gym.no-workout-streak',
  evaluate(ctx) {
    const days = ctx.gym.daysSinceLastWorkout;
    if (days === null || days < THRESHOLD_DAYS) return null;

    return {
      ruleId: this.id,
      category: 'health',
      priority: days >= 10 ? 'urgent' : 'warn',
      title: `${days} días sin entrenar`,
      message: `Última sesión: ${ctx.gym.lastWorkoutDate ?? 'sin registro'}. Agenda una sesión corta hoy para mantener consistencia.`,
      data: { daysSinceLastWorkout: days, lastWorkoutDate: ctx.gym.lastWorkoutDate },
    };
  },
};
