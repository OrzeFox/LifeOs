import { Icon } from '../../../components/Icon';
import type { Habit } from '../../../ts/habits';
import useHabitHistory from '../hooks/useHabitHistory';
import styles from '../HabitsPage.module.css';

export const HabitHistory = ({ habit }: { habit: Habit }) => {
  const { history } = useHabitHistory(habit.id);

  return (
    <div className={styles.history}>
      <div className={styles.labelSm} style={{ marginBottom: 10 }}>
        <Icon name="bar_chart" size={11} /> Últimos 14 días
      </div>
      <div className={styles.historyBars}>
        {history.map((day) => {
          const label = new Date(day.date + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'narrow' });
          return (
            <div key={day.date} className={styles.historyBar} title={`${day.date}: ${day.progress}%`}>
              <div className={styles.historyBarTrack}>
                <div
                  className={styles.historyBarFill}
                  style={{
                    height: `${day.progress}%`,
                    background: day.completed
                      ? habit.color
                      : day.progress > 0
                      ? `${habit.color}66`
                      : 'var(--color-surface-container-high)',
                  }}
                />
              </div>
              <span className={styles.historyBarLabel}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
