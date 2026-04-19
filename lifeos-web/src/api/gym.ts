import api from './client';
import type { ActivityType } from '../ts/gym';

export const gymApi = {
  getAll: (type?: ActivityType) => api.get('/gym', { params: type ? { type } : {} }),

  create: (data: {
    activityType: ActivityType;
    duration: number;
    weight?: number;
    notes?: string;
    date: string;
  }) => api.post('/gym', data),

  delete: (id: string) => api.delete(`/gym/${id}`),

  getSummary: () => api.get('/gym/summary'),
};
