import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Icon } from '../../../components/Icon';
import type { HabitType } from '../../../ts/habits';
import { HABIT_TYPES, WEEKDAYS, HABIT_COLORS } from '../../../ts/habits';
import styles from '../HabitsPage.module.css';

type CreatePayload = {
  name: string;
  description?: string;
  habitType?: HabitType;
  targetValue?: number;
  scheduleDays?: number[];
  color?: string;
  checklistItems?: string[];
};

interface CreateHabitFormProps {
  onSubmit: (data: CreatePayload) => Promise<void>;
}

type FormValues = {
  name: string;
  description: string;
  habitType: HabitType;
  targetValue: string;
  scheduleDays: number[];
  color: string;
  checklistItems: string[];
};

export const CreateHabitForm = ({ onSubmit }: CreateHabitFormProps) => {
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name:           '',
      description:    '',
      habitType:      'simple',
      targetValue:    '',
      scheduleDays:   [],
      color:          HABIT_COLORS[0],
      checklistItems: [''],
    },
  });

  const habitType      = watch('habitType');
  const scheduleDays   = watch('scheduleDays');
  const color          = watch('color');
  const checklistItems = watch('checklistItems');

  const toggleDay = (d: number) =>
    setValue('scheduleDays', scheduleDays.includes(d)
      ? scheduleDays.filter((x) => x !== d)
      : [...scheduleDays, d]);

  const updateChecklistItem = (i: number, val: string) => {
    const next = [...checklistItems];
    next[i] = val;
    setValue('checklistItems', next);
  };

  const onFormSubmit = handleSubmit(async (data) => {
    setSaving(true);
    const items = data.checklistItems.map((s) => s.trim()).filter(Boolean);
    await onSubmit({
      name:           data.name.trim(),
      description:    data.description.trim() || undefined,
      habitType:      data.habitType,
      targetValue:    data.targetValue ? Number(data.targetValue) : undefined,
      scheduleDays:   data.scheduleDays.length ? data.scheduleDays : undefined,
      color:          data.color,
      checklistItems: data.habitType === 'checklist' ? items : undefined,
    });
    reset();
    setSaving(false);
  });

  return (
    <form onSubmit={onFormSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Nombre</label>
        <input
          placeholder="Ej: Meditar"
          className={styles.input}
          {...register('name', { required: true })}
        />
        {errors.name && <span className={styles.fieldError}>Nombre requerido</span>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Tipo de hábito</label>
        <div className={styles.typeGrid}>
          {HABIT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setValue('habitType', t.value)}
              className={`${styles.typeBtn} ${habitType === t.value ? styles.typeBtnActive : ''}`}
            >
              <Icon name={t.icon} size={14} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {(habitType === 'timer' || habitType === 'numeric') && (
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Meta {habitType === 'timer' ? '(minutos)' : '(cantidad)'}
          </label>
          <input
            type="number"
            min={1}
            placeholder={habitType === 'timer' ? '20' : '10'}
            className={styles.input}
            {...register('targetValue')}
          />
        </div>
      )}

      {habitType === 'checklist' && (
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Tareas</label>
          {checklistItems.map((item, i) => (
            <div key={i} className={styles.checklistInputRow}>
              <input
                value={item}
                onChange={(e) => updateChecklistItem(i, e.target.value)}
                placeholder={`Tarea ${i + 1}`}
                className={styles.input}
              />
              {checklistItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => setValue('checklistItems', checklistItems.filter((_, j) => j !== i))}
                  className={styles.removeItemBtn}
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setValue('checklistItems', [...checklistItems, ''])}
            className={styles.addItemBtn}
          >
            <Icon name="add" size={13} /> Agregar tarea
          </button>
        </div>
      )}

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          Días <span className={styles.formLabelOptional}>(vacío = todos)</span>
        </label>
        <div className={styles.dayPicker}>
          {WEEKDAYS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => toggleDay(d.value)}
              className={`${styles.dayBtn} ${scheduleDays.includes(d.value) ? styles.dayBtnActive : ''}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Color</label>
        <div className={styles.colorPicker}>
          {HABIT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setValue('color', c)}
              className={`${styles.colorDot} ${color === c ? styles.colorDotActive : ''}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          Motivación <span className={styles.formLabelOptional}>(opcional)</span>
        </label>
        <input
          placeholder="¿Por qué este hábito importa?"
          className={styles.input}
          {...register('description')}
        />
      </div>

      <button type="submit" disabled={saving} className={styles.submitBtn}>
        {saving ? 'Creando…' : <><Icon name="add" size={16} /> Crear hábito</>}
      </button>
    </form>
  );
};
