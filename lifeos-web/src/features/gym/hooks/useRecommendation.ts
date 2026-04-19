import { useQuery } from '@tanstack/react-query';
import { gymApi } from '../../../api/gym';

const useRecommendation = () =>
  useQuery({
    queryKey: ['gym-recommendation'],
    queryFn: async () => (await gymApi.getRecommendation()).data,
  });

export default useRecommendation;
