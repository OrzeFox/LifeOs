import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Icon } from '../../../components/Icon';
import type { Meal, MealType } from '../../../ts/routine';
import { MEAL_TYPES, TIME_SLOTS } from '../../../ts/routine';
import styles from '../RoutinePage.module.css';

interface EditMealRowProps {
  meal: Meal;
  onSave: (data: Partial<Meal>) => Promise<void>;
  onCancel: () => void;
}

type EditMealFormValues = {
  mealType: MealType;
  scheduledTime: string;
  description: string;
};

export const EditMealRow = ({ meal, onSave, onCancel }: EditMealRowProps) => {
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit } = useForm<EditMealFormValues>({
    defaultValues: {
      mealType:      meal.mealType,
      scheduledTime: meal.scheduledTime ?? '',
      description:   meal.description ?? '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setSaving(true);
    await onSave(data);
    setSaving(false);
  });

  return (
    <form onSubmit={onSubmit} className={styles.editForm}>
      <select className={styles.input} {...register('mealType')}>
        {MEAL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      <select className={styles.input} {...register('scheduledTime')}>
        <option value="">Sin hora</option>
        {TIME_SLOTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      <input
        placeholder="Descripción de la comida…"
        className={styles.input}
        {...register('description')}
      />
      <div className={styles.editActions}>
        <button type="submit" disabled={saving} className={styles.saveEditBtn}>
          {saving ? <span className={styles.savingDot} /> : <Icon name="check" size={14} />}
          {saving ? 'Analizando…' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancel} className={styles.cancelEditBtn}>Cancelar</button>
      </div>
    </form>
  );
};
