import api from './client';
import type { Insight } from '../ts/insights';

export const insightsApi = {
  list: (params?: { unread?: boolean; limit?: number }) =>
    api.get<Insight[]>('/insights', {
      params: {
        ...(params?.unread ? { unread: 'true' } : {}),
        ...(params?.limit ? { limit: params.limit } : {}),
      },
    }),
  run: () => api.post<Insight[]>('/insights/run'),
  markRead: (id: string) => api.patch<Insight>(`/insights/${id}/read`),
  markAllRead: () => api.patch<{ updated: number }>('/insights/read-all'),
  delete: (id: string) => api.delete<{ deleted: true }>(`/insights/${id}`),
};
