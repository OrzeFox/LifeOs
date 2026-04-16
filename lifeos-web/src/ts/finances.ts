export interface Expense {
  id: string;
  name: string;
  amount: number;
  type: 'variable' | 'fixed';
  category?: string;
  date: string;
}

export interface FinanceSummary {
  totalIncome: number;
  totalSpent: number;
  remaining: number;
  projectedRemaining: number;
  byCategory: Record<string, number>;
}

export interface ExpenseForm {
  name: string;
  amount: string;
  type: string;
  category: string;
  date: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
}
