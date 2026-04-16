export type HabitType = 'simple' | 'timer' | 'numeric' | 'checklist';

export const HABIT_TYPES: { value: HabitType; label: string; icon: string; hint: string }[] = [
  { value: 'simple',    label: 'Simple',         icon: 'check_circle', hint: 'Marcar como hecho' },
  { value: 'timer',     label: 'Tiempo',          icon: 'timer',        hint: 'Meta en minutos' },
  { value: 'numeric',   label: 'Numérico',        icon: 'pin',          hint: 'Meta en cantidad' },
  { value: 'checklist', label: 'Lista de tareas', icon: 'checklist',    hint: 'Completar subtareas' },
];

export const WEEKDAYS = [
  { value: 1, label: 'L' }, { value: 2, label: 'M' }, { value: 3, label: 'X' },
  { value: 4, label: 'J' }, { value: 5, label: 'V' }, { value: 6, label: 'S' },
  { value: 0, label: 'D' },
];

export const HABIT_COLORS = [
  '#4EDEA3', '#C0C1FF', '#FFB95F', '#FF6B6B', '#74C0FC', '#D0BFFF', '#96F2D7',
];

export interface Habit {
  id: string;
  name: string;
  description?: string;
  habitType: HabitType;
  targetValue?: number;
  scheduleDays?: number[];
  color: string;
  checklistItems?: string[];
  completed: boolean;
  progress: number;
  value: number;
  checklistState?: boolean[] | null;
}

export interface CalendarDay {
  date: string;
  scheduled: boolean;
  completed: boolean;
  progress: number;
  value: number;
}

export interface HistoryDay {
  date: string;
  completed: boolean;
  progress: number;
  value: number;
}
