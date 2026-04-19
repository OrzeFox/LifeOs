import type { InsightRule } from './rule.interface';

export const overSpendingRule: InsightRule = {
  id: 'finance.over-weekly-avg',
  evaluate(ctx) {
    const { weekSpent, weeklyAvgSpend } = ctx.finance;
    if (weeklyAvgSpend <= 0) return null;
    const ratio = weekSpent / weeklyAvgSpend;
    if (ratio < 1.2) return null;

    const pct = Math.round((ratio - 1) * 100);
    return {
      ruleId: this.id,
      category: 'finance',
      priority: ratio >= 1.5 ? 'urgent' : 'warn',
      title: `Gasto ${pct}% sobre promedio`,
      message: `Esta semana gastaste $${weekSpent.toFixed(0)} vs promedio $${weeklyAvgSpend.toFixed(0)}. Revisa categorías inusuales.`,
      data: { weekSpent, weeklyAvgSpend, ratio },
    };
  },
};
