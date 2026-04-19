import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { TodayView } from './views/TodayView';
import { CalendarView } from './views/CalendarView';
import { ManageView } from './views/ManageView';
import styles from './HabitsPage.module.css';

type Tab = 'today' | 'calendar' | 'manage';

const TABS: { value: Tab; label: string; icon: string }[] = [
  { value: 'today',    label: 'Hoy',        icon: 'today' },
  { value: 'calendar', label: 'Calendario', icon: 'calendar_month' },
  { value: 'manage',   label: 'Hábitos',    icon: 'list' },
];

export const HabitsPage = () => {
  const today = new Date().toISOString().split('T')[0];
  const [tab, setTab]   = useState<Tab>('today');
  const [date, setDate] = useState(today);

  const heroSub =
    tab === 'today'    ? new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
    : tab === 'calendar' ? 'Vista mensual'
    : 'Gestiona tus hábitos y tareas';

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Habit Momentum</h1>
        <p className={styles.heroSub}>{heroSub}</p>
      </div>

      <div className={styles.tabBar}>
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`${styles.tabBtn} ${tab === t.value ? styles.tabBtnActive : ''}`}
          >
            <Icon name={t.icon} size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'today' && <TodayView date={date} onDateChange={setDate} />}
      {tab === 'calendar' && <CalendarView date={date} onDateChange={setDate} />}
      {tab === 'manage' && <ManageView />}
    </div>
  );
};
