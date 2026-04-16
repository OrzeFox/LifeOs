import { useEffect, useState } from 'react';
import { habitsApi } from '../../api/habits';
import { Icon } from '../../components/Icon';

// ─── Primitives ───────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: 'var(--color-surface-container)',
  borderRadius: 'var(--radius-xl)',
  padding: '24px',
};

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

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-surface-container-lowest)',
  border: '1px solid rgba(60, 74, 66, 0.15)',
  borderRadius: 'var(--radius-md)',
  padding: '10px 14px',
  fontSize: '0.875rem',
  color: 'var(--color-on-surface)',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
  transition: 'border-color 0.15s ease',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export function HabitsPage() {
  const [habits, setHabits] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const load = () => habitsApi.getToday(today).then((r) => setHabits(r.data));
  useEffect(() => { load(); }, []);

  const toggle = async (id: string) => { await habitsApi.toggle(id, today); load(); };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await habitsApi.create(newName.trim(), newDesc.trim() || undefined);
    setNewName(''); setNewDesc('');
    load();
  };

  const remove = async (id: string) => {
    setDeletingId(id);
    await habitsApi.delete(id);
    setDeletingId(null);
    load();
  };

  const completed = habits.filter((h) => h.completed).length;
  const total     = habits.length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Editorial heading ──────────────────────────────────── */}
      <div style={{ marginBottom: '8px' }}>
        <h1 style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontSize: '3.5rem', fontWeight: 300,
          letterSpacing: '-0.04em',
          color: 'var(--color-on-surface)', lineHeight: 1.05,
        }}>
          Habit Momentum
        </h1>
        <p style={{
          margin: '6px 0 0',
          fontSize: '0.6875rem', letterSpacing: '0.05em',
          textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', fontWeight: 600,
        }}>
          {today} — {total} rituales activos
        </p>
      </div>

      {/* ── Progress hero ──────────────────────────────────────── */}
      <div style={{
        ...card,
        /* Indigo ambient glow when making progress */
        boxShadow: pct > 50 ? '0 0 48px rgba(192, 193, 255, 0.04)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={labelSm}><Icon name="self_improvement" size={11} /> Progreso de hoy</div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem', fontWeight: 300, letterSpacing: '-0.04em',
            color: 'var(--color-secondary)',
            textShadow: pct > 50 ? '0 0 24px rgba(192, 193, 255, 0.25)' : 'none',
          }}>
            {pct}<span style={{ fontSize: '1rem', color: 'var(--color-on-surface-variant)' }}>%</span>
          </span>
        </div>

        {/* Segmented bar — full radius contrasting xl grid */}
        {total > 0 ? (
          <div style={{ display: 'flex', gap: '4px' }}>
            {habits.map((h, i) => (
              <div key={h.id} title={h.name}
                style={{
                  flex: 1, height: '6px', borderRadius: '9999px',
                  background: h.completed
                    ? 'linear-gradient(90deg, var(--color-secondary-container), var(--color-secondary))'
                    : 'var(--color-surface-container-high)',
                  cursor: 'pointer',
                  transition: 'background 0.3s ease',
                  boxShadow: h.completed ? '0 0 8px rgba(192, 193, 255, 0.15)' : 'none',
                }}
                onClick={() => toggle(h.id)}
              />
            ))}
          </div>
        ) : (
          <div className="progress-track">
            <div className="progress-fill" style={{ width: '0%', background: 'var(--color-secondary)' }} />
          </div>
        )}
        {total > 0 && (
          <p style={{ margin: '8px 0 0', fontSize: '0.6875rem', color: 'var(--color-outline)' }}>
            {completed} de {total} rituales completados
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '16px', alignItems: 'start' }}>

        {/* ── Active Rituals ──────────────────────────────────── */}
        <div style={card}>
          <div style={labelSm}><Icon name="checklist" size={11} /> Rituales activos</div>

          {habits.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: '12px' }}>
              <span className="icon-container" style={{ width: '48px', height: '48px' }}>
                <Icon name="self_improvement" size={24} style={{ color: 'var(--color-outline)' }} />
              </span>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-outline)', textAlign: 'center' }}>
                Aún no tienes rituales.<br />Crea el primero a la derecha.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {habits.map((h) => (
                <div key={h.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '12px 14px', borderRadius: 'var(--radius-lg)',
                    /* Active ritual: slightly elevated surface */
                    background: h.completed
                      ? 'color-mix(in srgb, var(--color-secondary-container) 25%, var(--color-surface-container))'
                      : 'transparent',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!h.completed) (e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface-container-high)';
                  }}
                  onMouseLeave={(e) => {
                    if (!h.completed) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  {/* Toggle */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggle(h.id); }}
                    style={{
                      width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${h.completed ? 'var(--color-secondary)' : 'var(--color-surface-bright)'}`,
                      background: h.completed
                        ? 'linear-gradient(135deg, var(--color-secondary-container), var(--color-secondary))'
                        : 'transparent',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      boxShadow: h.completed ? '0 0 8px rgba(192, 193, 255, 0.25)' : 'none',
                    }}
                  >
                    {h.completed && <Icon name="check" size={11} style={{ color: 'var(--color-on-secondary)' }} />}
                  </button>

                  {/* Label */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0, fontSize: '0.875rem', fontWeight: h.completed ? 400 : 500,
                      color: h.completed ? 'var(--color-on-surface-variant)' : 'var(--color-on-surface)',
                      textDecoration: h.completed ? 'line-through' : 'none',
                      transition: 'all 0.2s',
                    }}>
                      {h.name}
                    </p>
                    {h.description && (
                      <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>
                        {h.description}
                      </p>
                    )}
                  </div>

                  {/* Status tag — full radius contrasts xl card */}
                  {h.completed ? (
                    <span className="tag" style={{
                      background: 'rgba(192, 193, 255, 0.10)',
                      color: 'var(--color-secondary)',
                    }}>Listo</span>
                  ) : (
                    <span className="tag" style={{
                      background: 'rgba(255,255,255,0.04)',
                      color: 'var(--color-outline)',
                    }}>Pendiente</span>
                  )}

                  {/* Delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(h.id); }}
                    disabled={deletingId === h.id}
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      padding: '4px', borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-outline)', display: 'flex', flexShrink: 0,
                      opacity: deletingId === h.id ? 0.4 : 1,
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={(ev) => ((ev.currentTarget).style.color = 'var(--color-error)')}
                    onMouseLeave={(ev) => ((ev.currentTarget).style.color = 'var(--color-outline)')}
                  >
                    <Icon name="delete_outline" size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Initiate Ritual ─────────────────────────────────── */}
        <div style={card}>
          <div style={labelSm}><Icon name="add_circle" size={11} /> Iniciar ritual</div>

          <form onSubmit={create} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ ...labelSm, marginBottom: '6px', marginTop: '2px' }}>Nombre del ritual</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Meditar 10 minutos" required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(192, 193, 255, 0.35)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(60, 74, 66, 0.15)')}
              />
            </div>
            <div>
              <label style={{ ...labelSm, marginBottom: '6px' }}>
                Motivación
                <span style={{ opacity: 0.4, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
              </label>
              <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                placeholder="¿Por qué este hábito importa?"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(192, 193, 255, 0.35)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(60, 74, 66, 0.15)')}
              />
            </div>
            <button type="submit" style={{
              padding: '12px', borderRadius: 'var(--radius-md)', border: 'none',
              background: 'var(--color-secondary-container)',
              color: 'var(--color-on-secondary-container)',
              fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-display)', letterSpacing: '0.03em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              marginTop: '4px', transition: 'opacity 0.15s',
              boxShadow: '0 0 24px rgba(192, 193, 255, 0.10)',
            }}
              onMouseEnter={(e) => ((e.currentTarget).style.opacity = '0.8')}
              onMouseLeave={(e) => ((e.currentTarget).style.opacity = '1')}
            >
              <Icon name="add" size={16} />
              Crear ritual
            </button>
          </form>

          {/* Stats — tonal separation, no divider line */}
          {total > 0 && (
            <div style={{
              marginTop: '20px', padding: '14px',
              /* Level shift: container-low on container */
              background: 'var(--color-surface-container-low)',
              borderRadius: 'var(--radius-lg)',
            }}>
              {[
                { lbl: 'Total', val: total },
                { lbl: 'Completados hoy', val: completed },
                { lbl: 'Pendientes', val: total - completed },
              ].map(({ lbl, val }) => (
                <div key={lbl} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '4px 0',
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>{lbl}</span>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1rem', fontWeight: 400, color: 'var(--color-on-surface)',
                  }}>{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
