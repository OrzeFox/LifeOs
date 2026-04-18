import { useState, type FormEvent } from 'react';
import { Icon } from '../../../components/Icon';
import type { Meal } from '../../../ts/routine';
import { MEAL_TYPES, TIME_SLOTS } from '../../../ts/routine';
import styles from '../RoutinePage.module.css';

interface EditMealRowProps {
  meal: Meal;
  onSave: (data: Partial<Meal>) => Promise<void>;
  onCancel: () => void;
}

export const EditMealRow = ({ meal, onSave, onCancel }: EditMealRowProps) => {
  const [mealType, setMealType]         = useState(meal.mealType);
  const [scheduledTime, setScheduledTime] = useState(meal.scheduledTime ?? '');
  const [description, setDescription]   = useState(meal.description ?? '');
  const [saving, setSaving]             = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ mealType, scheduledTime, description });
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className={styles.editForm}>
      <select value={mealType} onChange={(e) => setMealType(e.target.value as any)} className={styles.input}>
        {MEAL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      <select value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className={styles.input}>
        <option value="">Sin hora</option>
        {TIME_SLOTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción de la comida…"
        className={styles.input}
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
