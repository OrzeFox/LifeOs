import useSleepLogs from '../hooks/useSleepLogs';
import useSleepMutations from '../hooks/useSleepMutations';
import { Icon } from '../../../components/Icon';
import styles from '../SleepPage.module.css';

const fmtDate = (iso: string) => new Date(iso).toLocaleString('es-MX', {
  weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
});

const fmtDuration = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
};

export const SleepHistory = () => {
  const { data: logs, isLoading } = useSleepLogs();
  const { remove } = useSleepMutations();

  if (isLoading) return <p className={styles.hint}>Cargando...</p>;
  if (!logs?.length) return <p className={styles.hint}>Sin registros aún</p>;

  return (
    <ul className={styles.historyList}>
      {logs.map(log => (
        <li key={log.id} className={styles.historyItem}>
          <div className={styles.historyMain}>
            <div className={styles.historyRange}>
              {fmtDate(log.sleepAt)} → {fmtDate(log.wakeAt)}
            </div>
            {log.notes && <p className={styles.historyNotes}>{log.notes}</p>}
          </div>
          <div className={styles.historySide}>
            <span className={styles.duration}>{fmtDuration(log.durationMin)}</span>
            <button
              type="button"
              onClick={() => remove.mutate(log.id)}
              className={styles.deleteBtn}
              aria-label="Eliminar"
            >
              <Icon name="delete" size={16} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};
