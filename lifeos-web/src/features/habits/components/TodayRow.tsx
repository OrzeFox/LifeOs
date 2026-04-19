import { Icon } from '../../../components/Icon';
import type { Habit } from '../../../ts/habits';
import styles from '../HabitsPage.module.css';

interface TodayRowProps {
  habit: Habit;
  date: string;
  onToggleComplete: (habit: Habit) => void;
  onIncrement: (habit: Habit) => void;
  onChecklistToggle: (habit: Habit, index: number, checked: boolean) => void;
}

const DEFAULT_CHECKLIST = (len: number) => Array(len).fill(false);

export const TodayRow = ({ habit, onToggleComplete, onIncrement, onChecklistToggle }: TodayRowProps) => {
  const type        = habit.habitType ?? 'simple';
  const freqLabel   = habit.frequencyLabel ?? (habit.kind === 'task' ? 'Tarea' : 'Diario');
  const progress    = habit.progress ?? 0;
  const target      = habit.targetValue ?? 0;
  const value       = habit.value ?? 0;
  const isTask      = habit.kind === 'task';
  const doneLabel   = isTask ? 'Terminada' : 'Hecho';

  return (
    <div
      className={`${styles.todayRow} ${habit.completed ? styles.todayRowDone : ''}`}
      style={{ borderLeft: `3px solid ${habit.color}` }}
    >
      <button
        onClick={() => onToggleComplete(habit)}
        className={styles.completeBtn}
        style={{
          borderColor: habit.completed ? habit.color : 'rgba(255,255,255,0.10)',
          background: habit.completed ? `${habit.color}22` : 'transparent',
          color: habit.completed ? habit.color : 'var(--color-outline)',
        }}
        aria-label={habit.completed ? 'Marcar como pendiente' : 'Marcar como hecho'}
      >
        <Icon name={habit.completed ? 'check_circle' : 'radio_button_unchecked'} size={20} filled={habit.completed} />
      </button>

      <div className={styles.todayBody}>
        <div className={styles.todayTopRow}>
          <p className={`${styles.todayName} ${habit.completed ? styles.todayNameDone : ''}`}>
            {habit.name}
          </p>
          <span className={styles.freqChip}>
            <Icon name={isTask ? 'task_alt' : 'loop'} size={10} /> {freqLabel}
          </span>
          {type !== 'simple' && (
            <span className={styles.typeChipMini} style={{ background: `${habit.color}15`, color: habit.color }}>
              {type === 'timer' ? 'min' : type === 'numeric' ? '#' : 'list'}
            </span>
          )}
        </div>

        {type !== 'simple' && (
          <div className={styles.todayProgressRow}>
            <div className={styles.todayProgressTrack}>
              <div
                className={styles.todayProgressFill}
                style={{ width: `${progress}%`, background: habit.color }}
              />
            </div>
            <span className={styles.todayProgressText}>
              {type === 'checklist'
                ? `${(habit.checklistState ?? DEFAULT_CHECKLIST(habit.checklistItems?.length ?? 0)).filter(Boolean).length}/${habit.checklistItems?.length ?? 0}`
                : `${value}${target ? `/${target}` : ''} ${type === 'timer' ? 'min' : ''}`}
            </span>
          </div>
        )}

        {type === 'checklist' && (habit.checklistItems?.length ?? 0) > 0 && (
          <div className={styles.todayChecklist}>
            {(habit.checklistItems ?? []).map((item, i) => {
              const state = habit.checklistState ?? DEFAULT_CHECKLIST(habit.checklistItems?.length ?? 0);
              return (
                <label key={i} className={styles.todayCheckItem}>
                  <input
                    type="checkbox"
                    checked={state[i] ?? false}
                    onChange={(e) => onChecklistToggle(habit, i, e.target.checked)}
                  />
                  <span className={state[i] ? styles.checklistLabelDone : ''}>{item}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.todayActions}>
        {(type === 'numeric' || type === 'timer') && !habit.completed && (
          <button
            onClick={() => onIncrement(habit)}
            className={styles.incrementBtn}
            aria-label="Incrementar progreso"
          >
            <Icon name="add" size={16} />
          </button>
        )}
        {habit.completed && (
          <span className={styles.doneBadge}>
            <Icon name="check" size={11} /> {doneLabel}
          </span>
        )}
      </div>
    </div>
  );
};
