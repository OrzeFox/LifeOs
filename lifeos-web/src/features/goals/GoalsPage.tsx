import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { useGoalsProgress, useGoalMutations } from './hooks/useGoals';
import {
  METRIC_LABELS, TIMEFRAME_LABELS,
  type CreateGoalPayload, type GoalMetric, type GoalOperator, type GoalTimeframe, type GoalProgress,
} from '../../ts/goals';
import styles from './GoalsPage.module.css';

const EMPTY: CreateGoalPayload = {
  title: '',
  metric: 'sleep.avgHours',
  operator: 'gte',
  target: 7.5,
  timeframe: '7d',
};

export const GoalsPage = () => {
  const { data, isLoading } = useGoalsProgress();
  const { create, update, remove } = useGoalMutations();
  const [form, setForm] = useState<CreateGoalPayload>(EMPTY);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    create.mutate(form, { onSuccess: () => setForm(EMPTY) });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Metas</h1>
          <p className={styles.subtitle}>Define objetivos y sigue su progreso automáticamente.</p>
        </div>
      </div>

      <div className={styles.card}>
        <span className={styles.cardTitle}>Nueva meta</span>
        <form className={styles.form} onSubmit={submit}>
          <label className={styles.full}>
            Título
            <input
              className={styles.input}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej: Dormir ≥7h"
              required
            />
          </label>

          <label>
            Métrica
            <select
              className={styles.select}
              value={form.metric}
              onChange={(e) => setForm({ ...form, metric: e.target.value as GoalMetric })}
            >
              {(Object.keys(METRIC_LABELS) as GoalMetric[]).map((k) => (
                <option key={k} value={k}>{METRIC_LABELS[k]}</option>
              ))}
            </select>
          </label>

          <label>
            Periodo
            <select
              className={styles.select}
              value={form.timeframe}
              onChange={(e) => setForm({ ...form, timeframe: e.target.value as GoalTimeframe })}
            >
              {(Object.keys(TIMEFRAME_LABELS) as GoalTimeframe[]).map((k) => (
                <option key={k} value={k}>{TIMEFRAME_LABELS[k]}</option>
              ))}
            </select>
          </label>

          <label className={styles.small}>
            Operador
            <select
              className={styles.select}
              value={form.operator}
              onChange={(e) => setForm({ ...form, operator: e.target.value as GoalOperator })}
            >
              <option value="gte">≥ (mínimo)</option>
              <option value="lte">≤ (máximo)</option>
            </select>
          </label>

          <label className={styles.small}>
            Target
            <input
              className={styles.input}
              type="number"
              step="0.1"
              value={form.target}
              onChange={(e) => setForm({ ...form, target: Number(e.target.value) })}
              required
            />
          </label>

          <label className={styles.small}>
            Fecha límite (opcional)
            <input
              className={styles.input}
              type="date"
              value={form.targetDate ?? ''}
              onChange={(e) => setForm({ ...form, targetDate: e.target.value || undefined })}
            />
          </label>

          <div className={styles.actions}>
            <button type="submit" className={styles.btn} disabled={create.isPending}>
              <Icon name="add" size={14} /> Crear meta
            </button>
          </div>
        </form>
      </div>

      <div className={styles.card}>
        <span className={styles.cardTitle}>Activas</span>
        {isLoading ? (
          <div className={styles.empty}>Cargando…</div>
        ) : !data || data.length === 0 ? (
          <div className={styles.empty}>Sin metas activas.</div>
        ) : (
          <div className={styles.list}>
            {data.map((gp) => (
              <GoalRow
                key={gp.goal.id}
                item={gp}
                onPause={() => update.mutate({ id: gp.goal.id, patch: { status: 'paused' } })}
                onComplete={() => update.mutate({ id: gp.goal.id, patch: { status: 'completed' } })}
                onDelete={() => remove.mutate(gp.goal.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const GoalRow = ({
  item, onPause, onComplete, onDelete,
}: {
  item: GoalProgress;
  onPause: () => void;
  onComplete: () => void;
  onDelete: () => void;
}) => {
  const pct = Math.max(0, Math.min(1, item.progress)) * 100;
  return (
    <div className={styles.row}>
      <div className={styles.rowHead}>
        <div>
          <div className={styles.rowTitle}>{item.goal.title}</div>
          <div className={styles.rowMeta}>
            {METRIC_LABELS[item.goal.metric]} · {TIMEFRAME_LABELS[item.goal.timeframe]} ·{' '}
            {item.goal.operator === 'gte' ? '≥' : '≤'} {item.goal.target}
          </div>
        </div>
        <div className={styles.rowActions}>
          {!item.met && (
            <button className={styles.btnGhost} onClick={onComplete}>Completada</button>
          )}
          <button className={styles.btnGhost} onClick={onPause}>Pausar</button>
          <button className={styles.btnGhost} onClick={onDelete}>
            <Icon name="delete" size={14} />
          </button>
        </div>
      </div>
      <div className={styles.bar}>
        <div
          className={[styles.barFill, item.met ? styles.met : ''].join(' ')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={styles.rowMeta}>
        Actual: <strong style={{ color: 'var(--color-on-surface)' }}>{item.currentValue}</strong>
        {' '}· {item.met ? '✓ meta cumplida' : `${Math.round(pct)}% del objetivo`}
      </div>
    </div>
  );
};
