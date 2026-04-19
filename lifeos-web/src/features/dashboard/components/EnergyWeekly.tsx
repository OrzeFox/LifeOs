import { Icon } from '../../../components/Icon';
import type { EnergyWeekly as EnergyWeeklyData } from '../../../ts/dashboard';
import styles from './EnergyWeekly.module.css';

const DAY_LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

interface EnergyWeeklyProps {
  data: EnergyWeeklyData;
  today: string;
}

export const EnergyWeekly = ({ data, today }: EnergyWeeklyProps) => {
  const { days, average, best, worst, loggedDays } = data;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Icon name="insights" size={11} />
          <span>Comparativa semanal</span>
        </div>
        <span className={styles.avgBadge}>
          avg <strong>{loggedDays > 0 ? average.toFixed(1) : '—'}</strong>
        </span>
      </div>

      <div className={styles.chart}>
        {days.map((d) => {
          const dt = new Date(d.date + 'T12:00:00');
          const dow = dt.getDay();
          const isToday = d.date === today;
          const hasValue = d.level !== null && d.level !== undefined;
          const level = hasValue ? (d.level as number) : 0;
          const height = hasValue ? Math.max(level * 10, 6) : 4;

          return (
            <div key={d.date} className={styles.col}>
              <div className={styles.track}>
                <div
                  className={styles.bar}
                  style={{
                    height: `${height}%`,
                    background: !hasValue
                      ? 'var(--color-surface-container-high)'
                      : isToday
                        ? 'linear-gradient(180deg, var(--color-tertiary), rgba(255, 185, 95, 0.5))'
                        : 'linear-gradient(180deg, rgba(255, 185, 95, 0.65), rgba(255, 185, 95, 0.25))',
                    boxShadow: hasValue && isToday ? '0 0 12px rgba(255, 185, 95, 0.45)' : 'none',
                    opacity: hasValue ? 1 : 0.6,
                  }}
                  title={hasValue ? `${level}/10` : 'Sin registro'}
                />
              </div>
              <span
                className={styles.dayLabel}
                style={{
                  color: isToday ? 'var(--color-tertiary)' : 'var(--color-outline)',
                  fontWeight: isToday ? 700 : 500,
                }}
              >
                {DAY_LABELS[dow]}
              </span>
              <span className={styles.dayValue}>{hasValue ? level : '—'}</span>
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <span className={styles.footerItem}>
          <Icon name="trending_up" size={11} /> mejor <strong>{loggedDays > 0 ? best : '—'}</strong>
        </span>
        <span className={styles.footerDivider} />
        <span className={styles.footerItem}>
          <Icon name="trending_down" size={11} /> peor <strong>{loggedDays > 0 ? worst : '—'}</strong>
        </span>
        <span className={styles.footerDivider} />
        <span className={styles.footerItem}>
          <Icon name="calendar_month" size={11} /> {loggedDays}/7 días
        </span>
      </div>
    </div>
  );
};
