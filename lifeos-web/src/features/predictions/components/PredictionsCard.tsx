import { Icon } from '../../../components/Icon';
import usePredictions from '../hooks/usePredictions';
import type { Trend } from '../../../ts/predictions';
import styles from './PredictionsCard.module.css';

const TrendBadge = ({ t }: { t: Trend }) => (
  <span className={[styles.trend, styles[t]].join(' ')}>
    {t === 'up' ? '↑' : t === 'down' ? '↓' : '→'}
  </span>
);

export const PredictionsCard = () => {
  const { data, isLoading } = usePredictions();

  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.labelSm}><Icon name="insights" size={11} /> Predicciones</div>
        <div className={styles.grid}>
          {[1, 2, 3, 4].map((i) => <div key={i} className={styles.skeleton} />)}
        </div>
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className={styles.card}>
      <div className={styles.labelSm}><Icon name="insights" size={11} /> Predicciones</div>
      <div className={styles.grid}>
        <div className={styles.cell}>
          <div className={styles.cellHead}>Cierre de mes</div>
          <div className={styles.big}>
            ${Number(data.finance.monthEndProjectedRemaining).toLocaleString('es-MX')}
          </div>
          <div className={styles.sub}>
            Confianza {Math.round(data.finance.projectionConfidence * 100)}% · ${data.finance.dailyAvgSpend}/día
          </div>
        </div>

        <div className={styles.cell}>
          <div className={styles.cellHead}>
            Sueño próximos 7d <TrendBadge t={data.sleep.trend} />
          </div>
          <div className={styles.big}>{data.sleep.projectedAvgNext7d.toFixed(1)}h</div>
          <div className={styles.sub}>
            7d: {data.sleep.avg7d.toFixed(1)}h · 30d: {data.sleep.avg30d.toFixed(1)}h
          </div>
        </div>

        <div className={styles.cell}>
          <div className={styles.cellHead}>
            Hábitos 7d <TrendBadge t={data.habits.trend} />
          </div>
          <div className={styles.big}>
            {Math.round(data.habits.projectedRateNext7d * 100)}%
          </div>
          <div className={styles.sub}>
            Actual: {Math.round(data.habits.last7dRate * 100)}%
          </div>
        </div>

        <div className={styles.cell}>
          <div className={styles.cellHead}>
            Gym próximos 7d <TrendBadge t={data.gym.trend} />
          </div>
          <div className={styles.big}>{data.gym.projectedSessionsNext7d}</div>
          <div className={styles.sub}>
            7d: {data.gym.sessionsLast7d} · 30d: {data.gym.sessionsLast30d}
          </div>
        </div>
      </div>
    </div>
  );
};
