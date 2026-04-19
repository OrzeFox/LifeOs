import { useCallback, useEffect, useState } from 'react';
import { Icon } from '../../../components/Icon';
import { habitsApi } from '../../../api/habits';
import type { Habit } from '../../../ts/habits';
import { MonthCalendar } from '../components/MonthCalendar';
import { TodayRow } from '../components/TodayRow';
import styles from '../HabitsPage.module.css';

interface CalendarViewProps {
  date: string;
  onDateChange: (d: string) => void;
}

export const CalendarView = ({ date, onDateChange }: CalendarViewProps) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await habitsApi.getToday(date);
      setHabits(res.data);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const onToggleComplete = async (h: Habit) => {
    if (h.habitType === 'checklist') {
      const items = h.checklistItems ?? [];
      const next  = h.completed ? items.map(() => false) : items.map(() => true);
      await habitsApi.setProgress(h.id, date, next.filter(Boolean).length, next);
    } else if (h.habitType === 'timer' || h.habitType === 'numeric') {
      const full = h.targetValue ?? 1;
      const next = h.completed ? 0 : full;
      await habitsApi.setProgress(h.id, date, next);
    } else {
      await habitsApi.setProgress(h.id, date, h.completed ? 0 : 1);
    }
    await load();
  };

  const onIncrement = async (h: Habit) => {
    await habitsApi.increment(h.id, date);
    await load();
  };

  const onChecklistToggle = async (h: Habit, i: number, checked: boolean) => {
    const items = h.checklistItems ?? [];
    const state = h.checklistState ?? items.map(() => false);
    const next  = [...state];
    next[i] = checked;
    await habitsApi.setProgress(h.id, date, next.filter(Boolean).length, next);
    await load();
  };

  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div className={styles.calendarWrap}>
      <div className={styles.card}>
        <MonthCalendar selectedDate={date} onSelectDate={onDateChange} />
      </div>

      <div className={styles.card}>
        <div className={styles.labelSm}>
          <Icon name="event" size={11} /> {dateLabel}
        </div>

        {loading ? (
          <div className={styles.emptyState}>
            <div className={styles.skeletonLine} style={{ width: '60%' }} />
          </div>
        ) : habits.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}><Icon name="event_busy" size={24} /></span>
            <p className={styles.emptyText}>Sin hábitos programados este día.</p>
          </div>
        ) : (
          <div className={styles.todayList}>
            {habits.map((h) => (
              <TodayRow
                key={h.id}
                habit={h}
                date={date}
                onToggleComplete={onToggleComplete}
                onIncrement={onIncrement}
                onChecklistToggle={onChecklistToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
