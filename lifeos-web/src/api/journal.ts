import api from './client';
import type { JournalEntry, JournalStats, UpsertJournalPayload } from '../ts/journal';

export const journalApi = {
  list: (from?: string, to?: string) =>
    api.get<JournalEntry[]>('/journal', { params: { from, to } }),
  today: () => api.get<JournalEntry | ''>('/journal/today'),
  stats: () => api.get<JournalStats>('/journal/stats'),
  getByDate: (date: string) => api.get<JournalEntry | ''>(`/journal/${date}`),
  upsert: (date: string, payload: UpsertJournalPayload) =>
    api.put<JournalEntry>(`/journal/${date}`, payload),
  remove: (id: string) => api.delete(`/journal/${id}`),
};
