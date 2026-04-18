import { habitsApi } from '../../../api/habits';

const useHabitProgress = (habitId: string, onSave: () => void) => {
  const today = new Date().toISOString().split('T')[0];

  const saveProgress = async (value: number, checklistState?: boolean[]) => {
    try {
      await habitsApi.setProgress(habitId, today, value, checklistState);
      onSave();
    } catch (err) { console.error(err); }
  };

  return { saveProgress };
};

export default useHabitProgress;
