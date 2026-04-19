import { useMemo, useState } from 'react';
import { Icon } from '../../components/Icon';
import { useEvents } from './hooks/useEvents';
import useEventMutations from './hooks/useEventMutations';
import { CategoryFilter } from './components/CategoryFilter';
import { EventForm } from './components/EventForm';
import { EventCard } from './components/EventCard';
import { MonthView } from './components/MonthView';
import type { AppEvent } from '../../ts/events';
import styles from './EventsPage.module.css';

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export const EventsPage = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [editing, setEditing] = useState<AppEvent | null | undefined>(undefined);

  const range = useMemo(() => {
    const from = new Date(year, month, 1).toISOString();
    const to = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    return { from, to };
  }, [year, month]);

  const { data: events = [] } = useEvents({ from: range.from, to: range.to, category: categoryFilter });
  const { remove } = useEventMutations();

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const filtered = selectedDate
    ? events.filter(e => new Date(e.startAt).toISOString().substring(0, 10) === selectedDate)
    : events;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Eventos</h1>
        <p className={styles.heroSub}>Gestiona tu calendario</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.monthNav}>
          <button type="button" onClick={prevMonth} className={styles.iconBtn}>
            <Icon name="chevron_left" size={18} />
          </button>
          <span className={styles.monthLabel}>{MONTH_NAMES[month]} {year}</span>
          <button type="button" onClick={nextMonth} className={styles.iconBtn}>
            <Icon name="chevron_right" size={18} />
          </button>
        </div>
        <button type="button" onClick={() => setEditing(null)} className={styles.addEventBtn}>
          <Icon name="add" size={16} /> Nuevo evento
        </button>
      </div>

      <CategoryFilter selected={categoryFilter} onChange={setCategoryFilter} />

      <section className={styles.card}>
        <MonthView
          year={year} month={month} events={events}
          selectedDate={selectedDate}
          onSelectDate={(iso) => setSelectedDate(prev => prev === iso ? undefined : iso)}
        />
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>
          {selectedDate ? `Eventos del ${selectedDate}` : 'Eventos del mes'}
        </h2>
        {filtered.length === 0 && <p className={styles.hint}>Sin eventos</p>}
        <div className={styles.eventList}>
          {filtered.map(e => (
            <EventCard key={e.id} event={e} onEdit={() => setEditing(e)} onDelete={() => remove.mutate(e.id)} />
          ))}
        </div>
      </section>

      {editing !== undefined && (
        <div className={styles.modal} role="dialog">
          <div className={styles.modalContent}>
            <h2 className={styles.sectionTitle}>{editing ? 'Editar evento' : 'Nuevo evento'}</h2>
            <EventForm event={editing} onClose={() => setEditing(undefined)} />
          </div>
        </div>
      )}
    </div>
  );
};
