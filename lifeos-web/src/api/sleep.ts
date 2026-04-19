import api from './client';
import type { SleepLog, SleepStats, CreateSleepPayload, UpdateSleepPayload } from '../ts/sleep';

export const sleepApi = {
  list: (from?: string, to?: string) =>
    api.get<SleepLog[]>('/sleep', { params: { from, to } }),
  stats: () => api.get<SleepStats>('/sleep/stats'),
  create: (payload: CreateSleepPayload) => api.post<SleepLog>('/sleep', payload),
  update: (id: string, payload: UpdateSleepPayload) => api.patch<SleepLog>(`/sleep/${id}`, payload),
  remove: (id: string) => api.delete<{ deleted: boolean }>(`/sleep/${id}`),
};
