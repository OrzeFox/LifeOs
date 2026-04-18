import { useState, useCallback, useEffect } from 'react';
import { habitsApi } from '../../../api/habits';
import type { Habit, HabitType } from '../../../ts/habits';

type CreatePayload = {
  name: string;
  description?: string;
  habitType?: HabitType;
  targetValue?: number;
  scheduleDays?: number[];
  color?: string;
  checklistItems?: string[];
};

const useHabits = (date: string) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = useCallback(() =>
    habitsApi.getToday(date).then((r) => setHabits(r.data)), [date]);

  useEffect(() => { refresh(); }, [refresh]);

  const remove = async (id: string) => {
    setDeletingId(id);
    try {
      await habitsApi.delete(id);
    } catch (err) { console.error(err); }
    setDeletingId(null);
    refresh();
  };

  const create = async (data: CreatePayload) => {
    try {
      await habitsApi.create(data);
      refresh();
    } catch (err) { console.error(err); }
  };

  return { habits, deletingId, refresh, remove, create };
};

export default useHabits;
