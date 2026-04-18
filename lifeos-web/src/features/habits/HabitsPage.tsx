import { useEffect, useState, useCallback } from 'react';
import { habitsApi } from '../../api/habits';
import { Icon } from '../../components/Icon';
import type { Habit, CalendarDay, HistoryDay } from '../../ts/habits';
import { HABIT_TYPES, WEEKDAYS, HABIT_COLORS } from '../../ts/habits';
import styles from './HabitsPage.module.css';

// ─── Habit state helpers ─────────────────────────────────────────────────────

type HabitStateValue = 'pendiente' | 'en_progreso' | 'terminado';

const HABIT_STATES: { value: HabitStateValue; label: string; icon: string;
  activeColor: string; activeBg: string; activeBorder: string; inactiveColor: string }[] = [
  { value: 'pendiente',   label: 'Pendiente',   icon: 'circle',
    activeColor: '#94a3b8', activeBg: 'rgba(148,163,184,0.14)', activeBorder: 'rgba(148,163,184,0.5)', inactiveColor: 'rgba(148,163,184,0.55)' },
  { value: 'en_progreso', label: 'En progreso', icon: 'pending',
    activeColor: '#FFB95F', activeBg: 'rgba(255,185,95,0.14)',  activeBorder: 'rgba(255,185,95,0.55)',  inactiveColor: 'rgba(255,185,95,0.5)' },
  { value: 'terminado',   label: 'Terminado',   icon: 'check_circle',
    activeColor: '#4EDEA3', activeBg: 'rgba(78,222,163,0.14)', activeBorder: 'rgba(78,222,163,0.55)', inactiveColor: 'rgba(78,222,163,0.45)' },
];

function getHabitState(habit: Habit): HabitStateValue {
  const type = habit.habitType ?? 'simple';
  // Use raw value for simple type so it works without backend progress recompute
  if (type === 'simple') {
    if (habit.value >= 1)  return 'terminado';
    if (habit.value > 0)   return 'en_progreso';
    return 'pendiente';
  }
  if (habit.completed) return 'terminado';
  if (habit.progress > 0 || habit.value > 0) return 'en_progreso';
  return 'pendiente';
}

// ─── State selector ───────────────────────────────────────────────────────────

