import { Icon } from '../../../components/Icon';
import type { Habit } from '../../../ts/habits';
import useHabitCalendar from '../hooks/useHabitCalendar';
import styles from '../HabitsPage.module.css';

export const HabitCalendar = ({ habit }: { habit: Habit }) => {
  const { days, prevMonth, nextMonth, monthLabel, offset } = useHabitCalendar(habit.id);
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarHeader}>
        <button onClick={prevMonth} className={styles.calNavBtn}><Icon name="chevron_left" size={16} /></button>
        <span className={styles.calMonthLabel}>{monthLabel}</span>
        <button onClick={nextMonth} className={styles.calNavBtn}><Icon name="chevron_right" size={16} /></button>
      </div>
      <div className={styles.calGrid}>
        {['L','M','X','J','V','S','D'].map((d) => (
          <span key={d} className={styles.calDayName}>{d}</span>
        ))}
        {Array.from({ length: offset }, (_, i) => <span key={`e${i}`} />)}
        {days.map((day) => {
          const d       = parseInt(day.date.split('-')[2], 10);
          const isToday = day.date === todayStr;
          return (
            <div
              key={day.date}
              className={`${styles.calCell} ${!day.scheduled ? styles.calCellUnscheduled : ''} ${isToday ? styles.calCellToday : ''}`}
              title={`${day.date}: ${day.progress}%`}
            >
              <span className={styles.calDayNum}>{d}</span>
              {day.scheduled && (
                <div
                  className={styles.calDot}
                  style={{
                    background: day.completed
                      ? habit.color
                      : day.progress > 0
                      ? `${habit.color}66`
                      : 'var(--color-surface-container-high)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
