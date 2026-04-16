import api from './client';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ access_token: string }>('/auth/login', { email, password }),

  register: (email: string, password: string, name: string) =>
    api.post<{ access_token: string }>('/auth/register', { email, password, name }),
};
