import { useMutation, useQueryClient } from '@tanstack/react-query';
import { insightsApi } from '../../../api/insights';

const useInsightMutations = () => {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['insights'] });
  };

  const run = useMutation({
    mutationFn: () => insightsApi.run().then((r) => r.data),
    onSuccess: invalidate,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => insightsApi.markRead(id).then((r) => r.data),
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: () => insightsApi.markAllRead().then((r) => r.data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => insightsApi.delete(id).then((r) => r.data),
    onSuccess: invalidate,
  });

  return { run, markRead, markAllRead, remove };
};

export default useInsightMutations;
