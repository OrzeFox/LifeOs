import { Icon } from '../../../components/Icon';
import useInsights from '../hooks/useInsights';
import useInsightMutations from '../hooks/useInsightMutations';
import type { Insight, InsightCategory } from '../../../ts/insights';
import styles from './InsightsPanel.module.css';

const categoryLabel: Record<InsightCategory, string> = {
  health: 'Salud',
  finance: 'Finanzas',
  productivity: 'Productividad',
  lifestyle: 'Estilo de vida',
  alert: 'Alerta',
};

export const InsightsPanel = () => {
  const { data, isLoading } = useInsights({ limit: 20 });
  const { run, markRead, markAllRead, remove } = useInsightMutations();

  const unreadCount = data?.filter((i) => !i.readAt).length ?? 0;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.labelSm}>
          <Icon name="lightbulb" size={12} filled /> Insights{unreadCount > 0 ? ` · ${unreadCount}` : ''}
        </div>
        <div className={styles.actions}>
          <button
            className={styles.btn}
            onClick={() => run.mutate()}
            disabled={run.isPending}
            title="Re-evaluar reglas ahora"
          >
            <Icon name="refresh" size={14} /> {run.isPending ? '…' : 'Run'}
          </button>
          {unreadCount > 0 && (
            <button
              className={styles.btn}
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <Icon name="done_all" size={14} /> Leer todo
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className={styles.list}>
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </div>
      ) : !data || data.length === 0 ? (
        <div className={styles.empty}>Sin insights por ahora. Pulsa Run para re-evaluar.</div>
      ) : (
        <div className={styles.list}>
          {data.map((ins) => (
            <InsightRow
              key={ins.id}
              insight={ins}
              onRead={() => markRead.mutate(ins.id)}
              onDelete={() => remove.mutate(ins.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const InsightRow = ({
  insight,
  onRead,
  onDelete,
}: {
  insight: Insight;
  onRead: () => void;
  onDelete: () => void;
}) => {
  const isRead = !!insight.readAt;
  return (
    <div
      className={[
        styles.item,
        styles[insight.priority],
        isRead ? styles.read : '',
      ].join(' ')}
    >
      <div className={styles.itemHead}>
        <span className={styles.title}>{insight.title}</span>
        <span className={[styles.badge, styles[insight.category]].join(' ')}>
          {categoryLabel[insight.category]}
        </span>
      </div>
      <div className={styles.message}>{insight.message}</div>
      <div className={styles.itemActions}>
        {!isRead && (
          <button className={styles.iconBtn} onClick={onRead} title="Marcar leído">
            <Icon name="check" size={16} />
          </button>
        )}
        <button className={styles.iconBtn} onClick={onDelete} title="Eliminar">
          <Icon name="close" size={16} />
        </button>
      </div>
    </div>
  );
};
