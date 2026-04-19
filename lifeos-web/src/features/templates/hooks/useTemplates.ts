import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { templatesApi } from '../../../api/templates';

export const useTemplates = () =>
  useQuery({
    queryKey: ['templates'],
    queryFn: async () => (await templatesApi.list()).data,
    staleTime: 60_000,
  });

export const useTemplateMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['templates'] });
    qc.invalidateQueries({ queryKey: ['habits'] });
  };

  const snapshot = useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      templatesApi.snapshot(name, description).then((r) => r.data),
    onSuccess: invalidate,
  });
  const apply = useMutation({
    mutationFn: (id: string) => templatesApi.apply(id).then((r) => r.data),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => templatesApi.delete(id).then((r) => r.data),
    onSuccess: invalidate,
  });
  return { snapshot, apply, remove };
};
