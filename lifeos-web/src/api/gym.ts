import api from './client';
import type { ActivityType } from '../ts/gym';
import type { Recommendation } from '../ts/recommendation';

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

  getRecommendation: () => api.get<Recommendation | null>('/gym/recommendations'),

  generateRecommendation: (notes?: string) =>
    api.post<Recommendation>('/gym/recommendations/generate', notes ? { notes } : {}),
};
