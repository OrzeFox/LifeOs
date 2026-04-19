import { useState } from 'react';
import { Icon } from '../../../components/Icon';
import useRecommendation from '../hooks/useRecommendation';
import useGenerateRecommendation from '../hooks/useGenerateRecommendation';
import styles from './RecommendationPanel.module.css';

const GOAL_LABEL: Record<string, string> = {
  gain: 'Ganar masa',
  lose: 'Bajar grasa',
  maintain: 'Mantener',
};

export const RecommendationPanel = () => {
  const { data: rec, isLoading } = useRecommendation();
  const generate = useGenerateRecommendation();
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const handleGenerate = () => {
    generate.mutate(notes || undefined, {
      onSuccess: () => {
        setNotes('');
        setShowNotes(false);
      },
    });
  };

  const error = generate.error as any;
  const errMsg = error?.response?.data?.message ?? error?.message;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.labelSm}>
          <Icon name="auto_awesome" size={11} /> Plan IA personalizado
        </div>
        {rec && (
          <span className={styles.goalChip}>
            {GOAL_LABEL[rec.goal] ?? rec.goal}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className={styles.empty}>
          <div className={styles.skeleton} style={{ width: '70%' }} />
          <div className={styles.skeleton} style={{ width: '50%' }} />
        </div>
      ) : !rec ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}><Icon name="auto_awesome" size={20} /></span>
          <p className={styles.emptyText}>
            Sin recomendación aún.<br />
            Define tu objetivo en el perfil y genera tu plan.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generate.isPending}
            className={styles.primaryBtn}
          >
            {generate.isPending ? 'Generando…' : 'Generar plan'}
          </button>
          {errMsg && <p className={styles.errMsg}>{errMsg}</p>}
        </div>
      ) : (
        <>
          <p className={styles.summary}>{rec.summary}</p>

          <div className={styles.sectionTitle}>
            <Icon name="fitness_center" size={13} /> Rutina semanal
          </div>
          <div className={styles.daysGrid}>
            {rec.workoutPlan.days.map((d, i) => (
              <div key={i} className={styles.dayCard}>
                <div className={styles.dayHead}>
                  <span className={styles.dayName}>{d.day}</span>
                  <span className={styles.dayFocus}>{d.focus}</span>
                </div>
                <ul className={styles.exList}>
                  {d.exercises.map((ex, j) => (
                    <li key={j} className={styles.exRow}>
                      <span className={styles.exName}>{ex.name}</span>
                      <span className={styles.exMeta}>
                        {ex.sets}×{ex.reps}{ex.rest ? ` · ${ex.rest}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className={styles.sectionTitle}>
            <Icon name="restaurant" size={13} /> Plan de comidas
            {rec.mealPlan.kcalEstimate && (
              <span className={styles.kcal}>~{rec.mealPlan.kcalEstimate} kcal</span>
            )}
          </div>
          <div className={styles.mealGrid}>
            <div className={styles.mealRow}>
              <span className={styles.mealLabel}>Desayuno</span>
              <span className={styles.mealText}>{rec.mealPlan.breakfast}</span>
            </div>
            <div className={styles.mealRow}>
              <span className={styles.mealLabel}>Comida</span>
              <span className={styles.mealText}>{rec.mealPlan.lunch}</span>
            </div>
            <div className={styles.mealRow}>
              <span className={styles.mealLabel}>Cena</span>
              <span className={styles.mealText}>{rec.mealPlan.dinner}</span>
            </div>
            {rec.mealPlan.snacks?.length > 0 && (
              <div className={styles.mealRow}>
                <span className={styles.mealLabel}>Snacks</span>
                <span className={styles.mealText}>{rec.mealPlan.snacks.join(' · ')}</span>
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <span className={styles.footerInfo}>
              Generado {new Date(rec.generatedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} · {rec.aiProvider}
            </span>
            <div className={styles.footerActions}>
              {showNotes && (
                <input
                  className={styles.notesInput}
                  placeholder="Notas para el plan (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              )}
              <button
                type="button"
                onClick={() => setShowNotes((v) => !v)}
                className={styles.ghostBtn}
              >
                <Icon name="edit_note" size={14} />
              </button>
              <button
                onClick={handleGenerate}
                disabled={generate.isPending}
                className={styles.primaryBtn}
              >
                <Icon name="refresh" size={14} />
                {generate.isPending ? 'Generando…' : 'Regenerar'}
              </button>
            </div>
          </div>
          {errMsg && <p className={styles.errMsg}>{errMsg}</p>}
        </>
      )}
    </div>
  );
};
