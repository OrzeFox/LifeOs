import { Icon } from '../../../components/Icon';
import type { Habit } from '../../../ts/habits';
import { HABIT_TYPES, WEEKDAYS } from '../../../ts/habits';
import { StateSelector } from './StateSelector';
import { TypeDetail } from './TypeDetail';
import { HabitCalendar } from './HabitCalendar';
import { HabitHistory } from './HabitHistory';
import styles from '../HabitsPage.module.css';

interface HabitRowProps {
  habit: Habit;
  isSelected: boolean;
  isDeleting: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
  onSave: () => void;
}

export const HabitRow = ({ habit, isSelected, isDeleting, onToggleSelect, onDelete, onSave }: HabitRowProps) => {
  const effectiveType = habit.habitType ?? 'simple';
  const typeInfo      = HABIT_TYPES.find((t) => t.value === effectiveType);

  return (
    <div
      className={`${styles.habitRow} ${isSelected ? styles.habitRowSelected : ''}`}
      style={{ borderLeft: `3px solid ${habit.color}` }}
    >
      <div className={styles.habitRowMain}>
        <div className={styles.habitInfo} onClick={onToggleSelect} style={{ cursor: 'pointer' }}>
          <div className={styles.habitNameRow}>
            <p className={`${styles.habitName} ${habit.completed ? styles.habitNameDone : ''}`}>
              {habit.name}
            </p>
            {effectiveType !== 'simple' && typeInfo && (
              <span className={styles.habitTypeTag}>
                <Icon name={typeInfo.icon} size={10} /> {typeInfo.label}
              </span>
            )}
            {habit.scheduleDays?.length ? (
              <span className={styles.habitScheduleTag}>
                {habit.scheduleDays.map((d) => WEEKDAYS.find((w) => w.value === d)?.label).join(' ')}
              </span>
            ) : null}
          </div>
          {habit.description && <p className={styles.habitDesc}>{habit.description}</p>}
        </div>

        <div className={styles.habitControls}>
          <StateSelector habit={habit} onSave={onSave} />
          {effectiveType !== 'simple' && <TypeDetail habit={habit} onSave={onSave} />}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          disabled={isDeleting}
          className={styles.deleteBtn}
        >
          <Icon name="delete_outline" size={16} />
        </button>
      </div>

      {isSelected && (
        <div className={styles.habitDetail}>
          <HabitCalendar habit={habit} />
          <HabitHistory habit={habit} />
        </div>
      )}
    </div>
  );
};
