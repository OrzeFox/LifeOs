import { useCallback, useEffect, useState } from 'react';
import { gymApi } from '../../../api/gym';
import type { ActivityType, GymActivity, GymSummary } from '../../../ts/gym';

const useGym = (filter: ActivityType | 'all') => {
  const [activities, setActivities] = useState<GymActivity[]>([]);
  const [summary, setSummary]       = useState<GymSummary | null>(null);
  const [loading, setLoading]       = useState(true);

  const load = useCallback(async () => {
    const [list, sum] = await Promise.all([
      gymApi.getAll(filter === 'all' ? undefined : filter),
      gymApi.getSummary(),
    ]);
    setActivities(list.data);
    setSummary(sum.data);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const create = async (data: {
    activityType: ActivityType;
    duration: number;
    weight?: number;
    notes?: string;
    date: string;
  }) => {
    await gymApi.create(data);
    await load();
  };

  const remove = async (id: string) => {
    await gymApi.delete(id);
    await load();
  };

  return { activities, summary, loading, create, remove, refresh: load };
};

export default useGym;
