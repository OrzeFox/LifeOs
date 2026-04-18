import { useEffect, useState } from 'react';
import api from '../../../api/client';

const useRoutineHistory = () => {
  const [historyDates, setHistoryDates] = useState<string[]>([]);

  const load = async () => {
    try {
      const res = await api.get('/routine/meals/history');
      setHistoryDates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { load(); }, []);

  return { historyDates, reloadHistory: load };
};

export default useRoutineHistory;
