import { useEffect, useState } from 'react';
import api from '../../api/client';
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

// ─── Slot colors (tonal, not border-based) ────────────────────────────────────

function slotColor(time?: string): string {
  if (!time) return 'var(--color-outline)';
  const h = parseInt(time.split(':')[0], 10);
  if (h < 10) return 'var(--color-tertiary)';      /* Amber — morning  */
  if (h < 14) return 'var(--color-primary)';        /* Emerald — midday */
  if (h < 18) return 'var(--color-secondary)';      /* Indigo — afternoon */
  return 'var(--color-on-surface-variant)';          /* Neutral — evening */
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function RoutinePage() {
  const [meals, setMeals] = useState<any[]>([]);
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ name: '', scheduledTime: '', description: '', date: today });

  const load = () => api.get('/routine/meals', { params: { date: form.date } }).then(r => setMeals(r.data));
  useEffect(() => { load(); }, [form.date]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/routine/meals', form);
    setForm(f => ({ ...f, name: '', scheduledTime: '', description: '' }));
    load();
  };

  const remove = (id: string) => api.delete(`/routine/meals/${id}`).then(load);

  const sorted = [...meals].sort((a, b) => {
    if (!a.scheduledTime) return 1;
    if (!b.scheduledTime) return -1;
    return a.scheduledTime.localeCompare(b.scheduledTime);
  });

  const displayDate = new Date(form.date + 'T00:00:00')
    .toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Editorial heading ──────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <h1 style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: '3.5rem', fontWeight: 300, letterSpacing: '-0.04em',
            color: 'var(--color-on-surface)', lineHeight: 1.05,
            textTransform: 'capitalize',
          }}>
            {displayDate}
          </h1>
          <p style={{
            margin: '6px 0 0',
            fontSize: '0.6875rem', letterSpacing: '0.05em',
            textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', fontWeight: 600,
          }}>
            Plan alimenticio · {meals.length} {meals.length === 1 ? 'comida' : 'comidas'}
          </p>
        </div>
        {/* Date picker — sunken input style */}
        <input
          type="date" value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
          style={{ ...inputStyle, width: 'auto', colorScheme: 'dark', marginBottom: '10px' }}
          onFocus={(e) => (e.target.style.borderColor = 'rgba(78, 222, 163, 0.35)')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(60, 74, 66, 0.15)')}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '16px', alignItems: 'start' }}>

        {/* ── Meal Timeline ──────────────────────────────────────── */}
        <div style={card}>
          <div style={labelSm}><Icon name="schedule" size={11} /> Línea de tiempo</div>

          {sorted.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: '12px' }}>
              <span className="icon-container" style={{ width: '48px', height: '48px' }}>
                <Icon name="no_meals" size={24} style={{ color: 'var(--color-outline)' }} />
              </span>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-outline)', textAlign: 'center' }}>
                Sin comidas para esta fecha.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {sorted.map((m) => {
                const color = slotColor(m.scheduledTime);
                return (
                  <div key={m.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '12px 14px',
                      /* Tonal elevation on hover, never a border */
                      background: 'var(--color-surface-container-high)',
                      borderRadius: 'var(--radius-lg)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface-bright)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface-container-high)')}
                  >
                    {/* Time dot — color-coded by slot */}
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '9999px',
                      background: color, flexShrink: 0,
                      boxShadow: `0 0 8px color-mix(in srgb, ${color} 40%, transparent)`,
                    }} />

                    <span style={{
                      fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600,
                      color, width: '40px', flexShrink: 0,
                    }}>
                      {m.scheduledTime?.slice(0, 5) ?? '--:--'}
                    </span>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-on-surface)' }}>{m.name}</p>
                      {m.description && (
                        <p style={{ margin: '2px 0 0', fontSize: '0.6875rem', color: 'var(--color-on-surface-variant)' }}>{m.description}</p>
                      )}
                    </div>

                    <button onClick={() => remove(m.id)}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        padding: '4px', borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-outline)', display: 'flex', flexShrink: 0,
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(ev) => ((ev.currentTarget).style.color = 'var(--color-error)')}
                      onMouseLeave={(ev) => ((ev.currentTarget).style.color = 'var(--color-outline)')}
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Add Meal ────────────────────────────────────────────── */}
        <div style={card}>
          <div style={labelSm}><Icon name="add_circle" size={11} /> Agregar comida</div>

          <form onSubmit={add} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ ...labelSm, marginBottom: '6px', marginTop: '2px' }}>Nombre</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Almuerzo" required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(78, 222, 163, 0.35)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(60, 74, 66, 0.15)')}
              />
            </div>
            <div>
              <label style={{ ...labelSm, marginBottom: '6px' }}>Hora</label>
              <input type="time" value={form.scheduledTime}
                onChange={e => setForm({ ...form, scheduledTime: e.target.value })}
                style={{ ...inputStyle, colorScheme: 'dark' }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(78, 222, 163, 0.35)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(60, 74, 66, 0.15)')}
              />
            </div>
            <div>
              <label style={{ ...labelSm, marginBottom: '6px' }}>
                Descripción
                <span style={{ opacity: 0.4, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
              </label>
              <input value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Ej: Ensalada de pollo…"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(78, 222, 163, 0.35)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(60, 74, 66, 0.15)')}
              />
            </div>
            <button type="submit" style={{
              padding: '12px', borderRadius: 'var(--radius-md)', border: 'none',
              background: 'var(--color-primary-container)',
              color: 'var(--color-on-primary)',
              fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-display)', letterSpacing: '0.02em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              marginTop: '4px', transition: 'opacity 0.15s',
            }}
              onMouseEnter={(e) => ((e.currentTarget).style.opacity = '0.8')}
              onMouseLeave={(e) => ((e.currentTarget).style.opacity = '1')}
            >
              <Icon name="add" size={16} />
              Agregar comida
            </button>
          </form>

          {/* Slot color legend — tonal, no borders */}
          <div style={{
            marginTop: '20px', padding: '14px',
            background: 'var(--color-surface-container-low)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <div style={{ ...labelSm, marginBottom: '10px' }}>Franja horaria</div>
            {[
              { lbl: 'Mañana · antes 10h',  color: 'var(--color-tertiary)' },
              { lbl: 'Mediodía · 10–14h',   color: 'var(--color-primary)' },
              { lbl: 'Tarde · 14–18h',      color: 'var(--color-secondary)' },
              { lbl: 'Noche · después 18h', color: 'var(--color-on-surface-variant)' },
            ].map(({ lbl, color }) => (
              <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '9999px', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-on-surface-variant)' }}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
