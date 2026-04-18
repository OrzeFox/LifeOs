import type { Habit } from '../../ts/habits';

export type HabitStateValue = 'pendiente' | 'en_progreso' | 'terminado';

export const HABIT_STATES: {
  value: HabitStateValue;
  label: string;
  icon: string;
  activeColor: string;
  activeBg: string;
  activeBorder: string;
  inactiveColor: string;
}[] = [
  { value: 'pendiente',   label: 'Pendiente',   icon: 'circle',
    activeColor: '#94a3b8', activeBg: 'rgba(148,163,184,0.14)', activeBorder: 'rgba(148,163,184,0.5)', inactiveColor: 'rgba(148,163,184,0.55)' },
  { value: 'en_progreso', label: 'En progreso', icon: 'pending',
    activeColor: '#FFB95F', activeBg: 'rgba(255,185,95,0.14)',  activeBorder: 'rgba(255,185,95,0.55)',  inactiveColor: 'rgba(255,185,95,0.5)' },
  { value: 'terminado',   label: 'Terminado',   icon: 'check_circle',
    activeColor: '#4EDEA3', activeBg: 'rgba(78,222,163,0.14)', activeBorder: 'rgba(78,222,163,0.55)', inactiveColor: 'rgba(78,222,163,0.45)' },
];

export const getHabitState = (habit: Habit): HabitStateValue => {
  const type = habit.habitType ?? 'simple';
  if (type === 'simple') {
    if (habit.value >= 1) return 'terminado';
    if (habit.value > 0)  return 'en_progreso';
    return 'pendiente';
  }
  if (habit.completed) return 'terminado';
  if (habit.progress > 0 || habit.value > 0) return 'en_progreso';
  return 'pendiente';
};

export const computeProgressForState = (
  targetState: HabitStateValue,
  habit: Habit
): { value: number; checklistState?: boolean[] } => {
  const type = habit.habitType ?? 'simple';

  if (targetState === 'pendiente') {
    return {
      value: 0,
      checklistState: type === 'checklist'
        ? (habit.checklistItems ?? []).map(() => false)
        : undefined,
    };
  }

  if (targetState === 'en_progreso') {
    if (type === 'timer' || type === 'numeric') {
      return { value: habit.value > 0 ? habit.value : Math.max(1, Math.round((habit.targetValue ?? 2) * 0.5)) };
    }
    if (type === 'checklist') {
      const items = habit.checklistItems ?? [];
      const half  = Math.max(1, Math.floor(items.length / 2));
      return { value: half, checklistState: items.map((_, i) => i < half) };
    }
    return { value: 0.5 };
  }

  if (type === 'checklist') {
    const items = habit.checklistItems ?? [];
    return { value: items.length, checklistState: items.map(() => true) };
  }
  return { value: habit.targetValue ?? 1 };
};
