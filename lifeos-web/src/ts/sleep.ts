export interface SleepLog {
  id: string;
  sleepAt: string;
  wakeAt: string;
  durationMin: number;
  notes?: string | null;
  createdAt: string;
}

export interface SleepStats {
  lastNight: SleepLog | null;
  avgHours7d: number;
  avgHours30d: number;
  trend: 'improving' | 'declining' | 'stable';
  suggestions: string[];
}

export interface CreateSleepPayload {
  sleepAt: string;
  wakeAt: string;
  notes?: string;
}

export interface UpdateSleepPayload extends Partial<CreateSleepPayload> {}
