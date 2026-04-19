import { useQuery } from '@tanstack/react-query';
import { predictionsApi } from '../../../api/predictions';

const usePredictions = () =>
  useQuery({
    queryKey: ['predictions'],
    queryFn: async () => (await predictionsApi.get()).data,
    staleTime: 60_000,
  });

export default usePredictions;
