export type HabitType = 'simple' | 'timer' | 'numeric' | 'checklist';
export type HabitKind = 'habit' | 'task';
export type FrequencyType = 'daily' | 'weekly' | 'custom';

export const HABIT_TYPES: { value: HabitType; label: string; icon: string; hint: string }[] = [
  { value: 'simple',    label: 'Simple',         icon: 'check_circle', hint: 'Marcar como hecho' },
  { value: 'timer',     label: 'Tiempo',          icon: 'timer',        hint: 'Meta en minutos' },
  { value: 'numeric',   label: 'Numérico',        icon: 'pin',          hint: 'Meta en cantidad' },
  { value: 'checklist', label: 'Lista de tareas', icon: 'checklist',    hint: 'Completar subtareas' },
];

export const HABIT_KINDS: { value: HabitKind; label: string; icon: string; hint: string }[] = [
  { value: 'habit', label: 'Hábito', icon: 'loop',        hint: 'Recurrente' },
  { value: 'task',  label: 'Tarea',  icon: 'task_alt',    hint: 'Única' },
];

export const FREQUENCY_OPTIONS: { value: FrequencyType; label: string; icon: string }[] = [
  { value: 'daily',  label: 'Diario',        icon: 'calendar_today' },
  { value: 'weekly', label: 'X por semana',  icon: 'date_range' },
  { value: 'custom', label: 'Días específicos', icon: 'event' },
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
  kind: HabitKind;
  habitType: HabitType;
  targetValue?: number;
  frequencyType: FrequencyType;
  timesPerWeek?: number;
  scheduleDays?: number[];
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
  color: string;
  checklistItems?: string[];
  frequencyLabel?: string;
  completed: boolean;
  progress: number;
  value: number;
  checklistState?: boolean[] | null;
}

// Raw habit record (from /habits list) — no per-date progress.
export interface HabitDefinition {
  id: string;
  name: string;
  description?: string;
  kind: HabitKind;
  habitType: HabitType;
  isActive: boolean;
  targetValue?: number;
  frequencyType: FrequencyType;
  timesPerWeek?: number;
  scheduleDays?: number[];
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
  color: string;
  checklistItems?: string[];
  createdAt: string;
}

export interface CalendarDay {
  date: string;
  scheduled: boolean;
  completed: boolean;
  progress: number;
  value: number;
}

export interface MonthRollupDay {
  date: string;
  scheduled: number;
  completed: number;
  colors: string[];
}

export interface HistoryDay {
  date: string;
  completed: boolean;
  progress: number;
  value: number;
}

export interface HabitPayload {
  name: string;
  description?: string;
  kind?: HabitKind;
  habitType?: HabitType;
  targetValue?: number;
  frequencyType?: FrequencyType;
  timesPerWeek?: number;
  scheduleDays?: number[];
  startDate?: string;
  endDate?: string;
  notes?: string;
  color?: string;
  checklistItems?: string[];
}
