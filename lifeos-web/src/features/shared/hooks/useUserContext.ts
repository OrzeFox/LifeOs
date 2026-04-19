import { useQuery } from '@tanstack/react-query';
import { userContextApi } from '../../../api/userContext';

const useUserContext = (days = 7) =>
  useQuery({
    queryKey: ['user-context', days],
    queryFn: async () => (await userContextApi.get(days)).data,
    staleTime: 60_000,
  });

export default useUserContext;
