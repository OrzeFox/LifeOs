import { useEffect, useState } from 'react';
import { financesApi } from '../../../api/finances';
import type { Expense, FinanceSummary, ExpenseForm } from '../../../ts/finances';

const useFinances = (year: number, month: number) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [exp, sum] = await Promise.all([
        financesApi.getExpenses(year, month),
        financesApi.getSummary(year, month),
      ]);
      setExpenses(exp.data);
      setSummary(sum.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [year, month]);

  const addExpense = async (data: ExpenseForm) => {
    await financesApi.createExpense({ ...data, amount: Number(data.amount) } as any);
    await load();
  };

  const deleteExpense = async (id: string) => {
    await financesApi.deleteExpense(id);
    await load();
  };

  const saveIncome = async (val: number, monthStr: string) => {
    await financesApi.setIncome(val, monthStr);
    await load();
  };

  return { expenses, summary, loading, addExpense, deleteExpense, saveIncome };
};

export default useFinances;
