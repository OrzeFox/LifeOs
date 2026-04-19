import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sleepApi } from '../../../api/sleep';
import type { CreateSleepPayload, UpdateSleepPayload } from '../../../ts/sleep';

const useSleepMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['sleep-logs'] });
    qc.invalidateQueries({ queryKey: ['sleep-stats'] });
  };

  const create = useMutation({
    mutationFn: async (payload: CreateSleepPayload) => (await sleepApi.create(payload)).data,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateSleepPayload }) =>
      (await sleepApi.update(id, payload)).data,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => (await sleepApi.remove(id)).data,
    onSuccess: invalidate,
  });

  return { create, update, remove };
};

export default useSleepMutations;
