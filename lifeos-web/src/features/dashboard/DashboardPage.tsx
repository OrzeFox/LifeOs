import { Icon } from '../../components/Icon';
import { getGreeting } from '../../domain/dashboard/dashboardUtils';
import { MEAL_TYPES } from '../../ts/routine';
import useDashboard from './hooks/useDashboard';
import { ProgressBar } from './components/ProgressBar';
import { EnergyInput } from './components/EnergyInput';
import { EnergyWeekly } from './components/EnergyWeekly';
import { DashboardHabitRow } from './components/DashboardHabitRow';
import { StreaksCard } from '../shared/components/StreaksCard';
import { InsightsPanel } from '../insights/components/InsightsPanel';
import { EnergyScoreCard } from '../energy-score/components/EnergyScoreCard';
import { GoalsCard } from '../goals/components/GoalsCard';
import { PredictionsCard } from '../predictions/components/PredictionsCard';
import styles from './DashboardPage.module.css';

export const DashboardPage = () => {
  const { data, setData, loading, reload } = useDashboard();

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.hero}>
          <div className={styles.skeletonLine} style={{ width: '30%', height: 48, marginBottom: 10 }} />
          <div className={styles.skeletonLine} style={{ width: '20%' }} />
        </div>
        <div className={styles.bentoGrid}>
          <div className={styles.card} style={{ gridColumn: 'span 8' }}>
            <div className={styles.skeletonLine} style={{ width: '25%', marginBottom: 20 }} />
            <div className={styles.skeletonLine} style={{ width: '45%', height: 44, marginBottom: 24 }} />
            <div className={styles.skeletonSubGrid}>
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className={styles.skeletonLine} style={{ width: '50%', marginBottom: 8 }} />
                  <div className={styles.skeletonLine} style={{ width: '70%', height: 22 }} />
                </div>
              ))}
            </div>
            <div className={styles.skeletonLine} style={{ height: 6, marginTop: 20, borderRadius: 99 }} />
          </div>
          <div className={styles.card} style={{ gridColumn: 'span 4' }}>
            <div className={styles.skeletonLine} style={{ width: '40%', marginBottom: 20 }} />
            <div className={styles.skeletonLine} style={{ width: '30%', height: 56, marginBottom: 16 }} />
            <div className={styles.skeletonLine} style={{ height: 6, borderRadius: 99 }} />
          </div>
          <div className={styles.card} style={{ gridColumn: 'span 4' }}>
            <div className={styles.skeletonLine} style={{ width: '40%', marginBottom: 20 }} />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                <div className={styles.skeletonLine} style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0 }} />
                <div className={styles.skeletonLine} style={{ flex: 1, height: 14 }} />
              </div>
            ))}
          </div>
          <div className={styles.card} style={{ gridColumn: 'span 8' }}>
            <div className={styles.skeletonLine} style={{ width: '25%', marginBottom: 20 }} />
            {[1, 2].map((i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div className={styles.skeletonLine} style={{ width: 36, height: 14 }} />
                <div className={styles.skeletonLine} style={{ flex: 1, height: 14 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const completed = data.habits.filter((h) => h.completed).length;
  const total     = data.habits.length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;
  const income    = data.summary.totalIncome;
  const spent     = data.summary.totalSpent;
  const remaining = data.summary.remaining;
  const spentPct  = income > 0 ? Math.min((spent / income) * 100, 100) : 0;

  return (
    <div className={styles.page}>

      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>{getGreeting()}</h1>
        <p className={styles.heroDate}>
          {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className={styles.bentoGrid}>

        {/* Liquidity Pulse — 8 cols */}
        <div className={styles.card} style={{ gridColumn: 'span 8' }}>
          <div className={styles.labelSm}>
            <Icon name="account_balance_wallet" size={11} />
            Liquidez mensual
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '24px' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-display-lg)', fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1,
              color: remaining >= 0 ? 'var(--color-primary)' : 'var(--color-error)',
              textShadow: remaining >= 0 ? '0 0 40px rgba(78, 222, 163, 0.20)' : 'none',
            }}>
              ${Math.abs(remaining).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
            </span>
            <div style={{ paddingBottom: '8px' }}>
              <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-on-surface-variant)' }}>
                {remaining >= 0 ? 'disponible' : 'déficit'}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 'var(--text-label-md)', color: 'var(--color-outline)' }}>
                de ${income.toLocaleString('es-MX', { maximumFractionDigits: 0 })} ingreso
              </p>
            </div>
          </div>

          <div className={styles.subMetricsGrid}>
            {[
              { lbl: 'Ingresos', val: income, color: 'var(--color-primary)' },
              { lbl: 'Gastado',  val: spent,  color: 'var(--color-tertiary)' },
              { lbl: 'Estimado', val: data.summary.projectedRemaining, color: spentPct > 80 ? 'var(--color-error)' : 'var(--color-secondary)' },
            ].map(({ lbl, val, color }) => (
              <div key={lbl}>
                <p className={styles.metricLabel}>{lbl}</p>
                <p className={styles.metricValue} style={{ color }}>
                  ${Number(val).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                </p>
              </div>
            ))}
          </div>

          <ProgressBar
            value={spent} max={income}
            color={spentPct > 85 ? 'var(--color-error)' : spentPct > 65 ? 'var(--color-tertiary)' : 'var(--color-primary)'}
          />
          <div className={styles.progressLabels}>
            <span className={styles.progressLabelText}>0%</span>
            <span className={styles.progressLabelText} style={{ fontWeight: 600 }}>{spentPct.toFixed(0)}% consumido</span>
            <span className={styles.progressLabelText}>100%</span>
          </div>
        </div>

        {/* Energy Vitality — 4 cols */}
        <div className={styles.card} style={{ gridColumn: 'span 4' }}>
          <div className={styles.labelSm}>
            <Icon name="bolt" size={11} />
            Energía vital
          </div>
          <div style={{
            background: data.energy?.level && data.energy.level > 6
              ? `radial-gradient(ellipse at 50% 0%, rgba(255, 185, 95, 0.05) 0%, transparent 70%)`
              : 'none',
            margin: '-8px', padding: '8px', borderRadius: 'var(--radius-xl)',
          }}>
            <EnergyInput
              initial={data.energy?.level ?? null}
              date={data.date}
              onChange={(v) => {
                setData((d) => d ? {
                  ...d,
                  energy: { ...d.energy, level: v },
                  energyWeekly: d.energyWeekly
                    ? {
                        ...d.energyWeekly,
                        days: d.energyWeekly.days.map((day) =>
                          day.date === d.date ? { ...day, level: v } : day,
                        ),
                      }
                    : d.energyWeekly,
                } : d);
                reload();
              }}
            />
          </div>
        </div>

        {/* Energy weekly trend — 12 cols */}
        {data.energyWeekly && (
          <div className={styles.card} style={{ gridColumn: 'span 12' }}>
            <EnergyWeekly data={data.energyWeekly} today={data.date} />
          </div>
        )}

        {/* Habit Loop — 4 cols */}
        <div className={styles.card} style={{ gridColumn: 'span 4' }}>
          <div className={styles.habitLoopHeader}>
            <div className={styles.labelSm}>
              <Icon name="self_improvement" size={11} />
              Habit loop
            </div>
            <span
              className={styles.habitPct}
              style={{ textShadow: pct > 50 ? '0 0 20px rgba(192, 193, 255, 0.20)' : 'none' }}
            >
              {pct}%
            </span>
          </div>

          {total > 0 && (
            <div className={styles.segmentBar}>
              {Array.from({ length: total }, (_, i) => (
                <div
                  key={i}
                  className={styles.segment}
                  style={{
                    background: i < completed
                      ? 'linear-gradient(90deg, var(--color-secondary-container), var(--color-secondary))'
                      : 'var(--color-surface-container-high)',
                  }}
                />
              ))}
            </div>
          )}

          {total === 0 ? (
            <p className={styles.emptyText}>Ve a Hábitos para crear rituales.</p>
          ) : (
            <ul className={styles.habitList}>
              {data.habits.slice(0, 5).map((h) => (
                <DashboardHabitRow key={h.id} habit={h} date={data.date} onToggle={reload} />
              ))}
              {data.habits.length > 5 && (
                <li className={styles.moreHabits}>+{data.habits.length - 5} rituales más</li>
              )}
            </ul>
          )}
        </div>

        {/* Energy Score — 12 cols */}
        <div style={{ gridColumn: 'span 12' }}>
          <EnergyScoreCard />
        </div>

        {/* Goals — 12 cols */}
        <div style={{ gridColumn: 'span 12' }}>
          <GoalsCard />
        </div>

        {/* Predictions — 12 cols */}
        <div style={{ gridColumn: 'span 12' }}>
          <PredictionsCard />
        </div>

        {/* Insights — 12 cols */}
        <div style={{ gridColumn: 'span 12' }}>
          <InsightsPanel />
        </div>

        {/* Streaks — 12 cols */}
        <div style={{ gridColumn: 'span 12' }}>
          <StreaksCard />
        </div>

        {/* Meal Plan — 8 cols */}
        <div className={styles.card} style={{ gridColumn: 'span 8' }}>
          <div className={styles.mealHeader}>
            <div className={styles.labelSm}>
              <Icon name="restaurant" size={11} />
              Plan de comidas
            </div>
            <span
              className={styles.tag}
              style={{ background: 'rgba(192, 193, 255, 0.10)', color: 'var(--color-secondary)' }}
            >
              {data.meals.length} hoy
            </span>
          </div>

          {data.meals.length === 0 ? (
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-outline)', margin: 0 }}>
              Sin comidas registradas. Ve a Rutina.
            </p>
          ) : (
            <div className={styles.mealList}>
              {data.meals.map((m) => (
                <div key={m.id} className={styles.mealRow}>
                  <span className={styles.mealTime}>{m.scheduledTime?.slice(0, 5) ?? '--:--'}</span>
                  <div style={{ flex: 1 }}>
                    <p className={styles.mealName}>{MEAL_TYPES.find((t) => t.value === m.mealType)?.label ?? m.mealType}</p>
                    {m.description && <p className={styles.mealDesc}>{m.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {income > 0 && (
        <div className={styles.predictionBanner}>
          <div>
            <div className={styles.labelSm}><Icon name="insights" size={11} /> Predicción de cierre</div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)' }}>
              Basada en tu ritmo de gasto actual
            </p>
          </div>
          <span
            className={styles.predictionValue}
            style={{ color: data.summary.projectedRemaining >= 0 ? 'var(--color-primary)' : 'var(--color-error)' }}
          >
            ${data.summary.projectedRemaining}
          </span>
        </div>
      )}
    </div>
  );
};
