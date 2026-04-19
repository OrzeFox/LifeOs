import type { InsightRule } from './rule.interface';

export const journalGapRule: InsightRule = {
  id: 'journal.gap',
  evaluate(ctx) {
    if (ctx.journal.entries7d > 0) return null;

    return {
      ruleId: this.id,
      category: 'productivity',
      priority: 'info',
      title: 'Sin journal esta semana',
      message: 'No has registrado entradas en los últimos 7 días. Registra mood/energía de hoy para habilitar insights correlacionados.',
    };
  },
};
