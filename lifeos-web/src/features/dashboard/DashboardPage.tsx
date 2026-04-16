import { useEffect, useState, useCallback } from 'react';
import { dashboardApi } from '../../api/dashboard';
import { habitsApi } from '../../api/habits';
import api from '../../api/client';
import { Icon } from '../../components/Icon';

// ─── Shared primitives ────────────────────────────────────────────────────────

/** Bento card — depth via background only, never borders */
const card: React.CSSProperties = {
  background: 'var(--color-surface-container)',
  borderRadius: 'var(--radius-xl)',
  padding: '24px',
};

/** Uppercase technical metadata label */
const labelSm: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.625rem',
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'var(--color-on-surface-variant)',
  marginBottom: '10px',
};

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="progress-track" style={{ marginTop: '12px' }}>
      <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ─── Energy Input ─────────────────────────────────────────────────────────────

function energyLabel(n: number) {
  if (n <= 2) return 'Agotado';
  if (n <= 4) return 'Bajo';
  if (n <= 6) return 'Normal';
  if (n <= 8) return 'Bien';
  return 'Excelente';
}

function EnergyInput({ initial, date, onChange }: { initial: number | null; date: string; onChange: (v: number) => void }) {
  const [level, setLevel] = useState<number>(initial ?? 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!initial);

  const save = async (val: number) => {
    setSaving(true);
    await api.post('/energy', { date, level: val });
    setSaving(false); setSaved(true); onChange(val);
    setTimeout(() => setSaved(false), 1500);
  };

  /* Amber glow intensity grows with level */
  const glowOpacity = level > 0 ? Math.min(level / 10 * 0.25, 0.25) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '3.5rem',    /* display-lg */
          fontWeight: 300,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          color: level > 0 ? 'var(--color-tertiary)' : 'var(--color-surface-container-high)',
          textShadow: level > 0 ? `0 0 40px rgba(255, 185, 95, ${glowOpacity})` : 'none',
          transition: 'all 0.3s ease',
        }}>
          {level > 0 ? level : '—'}
        </span>
        <div style={{ paddingBottom: '8px' }}>
          {level > 0 && (
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-tertiary)', fontWeight: 500 }}>
              {energyLabel(level)}
            </p>
          )}
          {saving && <p style={{ margin: 0, fontSize: '0.625rem', color: 'var(--color-on-surface-variant)' }}>guardando…</p>}
          {saved && !saving && (
            <p style={{ margin: 0, fontSize: '0.625rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Icon name="check_circle" size={11} filled /> guardado
            </p>
          )}
        </div>
      </div>
      <input type="range" min={1} max={10} value={level || 1}
        onChange={(e) => setLevel(Number(e.target.value))}
        onMouseUp={(e) => save(Number((e.target as HTMLInputElement).value))}
        onTouchEnd={(e) => save(Number((e.target as HTMLInputElement).value))}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} style={{
            fontSize: '0.625rem',
            fontWeight: level === i + 1 ? 700 : 400,
            color: level === i + 1 ? 'var(--color-tertiary)' : 'var(--color-surface-container-high)',
            transition: 'color 0.2s',
          }}>{i + 1}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Habit Row ────────────────────────────────────────────────────────────────

function HabitRow({ habit, date, onToggle }: { habit: any; date: string; onToggle: () => void }) {
  const [pending, setPending] = useState(false);
  const toggle = async () => {
    setPending(true);
    await habitsApi.toggle(habit.id, date);
    onToggle();
    setPending(false);
  };
  return (
    <li style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '8px 0',
      /* Separator via tonal shift, not a line */
    }}>
      <button onClick={toggle} disabled={pending} style={{
        width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
        border: `2px solid ${habit.completed ? 'var(--color-secondary)' : 'var(--color-surface-container-high)'}`,
        background: habit.completed
          ? 'linear-gradient(135deg, var(--color-secondary-container), var(--color-secondary))'
          : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s ease',
        boxShadow: habit.completed ? '0 0 8px rgba(192, 193, 255, 0.25)' : 'none',
      }}>
        {habit.completed && <Icon name="check" size={10} style={{ color: 'var(--color-on-secondary)' }} />}
      </button>
      <span style={{
        flex: 1, fontSize: '0.8125rem',
        color: habit.completed ? 'var(--color-on-surface-variant)' : 'var(--color-on-surface)',
        textDecoration: habit.completed ? 'line-through' : 'none',
        transition: 'all 0.2s ease',
      }}>
        {habit.name}
      </span>
    </li>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() =>
    dashboardApi.getDaily().then((res) => { setData(res.data); setLoading(false); }), []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{
          width: '28px', height: '28px',
          border: '2px solid var(--color-primary)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const completed = data.habits.filter((h: any) => h.completed).length;
  const total     = data.habits.length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;
  const income    = data.summary.totalIncome;
  const spent     = data.summary.totalSpent;
  const remaining = data.summary.remaining;
  const spentPct  = income > 0 ? Math.min((spent / income) * 100, 100) : 0;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Editorial hero greeting — display-lg ────────────────── */}
      <div style={{ marginBottom: '8px' }}>
        <h1 style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontSize: '3.5rem',
          fontWeight: 300,
          letterSpacing: '-0.04em',
          color: 'var(--color-on-surface)',
          lineHeight: 1.05,
        }}>
          {greeting}
        </h1>
        <p style={{
          margin: '6px 0 0',
          fontSize: '0.6875rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: 'var(--color-on-surface-variant)',
          fontWeight: 600,
        }}>
          {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* ── Bento grid — 12 columns ──────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>

        {/* Liquidity Pulse — 8 cols ─────────────────────────────── */}
        <div style={{ ...card, gridColumn: 'span 8' }}>
          <div style={labelSm}>
            <Icon name="account_balance_wallet" size={11} />
            Liquidez mensual
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '24px' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3.5rem', fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1,
              color: remaining >= 0 ? 'var(--color-primary)' : 'var(--color-error)',
              textShadow: remaining >= 0 ? '0 0 40px rgba(78, 222, 163, 0.20)' : 'none',
            }}>
              ${Math.abs(remaining).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
            </span>
            <div style={{ paddingBottom: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>
                {remaining >= 0 ? 'disponible' : 'déficit'}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '0.6875rem', color: 'var(--color-outline)' }}>
                de ${income.toLocaleString('es-MX', { maximumFractionDigits: 0 })} ingreso
              </p>
            </div>
          </div>

          {/* Sub-metrics row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[
              { lbl: 'Ingresos',   val: income,   color: 'var(--color-primary)' },
              { lbl: 'Gastado',    val: spent,    color: 'var(--color-tertiary)' },
              { lbl: 'Estimado',   val: data.summary.projectedRemaining, color: spentPct > 80 ? 'var(--color-error)' : 'var(--color-secondary)' },
            ].map(({ lbl, val, color }) => (
              <div key={lbl}>
                <p style={{ ...labelSm, margin: '0 0 4px', fontSize: '0.625rem' }}>{lbl}</p>
                <p style={{
                  margin: 0, fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem', fontWeight: 400, letterSpacing: '-0.03em', color,
                }}>
                  ${Number(val).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                </p>
              </div>
            ))}
          </div>

          <ProgressBar value={spent} max={income}
            color={spentPct > 85 ? 'var(--color-error)' : spentPct > 65 ? 'var(--color-tertiary)' : 'var(--color-primary)'}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '0.625rem', color: 'var(--color-outline)' }}>0%</span>
            <span style={{ fontSize: '0.625rem', color: 'var(--color-outline)', fontWeight: 600 }}>{spentPct.toFixed(0)}% consumido</span>
            <span style={{ fontSize: '0.625rem', color: 'var(--color-outline)' }}>100%</span>
          </div>
        </div>

        {/* Energy Vitality — 4 cols ─────────────────────────────── */}
        <div style={{ ...card, gridColumn: 'span 4' }}>
          <div style={labelSm}>
            <Icon name="bolt" size={11} />
            Energía vital
          </div>
          {/* 5% amber glow behind the energy metric — simulates "radiance" */}
          <div style={{
            background: data.energy?.level > 6
              ? `radial-gradient(ellipse at 50% 0%, rgba(255, 185, 95, 0.05) 0%, transparent 70%)`
              : 'none',
            margin: '-8px', padding: '8px', borderRadius: 'var(--radius-xl)',
          }}>
            <EnergyInput
              initial={data.energy?.level ?? null}
              date={data.date}
              onChange={(v) => setData((d: any) => ({ ...d, energy: { ...d.energy, level: v } }))}
            />
          </div>
        </div>

        {/* Habit Loop — 4 cols ──────────────────────────────────── */}
        <div style={{ ...card, gridColumn: 'span 4' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={labelSm}>
              <Icon name="self_improvement" size={11} />
              Habit loop
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem', fontWeight: 300, letterSpacing: '-0.03em',
              color: 'var(--color-secondary)',
              textShadow: pct > 50 ? '0 0 20px rgba(192, 193, 255, 0.20)' : 'none',
            }}>{pct}%</span>
          </div>

          {/* Segment bar — full radius tags */}
          {total > 0 && (
            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
              {Array.from({ length: total }, (_, i) => (
                <div key={i} style={{
                  flex: 1, height: '4px',
                  background: i < completed
                    ? 'linear-gradient(90deg, var(--color-secondary-container), var(--color-secondary))'
                    : 'var(--color-surface-container-high)',
                  borderRadius: '9999px',
                  transition: 'background 0.3s ease',
                }} />
              ))}
            </div>
          )}

          {total === 0 ? (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)', margin: 0 }}>
              Ve a Hábitos para crear rituales.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {data.habits.slice(0, 5).map((h: any) => (
                <HabitRow key={h.id} habit={h} date={data.date} onToggle={load} />
              ))}
              {data.habits.length > 5 && (
                <li style={{ fontSize: '0.6875rem', color: 'var(--color-outline)', paddingTop: '6px' }}>
                  +{data.habits.length - 5} rituales más
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Meal Plan — 8 cols ───────────────────────────────────── */}
        <div style={{ ...card, gridColumn: 'span 8' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={labelSm}>
              <Icon name="restaurant" size={11} />
              Plan de comidas
            </div>
            <span className="tag" style={{
              background: 'rgba(192, 193, 255, 0.10)',
              color: 'var(--color-secondary)',
            }}>
              {data.meals.length} hoy
            </span>
          </div>

          {data.meals.length === 0 ? (
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-outline)', margin: 0 }}>
              Sin comidas registradas. Ve a Rutina.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {data.meals.map((m: any) => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '10px 14px',
                  /* Slightly higher surface — the "Level 2" hover trick */
                  background: 'var(--color-surface-container-high)',
                  borderRadius: 'var(--radius-lg)',
                  transition: 'background 0.15s ease',
                }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface-bright)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface-container-high)')}
                >
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--color-outline)', width: '40px', flexShrink: 0 }}>
                    {m.scheduledTime?.slice(0, 5) ?? '--:--'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-on-surface)' }}>{m.name}</p>
                    {m.description && <p style={{ margin: '1px 0 0', fontSize: '0.6875rem', color: 'var(--color-on-surface-variant)' }}>{m.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Predicción banner ──────────────────────────────────────── */}
      {income > 0 && (
        <div style={{
          background: 'var(--color-surface-container-low)',
          borderRadius: 'var(--radius-xl)',
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={labelSm}><Icon name="insights" size={11} /> Predicción de cierre</div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)' }}>
              Basada en tu ritmo de gasto actual
            </p>
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem', fontWeight: 300, letterSpacing: '-0.03em',
            color: data.summary.projectedRemaining >= 0 ? 'var(--color-primary)' : 'var(--color-error)',
          }}>
            ${data.summary.projectedRemaining}
          </span>
        </div>
      )}
    </div>
  );
}
