import api from './client';
import type {
  AppEvent, EventCategory,
  CreateEventPayload, UpdateEventPayload, CreateCategoryPayload,
} from '../ts/events';

export const eventsApi = {
  list: (params: { from?: string; to?: string; category?: string } = {}) =>
    api.get<AppEvent[]>('/events', { params }),
  upcoming: (limit = 5) => api.get<AppEvent[]>('/events/upcoming', { params: { limit } }),
  create: (payload: CreateEventPayload) => api.post<AppEvent>('/events', payload),
  update: (id: string, payload: UpdateEventPayload) => api.patch<AppEvent>(`/events/${id}`, payload),
  remove: (id: string) => api.delete<{ deleted: boolean }>(`/events/${id}`),
  listCategories: () => api.get<EventCategory[]>('/events/categories'),
  createCategory: (payload: CreateCategoryPayload) => api.post<EventCategory>('/events/categories', payload),
};
