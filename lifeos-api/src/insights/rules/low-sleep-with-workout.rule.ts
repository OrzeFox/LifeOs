import type { InsightRule } from './rule.interface';

export const lowSleepWithWorkoutRule: InsightRule = {
  id: 'sleep.low-with-workout',
  evaluate(ctx) {
    const hours = ctx.sleep.lastNight?.durationHours;
    if (!hours || hours >= 6) return null;
    if (!ctx.events.workoutScheduledToday) return null;

    return {
      ruleId: this.id,
      category: 'health',
      priority: 'urgent',
      title: 'Poco sueño + gym hoy',
      message: `Dormiste ${hours.toFixed(1)}h y tienes entrenamiento agendado. Considera reducir intensidad o mover la sesión.`,
      data: { hours, threshold: 6 },
    };
  },
};