function StateSelector({ habit, onSave }: { habit: Habit; onSave: () => void }) {
  const today   = new Date().toISOString().split('T')[0];
  const type    = habit.habitType ?? 'simple';
  const current = getHabitState(habit);

  const applyState = async (s: HabitStateValue) => {
    if (s === current) return;
    let value = 0;
    let checklistState: boolean[] | undefined;

    if (s === 'pendiente') {
      value = 0;
      if (type === 'checklist')
        checklistState = (habit.checklistItems ?? []).map(() => false);
    } else if (s === 'en_progreso') {
      if (type === 'timer' || type === 'numeric')
        value = habit.value > 0 ? habit.value : Math.max(1, Math.round((habit.targetValue ?? 2) * 0.5));
      else if (type === 'checklist') {
        const items = habit.checklistItems ?? [];
        const half  = Math.max(1, Math.floor(items.length / 2));
        checklistState = items.map((_, i) => i < half);
        value = half;
      } else {
        value = 0.5;
      }
    } else {
      if (type === 'checklist') {
        const items = habit.checklistItems ?? [];
        value = items.length;
        checklistState = items.map(() => true);
      } else {
        value = habit.targetValue ?? 1;
      }
    }

    try {
      await habitsApi.setProgress(habit.id, today, value, checklistState);
      onSave();
    } catch { /* silent */ }
  };

  return (
    <div className={styles.stateSelector}>
      {HABIT_STATES.map((s) => {
        const active = current === s.value;
        return (
          <button
            key={s.value}
            onClick={(e) => { e.stopPropagation(); applyState(s.value); }}
            className={`${styles.stateBtn} ${active ? styles.stateBtnActive : ''}`}
            style={{
              color:       active ? s.activeColor   : s.inactiveColor,
              borderColor: active ? s.activeBorder  : 'rgba(255,255,255,0.08)',
              background:  active ? s.activeBg      : 'transparent',
              fontWeight:  active ? 700              : 500,
            }}
          >
            <Icon name={s.icon} size={12} style={{ color: active ? s.activeColor : s.inactiveColor }} />
            <span>{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Type-specific detail (checklist tasks / numeric value) ──────────────────

function TypeDetail({ habit, onSave }: { habit: Habit; onSave: () => void }) {
  const today = new Date().toISOString().split('T')[0];
  const type  = habit.habitType ?? 'simple';

  const saveProgress = async (value: number, checklistState?: boolean[]) => {
    try {
      await habitsApi.setProgress(habit.id, today, value, checklistState);
      onSave();
    } catch { /* silent */ }
  };

  if (type === 'checklist') {
    const items = habit.checklistItems ?? [];
    const state = habit.checklistState ?? items.map(() => false);
    return (
      <div className={styles.typeDetailChecklist}>
        {items.map((item, i) => (
          <label key={i} className={styles.typeDetailCheckItem} onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={state[i] ?? false}
              onChange={(e) => {
                const next = [...state];
                next[i] = e.target.checked;
                saveProgress(next.filter(Boolean).length, next);
              }}
            />
            <span className={state[i] ? styles.checklistLabelDone : ''}>{item}</span>
          </label>
        ))}
      </div>
    );
  }

  if (type === 'timer' || type === 'numeric') {
    const unit = type === 'timer' ? 'min' : 'veces';
    return (
      <div className={styles.typeDetailNumeric} onClick={(e) => e.stopPropagation()}>
        <Icon name={type === 'timer' ? 'timer' : 'pin'} size={13} style={{ color: 'var(--color-outline)' }} />
        <input
          type="number"
          min={0}
          defaultValue={habit.value || ''}
          placeholder="0"
          className={styles.typeDetailInput}
          onBlur={(e) => {
            const v = parseFloat(e.target.value) || 0;
            saveProgress(v);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const v = parseFloat((e.target as HTMLInputElement).value) || 0;
              saveProgress(v);
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
        <span className={styles.typeDetailUnit}>
          {habit.targetValue ? `/ ${habit.targetValue} ${unit}` : unit}
        </span>
      </div>
    );
  }

  return null;
}

// ─── Habit calendar (monthly grid) ───────────────────────────────────────────

function HabitCalendar({ habit }: { habit: Habit }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [days, setDays] = useState<CalendarDay[]>([]);

  useEffect(() => {
    habitsApi.getCalendar(habit.id, year, month)
      .then((r) => setDays(Array.isArray(r.data) ? r.data : []))
      .catch(() => setDays([]));
  }, [habit.id, year, month]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => {
    const ny = month === 12 ? year + 1 : year;
    const nm = month === 12 ? 1 : month + 1;
    if (ny > now.getFullYear() || (ny === now.getFullYear() && nm > now.getMonth() + 1)) return;
    setMonth(nm); setYear(ny);
  };

  const firstDow = new Date(year, month - 1, 1).getDay();
  const offset = firstDow === 0 ? 6 : firstDow - 1; // Mon-first

  const monthLabel = new Date(year, month - 1, 1)
    .toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarHeader}>
        <button onClick={prevMonth} className={styles.calNavBtn}><Icon name="chevron_left" size={16} /></button>
        <span className={styles.calMonthLabel}>{monthLabel}</span>
        <button onClick={nextMonth} className={styles.calNavBtn}><Icon name="chevron_right" size={16} /></button>
      </div>
      <div className={styles.calGrid}>
        {['L','M','X','J','V','S','D'].map((d) => (
          <span key={d} className={styles.calDayName}>{d}</span>
        ))}
        {Array.from({ length: offset }, (_, i) => <span key={`e${i}`} />)}
        {days.map((day) => {
          const d = parseInt(day.date.split('-')[2], 10);
          const isToday = day.date === new Date().toISOString().split('T')[0];
          return (
            <div
              key={day.date}
              className={`${styles.calCell} ${!day.scheduled ? styles.calCellUnscheduled : ''} ${isToday ? styles.calCellToday : ''}`}
              title={`${day.date}: ${day.progress}%`}
            >
              <span className={styles.calDayNum}>{d}</span>
              {day.scheduled && (
                <div
                  className={styles.calDot}
                  style={{
                    background: day.completed
                      ? habit.color
                      : day.progress > 0
                      ? `${habit.color}66`
                      : 'var(--color-surface-container-high)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 14-day history chart ─────────────────────────────────────────────────────

function HabitHistory({ habit }: { habit: Habit }) {
  const [history, setHistory] = useState<HistoryDay[]>([]);

  useEffect(() => {
    habitsApi.getHistory(habit.id, 14)
      .then((r) => setHistory(Array.isArray(r.data) ? r.data : []))
      .catch(() => setHistory([]));
  }, [habit.id]);

  return (
    <div className={styles.history}>
      <div className={styles.labelSm} style={{ marginBottom: 10 }}>
        <Icon name="bar_chart" size={11} /> Últimos 14 días
      </div>
      <div className={styles.historyBars}>
        {history.map((day) => {
          const label = new Date(day.date + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'narrow' });
          return (
            <div key={day.date} className={styles.historyBar} title={`${day.date}: ${day.progress}%`}>
              <div className={styles.historyBarTrack}>
                <div
                  className={styles.historyBarFill}
                  style={{
                    height: `${day.progress}%`,
                    background: day.completed
                      ? habit.color
                      : day.progress > 0
                      ? `${habit.color}66`
                      : 'var(--color-surface-container-high)',
                  }}
                />
              </div>
              <span className={styles.historyBarLabel}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Create habit form ────────────────────────────────────────────────────────

function CreateHabitForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName]                   = useState('');
  const [description, setDescription]     = useState('');
  const [habitType, setHabitType]         = useState<'simple'|'timer'|'numeric'|'checklist'>('simple');
  const [targetValue, setTargetValue]     = useState('');
  const [scheduleDays, setScheduleDays]   = useState<number[]>([]);
  const [color, setColor]                 = useState(HABIT_COLORS[0]);
  const [checklistItems, setChecklistItems] = useState<string[]>(['']);
  const [saving, setSaving]               = useState(false);

  const toggleDay = (d: number) =>
    setScheduleDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const items = checklistItems.map((s) => s.trim()).filter(Boolean);
    await habitsApi.create({
      name: name.trim(),
      description: description.trim() || undefined,
      habitType,
      targetValue: targetValue ? Number(targetValue) : undefined,
      scheduleDays: scheduleDays.length ? scheduleDays : undefined,
      color,
      checklistItems: habitType === 'checklist' ? items : undefined,
    });
    setName(''); setDescription(''); setHabitType('simple');
    setTargetValue(''); setScheduleDays([]); setColor(HABIT_COLORS[0]);
    setChecklistItems(['']);
    setSaving(false);
    onCreated();
  };

  return (
    <form onSubmit={submit} className={styles.form}>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Nombre</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Meditar" required className={styles.input} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Tipo de hábito</label>
        <div className={styles.typeGrid}>
          {HABIT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setHabitType(t.value)}
              className={`${styles.typeBtn} ${habitType === t.value ? styles.typeBtnActive : ''}`}
            >
              <Icon name={t.icon} size={14} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {(habitType === 'timer' || habitType === 'numeric') && (
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Meta {habitType === 'timer' ? '(minutos)' : '(cantidad)'}
          </label>
          <input
            type="number" min={1} value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder={habitType === 'timer' ? '20' : '10'}
            className={styles.input}
          />
        </div>
      )}

      {habitType === 'checklist' && (
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Tareas</label>
          {checklistItems.map((item, i) => (
            <div key={i} className={styles.checklistInputRow}>
              <input
                value={item}
                onChange={(e) => {
                  const next = [...checklistItems]; next[i] = e.target.value; setChecklistItems(next);
                }}
                placeholder={`Tarea ${i + 1}`}
                className={styles.input}
              />
              {checklistItems.length > 1 && (
                <button type="button" onClick={() => setChecklistItems(checklistItems.filter((_, j) => j !== i))} className={styles.removeItemBtn}>
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setChecklistItems([...checklistItems, ''])} className={styles.addItemBtn}>
            <Icon name="add" size={13} /> Agregar tarea
          </button>
        </div>
      )}

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Días <span className={styles.formLabelOptional}>(vacío = todos)</span></label>
        <div className={styles.dayPicker}>
          {WEEKDAYS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => toggleDay(d.value)}
              className={`${styles.dayBtn} ${scheduleDays.includes(d.value) ? styles.dayBtnActive : ''}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Color</label>
        <div className={styles.colorPicker}>
          {HABIT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`${styles.colorDot} ${color === c ? styles.colorDotActive : ''}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Motivación <span className={styles.formLabelOptional}>(opcional)</span></label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="¿Por qué este hábito importa?" className={styles.input} />
      </div>

      <button type="submit" disabled={saving} className={styles.submitBtn}>
        {saving ? 'Creando…' : <><Icon name="add" size={16} /> Crear hábito</>}
      </button>
    </form>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function HabitsPage() {
  const [habits, setHabits]           = useState<Habit[]>([]);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const load = useCallback(() =>
    habitsApi.getToday(today).then((r) => setHabits(r.data)), [today]);

  useEffect(() => { load(); }, [load]);

  const remove = async (id: string) => {
    setDeletingId(id);
    if (selectedId === id) setSelectedId(null);
    await habitsApi.delete(id);
    setDeletingId(null);
    load();
  };

  const total       = habits.length;
  const pendientes  = habits.filter((h) => getHabitState(h) === 'pendiente').length;
  const enProgreso  = habits.filter((h) => getHabitState(h) === 'en_progreso').length;
  const terminados  = habits.filter((h) => getHabitState(h) === 'terminado').length;

  const todayLabel = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Habit Momentum</h1>
        <p className={styles.heroSub}>{todayLabel} — {total} {total === 1 ? 'hábito' : 'hábitos'} activos</p>
      </div>

      {/* Daily overview bar */}
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

        {/* Habit list */}
        <div className={styles.card}>
          <div className={styles.labelSm}><Icon name="checklist" size={11} /> Hábitos de hoy</div>

          {habits.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}><Icon name="self_improvement" size={24} /></span>
              <p className={styles.emptyText}>Aún no tienes hábitos.<br />Crea el primero a la derecha.</p>
            </div>
          ) : (
            <div className={styles.habitList}>
              {habits.map((h) => {
                const isSelected = selectedId === h.id;
                const effectiveType = h.habitType ?? 'simple';
                const typeInfo = HABIT_TYPES.find((t) => t.value === effectiveType);
                return (
                  <div
                    key={h.id}
                    className={`${styles.habitRow} ${isSelected ? styles.habitRowSelected : ''}`}
                    style={{ borderLeft: `3px solid ${h.color}` }}
                  >
                    <div className={styles.habitRowMain}>
                      <div className={styles.habitInfo} onClick={() => setSelectedId(isSelected ? null : h.id)} style={{ cursor: 'pointer' }}>
                        <div className={styles.habitNameRow}>
                          <p className={`${styles.habitName} ${h.completed ? styles.habitNameDone : ''}`}>{h.name}</p>
                          {effectiveType !== 'simple' && typeInfo && (
                            <span className={styles.habitTypeTag}>
                              <Icon name={typeInfo.icon} size={10} /> {typeInfo.label}
                            </span>
                          )}
                          {h.scheduleDays?.length ? (
                            <span className={styles.habitScheduleTag}>
                              {h.scheduleDays.map((d) => WEEKDAYS.find((w) => w.value === d)?.label).join(' ')}
                            </span>
                          ) : null}
                        </div>
                        {h.description && <p className={styles.habitDesc}>{h.description}</p>}
                      </div>

                      <div className={styles.habitControls}>
                        <StateSelector habit={h} onSave={load} />
                        {effectiveType !== 'simple' && <TypeDetail habit={h} onSave={load} />}
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); remove(h.id); }}
                        disabled={deletingId === h.id}
                        className={styles.deleteBtn}
                      >
                        <Icon name="delete_outline" size={16} />
                      </button>
                    </div>

                    {/* Expanded: calendar + history */}
                    {isSelected && (
                      <div className={styles.habitDetail}>
                        <HabitCalendar habit={h} />
                        <HabitHistory habit={h} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: create form */}
        <div className={styles.card}>
          <div className={styles.labelSm}><Icon name="add_circle" size={11} /> Nuevo hábito</div>
          <CreateHabitForm onCreated={load} />
        </div>
      </div>
    </div>
  );
}
