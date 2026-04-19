import { useQuery } from '@tanstack/react-query';
import { insightsApi } from '../../../api/insights';

const useInsights = (opts: { unread?: boolean; limit?: number } = {}) =>
  useQuery({
    queryKey: ['insights', opts],
    queryFn: async () => (await insightsApi.list(opts)).data,
    staleTime: 60_000,
  });

export default useInsights;
