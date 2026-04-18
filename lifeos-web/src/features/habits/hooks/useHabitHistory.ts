import { useState, useEffect } from 'react';
import { habitsApi } from '../../../api/habits';
import type { HistoryDay } from '../../../ts/habits';

const useHabitHistory = (habitId: string, days = 14) => {
  const [history, setHistory] = useState<HistoryDay[]>([]);

  useEffect(() => {
    habitsApi.getHistory(habitId, days)
      .then((r) => setHistory(Array.isArray(r.data) ? r.data : []))
      .catch((err) => { console.error(err); setHistory([]); });
  }, [habitId, days]);

  return { history };
};

export default useHabitHistory;
