import { Icon } from '../../../components/Icon';
import type { AppEvent } from '../../../ts/events';
import styles from '../EventsPage.module.css';

interface Props {
  event: AppEvent;
  onEdit: () => void;
  onDelete: () => void;
}

const fmt = (iso: string, allDay: boolean) => {
  const d = new Date(iso);
  if (allDay) return d.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short' });
  return d.toLocaleString('es-MX', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export const EventCard = ({ event, onEdit, onDelete }: Props) => {
  const color = event.category?.color ?? '#666';
  return (
    <article className={styles.eventCard} style={{ borderLeftColor: color }}>
      <div className={styles.eventMain}>
        <div className={styles.eventHeader}>
          <h3 className={styles.eventTitle}>{event.title}</h3>
          {event.category && (
            <span className={styles.categoryTag} style={{ background: color }}>
              {event.category.name}
            </span>
          )}
        </div>
        <p className={styles.eventTime}>
          <Icon name="schedule" size={14} /> {fmt(event.startAt, event.allDay)} → {fmt(event.endAt, event.allDay)}
        </p>
        {event.location && (
          <p className={styles.eventLocation}>
            <Icon name="place" size={14} /> {event.location}
          </p>
        )}
        {event.description && <p className={styles.eventDesc}>{event.description}</p>}
      </div>
      <div className={styles.eventActions}>
        <button type="button" onClick={onEdit} className={styles.iconBtn} aria-label="Editar">
          <Icon name="edit" size={16} />
        </button>
        <button type="button" onClick={onDelete} className={styles.iconBtnDanger} aria-label="Eliminar">
          <Icon name="delete" size={16} />
        </button>
      </div>
    </article>
  );
};
