import { useState, type FormEvent } from 'react';
import { Icon } from '../../components/Icon';
import type { MealForm } from '../../ts/routine';
import { MEAL_TYPES, TIME_SLOTS } from '../../ts/routine';
import { slotColor } from '../../domain/routine/slotColor';
import { NUTRITION_GOALS } from '../../domain/routine/nutritionGoals';
import useRoutine from './hooks/useRoutine';
import useRoutineHistory from './hooks/useRoutineHistory';
import { NutritionPill } from './components/NutritionPill';
import { EditMealRow } from './components/EditMealRow';
import styles from './RoutinePage.module.css';

export const RoutinePage = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [adding, setAdding]             = useState(false);
  const [form, setForm]                 = useState<MealForm>({
    mealType: 'almuerzo', scheduledTime: '12:30', description: '', date: today,
  });

  const { summary, loading, add, update, remove } = useRoutine(selectedDate);
  const { historyDates, reloadHistory }           = useRoutineHistory();

  const selectDate = (d: string) => {
    setSelectedDate(d);
    setForm((f) => ({ ...f, date: d }));
    setEditingId(null);
  };

  const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAdding(true);
    await add(form);
    await reloadHistory();
    setForm((f) => ({ ...f, description: '' }));
    setAdding(false);
  };

  const handleUpdate = async (id: string, data: Parameters<typeof update>[1]) => {
    await update(id, data);
    setEditingId(null);
  };

  const handleRemove = async (id: string) => {
    await remove(id);
    await reloadHistory();
  };

  const meals  = summary?.meals ?? [];
  const totals = summary?.totals;
  const sorted = [...meals].sort((a, b) => {
    if (!a.scheduledTime) return 1;
    if (!b.scheduledTime) return -1;
    return a.scheduledTime.localeCompare(b.scheduledTime);
  });

  const displayDate = new Date(selectedDate + 'T00:00:00')
    .toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  const isToday = selectedDate === today;

  return (
    <div className={styles.page}>

      <div className={styles.heroRow}>
        <div>
          <h1 className={styles.heroTitle}>Alimentación</h1>
          <p className={styles.heroSub}>
            {displayDate} · {meals.length} {meals.length === 1 ? 'comida' : 'comidas'}
            {isToday && <span className={styles.todayBadge}>Hoy</span>}
          </p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => selectDate(e.target.value)}
          className={styles.datePicker}
        />
      </div>

      {totals && totals.calories > 0 && (
        <div className={styles.nutritionCard}>
          <div className={styles.labelSm}><Icon name="monitor_heart" size={11} /> Resumen nutricional del día</div>
          <div className={styles.nutritionGrid}>
            {([
              { key: 'calories', label: 'Calorías', unit: 'kcal', goal: NUTRITION_GOALS.calories, color: 'var(--color-tertiary)' },
              { key: 'protein',  label: 'Proteína',  unit: 'g',    goal: NUTRITION_GOALS.protein,  color: 'var(--color-primary)' },
              { key: 'carbs',    label: 'Carbohid.',  unit: 'g',    goal: NUTRITION_GOALS.carbs,    color: 'var(--color-secondary)' },
              { key: 'fat',      label: 'Grasa',      unit: 'g',    goal: NUTRITION_GOALS.fat,      color: 'var(--color-on-surface-variant)' },
              { key: 'fiber',    label: 'Fibra',      unit: 'g',    goal: NUTRITION_GOALS.fiber,    color: 'var(--color-outline)' },
            ] as { key: keyof typeof totals; label: string; unit: string; goal: number; color: string }[]).map(({ key, label, unit, goal, color }) => {
              const val = totals[key];
              const pct = Math.min((val / goal) * 100, 100);
              return (
                <div key={key} className={styles.nutritionStat}>
                  <div className={styles.nutritionStatHeader}>
                    <span className={styles.nutritionLabel}>{label}</span>
                    <span className={styles.nutritionValue} style={{ color }}>
                      {val}<span className={styles.nutritionUnit}>{unit}</span>
                    </span>
                  </div>
                  <div className={styles.nutritionTrack}>
                    <div className={styles.nutritionFill} style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <span className={styles.nutritionGoal}>meta {goal}{unit}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.grid}>

        <div className={styles.card}>
          <div className={styles.labelSm}><Icon name="schedule" size={11} /> Línea de tiempo</div>

          {loading ? (
            <div className={styles.skeletonList}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonRow}>
                  <div className={styles.skeletonDot} />
                  <div style={{ flex: 1 }}>
                    <div className={styles.skeletonLine} style={{ width: '30%', marginBottom: 6 }} />
                    <div className={styles.skeletonLine} style={{ width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}><Icon name="no_meals" size={24} /></span>
              <p className={styles.emptyText}>Sin comidas para esta fecha.</p>
            </div>
          ) : (
            <div className={styles.mealList}>
              {sorted.map((m) => {
                const color     = slotColor(m.scheduledTime);
                const typeLabel = MEAL_TYPES.find((t) => t.value === m.mealType)?.label ?? m.mealType;
                const isEditing = editingId === m.id;

                return (
                  <div key={m.id} className={`${styles.mealRow} ${isEditing ? styles.mealRowEditing : ''}`}>
                    {isEditing ? (
                      <EditMealRow
                        meal={m}
                        onSave={(data) => handleUpdate(m.id, data)}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <>
                        <div className={styles.timeDot} style={{ background: color, boxShadow: `0 0 8px color-mix(in srgb, ${color} 40%, transparent)` }} />
                        <span className={styles.timeLabel} style={{ color }}>
                          {m.scheduledTime?.slice(0, 5) ?? '--:--'}
                        </span>
                        <div className={styles.mealInfo}>
                          <p className={styles.mealName}>{typeLabel}</p>
                          {m.description && <p className={styles.mealDesc}>{m.description}</p>}
                          {(m.calories || m.protein || m.carbs || m.fat) && (
                            <div className={styles.nutritionPills}>
                              <NutritionPill label="kcal" value={m.calories} unit="kcal" />
                              <NutritionPill label="P" value={m.protein} />
                              <NutritionPill label="C" value={m.carbs} />
                              <NutritionPill label="G" value={m.fat} />
                              {m.fiber ? <NutritionPill label="F" value={m.fiber} /> : null}
                            </div>
                          )}
                        </div>
                        <div className={styles.mealActions}>
                          <button onClick={() => setEditingId(m.id)} className={styles.editRowBtn}>
                            <Icon name="edit" size={14} />
                          </button>
                          <button onClick={() => handleRemove(m.id)} className={styles.deleteBtn}>
                            <Icon name="close" size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.rightCol}>

          <div className={styles.card}>
            <div className={styles.labelSm}><Icon name="add_circle" size={11} /> Agregar comida</div>
            <form onSubmit={handleAdd} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tipo</label>
                <select
                  value={form.mealType}
                  onChange={(e) => setForm({ ...form, mealType: e.target.value as any })}
                  className={styles.input}
                >
                  {MEAL_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Franja horaria</label>
                <select
                  value={form.scheduledTime}
                  onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                  className={styles.input}
                >
                  <option value="">Sin hora</option>
                  {TIME_SLOTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Descripción
                  <span className={styles.formLabelOptional}> · Claude analiza la nutrición</span>
                </label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ej: 200g pechuga a la plancha con arroz integral…"
                  className={styles.input}
                />
              </div>

              <button type="submit" disabled={adding} className={styles.submitBtn}>
                {adding
                  ? <><span className={styles.savingDot} /> Analizando nutrición…</>
                  : <><Icon name="add" size={16} /> Agregar comida</>
                }
              </button>
            </form>
          </div>

          {historyDates.length > 0 && (
            <div className={styles.card}>
              <div className={styles.labelSm}><Icon name="history" size={11} /> Historial</div>
              <div className={styles.historyList}>
                {historyDates.map((d) => {
                  const label = new Date(d + 'T00:00:00')
                    .toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
                  const isSelected = d === selectedDate;
                  return (
                    <button
                      key={d}
                      onClick={() => selectDate(d)}
                      className={`${styles.historyItem} ${isSelected ? styles.historyItemActive : ''}`}
                    >
                      <span className={styles.historyLabel}>{label}</span>
                      {d === today && <span className={styles.todayChip}>hoy</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
