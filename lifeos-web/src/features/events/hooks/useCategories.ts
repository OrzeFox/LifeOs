import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '../../../api/events';
import type { CreateCategoryPayload } from '../../../ts/events';

export const useCategories = () =>
  useQuery({
    queryKey: ['event-categories'],
    queryFn: async () => (await eventsApi.listCategories()).data,
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCategoryPayload) => (await eventsApi.createCategory(payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['event-categories'] }),
  });
};
