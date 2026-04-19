import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '../../../api/events';

export const useEvents = (params: { from?: string; to?: string; category?: string } = {}) =>
  useQuery({
    queryKey: ['events', params],
    queryFn: async () => (await eventsApi.list(params)).data,
  });

export const useUpcomingEvents = (limit = 5) =>
  useQuery({
    queryKey: ['events-upcoming', limit],
    queryFn: async () => (await eventsApi.upcoming(limit)).data,
  });
