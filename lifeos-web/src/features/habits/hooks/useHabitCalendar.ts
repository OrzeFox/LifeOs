import { useState, useEffect } from 'react';
import { habitsApi } from '../../../api/habits';
import type { CalendarDay } from '../../../ts/habits';

const useHabitCalendar = (habitId: string) => {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [days, setDays]   = useState<CalendarDay[]>([]);

  useEffect(() => {
    habitsApi.getCalendar(habitId, year, month)
      .then((r) => setDays(Array.isArray(r.data) ? r.data : []))
      .catch((err) => { console.error(err); setDays([]); });
  }, [habitId, year, month]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    const ny = month === 12 ? year + 1 : year;
    const nm = month === 12 ? 1 : month + 1;
    if (ny > now.getFullYear() || (ny === now.getFullYear() && nm > now.getMonth() + 1)) return;
    setMonth(nm);
    setYear(ny);
  };

  const monthLabel = new Date(year, month - 1, 1)
    .toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

  const firstDow = new Date(year, month - 1, 1).getDay();
  const offset   = firstDow === 0 ? 6 : firstDow - 1;

  return { days, prevMonth, nextMonth, monthLabel, offset };
};

export default useHabitCalendar;
