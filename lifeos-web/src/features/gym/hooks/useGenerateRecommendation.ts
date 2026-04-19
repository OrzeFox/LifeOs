import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gymApi } from '../../../api/gym';

const useGenerateRecommendation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notes?: string) => (await gymApi.generateRecommendation(notes)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gym-recommendation'] }),
  });
};

export default useGenerateRecommendation;
