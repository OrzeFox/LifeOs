import api from './client';
import type { UserContext } from '../ts/userContext';

export const userContextApi = {
  get: (days?: number) =>
    api.get<UserContext>('/user-context', { params: days ? { days } : {} }),
};
