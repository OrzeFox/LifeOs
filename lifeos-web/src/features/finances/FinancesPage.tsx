import { useEffect, useState } from 'react';
import { financesApi } from '../../api/finances';
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

/* Sunken input — surface-container-lowest = "deposits information" */
const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-surface-container-lowest)',
  border: '1px solid rgba(60, 74, 66, 0.15)',   /* ghost border — inputs only */
  borderRadius: 'var(--radius-md)',
  padding: '10px 14px',
  fontSize: '0.875rem',
  color: 'var(--color-on-surface)',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
  transition: 'border-color 0.15s ease',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export function FinancesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [income, setIncome] = useState('');
  const [form, setForm] = useState({
    name: '', amount: '', type: 'variable', category: '',
    date: new Date().toISOString().split('T')[0],
  });

  const now  = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const load = async () => {
    const [exp, sum] = await Promise.all([
      financesApi.getExpenses(year, month),
      financesApi.getSummary(year, month),
    ]);
    setExpenses(exp.data);
    setSummary(sum.data);
  };

  useEffect(() => { load(); }, []);

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await financesApi.createExpense({ ...form, amount: Number(form.amount) } as any);
    setForm({ name: '', amount: '', type: 'variable', category: '', date: new Date().toISOString().split('T')[0] });
    load();
  };

  const saveIncome = async () => {
    if (!income) return;
    const monthStr = `${year}-${String(month).padStart(2, '0')}-01`;
    await financesApi.setIncome(Number(income), monthStr);
    setIncome('');
    load();
  };

  const spentPct = summary?.totalIncome > 0
    ? Math.min((summary.totalSpent / summary.totalIncome) * 100, 100)
    : 0;

  const monthName = now.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Editorial heading ──────────────────────────────────── */}
      <div style={{ marginBottom: '8px' }}>
        <h1 style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontSize: '3.5rem', fontWeight: 300,
          letterSpacing: '-0.04em',
          color: 'var(--color-on-surface)',
          lineHeight: 1.05,
        }}>
          Monthly Budget
        </h1>
        <p style={{
          margin: '6px 0 0',
          fontSize: '0.6875rem', letterSpacing: '0.05em',
          textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', fontWeight: 600,
        }}>
          {monthName}
        </p>
      </div>

      {/* ── Hero balance — surface-container, emerald glow ─────── */}
      {summary && (
        <div style={{
          ...card,
          background: 'var(--color-surface-container)',
          padding: '32px',
          /* Bioluminescent primary glow */
          boxShadow: '0 0 48px rgba(78, 222, 163, 0.04)',
        }}>
          {/* Main number */}
          <p style={{ margin: '0 0 4px', ...labelSm, marginBottom: '12px' }}>
            <Icon name="savings" size={11} /> Saldo disponible
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '28px' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3.5rem', fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1,
              color: summary.remaining >= 0 ? 'var(--color-primary)' : 'var(--color-error)',
              textShadow: summary.remaining >= 0 ? '0 0 48px rgba(78, 222, 163, 0.25)' : 'none',
            }}>
              ${Number(summary.remaining).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
            </span>
            <p style={{
              paddingBottom: '8px', margin: 0,
              fontSize: '0.75rem', color: 'var(--color-on-surface-variant)',
            }}>
              de ${Number(summary.totalIncome).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
            </p>
          </div>

          {/* 4-up sub-metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {[
              { lbl: 'Ingresos',   val: summary.totalIncome,          color: 'var(--color-primary)',   icon: 'trending_up' },
              { lbl: 'Gastado',    val: summary.totalSpent,            color: 'var(--color-tertiary)',  icon: 'payments' },
              { lbl: 'Disponible', val: summary.remaining,             color: summary.remaining >= 0 ? 'var(--color-primary)' : 'var(--color-error)', icon: 'account_balance' },
              { lbl: 'Estimado',   val: summary.projectedRemaining,    color: summary.projectedRemaining >= 0 ? 'var(--color-secondary)' : 'var(--color-error)', icon: 'insights' },
            ].map(({ lbl, val, color, icon }) => (
              <div key={lbl}>
                <div style={{ ...labelSm, marginBottom: '6px' }}>
                  <span className="icon-container" style={{ width: '24px', height: '24px' }}>
                    <Icon name={icon} size={13} style={{ color }} />
                  </span>
                  {lbl}
                </div>
                <p style={{
                  margin: 0, fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem', fontWeight: 300, letterSpacing: '-0.03em', color,
                }}>
                  ${Number(val).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                </p>
              </div>
            ))}
          </div>

          {/* Budget progress */}
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-on-surface-variant)', letterSpacing: '0.03em' }}>
                Presupuesto consumido
              </span>
              <span style={{
                fontSize: '0.6875rem', fontWeight: 700,
                color: spentPct > 85 ? 'var(--color-error)' : 'var(--color-on-surface-variant)',
              }}>
                {spentPct.toFixed(1)}%
              </span>
            </div>
            <div className="progress-track" style={{ height: '6px' }}>
              <div className="progress-fill" style={{
                width: `${spentPct}%`,
                background: spentPct > 85 ? 'var(--color-error)' : spentPct > 65 ? 'var(--color-tertiary)' : 'var(--color-primary)',
              }} />
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '16px' }}>

        {/* ── Left column: income + add expense ─────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Ingreso mensual */}
          <div style={card}>
            <div style={labelSm}><Icon name="trending_up" size={11} /> Ingreso mensual</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number" value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder={`Actual: $${summary?.totalIncome ?? 0}`}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(78, 222, 163, 0.40)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(60, 74, 66, 0.15)')}
              />
              <button onClick={saveIncome} style={{
                flexShrink: 0, padding: '10px 14px', borderRadius: 'var(--radius-md)',
                border: 'none', background: 'var(--color-primary-container)',
                color: 'var(--color-on-primary)', cursor: 'pointer', display: 'flex',
                fontFamily: 'var(--font-sans)',
                transition: 'opacity 0.15s',
              }}
                onMouseEnter={(e) => ((e.currentTarget).style.opacity = '0.8')}
                onMouseLeave={(e) => ((e.currentTarget).style.opacity = '1')}
              >
                <Icon name="check" size={16} />
              </button>
            </div>
          </div>

          {/* Nuevo gasto */}
          <div style={card}>
            <div style={labelSm}><Icon name="add_circle" size={11} /> Nuevo gasto</div>
            <form onSubmit={addExpense} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { key: 'name', placeholder: 'Descripción', required: true, type: 'text' },
                { key: 'amount', placeholder: 'Monto', required: true, type: 'number' },
              ].map(({ key, placeholder, required, type }) => (
                <input key={key} type={type} value={(form as any)[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder} required={required}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(78, 222, 163, 0.40)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(60, 74, 66, 0.15)')}
                />
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  style={{ ...inputStyle, cursor: 'pointer', colorScheme: 'dark' }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(78, 222, 163, 0.40)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(60, 74, 66, 0.15)')}
                >
                  <option value="variable">Variable</option>
                  <option value="fixed">Fijo</option>
                </select>
                <input value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  placeholder="Categoría"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(78, 222, 163, 0.40)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(60, 74, 66, 0.15)')}
                />
              </div>
              <input type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                style={{ ...inputStyle, colorScheme: 'dark' }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(78, 222, 163, 0.40)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(60, 74, 66, 0.15)')}
              />
              <button type="submit" style={{
                padding: '11px', borderRadius: 'var(--radius-md)', border: 'none',
                background: 'var(--color-primary-container)',
                color: 'var(--color-on-primary)',
                fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-display)', letterSpacing: '0.02em',
                marginTop: '2px', transition: 'opacity 0.15s',
              }}
                onMouseEnter={(e) => ((e.currentTarget).style.opacity = '0.8')}
                onMouseLeave={(e) => ((e.currentTarget).style.opacity = '1')}
              >
                Registrar gasto
              </button>
            </form>
          </div>
        </div>

        {/* ── Transaction ledger ─────────────────────────────────── */}
        <div style={card}>
          <div style={labelSm}><Icon name="receipt_long" size={11} /> Ledger de transacciones</div>

          {expenses.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '10px' }}>
              <span className="icon-container"><Icon name="receipt" size={20} style={{ color: 'var(--color-outline)' }} /></span>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-outline)' }}>Sin gastos este mes</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {/* Column headers */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto auto',
                gap: '12px', padding: '4px 12px',
                fontSize: '0.625rem', fontWeight: 600,
                letterSpacing: '0.07em', textTransform: 'uppercase',
                color: 'var(--color-outline)',
              }}>
                <span>Descripción</span><span>Tipo</span><span style={{ textAlign: 'right' }}>Monto</span><span />
              </div>

              {expenses.map((e) => (
                <div key={e.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr auto auto auto',
                    gap: '12px', alignItems: 'center',
                    padding: '10px 12px', borderRadius: 'var(--radius-lg)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(el) => ((el.currentTarget as HTMLDivElement).style.background = 'var(--color-surface-container-high)')}
                  onMouseLeave={(el) => ((el.currentTarget as HTMLDivElement).style.background = 'transparent')}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-on-surface)' }}>{e.name}</p>
                    {e.category && <p style={{ margin: '1px 0 0', fontSize: '0.6875rem', color: 'var(--color-outline)' }}>{e.category}</p>}
                  </div>

                  <span className="tag" style={{
                    background: e.type === 'fixed'
                      ? 'rgba(192, 193, 255, 0.10)'
                      : 'rgba(255, 185, 95, 0.10)',
                    color: e.type === 'fixed' ? 'var(--color-secondary)' : 'var(--color-tertiary)',
                  }}>
                    {e.type === 'fixed' ? 'Fijo' : 'Variable'}
                  </span>

                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.9375rem', fontWeight: 500,
                    letterSpacing: '-0.02em', color: 'var(--color-error)',
                  }}>
                    ${Number(e.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>

                  <button onClick={() => financesApi.deleteExpense(e.id).then(load)}
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      padding: '4px', borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-outline)', display: 'flex',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={(ev) => ((ev.currentTarget).style.color = 'var(--color-error)')}
                    onMouseLeave={(ev) => ((ev.currentTarget).style.color = 'var(--color-outline)')}
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>
              ))}

              {/* Total */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 12px 0',
                marginTop: '4px',
                /* Tonal separation without a line */
                background: 'var(--color-surface-container-low)',
                borderRadius: 'var(--radius-lg)',
                marginLeft: '-4px', marginRight: '-4px',
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>
                  Total gastado
                </span>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem', fontWeight: 400, letterSpacing: '-0.02em',
                  color: 'var(--color-error)',
                }}>
                  ${summary ? Number(summary.totalSpent).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
