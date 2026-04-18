import { Icon } from '../../../components/Icon';
import { energyLabel } from '../../../domain/dashboard/dashboardUtils';
import useEnergy from '../hooks/useEnergy';
import styles from '../DashboardPage.module.css';

interface EnergyInputProps {
  initial: number | null;
  date: string;
  onChange: (v: number) => void;
}

export const EnergyInput = ({ initial, date, onChange }: EnergyInputProps) => {
  const { level, setLevel, saving, saved, save } = useEnergy(initial, date, onChange);
  const glowOpacity = level > 0 ? Math.min(level / 10 * 0.25, 0.25) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
        <span
          className={styles.energyNumber}
          style={{
            color: level > 0 ? 'var(--color-tertiary)' : 'var(--color-surface-container-high)',
            textShadow: level > 0 ? `0 0 40px rgba(255, 185, 95, ${glowOpacity})` : 'none',
          }}
        >
          {level > 0 ? level : '—'}
        </span>
        <div className={styles.energyMeta}>
          {level > 0 && (
            <p className={styles.energyStatusText} style={{ color: 'var(--color-tertiary)' }}>
              {energyLabel(level)}
            </p>
          )}
          {saving && <p className={styles.energySavingText}>guardando…</p>}
          {saved && !saving && (
            <p className={styles.energySavingText} style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Icon name="check_circle" size={11} filled /> guardado
            </p>
          )}
        </div>
      </div>
      <input
        type="range" min={1} max={10} value={level || 1}
        onChange={(e) => setLevel(Number(e.target.value))}
        onMouseUp={(e) => save(Number((e.target as HTMLInputElement).value))}
        onTouchEnd={(e) => save(Number((e.target as HTMLInputElement).value))}
      />
      <div className={styles.energyTicks}>
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className={styles.energyTick}
            style={{
              fontWeight: level === i + 1 ? 700 : 400,
              color: level === i + 1 ? 'var(--color-tertiary)' : 'var(--color-surface-container-high)',
            }}
          >
            {i + 1}
          </span>
        ))}
      </div>
    </div>
  );
};
