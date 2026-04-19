import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Icon } from '../../components/Icon';
import { ACTIVITY_TYPES } from '../../ts/gym';
import type { ActivityType, GymActivityForm } from '../../ts/gym';
import useGym from './hooks/useGym';
import { RecommendationPanel } from './components/RecommendationPanel';
import styles from './GymPage.module.css';

const typeMeta = (t: ActivityType) => ACTIVITY_TYPES.find((a) => a.value === t)!;

export const GymPage = () => {
  const today = new Date().toISOString().split('T')[0];
  const [filter, setFilter] = useState<ActivityType | 'all'>('all');
  const { activities, summary, loading, create, remove } = useGym(filter);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<GymActivityForm>({
    defaultValues: {
      activityType: 'weights',
      duration: '',
      weight: '',
      notes: '',
      date: today,
    },
  });

  const selectedType = watch('activityType');

  const onSubmit = async (data: GymActivityForm) => {
    await create({
      activityType: data.activityType,
      duration: Number(data.duration),
      weight: data.weight ? Number(data.weight) : undefined,
      notes: data.notes || undefined,
      date: data.date,
    });
    reset({
      activityType: data.activityType,
      duration: '',
      weight: '',
      notes: '',
      date: today,
    });
  };

  const grouped = useMemo(() => {
    const map = new Map<string, typeof activities>();
    for (const a of activities) {
      const list = map.get(a.date) ?? [];
      list.push(a);
      map.set(a.date, list);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [activities]);

  const totalMin = summary?.totalMinutes ?? 0;
  const totalCount = summary?.total ?? 0;
  const todayLabel = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className={styles.page}>

      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Gym Pulse</h1>
        <p className={styles.heroSub}>{todayLabel} — {totalCount} {totalCount === 1 ? 'sesión' : 'sesiones'} registradas</p>
      </div>

      <div className={styles.heroCard}>
        <div className={styles.labelSm}><Icon name="exercise" size={11} /> Resumen total</div>
        <div className={styles.summaryGrid}>
          <div>
            <p className={styles.metricLabel}>Sesiones</p>
            <p className={styles.metricValue} style={{ color: 'var(--color-primary)' }}>{totalCount}</p>
          </div>
          <div>
            <p className={styles.metricLabel}>Minutos</p>
            <p className={styles.metricValue} style={{ color: 'var(--color-secondary)' }}>{totalMin}</p>
          </div>
          {ACTIVITY_TYPES.map((t) => {
            const entry = summary?.byType[t.value];
            return (
              <div key={t.value}>
                <p className={styles.metricLabel}>
                  <Icon name={t.icon} size={11} /> {t.label}
                </p>
                <p className={styles.metricValue} style={{ color: t.color }}>
                  {entry?.count ?? 0}
                  <span className={styles.metricUnit}>· {entry?.duration ?? 0}m</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <RecommendationPanel />

      <div className={styles.twoCol}>

        <div className={styles.card}>
          <div className={styles.labelSm}><Icon name="add_circle" size={11} /> Registrar actividad</div>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.typeGrid}>
              {ACTIVITY_TYPES.map((t) => (
                <label
                  key={t.value}
                  className={`${styles.typeChip} ${selectedType === t.value ? styles.typeChipActive : ''}`}
                  style={selectedType === t.value ? { borderColor: t.color, boxShadow: `0 0 12px ${t.color}33` } : undefined}
                >
                  <input type="radio" value={t.value} {...register('activityType')} className={styles.typeRadio} />
                  <Icon name={t.icon} size={18} />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>

            <div className={styles.inputGrid}>
              <div>
                <label className={styles.fieldLabel}>Duración (min)</label>
                <input
                  type="number"
                  placeholder="30"
                  className={styles.input}
                  {...register('duration', { required: 'Requerido', min: { value: 1, message: 'Mínimo 1 min' } })}
                />
                {errors.duration && <span className={styles.fieldError}>{errors.duration.message}</span>}
              </div>
              <div>
                <label className={styles.fieldLabel}>
                  Peso (kg) {selectedType !== 'weights' && <span className={styles.fieldHint}>opcional</span>}
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="—"
                  className={styles.input}
                  {...register('weight')}
                />
              </div>
            </div>

            <label className={styles.fieldLabel}>Notas</label>
            <textarea
              placeholder="Ej: 4x8 sentadilla, buena energía…"
              className={styles.textarea}
              rows={2}
              {...register('notes')}
            />

            <label className={styles.fieldLabel}>Fecha</label>
            <input type="date" className={styles.input} {...register('date', { required: true })} />

            <button type="submit" className={styles.submitBtn}>Registrar sesión</button>
          </form>
        </div>

        <div className={styles.card}>
          <div className={styles.historyHeader}>
            <div className={styles.labelSm}><Icon name="history" size={11} /> Historial</div>
            <div className={styles.filterRow}>
              <button
                type="button"
                className={`${styles.filterChip} ${filter === 'all' ? styles.filterChipActive : ''}`}
                onClick={() => setFilter('all')}
              >
                Todo
              </button>
              {ACTIVITY_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={`${styles.filterChip} ${filter === t.value ? styles.filterChipActive : ''}`}
                  style={filter === t.value ? { color: t.color, borderColor: t.color } : undefined}
                  onClick={() => setFilter(t.value)}
                >
                  <Icon name={t.icon} size={13} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className={styles.emptyState}>
              <div className={styles.skeletonLine} style={{ width: '60%', height: 14 }} />
            </div>
          ) : activities.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}><Icon name="fitness_center" size={20} /></span>
              <p className={styles.emptyText}>Sin sesiones registradas.<br />Agrega la primera a la izquierda.</p>
            </div>
          ) : (
            <div className={styles.history}>
              {grouped.map(([date, items]) => {
                const d = new Date(date + 'T12:00:00');
                const label = d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
                const dayTotal = items.reduce((a, b) => a + b.duration, 0);
                return (
                  <div key={date} className={styles.daySection}>
                    <div className={styles.dayHeader}>
                      <span className={styles.dayLabel}>{label}</span>
                      <span className={styles.dayTotal}>{dayTotal} min · {items.length}</span>
                    </div>
                    <div className={styles.dayList}>
                      {items.map((a) => {
                        const meta = typeMeta(a.activityType);
                        return (
                          <div key={a.id} className={styles.activityRow}>
                            <span
                              className={styles.activityIcon}
                              style={{ background: `${meta.color}15`, color: meta.color }}
                            >
                              <Icon name={meta.icon} size={16} />
                            </span>
                            <div className={styles.activityBody}>
                              <p className={styles.activityTitle}>
                                {meta.label}
                                <span className={styles.activityDuration}>· {a.duration} min</span>
                                {a.weight ? <span className={styles.activityWeight}>· {a.weight} kg</span> : null}
                              </p>
                              {a.notes && <p className={styles.activityNotes}>{a.notes}</p>}
                            </div>
                            <button onClick={() => remove(a.id)} className={styles.deleteBtn} aria-label="Eliminar">
                              <Icon name="close" size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
