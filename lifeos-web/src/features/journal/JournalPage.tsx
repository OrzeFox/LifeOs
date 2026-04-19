import { useMemo, useState } from 'react';
import { Icon } from '../../components/Icon';
import { useJournalList, useJournalStats } from './hooks/useJournal';
import useJournalMutations from './hooks/useJournalMutations';
import { JournalForm } from './components/JournalForm';
import { JournalHistory } from './components/JournalHistory';
import styles from './JournalPage.module.css';

const ymd = (d: Date) => d.toISOString().split('T')[0];

export const JournalPage = () => {
  const today = ymd(new Date());
  const [selectedDate, setSelectedDate] = useState(today);

  const { data: entries = [] } = useJournalList();
  const { data: stats } = useJournalStats();
  const { upsert, remove } = useJournalMutations();

  const activeEntry = useMemo(
    () => entries.find((e) => e.date === selectedDate) ?? null,
    [entries, selectedDate],
  );

  const trendMood = stats?.avgMood7d ?? 0;
  const trendEnergy = stats?.avgEnergy7d ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Journal</h1>
        <p className={styles.heroSub}>
          {stats?.entries7d ?? 0} {stats?.entries7d === 1 ? 'entrada' : 'entradas'} en 7 días
        </p>
      </div>

      <div className={styles.metricsCard}>
        <div className={styles.labelSm}><Icon name="trending_up" size={11} /> Promedios 7 días</div>
        <div className={styles.metricsGrid}>
          <div>
            <p className={styles.metricLabel}>Mood</p>
            <p className={styles.metricValue} style={{ color: 'var(--color-primary)' }}>
              {trendMood || '—'}<span className={styles.metricUnit}>/10</span>
            </p>
          </div>
          <div>
            <p className={styles.metricLabel}>Energía</p>
            <p className={styles.metricValue} style={{ color: 'var(--color-secondary)' }}>
              {trendEnergy || '—'}<span className={styles.metricUnit}>/10</span>
            </p>
          </div>
          <div>
            <p className={styles.metricLabel}>Racha mood bajo</p>
            <p className={styles.metricValue} style={{ color: stats?.lowMoodStreak ? 'var(--color-error)' : 'var(--color-outline)' }}>
              {stats?.lowMoodStreak ?? 0}<span className={styles.metricUnit}>d</span>
            </p>
          </div>
        </div>
      </div>

      <div className={styles.twoCol}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <input
              type="date"
              value={selectedDate}
              max={today}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <JournalForm
            date={selectedDate}
            entry={activeEntry}
            saving={upsert.isPending}
            onSave={(payload) => upsert.mutate({ date: selectedDate, payload })}
          />
        </div>

        <div className={styles.card}>
          <div className={styles.labelSm}><Icon name="history" size={11} /> Historial</div>
          <JournalHistory
            entries={entries}
            onSelect={setSelectedDate}
            onDelete={(id) => remove.mutate(id)}
            activeDate={selectedDate}
          />
        </div>
      </div>
    </div>
  );
};
