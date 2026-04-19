import { Icon } from '../../../components/Icon';
import useEnergyScore from '../hooks/useEnergyScore';
import type { EnergyBand } from '../../../ts/energyScore';
import styles from './EnergyScoreCard.module.css';

const BAND_LABEL: Record<EnergyBand, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
  peak: 'Pico',
};

export const EnergyScoreCard = () => {
  const { data, isLoading } = useEnergyScore();

  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.labelSm}>
          <Icon name="local_fire_department" size={11} /> Energy score
        </div>
        <div className={styles.skeleton} />
      </div>
    );
  }

  if (!data) return null;

  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, data.total)) / 100;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.labelSm}>
          <Icon name="local_fire_department" size={11} /> Energy score
        </div>
        <span className={[styles.band, styles[data.band]].join(' ')}>
          {BAND_LABEL[data.band]}
        </span>
      </div>

      <div className={styles.main}>
        <div className={styles.ring}>
          <svg viewBox="0 0 112 112">
            <circle className={styles.ringBg} cx="56" cy="56" r={radius} />
            <circle
              className={[styles.ringFg, styles[data.band]].join(' ')}
              cx="56"
              cy="56"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className={styles.ringCenter}>
            <span className={styles.total}>{data.total}</span>
            <span className={styles.outOf}>/ 100</span>
          </div>
        </div>

        <div className={styles.components}>
          {data.components.map((c) => {
            const pct = c.max > 0 ? (c.score / c.max) * 100 : 0;
            return (
              <div key={c.key} className={styles.row}>
                <span className={styles.rowLabel}>{c.label}</span>
                <div className={styles.bar}>
                  <div className={styles.barFill} style={{ width: `${pct}%` }} />
                </div>
                <span className={styles.rowNote}>{c.note}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
