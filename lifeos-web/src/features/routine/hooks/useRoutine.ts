import { useEffect, useState } from 'react';
import api from '../../../api/client';
import type { Meal, MealForm, DailySummary } from '../../../ts/routine';

const useRoutine = (date: string) => {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/nutrition/meals/summary', { params: { date } });
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [date]);

  const add = async (form: MealForm) => {
    await api.post('/nutrition/meals', form);
    await load();
  };

  const update = async (id: string, data: Partial<Meal>) => {
    await api.patch(`/nutrition/meals/${id}`, data);
    await load();
  };

  const remove = async (id: string) => {
    await api.delete(`/nutrition/meals/${id}`);
    await load();
  };

  return { summary, loading, add, update, remove };
};

export default useRoutine;
