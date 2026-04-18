import { Icon } from '../../../components/Icon';
import type { Habit } from '../../../ts/habits';
import { HABIT_STATES, getHabitState, computeProgressForState } from '../../../domain/habits/habitState';
import type { HabitStateValue } from '../../../domain/habits/habitState';
import useHabitProgress from '../hooks/useHabitProgress';
import styles from '../HabitsPage.module.css';

export const StateSelector = ({ habit, onSave }: { habit: Habit; onSave: () => void }) => {
  const current = getHabitState(habit);
  const { saveProgress } = useHabitProgress(habit.id, onSave);

  const applyState = async (s: HabitStateValue) => {
    if (s === current) return;
    const { value, checklistState } = computeProgressForState(s, habit);
    await saveProgress(value, checklistState);
  };

  return (
    <div className={styles.stateSelector}>
      {HABIT_STATES.map((s) => {
        const active = current === s.value;
        return (
          <button
            key={s.value}
            onClick={(e) => { e.stopPropagation(); applyState(s.value); }}
            className={`${styles.stateBtn} ${active ? styles.stateBtnActive : ''}`}
            style={{
              color:       active ? s.activeColor  : s.inactiveColor,
              borderColor: active ? s.activeBorder : 'rgba(255,255,255,0.08)',
              background:  active ? s.activeBg     : 'transparent',
              fontWeight:  active ? 700             : 500,
            }}
          >
            <Icon name={s.icon} size={12} style={{ color: active ? s.activeColor : s.inactiveColor }} />
            <span>{s.label}</span>
          </button>
        );
      })}
    </div>
  );
};
