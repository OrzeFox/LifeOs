import api from './client';

export const dashboardApi = {
  getDaily: () => api.get('/dashboard'),
};
