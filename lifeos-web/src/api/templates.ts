import api from './client';
import type { CreateTemplatePayload, RoutineTemplate } from '../ts/templates';

export const templatesApi = {
  list: () => api.get<RoutineTemplate[]>('/templates'),
  create: (payload: CreateTemplatePayload) => api.post<RoutineTemplate>('/templates', payload),
  snapshot: (name: string, description?: string) =>
    api.post<RoutineTemplate>('/templates/from-current', { name, description }),
  apply: (id: string) => api.post<{ created: number }>(`/templates/${id}/apply`),
  delete: (id: string) => api.delete<{ deleted: true }>(`/templates/${id}`),
};
