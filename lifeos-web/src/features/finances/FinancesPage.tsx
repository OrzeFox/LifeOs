import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Icon } from '../../components/Icon';
import type { ExpenseForm } from '../../ts/finances';
import { DEFAULT_CATEGORIES, computeSpentPct } from '../../domain/finances/financeUtils';
import useFinances from './hooks/useFinances';
import useCategories from './hooks/useCategories';
import styles from './FinancesPage.module.css';

export const FinancesPage = () => {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;

  const { expenses, summary, loading, addExpense, deleteExpense, saveIncome } = useFinances(year, month);
  const { customCategories, saveCategory } = useCategories();

  const [incomeEditing, setIncomeEditing]     = useState(false);
  const [incomeInput, setIncomeInput]         = useState('');
  const [addingCategory, setAddingCategory]   = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ExpenseForm>({
    defaultValues: {
      name: '', amount: '', type: 'variable', category: '',
      date: now.toISOString().split('T')[0],
    },
  });

  const allCategories = [
    ...DEFAULT_CATEGORIES,
    ...customCategories.map((c) => c.name).filter((n) => !DEFAULT_CATEGORIES.includes(n)),
  ];

  const onAddExpense = async (data: ExpenseForm) => {
    await addExpense(data);
    reset({ name: '', amount: '', type: 'variable', category: '', date: now.toISOString().split('T')[0] });
  };

  const onSaveIncome = async () => {
    const val = Number(incomeInput);
    if (!incomeInput || isNaN(val) || val <= 0) return;
    const monthStr = `${year}-${String(month).padStart(2, '0')}-01`;
    await saveIncome(val, monthStr);
    setIncomeEditing(false);
    setIncomeInput('');
  };

  const onSaveCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    await saveCategory(name);
    setNewCategoryName('');
    setAddingCategory(false);
    setValue('category', name);
  };

  const spentPct       = summary ? computeSpentPct(summary.totalSpent, summary.totalIncome) : 0;
  const monthName      = now.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  const byCategory     = summary?.byCategory ?? {};
  const categoryEntries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const maxCategorySpend = categoryEntries[0]?.[1] ?? 1;

  return (
    <div className={styles.page}>

      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Monthly Budget</h1>
        <p className={styles.heroSub}>{monthName}</p>
      </div>

      {loading ? (
        <div className={styles.heroCard}>
          <div className={styles.skeletonLine} style={{ width: '40%', marginBottom: 12 }} />
          <div className={styles.skeletonLine} style={{ width: '60%', height: 48, marginBottom: 28 }} />
          <div className={styles.skeletonGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className={styles.skeletonLine} style={{ width: '50%', marginBottom: 8 }} />
                <div className={styles.skeletonLine} style={{ width: '70%', height: 22 }} />
              </div>
            ))}
          </div>
        </div>
      ) : summary && (
        <div className={styles.heroCard}>
          <p className={styles.labelSm} style={{ margin: '0 0 12px' }}>
            <Icon name="savings" size={11} /> Saldo disponible
          </p>
          <div className={styles.balanceRow}>
            <span
              className={styles.balanceAmount}
              style={{
                color: summary.remaining >= 0 ? 'var(--color-primary)' : 'var(--color-error)',
                textShadow: summary.remaining >= 0 ? '0 0 48px rgba(78, 222, 163, 0.25)' : 'none',
              }}
            >
              ${Number(summary.remaining).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
            </span>
            <p className={styles.balanceOf}>
              de ${Number(summary.totalIncome).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className={styles.metricsGrid}>
            {[
              { lbl: 'Ingresos',   val: summary.totalIncome,       color: 'var(--color-primary)',   icon: 'trending_up' },
              { lbl: 'Gastado',    val: summary.totalSpent,         color: 'var(--color-tertiary)',  icon: 'payments' },
              { lbl: 'Disponible', val: summary.remaining,          color: summary.remaining >= 0 ? 'var(--color-primary)' : 'var(--color-error)', icon: 'account_balance' },
              { lbl: 'Estimado',   val: summary.projectedRemaining, color: summary.projectedRemaining >= 0 ? 'var(--color-secondary)' : 'var(--color-error)', icon: 'insights' },
            ].map(({ lbl, val, color, icon }) => (
              <div key={lbl}>
                <div className={styles.metricLabelRow}>
                  <span className={styles.iconContainer}>
                    <Icon name={icon} size={13} style={{ color }} />
                  </span>
                  {lbl}
                </div>
                <p className={styles.metricValue} style={{ color }}>
                  ${Number(val).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                </p>
              </div>
            ))}
          </div>

          <div className={styles.budgetProgress}>
            <div className={styles.budgetProgressLabels}>
              <span className={styles.budgetProgressLabel}>Presupuesto consumido</span>
              <span
                className={styles.budgetProgressPct}
                style={{ color: spentPct > 85 ? 'var(--color-error)' : 'var(--color-on-surface-variant)' }}
              >
                {spentPct.toFixed(1)}%
              </span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${spentPct}%`,
                  background: spentPct > 85 ? 'var(--color-error)' : spentPct > 65 ? 'var(--color-tertiary)' : 'var(--color-primary)',
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className={styles.twoCol}>
        <div className={styles.leftCol}>

          <div className={styles.card}>
            <div className={styles.labelSm}><Icon name="trending_up" size={11} /> Ingreso mensual</div>
            {incomeEditing ? (
              <div className={styles.incomeRow}>
                <input
                  type="number"
                  value={incomeInput}
                  onChange={(e) => setIncomeInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') onSaveIncome(); if (e.key === 'Escape') setIncomeEditing(false); }}
                  placeholder="Nuevo ingreso"
                  className={styles.input}
                  autoFocus
                />
                <button onClick={onSaveIncome} className={styles.saveBtn}><Icon name="check" size={16} /></button>
                <button onClick={() => setIncomeEditing(false)} className={styles.cancelBtn}><Icon name="close" size={16} /></button>
              </div>
            ) : (
              <div className={styles.incomeDisplay}>
                <span className={styles.incomeValue}>
                  {summary?.totalIncome
                    ? `$${Number(summary.totalIncome).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
                    : <span className={styles.incomeEmpty}>Sin ingreso registrado</span>
                  }
                </span>
                <button onClick={() => setIncomeEditing(true)} className={styles.editBtn}>
                  <Icon name="edit" size={14} />
                  {summary?.totalIncome ? 'Editar' : 'Agregar'}
                </button>
              </div>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.labelSm}><Icon name="add_circle" size={11} /> Nuevo gasto</div>
            <form onSubmit={handleSubmit(onAddExpense)} className={styles.expenseForm}>
              <input type="text" placeholder="Descripción" className={styles.input} {...register('name', { required: 'Requerido' })} />
              {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}

              <input type="number" placeholder="Monto" className={styles.input} {...register('amount', { required: 'Requerido', min: { value: 0.01, message: 'Monto inválido' } })} />
              {errors.amount && <span className={styles.fieldError}>{errors.amount.message}</span>}

              <div className={styles.inputGrid}>
                <select className={styles.input} {...register('type')}>
                  <option value="variable">Variable</option>
                  <option value="fixed">Fijo</option>
                </select>

                {addingCategory ? (
                  <div className={styles.newCategoryRow}>
                    <input
                      className={styles.input}
                      placeholder="Nueva categoría"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSaveCategory(); } if (e.key === 'Escape') setAddingCategory(false); }}
                      autoFocus
                    />
                    <button type="button" onClick={onSaveCategory} className={styles.saveBtn}><Icon name="check" size={14} /></button>
                    <button type="button" onClick={() => setAddingCategory(false)} className={styles.cancelBtn}><Icon name="close" size={14} /></button>
                  </div>
                ) : (
                  <select
                    className={styles.input}
                    value={watch('category')}
                    onChange={(e) => {
                      if (e.target.value === '__new__') { setAddingCategory(true); }
                      else { setValue('category', e.target.value); }
                    }}
                  >
                    <option value="">Categoría</option>
                    {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                    <option value="__new__">+ Nueva categoría…</option>
                  </select>
                )}
              </div>

              <input type="date" className={styles.input} {...register('date', { required: 'Requerido' })} />
              <button type="submit" className={styles.submitBtn}>Registrar gasto</button>
            </form>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.labelSm}><Icon name="receipt_long" size={11} /> Ledger de transacciones</div>

          {expenses.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}><Icon name="receipt" size={20} /></span>
              <p className={styles.emptyText}>Sin gastos este mes</p>
            </div>
          ) : (
            <div className={styles.ledger}>
              <div className={styles.ledgerHeader}>
                <span>Descripción</span><span>Tipo</span><span style={{ textAlign: 'right' }}>Monto</span><span />
              </div>

              {expenses.map((e) => (
                <div key={e.id} className={styles.ledgerRow}>
                  <div>
                    <p className={styles.expenseName}>{e.name}</p>
                    {e.category && <p className={styles.expenseCategory}>{e.category}</p>}
                  </div>
                  <span
                    className={styles.tag}
                    style={{
                      background: e.type === 'fixed' ? 'rgba(192, 193, 255, 0.10)' : 'rgba(255, 185, 95, 0.10)',
                      color: e.type === 'fixed' ? 'var(--color-secondary)' : 'var(--color-tertiary)',
                    }}
                  >
                    {e.type === 'fixed' ? 'Fijo' : 'Variable'}
                  </span>
                  <span className={styles.expenseAmount}>
                    ${Number(e.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                  <button onClick={() => deleteExpense(e.id)} className={styles.deleteBtn}>
                    <Icon name="close" size={16} />
                  </button>
                </div>
              ))}

              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total gastado</span>
                <span className={styles.totalAmount}>
                  ${summary ? Number(summary.totalSpent).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {!loading && categoryEntries.length > 0 && (
        <div className={styles.card}>
          <div className={styles.labelSm}><Icon name="donut_small" size={11} /> Gasto por categoría</div>
          <div className={styles.categoryBreakdown}>
            {categoryEntries.map(([cat, amount]) => {
              const pct    = summary?.totalSpent ? (amount / summary.totalSpent) * 100 : 0;
              const barPct = (amount / maxCategorySpend) * 100;
              return (
                <div key={cat} className={styles.categoryRow}>
                  <span className={styles.categoryName}>{cat}</span>
                  <div className={styles.categoryBarWrap}>
                    <div className={styles.categoryBar} style={{ width: `${barPct}%` }} />
                  </div>
                  <span className={styles.categoryAmount}>
                    ${Number(amount).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                  </span>
                  <span className={styles.categoryPct}>{pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
