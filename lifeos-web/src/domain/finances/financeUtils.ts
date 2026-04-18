export const DEFAULT_CATEGORIES = [
  'Comida', 'Salidas', 'Transporte', 'Salud', 'Ropa', 'Entretenimiento',
];

export const computeSpentPct = (spent: number, income: number): number =>
  income > 0 ? Math.min((spent / income) * 100, 100) : 0;
