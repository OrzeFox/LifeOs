export interface TemplateHabitSpec {
  name: string;
  description?: string | null;
  habitType: 'simple' | 'timer' | 'numeric' | 'checklist';
  targetValue?: number | null;
  frequencyType: 'daily' | 'weekly' | 'custom';
  timesPerWeek?: number | null;
  scheduleDays?: number[] | null;
  color?: string | null;
  checklistItems?: string[] | null;
}

export interface RoutineTemplate {
  id: string;
  name: string;
  description: string | null;
  habits: TemplateHabitSpec[];
  lastAppliedAt: string | null;
  createdAt: string;
}

export interface CreateTemplatePayload {
  name: string;
  description?: string;
  habits: TemplateHabitSpec[];
}
