import api from './client';
import type { CreateGoalPayload, Goal, GoalProgress, GoalStatus } from '../ts/goals';

export const goalsApi = {
  list: (status?: GoalStatus) => api.get<Goal[]>('/goals', { params: status ? { status } : undefined }),
  progress: () => api.get<GoalProgress[]>('/goals/progress'),
  create: (payload: CreateGoalPayload) => api.post<Goal>('/goals', payload),
  update: (id: string, patch: Partial<Goal>) => api.patch<Goal>(`/goals/${id}`, patch),
  delete: (id: string) => api.delete<{ deleted: true }>(`/goals/${id}`),
};
