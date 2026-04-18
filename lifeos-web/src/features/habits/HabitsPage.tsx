import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { getHabitState } from '../../domain/habits/habitState';
import useHabits from './hooks/useHabits';
import { HabitRow } from './components/HabitRow';
import { CreateHabitForm } from './components/CreateHabitForm';
import styles from './HabitsPage.module.css';

export const HabitsPage = () => {
  const today = new Date().toISOString().split('T')[0];
  const { habits, deletingId, refresh, remove, create } = useHabits(today);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const total      = habits.length;
  const pendientes = habits.filter((h) => getHabitState(h) === 'pendiente').length;
  const enProgreso = habits.filter((h) => getHabitState(h) === 'en_progreso').length;
  const terminados = habits.filter((h) => getHabitState(h) === 'terminado').length;
  const todayLabel = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className={styles.page}>

      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Habit Momentum</h1>
        <p className={styles.heroSub}>{todayLabel} — {total} {total === 1 ? 'hábito' : 'hábitos'} activos</p>
      </div>

      {total > 0 && (
        <div className={styles.card}>
          <div className={styles.labelSm}><Icon name="self_improvement" size={11} /> Progreso de hoy</div>
          <div className={styles.stateSummaryRow}>
            <span className={styles.stateSummaryItem} style={{ color: 'var(--color-outline)' }}>
              <Icon name="radio_button_unchecked" size={13} />
              <strong>{pendientes}</strong> pendiente{pendientes !== 1 ? 's' : ''}
            </span>
            <span className={styles.stateSummaryDivider} />
            <span className={styles.stateSummaryItem} style={{ color: 'var(--color-tertiary)' }}>
              <Icon name="pending" size={13} />
              <strong>{enProgreso}</strong> en progreso
            </span>
            <span className={styles.stateSummaryDivider} />
            <span className={styles.stateSummaryItem} style={{ color: 'var(--color-primary)' }}>
              <Icon name="check_circle" size={13} />
              <strong>{terminados}</strong> terminado{terminados !== 1 ? 's' : ''}
            </span>
          </div>
          <div className={styles.segmentBar} style={{ marginTop: 12 }}>
            {habits.map((h) => {
              const st = getHabitState(h);
              return (
                <div
                  key={h.id}
                  title={`${h.name}: ${st}`}
                  className={styles.segment}
                  style={{
                    background: st === 'terminado' ? h.color
                      : st === 'en_progreso' ? 'var(--color-tertiary)'
                      : 'var(--color-surface-container-high)',
                    boxShadow: st === 'terminado' ? `0 0 8px ${h.color}44` : 'none',
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.mainGrid}>

        <div className={styles.card}>
          <div className={styles.labelSm}><Icon name="checklist" size={11} /> Hábitos de hoy</div>

          {habits.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}><Icon name="self_improvement" size={24} /></span>
              <p className={styles.emptyText}>Aún no tienes hábitos.<br />Crea el primero a la derecha.</p>
            </div>
          ) : (
            <div className={styles.habitList}>
              {habits.map((h) => (
                <HabitRow
                  key={h.id}
                  habit={h}
                  isSelected={selectedId === h.id}
                  isDeleting={deletingId === h.id}
                  onToggleSelect={() => setSelectedId(selectedId === h.id ? null : h.id)}
                  onDelete={() => remove(h.id)}
                  onSave={refresh}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.card}>
          <div className={styles.labelSm}><Icon name="add_circle" size={11} /> Nuevo hábito</div>
          <CreateHabitForm onSubmit={create} />
        </div>

      </div>
    </div>
  );
};
