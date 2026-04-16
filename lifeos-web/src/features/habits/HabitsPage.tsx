import { useEffect, useState, useCallback } from 'react';
import { habitsApi } from '../../api/habits';
import { Icon } from '../../components/Icon';
import type { Habit, CalendarDay, HistoryDay } from '../../ts/habits';
import { HABIT_TYPES, WEEKDAYS, HABIT_COLORS } from '../../ts/habits';
import styles from './HabitsPage.module.css';

// ─── Progress input per habit type ───────────────────────────────────────────

function ProgressInput({ habit, onSave }: { habit: Habit; onSave: () => void }) {
  const today = new Date().toISOString().split('T')[0];
  const type = habit.habitType ?? 'simple';

  const saveProgress = useCallback(async (value: number, checklistState?: boolean[]) => {
    await habitsApi.setProgress(habit.id, today, value, checklistState);
    onSave();
  }, [habit.id, today, onSave]);

  if (type === 'simple') {
    return (
      <button
        onClick={() => saveProgress(habit.completed ? 0 : 1)}
        className={styles.toggleBtn}
        style={{
          border: `2px solid ${habit.completed ? habit.color : 'var(--color-surface-bright)'}`,
          background: habit.completed ? habit.color : 'transparent',
          boxShadow: habit.completed ? `0 0 10px ${habit.color}44` : 'none',
        }}
      >
        {habit.completed && <Icon name="check" size={11} />}
      </button>
    );
  }

  if (type === 'timer' || type === 'numeric') {
    const unit = type === 'timer' ? 'min' : '';
    return (
      <div className={styles.numericInput}>
        <input
          type="number"
          min={0}
          max={habit.targetValue ? habit.targetValue * 2 : 9999}
          defaultValue={habit.value || ''}
          placeholder="0"
          className={styles.progressNumberInput}
          onBlur={(e) => {
            const v = parseFloat(e.target.value) || 0;
            if (v !== habit.value) saveProgress(v);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const v = parseFloat((e.target as HTMLInputElement).value) || 0;
              saveProgress(v);
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
        <span className={styles.progressUnit}>
          {unit}{habit.targetValue ? ` / ${habit.targetValue}${unit}` : ''}
        </span>
      </div>
    );
  }

  if (type === 'checklist') {
    const items = habit.checklistItems ?? [];
    const state = habit.checklistState ?? items.map(() => false);
    return (
      <div className={styles.checklistItems}>
        {items.map((item, i) => (
          <label key={i} className={styles.checklistItem}>
            <input
              type="checkbox"
              checked={state[i] ?? false}
              onChange={(e) => {
                const next = [...state];
                next[i] = e.target.checked;
                const value = next.filter(Boolean).length;
                saveProgress(value, next);
              }}
            />
            <span className={`${styles.checklistLabel} ${state[i] ? styles.checklistLabelDone : ''}`}>
              {item}
            </span>
          </label>
        ))}
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

  const completed = habits.filter((h) => h.completed).length;
  const total     = habits.length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;
  const selected  = habits.find((h) => h.id === selectedId) ?? null;

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
        <div className={styles.card} style={{ boxShadow: pct > 50 ? '0 0 48px rgba(192,193,255,0.04)' : 'none' }}>
          <div className={styles.progressHeader}>
            <div className={styles.labelSm}><Icon name="self_improvement" size={11} /> Progreso de hoy</div>
            <span className={styles.progressPct} style={{ textShadow: pct > 50 ? '0 0 24px rgba(192,193,255,0.25)' : 'none' }}>
              {pct}<span className={styles.progressPctUnit}>%</span>
            </span>
          </div>
          <div className={styles.segmentBar}>
            {habits.map((h) => (
              <div
                key={h.id}
                title={`${h.name}: ${h.progress}%`}
                className={styles.segment}
                style={{
                  background: h.completed
                    ? h.color
                    : h.progress > 0
                    ? `${h.color}55`
                    : 'var(--color-surface-container-high)',
                  boxShadow: h.completed ? `0 0 8px ${h.color}44` : 'none',
                  cursor: 'default',
                }}
              />
            ))}
          </div>
          <p className={styles.progressCount}>{completed} de {total} hábitos completados</p>
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
                      <ProgressInput habit={h} onSave={load} />

                      <div className={styles.habitInfo} onClick={() => setSelectedId(isSelected ? null : h.id)} style={{ cursor: 'pointer' }}>
                        <div className={styles.habitNameRow}>
                          <p className={`${styles.habitName} ${h.completed ? styles.habitNameDone : ''}`}>{h.name}</p>
                          {effectiveType !== 'simple' && (
                            <span className={styles.habitTypeTag}>
                              <Icon name={typeInfo?.icon ?? 'check'} size={10} /> {typeInfo?.label}
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

                      {/* Progress bar */}
                      <div className={styles.habitProgressWrap}>
                        <div className={styles.habitProgressTrack}>
                          <div
                            className={styles.habitProgressFill}
                            style={{ width: `${h.progress}%`, background: h.color }}
                          />
                        </div>
                        <span className={styles.habitProgressPct}>{h.progress}%</span>
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
