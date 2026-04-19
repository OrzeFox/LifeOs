import { useCallback, useEffect, useState } from 'react';
import { Icon } from '../../../components/Icon';
import { habitsApi } from '../../../api/habits';
import type { Habit } from '../../../ts/habits';
import { TodayRow } from '../components/TodayRow';
import styles from '../HabitsPage.module.css';

interface TodayViewProps {
  date: string;
  onDateChange: (d: string) => void;
}

export const TodayView = ({ date, onDateChange }: TodayViewProps) => {
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

  const completed = habits.filter((h) => h.completed).length;
  const pending   = habits.length - completed;
  const pct       = habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0;

  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div className={styles.todayWrap}>
      <div className={styles.card}>
        <div className={styles.summaryHeader}>
          <div>
            <div className={styles.labelSm}><Icon name="today" size={11} /> {dateLabel}</div>
            <p className={styles.summaryLine}>
              <strong>{completed}</strong> completados · <strong>{pending}</strong> pendientes
            </p>
          </div>
          <div className={styles.summaryRight}>
            <input
              type="date"
              className={styles.dateInput}
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
            />
            <span className={styles.summaryPct}>{pct}%</span>
          </div>
        </div>

        {habits.length > 0 && (
          <div className={styles.segmentBar}>
            {habits.map((h) => (
              <div
                key={h.id}
                title={`${h.name}: ${h.progress}%`}
                className={styles.segment}
                style={{
                  background: h.completed
                    ? h.color
                    : h.progress > 0
                      ? `${h.color}66`
                      : 'var(--color-surface-container-high)',
                  boxShadow: h.completed ? `0 0 8px ${h.color}44` : 'none',
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.labelSm}><Icon name="checklist" size={11} /> Para hoy</div>

        {loading ? (
          <div className={styles.emptyState}>
            <div className={styles.skeletonLine} style={{ width: '60%' }} />
          </div>
        ) : habits.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}><Icon name="self_improvement" size={24} /></span>
            <p className={styles.emptyText}>Nada programado para este día.<br />Crea algo en la vista "Hábitos".</p>
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
