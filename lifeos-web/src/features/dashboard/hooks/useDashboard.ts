import { useEffect, useState, useCallback } from 'react';
import { dashboardApi } from '../../../api/dashboard';
import type { DashboardData } from '../../../ts/dashboard';

const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() =>
    dashboardApi.getDaily().then((res) => { setData(res.data); setLoading(false); }), []);

  useEffect(() => { load(); }, [load]);

  return { data, setData, loading, reload: load };
};

export default useDashboard;
