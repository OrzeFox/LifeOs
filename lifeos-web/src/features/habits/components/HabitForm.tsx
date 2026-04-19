import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Icon } from '../../../components/Icon';
import type { FrequencyType, HabitDefinition, HabitKind, HabitPayload, HabitType } from '../../../ts/habits';
import { FREQUENCY_OPTIONS, HABIT_COLORS, HABIT_KINDS, WEEKDAYS } from '../../../ts/habits';
import styles from '../HabitsPage.module.css';

type GoalType = 'complete' | 'numeric';

interface FormValues {
  name: string;
  kind: HabitKind;
  goalType: GoalType;
  targetValue: string;
  targetUnit: 'numeric' | 'timer';
  frequencyType: FrequencyType;
  timesPerWeek: string;
  scheduleDays: number[];
  startDate: string;
  endDate: string;
  notes: string;
  color: string;
}

interface HabitFormProps {
  mode: 'create' | 'edit';
  initial?: HabitDefinition | null;
  onSubmit: (data: HabitPayload) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

const emptyDefaults = (today: string): FormValues => ({
  name: '',
  kind: 'habit',
  goalType: 'complete',
  targetValue: '',
  targetUnit: 'numeric',
  frequencyType: 'daily',
  timesPerWeek: '3',
  scheduleDays: [],
  startDate: today,
  endDate: '',
  notes: '',
  color: HABIT_COLORS[0],
});

const fromDefinition = (h: HabitDefinition, today: string): FormValues => {
  const goalType: GoalType = h.habitType === 'simple' ? 'complete' : 'numeric';
  const targetUnit: 'numeric' | 'timer' = h.habitType === 'timer' ? 'timer' : 'numeric';
  return {
    name:          h.name ?? '',
    kind:          h.kind ?? 'habit',
    goalType,
    targetValue:   h.targetValue != null ? String(h.targetValue) : '',
    targetUnit,
    frequencyType: h.frequencyType ?? 'daily',
    timesPerWeek:  h.timesPerWeek != null ? String(h.timesPerWeek) : '3',
    scheduleDays:  h.scheduleDays ?? [],
    startDate:     (h.startDate ?? today) || today,
    endDate:       h.endDate ?? '',
    notes:         h.notes ?? '',
    color:         h.color ?? HABIT_COLORS[0],
  };
};

const toPayload = (v: FormValues): HabitPayload => {
  let habitType: HabitType = 'simple';
  if (v.goalType === 'numeric') habitType = v.targetUnit === 'timer' ? 'timer' : 'numeric';

  const payload: HabitPayload = {
    name:          v.name.trim(),
    kind:          v.kind,
    habitType,
    frequencyType: v.kind === 'task' ? 'custom' : v.frequencyType,
    color:         v.color,
  };

  if (habitType !== 'simple') payload.targetValue = v.targetValue ? Number(v.targetValue) : 1;
  if (v.kind === 'habit' && v.frequencyType === 'weekly') {
    payload.timesPerWeek = v.timesPerWeek ? Math.max(1, Math.min(7, Number(v.timesPerWeek))) : 3;
  }
  if (v.kind === 'habit' && v.frequencyType === 'custom' && v.scheduleDays.length) {
    payload.scheduleDays = v.scheduleDays;
  }
  if (v.startDate) payload.startDate = v.startDate;
  if (v.endDate)   payload.endDate   = v.endDate;
  if (v.notes.trim()) payload.notes = v.notes.trim();

  return payload;
};

export const HabitForm = ({ mode, initial, onSubmit, onCancel, submitLabel }: HabitFormProps) => {
  const today = new Date().toISOString().split('T')[0];
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: initial ? fromDefinition(initial, today) : emptyDefaults(today),
  });

  useEffect(() => {
    reset(initial ? fromDefinition(initial, today) : emptyDefaults(today));
  }, [initial, reset, today]);

  const kind          = watch('kind');
  const goalType      = watch('goalType');
  const frequencyType = watch('frequencyType');
  const scheduleDays  = watch('scheduleDays');
  const color         = watch('color');
  const targetUnit    = watch('targetUnit');

  const toggleDay = (d: number) =>
    setValue('scheduleDays', scheduleDays.includes(d)
      ? scheduleDays.filter((x) => x !== d)
      : [...scheduleDays, d]);

  const onFormSubmit = handleSubmit(async (data) => {
    setSaving(true);
    try {
      await onSubmit(toPayload(data));
      if (mode === 'create') reset(emptyDefaults(today));
    } finally {
      setSaving(false);
    }
  });

  return (
    <form onSubmit={onFormSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Nombre</label>
        <input
          placeholder="Ej: Leer 20 min"
          className={styles.input}
          {...register('name', { required: true })}
        />
        {errors.name && <span className={styles.fieldError}>Nombre requerido</span>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Tipo</label>
        <div className={styles.kindGrid}>
          {HABIT_KINDS.map((k) => (
            <button
              key={k.value}
              type="button"
              onClick={() => setValue('kind', k.value)}
              className={`${styles.chipBtn} ${kind === k.value ? styles.chipBtnActive : ''}`}
            >
              <Icon name={k.icon} size={14} /> {k.label}
              <span className={styles.chipHint}>{k.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Objetivo</label>
        <div className={styles.goalRow}>
          <button
            type="button"
            onClick={() => setValue('goalType', 'complete')}
            className={`${styles.chipBtn} ${goalType === 'complete' ? styles.chipBtnActive : ''}`}
          >
            <Icon name="check_circle" size={14} /> Completar
          </button>
          <button
            type="button"
            onClick={() => setValue('goalType', 'numeric')}
            className={`${styles.chipBtn} ${goalType === 'numeric' ? styles.chipBtnActive : ''}`}
          >
            <Icon name="pin" size={14} /> Progreso
          </button>
        </div>
      </div>

      {goalType === 'numeric' && (
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Meta
            <span className={styles.formLabelOptional}>(
              {targetUnit === 'timer' ? 'minutos' : 'cantidad'}
            )</span>
          </label>
          <div className={styles.targetRow}>
            <input
              type="number"
              min={1}
              placeholder={targetUnit === 'timer' ? '20' : '5'}
              className={styles.input}
              {...register('targetValue')}
            />
            <div className={styles.unitToggle}>
              <button
                type="button"
                onClick={() => setValue('targetUnit', 'numeric')}
                className={`${styles.unitBtn} ${targetUnit === 'numeric' ? styles.unitBtnActive : ''}`}
              >
                #
              </button>
              <button
                type="button"
                onClick={() => setValue('targetUnit', 'timer')}
                className={`${styles.unitBtn} ${targetUnit === 'timer' ? styles.unitBtnActive : ''}`}
              >
                min
              </button>
            </div>
          </div>
        </div>
      )}

      {kind === 'habit' && (
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Frecuencia</label>
          <div className={styles.frequencyGrid}>
            {FREQUENCY_OPTIONS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setValue('frequencyType', f.value)}
                className={`${styles.chipBtn} ${frequencyType === f.value ? styles.chipBtnActive : ''}`}
              >
                <Icon name={f.icon} size={13} /> {f.label}
              </button>
            ))}
          </div>

          {frequencyType === 'weekly' && (
            <div className={styles.weeklyRow}>
              <input
                type="number"
                min={1}
                max={7}
                className={`${styles.input} ${styles.inputNarrow}`}
                {...register('timesPerWeek')}
              />
              <span className={styles.weeklyHint}>veces por semana</span>
            </div>
          )}

          {frequencyType === 'custom' && (
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
          )}
        </div>
      )}

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          {kind === 'task' ? 'Fecha' : 'Inicio'}
          <span className={styles.formLabelOptional}>
            {kind === 'task' ? '(día de la tarea)' : ''}
          </span>
        </label>
        <div className={styles.dateRow}>
          <input type="date" className={styles.input} {...register('startDate')} />
          {kind === 'habit' && (
            <input
              type="date"
              className={styles.input}
              placeholder="Fin (opcional)"
              {...register('endDate')}
            />
          )}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Notas <span className={styles.formLabelOptional}>(opcional)</span></label>
        <textarea
          placeholder="Por qué importa, detalles, etc."
          rows={2}
          className={styles.textarea}
          {...register('notes')}
        />
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
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>

      <div className={styles.formActions}>
        {onCancel && (
          <button type="button" onClick={onCancel} className={styles.secondaryBtn}>
            Cancelar
          </button>
        )}
        <button type="submit" disabled={saving} className={styles.submitBtn}>
          {saving
            ? (mode === 'create' ? 'Creando…' : 'Guardando…')
            : <><Icon name={mode === 'create' ? 'add' : 'save'} size={16} /> {submitLabel ?? (mode === 'create' ? 'Crear' : 'Guardar')}</>}
        </button>
      </div>
    </form>
  );
};
