export type ActivityType = 'walk' | 'weights' | 'cardio' | 'other';

export const ACTIVITY_TYPES: { value: ActivityType; label: string; icon: string; color: string }[] = [
  { value: 'walk',    label: 'Caminata', icon: 'directions_walk', color: '#4EDEA3' },
  { value: 'weights', label: 'Pesas',    icon: 'fitness_center',  color: '#C0C1FF' },
  { value: 'cardio',  label: 'Cardio',   icon: 'directions_run',  color: '#FFB95F' },
  { value: 'other',   label: 'Otro',     icon: 'sports',          color: '#74C0FC' },
];

export interface GymActivity {
  id: string;
  activityType: ActivityType;
  duration: number;
  weight?: number | null;
  notes?: string | null;
  date: string;
  createdAt: string;
}

export interface GymActivityForm {
  activityType: ActivityType;
  duration: string;
  weight: string;
  notes: string;
  date: string;
}

export interface GymSummary {
  total: number;
  totalMinutes: number;
  byType: Record<string, { count: number; duration: number }>;
}
