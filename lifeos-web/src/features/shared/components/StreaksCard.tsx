import { Icon } from '../../../components/Icon';
import useStreaks from '../hooks/useStreaks';
import styles from './StreaksCard.module.css';

const Badge = ({ value, color }: { value: number; color: string }) => (
  <span className={styles.badge} style={{ color }}>
    <Icon name="local_fire_department" size={13} filled={value > 0} />
    {value}
  </span>
);

export const StreaksCard = () => {
  const { data, isLoading } = useStreaks();

  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.labelSm}><Icon name="local_fire_department" size={11} /> Rachas</div>
        <div className={styles.skeleton} style={{ width: '60%' }} />
      </div>
    );
  }

  if (!data) return null;

  const topHabits = data.habits.slice(0, 4);

  return (
    <div className={styles.card}>
      <div className={styles.labelSm}>
        <Icon name="local_fire_department" size={11} /> Rachas
      </div>

      <div className={styles.domainRow}>
        <div className={styles.domain}>
          <div className={styles.domainHead}>
            <Icon name="fitness_center" size={14} /> Gym
          </div>
          <div className={styles.domainValue}>
            <span className={styles.current}>{data.gym.current}</span>
            <span className={styles.unit}>d</span>
            <span className={styles.longest}>máx {data.gym.longest}</span>
          </div>
        </div>

        <div className={styles.domain}>
          <div className={styles.domainHead}>
            <Icon name="bedtime" size={14} /> Sueño ≥{data.sleep.thresholdHours}h
          </div>
          <div className={styles.domainValue}>
            <span className={styles.current}>{data.sleep.current}</span>
            <span className={styles.unit}>d</span>
            <span className={styles.longest}>máx {data.sleep.longest}</span>
          </div>
        </div>

        <div className={styles.domain}>
          <div className={styles.domainHead}>
            <Icon name="auto_stories" size={14} /> Journal
          </div>
          <div className={styles.domainValue}>
            <span className={styles.current}>{data.journal.current}</span>
            <span className={styles.unit}>d</span>
            <span className={styles.longest}>máx {data.journal.longest}</span>
          </div>
        </div>
      </div>

      {topHabits.length > 0 && (
        <>
          <div className={styles.divider} />
          <div className={styles.habitList}>
            {topHabits.map((h) => (
              <div key={h.habitId} className={styles.habitRow}>
                <span className={styles.habitDot} style={{ background: h.color }} />
                <span className={styles.habitName}>{h.name}</span>
                <Badge value={h.current} color={h.color} />
                <span className={styles.habitLongest}>máx {h.longest}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
