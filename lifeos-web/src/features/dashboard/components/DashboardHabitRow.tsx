import { Icon } from '../../../components/Icon';
import type { Habit } from '../../../ts/habits';
import useHabitToggle from '../hooks/useHabitToggle';
import styles from '../DashboardPage.module.css';

interface DashboardHabitRowProps {
  habit: Habit;
  date: string;
  onToggle: () => void;
}

export const DashboardHabitRow = ({ habit, date, onToggle }: DashboardHabitRowProps) => {
  const { pending, toggle } = useHabitToggle(habit.id, date, onToggle);

  return (
    <li className={styles.habitRow}>
      <button
        onClick={toggle}
        disabled={pending}
        className={styles.habitToggle}
        style={{
          border: `2px solid ${habit.completed ? 'var(--color-secondary)' : 'var(--color-surface-container-high)'}`,
          background: habit.completed
            ? 'linear-gradient(135deg, var(--color-secondary-container), var(--color-secondary))'
            : 'transparent',
          boxShadow: habit.completed ? '0 0 8px rgba(192, 193, 255, 0.25)' : 'none',
        }}
      >
        {habit.completed && <Icon name="check" size={10} />}
      </button>
      <span
        className={`${styles.habitName} ${habit.completed ? styles.habitNameCompleted : ''}`}
        style={{ color: habit.completed ? 'var(--color-on-surface-variant)' : 'var(--color-on-surface)' }}
      >
        {habit.name}
      </span>
    </li>
  );
};
