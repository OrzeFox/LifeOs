import { useMemo } from 'react';
import type { AppEvent } from '../../../ts/events';
import styles from '../EventsPage.module.css';

interface Props {
  year: number;
  month: number;
  events: AppEvent[];
  selectedDate?: string;
  onSelectDate: (isoDate: string) => void;
}

const DAY_LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

const toIsoDate = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const MonthView = ({ year, month, events, selectedDate, onSelectDate }: Props) => {
  const grid = useMemo(() => {
    const first = new Date(year, month, 1);
    const startOffset = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = Array(startOffset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, AppEvent[]>();
    events.forEach(e => {
      const key = toIsoDate(new Date(e.startAt));
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    });
    return map;
  }, [events]);

  const todayIso = toIsoDate(new Date());

  return (
    <div className={styles.monthGrid}>
      {DAY_LABELS.map(d => <div key={d} className={styles.dayLabel}>{d}</div>)}
      {grid.map((date, i) => {
        if (!date) return <div key={i} className={styles.dayCellEmpty} />;
        const iso = toIsoDate(date);
        const dayEvents = eventsByDay.get(iso) ?? [];
        const isToday = iso === todayIso;
        const isSelected = iso === selectedDate;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelectDate(iso)}
            className={`${styles.dayCell} ${isToday ? styles.dayCellToday : ''} ${isSelected ? styles.dayCellSelected : ''}`}
          >
            <span className={styles.dayNumber}>{date.getDate()}</span>
            <div className={styles.dayDots}>
              {dayEvents.slice(0, 3).map(e => (
                <span
                  key={e.id}
                  className={styles.dot}
                  style={{ background: e.category?.color ?? '#666' }}
                />
              ))}
              {dayEvents.length > 3 && <span className={styles.dotMore}>+{dayEvents.length - 3}</span>}
            </div>
          </button>
        );
      })}
    </div>
  );
};
