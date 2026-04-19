import { useQuery } from '@tanstack/react-query';
import { sleepApi } from '../../../api/sleep';

const useSleepStats = () =>
  useQuery({
    queryKey: ['sleep-stats'],
    queryFn: async () => (await sleepApi.stats()).data,
  });

export default useSleepStats;
