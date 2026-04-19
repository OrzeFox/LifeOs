import { useEffect, useState } from 'react';
import { Icon } from '../../../components/Icon';
import type { JournalEntry } from '../../../ts/journal';
import styles from './JournalForm.module.css';

type Props = {
  date: string;
  entry: JournalEntry | null;
  onSave: (payload: { mood: number; energyLevel: number; notes?: string }) => void;
  saving: boolean;
};

const Slider = ({ label, value, onChange, color }: { label: string; value: number; onChange: (n: number) => void; color: string }) => (
  <div className={styles.slider}>
    <div className={styles.sliderHead}>
      <span className={styles.sliderLabel}>{label}</span>
      <span className={styles.sliderValue} style={{ color }}>{value}<span className={styles.sliderMax}>/10</span></span>
    </div>
    <input
      type="range"
      min={1}
      max={10}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={styles.range}
      style={{ accentColor: color }}
    />
  </div>
);

export const JournalForm = ({ date, entry, onSave, saving }: Props) => {
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setMood(entry?.mood ?? 5);
    setEnergy(entry?.energyLevel ?? 5);
    setNotes(entry?.notes ?? '');
  }, [entry?.id, entry?.date]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ mood, energyLevel: energy, notes: notes.trim() || undefined });
  };

  return (
    <form onSubmit={submit} className={styles.form}>
      <div className={styles.labelSm}>
        <Icon name="edit_note" size={11} /> {entry ? 'Editar entrada' : 'Nueva entrada'} — {date}
      </div>

      <Slider label="Mood" value={mood} onChange={setMood} color="var(--color-primary)" />
      <Slider label="Energy" value={energy} onChange={setEnergy} color="var(--color-secondary)" />

      <label className={styles.fieldLabel}>Notas</label>
      <textarea
        className={styles.textarea}
        rows={3}
        placeholder="¿Cómo te sentiste hoy? Qué funcionó, qué no."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <button type="submit" disabled={saving} className={styles.submitBtn}>
        {saving ? 'Guardando…' : entry ? 'Actualizar' : 'Guardar'}
      </button>
    </form>
  );
};
