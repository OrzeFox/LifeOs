import api from './client';

export const financesApi = {
  getExpenses: (year?: number, month?: number) =>
    api.get('/finances/expenses', { params: { year, month } }),

  createExpense: (data: {
    name: string;
    amount: number;
    type: 'fixed' | 'variable';
    category?: string;
    date: string;
  }) => api.post('/finances/expenses', data),

  deleteExpense: (id: string) => api.delete(`/finances/expenses/${id}`),

  setIncome: (amount: number, month: string) =>
    api.post('/finances/income', { amount, month }),

  getSummary: (year?: number, month?: number) =>
    api.get('/finances/summary', { params: { year, month } }),
};
