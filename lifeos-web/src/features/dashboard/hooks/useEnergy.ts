import { useState } from 'react';
import api from '../../../api/client';

const useEnergy = (initial: number | null, date: string, onChange: (v: number) => void) => {
  const [level, setLevel] = useState<number>(initial ?? 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!initial);

  const save = async (val: number) => {
    setSaving(true);
    try {
      await api.post('/energy', { date, level: val });
      setSaved(true);
      onChange(val);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return { level, setLevel, saving, saved, save };
};

export default useEnergy;
