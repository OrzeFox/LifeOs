export interface JournalEntry {
  id: string;
  date: string;
  mood: number;
  energyLevel: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JournalStats {
  avgMood7d: number;
  avgEnergy7d: number;
  avgMood30d: number;
  avgEnergy30d: number;
  lowMoodStreak: number;
  entries7d: number;
}

export interface UpsertJournalPayload {
  mood: number;
  energyLevel: number;
  notes?: string;
}
