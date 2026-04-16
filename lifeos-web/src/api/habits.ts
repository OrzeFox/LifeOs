import api from './client';

export const habitsApi = {
  getAll: () => api.get('/habits'),
  create: (name: string, description?: string) => api.post('/habits', { name, description }),
  delete: (id: string) => api.delete(`/habits/${id}`),
  getToday: (date?: string) => api.get('/habits/today', { params: { date } }),
  toggle: (id: string, date?: string) => api.post(`/habits/${id}/toggle`, {}, { params: { date } }),
  getStreak: (id: string) => api.get(`/habits/${id}/streak`),
};
