import { useMutation, useQueryClient } from '@tanstack/react-query';
import { journalApi } from '../../../api/journal';
import type { UpsertJournalPayload } from '../../../ts/journal';

const useJournalMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['journal'] });
    qc.invalidateQueries({ queryKey: ['user-context'] });
  };

  const upsert = useMutation({
    mutationFn: async ({ date, payload }: { date: string; payload: UpsertJournalPayload }) =>
      (await journalApi.upsert(date, payload)).data,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => (await journalApi.remove(id)).data,
    onSuccess: invalidate,
  });

  return { upsert, remove };
};

export default useJournalMutations;
