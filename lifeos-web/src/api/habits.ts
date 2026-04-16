import api from './client';
import type { HabitType } from '../ts/habits';

export const habitsApi = {
  getAll:   ()             => api.get('/habits'),
  getToday: (date?: string) => api.get('/habits/today', { params: { date } }),

  create: (data: {
    name: string;
    description?: string;
    habitType?: HabitType;
    targetValue?: number;
    scheduleDays?: number[];
    color?: string;
    checklistItems?: string[];
  }) => api.post('/habits', data),

  delete: (id: string) => api.delete(`/habits/${id}`),

  // Legacy (dashboard)
  toggle: (id: string, date?: string) =>
    api.post(`/habits/${id}/toggle`, {}, { params: { date } }),

  // Full progress update (habits page)
  setProgress: (id: string, date: string, value: number, checklistState?: boolean[]) =>
    api.post(`/habits/${id}/progress`, { date, value, checklistState }),

  getCalendar: (id: string, year: number, month: number) =>
    api.get(`/habits/${id}/calendar`, { params: { year, month } }),

  getHistory: (id: string, days = 14) =>
    api.get(`/habits/${id}/history`, { params: { days } }),

  getStreak: (id: string) => api.get(`/habits/${id}/streak`),
};
