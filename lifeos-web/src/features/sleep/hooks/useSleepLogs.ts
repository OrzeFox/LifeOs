import { useQuery } from '@tanstack/react-query';
import { sleepApi } from '../../../api/sleep';

const useSleepLogs = (from?: string, to?: string) =>
  useQuery({
    queryKey: ['sleep-logs', from, to],
    queryFn: async () => (await sleepApi.list(from, to)).data,
  });

export default useSleepLogs;
