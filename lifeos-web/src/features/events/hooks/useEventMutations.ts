import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '../../../api/events';
import type { CreateEventPayload, UpdateEventPayload } from '../../../ts/events';

const useEventMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['events'] });
    qc.invalidateQueries({ queryKey: ['events-upcoming'] });
  };

  const create = useMutation({
    mutationFn: async (payload: CreateEventPayload) => (await eventsApi.create(payload)).data,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateEventPayload }) =>
      (await eventsApi.update(id, payload)).data,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => (await eventsApi.remove(id)).data,
    onSuccess: invalidate,
  });

  return { create, update, remove };
};

export default useEventMutations;
