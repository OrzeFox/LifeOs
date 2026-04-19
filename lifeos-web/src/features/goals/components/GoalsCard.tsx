import { Link } from 'react-router-dom';
import { Icon } from '../../../components/Icon';
import { useGoalsProgress } from '../hooks/useGoals';
import { METRIC_LABELS, TIMEFRAME_LABELS } from '../../../ts/goals';
import type { GoalProgress } from '../../../ts/goals';
import styles from './GoalsCard.module.css';

export const GoalsCard = () => {
  const { data, isLoading } = useGoalsProgress();

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.labelSm}>
          <Icon name="flag" size={11} filled /> Metas
        </div>
        <Link to="/goals" className={styles.btn}>
          <Icon name="tune" size={14} /> Gestionar
        </Link>
      </div>

      {isLoading ? (
        <div className={styles.list}>
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </div>
      ) : !data || data.length === 0 ? (
        <div className={styles.empty}>Sin metas activas. Crea una desde Gestionar.</div>
      ) : (
        <div className={styles.list}>
          {data.slice(0, 5).map((gp) => <GoalRow key={gp.goal.id} item={gp} />)}
        </div>
      )}
    </div>
  );
};

const GoalRow = ({ item }: { item: GoalProgress }) => {
  const pct = Math.max(0, Math.min(1, item.progress)) * 100;
  const barClass = item.met ? styles.met : item.progress < 0.35 ? styles.far : '';
  return (
    <div className={styles.row}>
      <div className={styles.rowHead}>
        <span className={styles.title}>{item.goal.title}</span>
        <span className={styles.value}>
          <strong>{item.currentValue}</strong>
          {' '}/ {item.goal.target}
        </span>
      </div>
      <div className={styles.bar}>
        <div className={[styles.barFill, barClass].join(' ')} style={{ width: `${pct}%` }} />
      </div>
      <div className={styles.meta}>
        <span>{METRIC_LABELS[item.goal.metric]} · {TIMEFRAME_LABELS[item.goal.timeframe]}</span>
        <span>{item.met ? '✓ cumplida' : `${Math.round(pct)}%`}</span>
      </div>
    </div>
  );
};
