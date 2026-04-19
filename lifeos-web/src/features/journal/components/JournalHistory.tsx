import { Icon } from '../../../components/Icon';
import type { JournalEntry } from '../../../ts/journal';
import styles from './JournalHistory.module.css';

type Props = {
  entries: JournalEntry[];
  onSelect: (date: string) => void;
  onDelete: (id: string) => void;
  activeDate: string;
};

const moodColor = (mood: number) => {
  if (mood >= 8) return 'var(--color-primary)';
  if (mood >= 5) return 'var(--color-secondary)';
  return 'var(--color-error)';
};

export const JournalHistory = ({ entries, onSelect, onDelete, activeDate }: Props) => {
  if (!entries.length) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}><Icon name="auto_stories" size={20} /></span>
        <p className={styles.emptyText}>Sin entradas aún.<br />Registra la primera hoy.</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {entries.map((e) => {
        const dateLabel = new Date(e.date + 'T12:00:00').toLocaleDateString('es-MX', {
          weekday: 'short', day: 'numeric', month: 'short',
        });
        const isActive = e.date === activeDate;
        return (
          <div key={e.id} className={`${styles.row} ${isActive ? styles.rowActive : ''}`}>
            <button onClick={() => onSelect(e.date)} className={styles.rowBtn}>
              <span className={styles.date}>{dateLabel}</span>
              <span className={styles.metrics}>
                <span style={{ color: moodColor(e.mood) }}>😊 {e.mood}</span>
                <span style={{ color: 'var(--color-secondary)' }}>⚡ {e.energyLevel}</span>
              </span>
              {e.notes && <span className={styles.preview}>{e.notes}</span>}
            </button>
            <button onClick={() => onDelete(e.id)} className={styles.deleteBtn} aria-label="Eliminar">
              <Icon name="close" size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
