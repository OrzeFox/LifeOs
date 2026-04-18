import { Icon } from '../../../components/Icon';
import type { Habit } from '../../../ts/habits';
import useHabitProgress from '../hooks/useHabitProgress';
import styles from '../HabitsPage.module.css';

export const TypeDetail = ({ habit, onSave }: { habit: Habit; onSave: () => void }) => {
  const type = habit.habitType ?? 'simple';
  const { saveProgress } = useHabitProgress(habit.id, onSave);

  if (type === 'checklist') {
    const items = habit.checklistItems ?? [];
    const state = habit.checklistState ?? items.map(() => false);
    return (
      <div className={styles.typeDetailChecklist}>
        {items.map((item, i) => (
          <label key={i} className={styles.typeDetailCheckItem} onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={state[i] ?? false}
              onChange={(e) => {
                const next = [...state];
                next[i] = e.target.checked;
                saveProgress(next.filter(Boolean).length, next);
              }}
            />
            <span className={state[i] ? styles.checklistLabelDone : ''}>{item}</span>
          </label>
        ))}
      </div>
    );
  }

  if (type === 'timer' || type === 'numeric') {
    const unit = type === 'timer' ? 'min' : 'veces';
    return (
      <div className={styles.typeDetailNumeric} onClick={(e) => e.stopPropagation()}>
        <Icon name={type === 'timer' ? 'timer' : 'pin'} size={13} style={{ color: 'var(--color-outline)' }} />
        <input
          type="number"
          min={0}
          defaultValue={habit.value || ''}
          placeholder="0"
          className={styles.typeDetailInput}
          onBlur={(e) => saveProgress(parseFloat(e.target.value) || 0)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const v = parseFloat((e.target as HTMLInputElement).value) || 0;
              saveProgress(v);
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
        <span className={styles.typeDetailUnit}>
          {habit.targetValue ? `/ ${habit.targetValue} ${unit}` : unit}
        </span>
      </div>
    );
  }

  return null;
};
