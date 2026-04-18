import { useState } from 'react';
import { habitsApi } from '../../../api/habits';

const useHabitToggle = (habitId: string, date: string, onToggle: () => void) => {
  const [pending, setPending] = useState(false);

  const toggle = async () => {
    setPending(true);
    try {
      await habitsApi.toggle(habitId, date);
      onToggle();
    } catch (err) {
      console.error(err);
    } finally {
      setPending(false);
    }
  };

  return { pending, toggle };
};

export default useHabitToggle;
