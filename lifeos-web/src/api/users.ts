import api from './client';
import type { UserProfile, UpdateProfilePayload } from '../ts/user';

export const usersApi = {
  getMe: () => api.get<UserProfile>('/users/me'),
  updateMe: (payload: UpdateProfilePayload) =>
    api.patch<UserProfile>('/users/me', payload),
};
