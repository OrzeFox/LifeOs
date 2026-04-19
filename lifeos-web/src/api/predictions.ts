import api from './client';
import type { PredictionSet } from '../ts/predictions';

export const predictionsApi = {
  get: () => api.get<PredictionSet>('/predictions'),
};
