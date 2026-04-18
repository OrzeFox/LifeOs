import { useState } from 'react';
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

export const CreateHabitForm = ({ onSubmit }: CreateHabitFormProps) => {
  const [name, setName]                     = useState('');
  const [description, setDescription]       = useState('');
  const [habitType, setHabitType]           = useState<HabitType>('simple');
  const [targetValue, setTargetValue]       = useState('');
  const [scheduleDays, setScheduleDays]     = useState<number[]>([]);
  const [color, setColor]                   = useState(HABIT_COLORS[0]);
  const [checklistItems, setChecklistItems] = useState<string[]>(['']);
  const [saving, setSaving]                 = useState(false);

  const toggleDay = (d: number) =>
    setScheduleDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const items = checklistItems.map((s) => s.trim()).filter(Boolean);
    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      habitType,
      targetValue: targetValue ? Number(targetValue) : undefined,
      scheduleDays: scheduleDays.length ? scheduleDays : undefined,
      color,
      checklistItems: habitType === 'checklist' ? items : undefined,
    });
    setName(''); setDescription(''); setHabitType('simple');
    setTargetValue(''); setScheduleDays([]); setColor(HABIT_COLORS[0]);
    setChecklistItems(['']);
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className={styles.form}>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Nombre</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Meditar"
          required
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Tipo de hábito</label>
        <div className={styles.typeGrid}>
          {HABIT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setHabitType(t.value)}
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
            type="number" min={1} value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder={habitType === 'timer' ? '20' : '10'}
            className={styles.input}
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
                onChange={(e) => {
                  const next = [...checklistItems]; next[i] = e.target.value; setChecklistItems(next);
                }}
                placeholder={`Tarea ${i + 1}`}
                className={styles.input}
              />
              {checklistItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => setChecklistItems(checklistItems.filter((_, j) => j !== i))}
                  className={styles.removeItemBtn}
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setChecklistItems([...checklistItems, ''])}
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
              onClick={() => setColor(c)}
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="¿Por qué este hábito importa?"
          className={styles.input}
        />
      </div>

      <button type="submit" disabled={saving} className={styles.submitBtn}>
        {saving ? 'Creando…' : <><Icon name="add" size={16} /> Crear hábito</>}
      </button>
    </form>
  );
};
