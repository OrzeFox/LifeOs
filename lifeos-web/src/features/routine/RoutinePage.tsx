import { useEffect, useState } from 'react';
import api from '../../api/client';
import { Icon } from '../../components/Icon';
import type { Meal, MealForm, DailySummary } from '../../ts/routine';
import { MEAL_TYPES, TIME_SLOTS } from '../../ts/routine';
import styles from './RoutinePage.module.css';

const NUTRITION_GOALS = { calories: 2000, protein: 150, carbs: 250, fat: 65, fiber: 30 };

function slotColor(time?: string): string {
  if (!time) return 'var(--color-outline)';
  const h = parseInt(time.split(':')[0], 10);
  if (h < 10) return 'var(--color-tertiary)';
  if (h < 14) return 'var(--color-primary)';
  if (h < 18) return 'var(--color-secondary)';
  return 'var(--color-on-surface-variant)';
}

function NutritionPill({ label, value, unit }: { label: string; value?: number; unit?: string }) {
  if (!value) return null;
  return (
    <span className={styles.nutritionPill}>
      {label} <strong>{value}{unit ?? 'g'}</strong>
    </span>
  );
}

function EditMealRow({ meal, onSave, onCancel }: {
  meal: Meal;
  onSave: (data: Partial<Meal>) => Promise<void>;
  onCancel: () => void;
}) {
  const [mealType, setMealType] = useState(meal.mealType);
  const [scheduledTime, setScheduledTime] = useState(meal.scheduledTime ?? '');
  const [description, setDescription] = useState(meal.description ?? '');
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ mealType, scheduledTime, description });
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className={styles.editForm}>
      <select value={mealType} onChange={(e) => setMealType(e.target.value as any)} className={styles.input}>
        {MEAL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      <select value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className={styles.input}>
        <option value="">Sin hora</option>
        {TIME_SLOTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción de la comida…"
        className={styles.input}
      />
      <div className={styles.editActions}>
        <button type="submit" disabled={saving} className={styles.saveEditBtn}>
          {saving ? <span className={styles.savingDot} /> : <Icon name="check" size={14} />}
          {saving ? 'Analizando…' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancel} className={styles.cancelEditBtn}>Cancelar</button>
      </div>
    </form>
  );
}

export function RoutinePage() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [historyDates, setHistoryDates] = useState<string[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<MealForm>({
    mealType: 'almuerzo', scheduledTime: '12:30', description: '', date: today,
  });

  const load = async (date = selectedDate) => {
    setLoadingSummary(true);
    const res = await api.get('/routine/meals/summary', { params: { date } });
    setSummary(res.data);
    setLoadingSummary(false);
  };

  const loadHistory = async () => {
    const res = await api.get('/routine/meals/history');
    setHistoryDates(res.data);
  };

  useEffect(() => { load(selectedDate); }, [selectedDate]);
  useEffect(() => { loadHistory(); }, []);

  const selectDate = (d: string) => {
    setSelectedDate(d);
    setForm((f) => ({ ...f, date: d }));
    setEditingId(null);
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    await api.post('/routine/meals', form);
    setForm((f) => ({ ...f, description: '' }));
    await Promise.all([load(selectedDate), loadHistory()]);
    setAdding(false);
  };

  const update = async (id: string, data: Partial<Meal>) => {
    await api.patch(`/routine/meals/${id}`, data);
    setEditingId(null);
    load(selectedDate);
  };

  const remove = async (id: string) => {
    await api.delete(`/routine/meals/${id}`);
    load(selectedDate);
    loadHistory();
  };

  const meals = summary?.meals ?? [];
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

      {/* Daily nutrition totals */}
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

        {/* Timeline */}
        <div className={styles.card}>
          <div className={styles.labelSm}><Icon name="schedule" size={11} /> Línea de tiempo</div>

          {loadingSummary ? (
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
                const color = slotColor(m.scheduledTime);
                const typeLabel = MEAL_TYPES.find((t) => t.value === m.mealType)?.label ?? m.mealType;
                const isEditing = editingId === m.id;

                return (
                  <div key={m.id} className={`${styles.mealRow} ${isEditing ? styles.mealRowEditing : ''}`}>
                    {isEditing ? (
                      <EditMealRow
                        meal={m}
                        onSave={(data) => update(m.id, data)}
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
                          <button onClick={() => remove(m.id)} className={styles.deleteBtn}>
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

        {/* Right column */}
        <div className={styles.rightCol}>

          {/* Add form */}
          <div className={styles.card}>
            <div className={styles.labelSm}><Icon name="add_circle" size={11} /> Agregar comida</div>
            <form onSubmit={add} className={styles.form}>
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

          {/* History */}
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
}
