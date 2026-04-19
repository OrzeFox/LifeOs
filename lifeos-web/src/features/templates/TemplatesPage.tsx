import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { useTemplates, useTemplateMutations } from './hooks/useTemplates';
import styles from './TemplatesPage.module.css';

export const TemplatesPage = () => {
  const { data, isLoading } = useTemplates();
  const { snapshot, apply, remove } = useTemplateMutations();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleSnapshot = () => {
    if (!name.trim()) return;
    snapshot.mutate(
      { name: name.trim(), description: desc.trim() || undefined },
      { onSuccess: () => { setName(''); setDesc(''); } },
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Plantillas</h1>
          <p className={styles.subtitle}>
            Guarda tu rutina actual como plantilla y aplícala después.
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <span className={styles.cardTitle}>Nueva plantilla desde hábitos actuales</span>
        <div className={styles.row}>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre (ej: Rutina de verano)"
          />
          <input
            className={styles.input}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Descripción (opcional)"
          />
          <button
            className={styles.btn}
            onClick={handleSnapshot}
            disabled={snapshot.isPending || !name.trim()}
          >
            <Icon name="save" size={14} /> Guardar snapshot
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <span className={styles.cardTitle}>Guardadas</span>
        {isLoading ? (
          <div className={styles.empty}>Cargando…</div>
        ) : !data || data.length === 0 ? (
          <div className={styles.empty}>Sin plantillas.</div>
        ) : (
          <div className={styles.list}>
            {data.map((t) => (
              <div key={t.id} className={styles.tRow}>
                <div className={styles.tHead}>
                  <div>
                    <div className={styles.tName}>{t.name}</div>
                    <div className={styles.tMeta}>
                      {t.habits.length} hábitos · creada {new Date(t.createdAt).toLocaleDateString('es-MX')}
                      {t.lastAppliedAt && ` · aplicada ${new Date(t.lastAppliedAt).toLocaleDateString('es-MX')}`}
                    </div>
                  </div>
                  <div className={styles.tActions}>
                    <button
                      className={styles.btnGhost}
                      onClick={() => apply.mutate(t.id)}
                      disabled={apply.isPending}
                    >
                      <Icon name="play_arrow" size={14} /> Aplicar
                    </button>
                    <button
                      className={styles.btnGhost}
                      onClick={() => remove.mutate(t.id)}
                      disabled={remove.isPending}
                    >
                      <Icon name="delete" size={14} />
                    </button>
                  </div>
                </div>
                {t.description && <div className={styles.tMeta}>{t.description}</div>}
                <div className={styles.habitPills}>
                  {t.habits.slice(0, 10).map((h, i) => (
                    <span key={i} className={styles.pill}>{h.name}</span>
                  ))}
                  {t.habits.length > 10 && (
                    <span className={styles.pill}>+{t.habits.length - 10}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
