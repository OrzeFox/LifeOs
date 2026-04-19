import { useQuery } from '@tanstack/react-query';
import { journalApi } from '../../../api/journal';

export const useJournalToday = () =>
  useQuery({
    queryKey: ['journal', 'today'],
    queryFn: async () => {
      const res = await journalApi.today();
      return res.data || null;
    },
  });

export const useJournalList = (from?: string, to?: string) =>
  useQuery({
    queryKey: ['journal', 'list', from ?? '', to ?? ''],
    queryFn: async () => (await journalApi.list(from, to)).data,
  });

export const useJournalStats = () =>
  useQuery({
    queryKey: ['journal', 'stats'],
    queryFn: async () => (await journalApi.stats()).data,
  });
