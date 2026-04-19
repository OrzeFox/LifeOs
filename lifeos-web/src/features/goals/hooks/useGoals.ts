import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { goalsApi } from '../../../api/goals';
import type { CreateGoalPayload, Goal } from '../../../ts/goals';

export const useGoalsProgress = () =>
  useQuery({
    queryKey: ['goals', 'progress'],
    queryFn: async () => (await goalsApi.progress()).data,
    staleTime: 60_000,
  });

export const useGoalsList = () =>
  useQuery({
    queryKey: ['goals', 'list'],
    queryFn: async () => (await goalsApi.list()).data,
    staleTime: 60_000,
  });

export const useGoalMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['goals'] });

  const create = useMutation({
    mutationFn: (payload: CreateGoalPayload) => goalsApi.create(payload).then((r) => r.data),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Goal> }) =>
      goalsApi.update(id, patch).then((r) => r.data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => goalsApi.delete(id).then((r) => r.data),
    onSuccess: invalidate,
  });

  return { create, update, remove };
};
