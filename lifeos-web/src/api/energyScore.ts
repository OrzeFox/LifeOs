import api from './client';
import type { EnergyScore } from '../ts/energyScore';

export const energyScoreApi = {
  get: () => api.get<EnergyScore>('/energy-score'),
};
