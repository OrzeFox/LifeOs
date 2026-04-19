import type { InsightRule } from './rule.interface';

export const lowMoodStreakRule: InsightRule = {
  id: 'journal.low-mood-streak',
  evaluate(ctx) {
    const streak = ctx.journal.lowMoodStreak;
    if (streak < 3) return null;

    return {
      ruleId: this.id,
      category: 'health',
      priority: streak >= 5 ? 'urgent' : 'warn',
      title: `Mood bajo ${streak} días`,
      message: `Has registrado mood ≤4 durante ${streak} días consecutivos. Revisa sueño, ejercicio y conexión social — patrones correlacionan.`,
      data: { streak },
    };
  },
};
