import api from './client';
import type { StreakSummary } from '../ts/streaks';

export const streaksApi = {
  getAll: () => api.get<StreakSummary>('/streaks'),
};
