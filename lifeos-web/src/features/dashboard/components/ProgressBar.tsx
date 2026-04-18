import styles from '../DashboardPage.module.css';

interface ProgressBarProps {
  value: number;
  max: number;
  color: string;
}

export const ProgressBar = ({ value, max, color }: ProgressBarProps) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className={styles.progressTrack}>
      <div className={styles.progressFill} style={{ width: `${pct}%`, background: color }} />
    </div>
  );
};
