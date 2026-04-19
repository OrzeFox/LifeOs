import { useCallback, useEffect, useState } from 'react';
import { Icon } from '../../../components/Icon';
import { habitsApi } from '../../../api/habits';
import type { HabitDefinition, HabitPayload } from '../../../ts/habits';
import { HabitForm } from '../components/HabitForm';
import styles from '../HabitsPage.module.css';

type Mode = 'list' | 'create' | { type: 'edit'; habit: HabitDefinition };

export const ManageView = () => {
  const [all, setAll] = useState<HabitDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('list');
  const [showInactive, setShowInactive] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await habitsApi.getAll(showInactive);
      setAll(Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  useEffect(() => { load(); }, [load]);

  const create = async (data: HabitPayload) => {
    await habitsApi.create(data);
    await load();
    setMode('list');
  };

  const update = async (id: string, data: HabitPayload) => {
    await habitsApi.update(id, data);
    await load();
    setMode('list');
  };

  const toggleActive = async (h: HabitDefinition) => {
    await habitsApi.setActive(h.id, !h.isActive);
    await load();
  };

  const remove = async (h: HabitDefinition) => {
    if (!confirm(`¿Eliminar "${h.name}"? Esta acción no se puede deshacer.`)) return;
    await habitsApi.delete(h.id);
    await load();
  };

  const activeCount   = all.filter((h) => h.isActive).length;
  const inactiveCount = all.length - activeCount;

  if (mode === 'create') {
    return (
      <div className={styles.card}>
        <div className={styles.labelSm}><Icon name="add_circle" size={11} /> Nuevo hábito</div>
        <HabitForm mode="create" onSubmit={create} onCancel={() => setMode('list')} />
      </div>
    );
  }

  if (typeof mode === 'object' && mode.type === 'edit') {
    return (
      <div className={styles.card}>
        <div className={styles.labelSm}><Icon name="edit" size={11} /> Editar hábito</div>
        <HabitForm
          mode="edit"
          initial={mode.habit}
          onSubmit={(data) => update(mode.habit.id, data)}
          onCancel={() => setMode('list')}
        />
      </div>
    );
  }

  return (
    <div className={styles.manageWrap}>
      <div className={styles.card}>
        <div className={styles.manageHeader}>
          <div>
            <div className={styles.labelSm}><Icon name="list" size={11} /> Hábitos</div>
            <p className={styles.summaryLine}>
              <strong>{activeCount}</strong> activos · <strong>{inactiveCount}</strong> inactivos
            </p>
          </div>
          <div className={styles.manageHeaderRight}>
            <label className={styles.toggleInline}>
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
              />
              <span>Incluir inactivos</span>
            </label>
            <button className={styles.primaryBtn} onClick={() => setMode('create')}>
              <Icon name="add" size={16} /> Nuevo
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.emptyState}>
            <div className={styles.skeletonLine} style={{ width: '60%' }} />
          </div>
        ) : all.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}><Icon name="self_improvement" size={24} /></span>
            <p className={styles.emptyText}>Aún no tienes hábitos.<br />Crea el primero.</p>
          </div>
        ) : (
          <div className={styles.manageList}>
            {all.map((h) => (
              <ManageRow
                key={h.id}
                habit={h}
                onEdit={() => setMode({ type: 'edit', habit: h })}
                onToggleActive={() => toggleActive(h)}
                onDelete={() => remove(h)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface RowProps {
  habit: HabitDefinition;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}

const ManageRow = ({ habit, onEdit, onToggleActive, onDelete }: RowProps) => {
  const isTask = habit.kind === 'task';
  const typeLabel =
    habit.habitType === 'timer' ? 'Tiempo' :
    habit.habitType === 'numeric' ? 'Numérico' :
    habit.habitType === 'checklist' ? 'Lista' :
    'Simple';

  const freqLabel = isTask
    ? 'Tarea'
    : habit.frequencyType === 'daily'
      ? 'Diario'
      : habit.frequencyType === 'weekly'
        ? `${habit.timesPerWeek ?? 3}×/sem`
        : 'Días específicos';

  return (
    <div
      className={`${styles.manageRow} ${!habit.isActive ? styles.manageRowInactive : ''}`}
      style={{ borderLeft: `3px solid ${habit.color}` }}
    >
      <div className={styles.manageBody}>
        <div className={styles.manageTopRow}>
          <p className={styles.manageName}>{habit.name}</p>
          <span className={styles.freqChip}>
            <Icon name={isTask ? 'task_alt' : 'loop'} size={10} /> {freqLabel}
          </span>
          <span
            className={styles.typeChipMini}
            style={{ background: `${habit.color}15`, color: habit.color }}
          >
            {typeLabel}
          </span>
          {!habit.isActive && <span className={styles.inactiveChip}>Inactivo</span>}
        </div>
        {habit.notes && <p className={styles.manageNotes}>{habit.notes}</p>}
        <div className={styles.manageMeta}>
          {habit.targetValue != null && (
            <span><Icon name="flag" size={11} /> Meta: {habit.targetValue}</span>
          )}
          {habit.startDate && (
            <span><Icon name="event" size={11} /> Desde {habit.startDate}</span>
          )}
          {habit.endDate && (
            <span><Icon name="event_busy" size={11} /> Hasta {habit.endDate}</span>
          )}
        </div>
      </div>

      <div className={styles.manageActions}>
        <button className={styles.iconBtn} onClick={onEdit} aria-label="Editar">
          <Icon name="edit" size={16} />
        </button>
        <button
          className={styles.iconBtn}
          onClick={onToggleActive}
          aria-label={habit.isActive ? 'Desactivar' : 'Activar'}
          title={habit.isActive ? 'Desactivar' : 'Activar'}
        >
          <Icon name={habit.isActive ? 'pause_circle' : 'play_circle'} size={16} />
        </button>
        <button className={styles.iconBtnDanger} onClick={onDelete} aria-label="Eliminar">
          <Icon name="delete" size={16} />
        </button>
      </div>
    </div>
  );
};
