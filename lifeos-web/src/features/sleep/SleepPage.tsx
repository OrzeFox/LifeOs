import { SleepLogForm } from './components/SleepLogForm';
import { SleepHistory } from './components/SleepHistory';
import { SleepInsights } from './components/SleepInsights';
import styles from './SleepPage.module.css';

export const SleepPage = () => (
  <div className={styles.page}>
    <div className={styles.hero}>
      <h1 className={styles.heroTitle}>Sueño</h1>
      <p className={styles.heroSub}>Registra y analiza tu descanso</p>
    </div>

    <section className={styles.card}>
      <h2 className={styles.sectionTitle}>Nuevo registro</h2>
      <SleepLogForm />
    </section>

    <section className={styles.card}>
      <h2 className={styles.sectionTitle}>Análisis</h2>
      <SleepInsights />
    </section>

    <section className={styles.card}>
      <h2 className={styles.sectionTitle}>Historial</h2>
      <SleepHistory />
    </section>
  </div>
);
