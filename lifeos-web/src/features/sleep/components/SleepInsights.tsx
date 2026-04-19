import useSleepStats from '../hooks/useSleepStats';
import { Icon } from '../../../components/Icon';
import styles from '../SleepPage.module.css';

const trendInfo = {
  improving: { icon: 'trending_up', label: 'Mejorando' },
  declining: { icon: 'trending_down', label: 'Descendiendo' },
  stable:    { icon: 'trending_flat', label: 'Estable' },
} as const;

export const SleepInsights = () => {
  const { data: stats, isLoading } = useSleepStats();
  if (isLoading) return <p className={styles.hint}>Cargando...</p>;
  if (!stats) return null;

  const t = trendInfo[stats.trend];

  return (
    <div className={styles.insights}>
      <div className={styles.metricsGrid}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Promedio 7d</span>
          <span className={styles.metricValue}>{stats.avgHours7d.toFixed(1)}h</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Promedio 30d</span>
          <span className={styles.metricValue}>{stats.avgHours30d.toFixed(1)}h</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Tendencia</span>
          <span className={styles.metricValue}>
            <Icon name={t.icon} size={16} /> {t.label}
          </span>
        </div>
      </div>

      {stats.suggestions.length > 0 && (
        <ul className={styles.suggestList}>
          {stats.suggestions.map((s, i) => (
            <li key={i} className={styles.suggestItem}>
              <Icon name="lightbulb" size={16} /> {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
