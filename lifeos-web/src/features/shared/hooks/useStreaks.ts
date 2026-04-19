import { useQuery } from '@tanstack/react-query';
import { streaksApi } from '../../../api/streaks';

const useStreaks = () =>
  useQuery({
    queryKey: ['streaks'],
    queryFn: async () => (await streaksApi.getAll()).data,
    staleTime: 60_000,
  });

export default useStreaks;
