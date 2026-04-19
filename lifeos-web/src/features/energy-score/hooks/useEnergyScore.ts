import { useQuery } from '@tanstack/react-query';
import { energyScoreApi } from '../../../api/energyScore';

const useEnergyScore = () =>
  useQuery({
    queryKey: ['energy-score'],
    queryFn: async () => (await energyScoreApi.get()).data,
    staleTime: 60_000,
  });

export default useEnergyScore;
