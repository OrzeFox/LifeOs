import api from './client';
import type { HabitPayload } from '../ts/habits';

export const habitsApi = {
  getAll: (includeInactive = false) =>
    api.get('/habits', { params: includeInactive ? { includeInactive: 'true' } : {} }),

  getToday: (date?: string) => api.get('/habits/today', { params: { date } }),

  getMonthly: (year: number, month: number) =>
    api.get('/habits/month', { params: { year, month } }),

  create: (data: HabitPayload) => api.post('/habits', data),

  update: (id: string, data: Partial<HabitPayload>) => api.patch(`/habits/${id}`, data),

  setActive: (id: string, isActive: boolean) =>
    api.patch(`/habits/${id}/active`, { isActive }),

  delete: (id: string) => api.delete(`/habits/${id}`),

  // Legacy (dashboard)
  toggle: (id: string, date?: string) =>
    api.post(`/habits/${id}/toggle`, {}, { params: { date } }),

  increment: (id: string, date?: string, step = 1) =>
    api.post(`/habits/${id}/increment`, { date, step }),

  setProgress: (id: string, date: string, value: number, checklistState?: boolean[]) =>
    api.post(`/habits/${id}/progress`, { date, value, checklistState }),

  getCalendar: (id: string, year: number, month: number) =>
    api.get(`/habits/${id}/calendar`, { params: { year, month } }),

  getHistory: (id: string, days = 14) =>
    api.get(`/habits/${id}/history`, { params: { days } }),

  getStreak: (id: string) => api.get(`/habits/${id}/streak`),
};
