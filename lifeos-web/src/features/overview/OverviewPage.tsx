import { Icon } from '../../components/Icon';
import useUserContext from '../shared/hooks/useUserContext';
import { EnergyScoreCard } from '../energy-score/components/EnergyScoreCard';
import { PredictionsCard } from '../predictions/components/PredictionsCard';
import { GoalsCard } from '../goals/components/GoalsCard';
import { InsightsPanel } from '../insights/components/InsightsPanel';
import { StreaksCard } from '../shared/components/StreaksCard';
import styles from './OverviewPage.module.css';

export const OverviewPage = () => {
  const { data: ctx, isLoading } = useUserContext(7);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Semana en perspectiva</h1>
          <p className={styles.subtitle}>
            Vista unificada: energía, hábitos, finanzas, sueño y metas.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        <div style={{ gridColumn: 'span 12' }}>
          <EnergyScoreCard />
        </div>

        <div style={{ gridColumn: 'span 12' }}>
          <PredictionsCard />
        </div>

        <div style={{ gridColumn: 'span 6' }}>
          <div className={styles.card}>
            <div className={styles.labelSm}>
              <Icon name="bedtime" size={11} /> Sueño 7d
            </div>
            {isLoading || !ctx ? (
              <div className={styles.sub}>Cargando…</div>
            ) : (
              <>
                <div className={styles.big}>{ctx.sleep.avgHours7d.toFixed(1)}h</div>
                <div className={styles.sub}>
                  30d: {ctx.sleep.avgHours30d.toFixed(1)}h · tendencia {ctx.sleep.trend}
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ gridColumn: 'span 6' }}>
          <div className={styles.card}>
            <div className={styles.labelSm}>
              <Icon name="fitness_center" size={11} /> Gym 7d
            </div>
            {isLoading || !ctx ? (
              <div className={styles.sub}>Cargando…</div>
            ) : (
              <>
                <div className={styles.big}>{ctx.gym.last7dCount}</div>
                <div className={styles.sub}>
                  {ctx.gym.minutesLast7d} min · última sesión hace {ctx.gym.daysSinceLastWorkout ?? '—'}d
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ gridColumn: 'span 6' }}>
          <div className={styles.card}>
            <div className={styles.labelSm}>
              <Icon name="self_improvement" size={11} /> Hábitos 7d
            </div>
            {isLoading || !ctx ? (
              <div className={styles.sub}>Cargando…</div>
            ) : (
              <>
                <div className={styles.big}>
                  {Math.round(ctx.habits.last7dCompletionRate * 100)}%
                </div>
                <div className={styles.sub}>
                  Hoy {ctx.habits.today.completed}/{ctx.habits.today.total}
                  {ctx.habits.missedDaysStreak > 0 && ` · ${ctx.habits.missedDaysStreak}d sin cumplir`}
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ gridColumn: 'span 6' }}>
          <div className={styles.card}>
            <div className={styles.labelSm}>
              <Icon name="account_balance_wallet" size={11} /> Finanzas
            </div>
            {isLoading || !ctx ? (
              <div className={styles.sub}>Cargando…</div>
            ) : (
              <>
                <div className={styles.big}>
                  ${Number(ctx.finance.monthRemaining).toLocaleString('es-MX')}
                </div>
                <div className={styles.sub}>
                  Semana: ${ctx.finance.weekSpent.toLocaleString('es-MX')}
                  {ctx.finance.overWeeklyAvg && ' · sobre promedio'}
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ gridColumn: 'span 12' }}>
          <GoalsCard />
        </div>

        <div style={{ gridColumn: 'span 12' }}>
          <InsightsPanel />
        </div>

        <div style={{ gridColumn: 'span 12' }}>
          <StreaksCard />
        </div>
      </div>
    </div>
  );
};
