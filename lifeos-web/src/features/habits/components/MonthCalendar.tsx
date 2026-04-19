import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../../../components/Icon';
import { habitsApi } from '../../../api/habits';
import type { MonthRollupDay } from '../../../ts/habits';
import styles from '../HabitsPage.module.css';

interface MonthCalendarProps {
  onSelectDate: (date: string) => void;
  selectedDate: string;
}

export const MonthCalendar = ({ onSelectDate, selectedDate }: MonthCalendarProps) => {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [days, setDays]   = useState<MonthRollupDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    habitsApi.getMonthly(year, month)
      .then((r) => setDays(Array.isArray(r.data) ? r.data : []))
      .catch(() => setDays([]))
      .finally(() => setLoading(false));
  }, [year, month]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const monthLabel = useMemo(() =>
    new Date(year, month - 1, 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
    [year, month],
  );

  const firstDow = new Date(year, month - 1, 1).getDay();
  const offset   = firstDow === 0 ? 6 : firstDow - 1;
  const todayStr = today.toISOString().split('T')[0];

  return (
    <div className={styles.monthCal}>
      <div className={styles.monthCalHeader}>
        <button onClick={prevMonth} className={styles.calNavBtn} aria-label="Mes anterior">
          <Icon name="chevron_left" size={16} />
        </button>
        <span className={styles.monthCalLabel}>{monthLabel}</span>
        <button onClick={nextMonth} className={styles.calNavBtn} aria-label="Mes siguiente">
          <Icon name="chevron_right" size={16} />
        </button>
      </div>

      <div className={styles.monthCalGrid}>
        {['L','M','X','J','V','S','D'].map((d) => (
          <span key={d} className={styles.calDayName}>{d}</span>
        ))}
        {Array.from({ length: offset }, (_, i) => <span key={`e${i}`} />)}
        {days.map((day) => {
          const d        = parseInt(day.date.split('-')[2], 10);
          const isToday  = day.date === todayStr;
          const selected = day.date === selectedDate;
          const pct      = day.scheduled > 0 ? (day.completed / day.scheduled) * 100 : 0;
          const colors   = day.colors.slice(0, 4);

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onSelectDate(day.date)}
              className={`${styles.monthCell}
                ${isToday ? styles.monthCellToday : ''}
                ${selected ? styles.monthCellSelected : ''}`}
              title={`${day.completed}/${day.scheduled} completados`}
            >
              <span className={styles.monthCellDay}>{d}</span>
              {day.scheduled > 0 && (
                <div className={styles.monthCellDots}>
                  {colors.length > 0
                    ? colors.map((c, i) => (
                        <span key={i} className={styles.monthCellDot} style={{ background: c }} />
                      ))
                    : <span className={styles.monthCellDot} style={{ background: 'var(--color-surface-container-high)' }} />
                  }
                </div>
              )}
              {day.scheduled > 0 && (
                <div className={styles.monthCellBar}>
                  <div
                    className={styles.monthCellBarFill}
                    style={{
                      width: `${pct}%`,
                      background: pct >= 100 ? 'var(--color-primary)' : pct >= 50 ? 'var(--color-tertiary)' : 'var(--color-outline)',
                    }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {loading && <div className={styles.calLoading}>Cargando…</div>}
    </div>
  );
};
