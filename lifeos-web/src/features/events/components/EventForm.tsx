import { useForm } from 'react-hook-form';
import { useCategories } from '../hooks/useCategories';
import useEventMutations from '../hooks/useEventMutations';
import type { AppEvent, CreateEventPayload } from '../../../ts/events';
import styles from '../EventsPage.module.css';

interface Props {
  event?: AppEvent | null;
  onClose: () => void;
}

type FormValues = {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  location: string;
  categoryId: string;
};

const toLocalInput = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const EventForm = ({ event, onClose }: Props) => {
  const { create, update } = useEventMutations();
  const { data: categories } = useCategories();
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      title: event?.title ?? '',
      description: event?.description ?? '',
      startAt: toLocalInput(event?.startAt) || toLocalInput(new Date().toISOString()),
      endAt: toLocalInput(event?.endAt) || toLocalInput(new Date(Date.now() + 3600_000).toISOString()),
      allDay: event?.allDay ?? false,
      location: event?.location ?? '',
      categoryId: event?.category?.id ?? '',
    },
  });

  const onSubmit = async (v: FormValues) => {
    const payload: CreateEventPayload = {
      title: v.title,
      description: v.description || undefined,
      startAt: new Date(v.startAt).toISOString(),
      endAt: new Date(v.endAt).toISOString(),
      allDay: v.allDay,
      location: v.location || undefined,
      categoryId: v.categoryId || undefined,
    };
    if (event) await update.mutateAsync({ id: event.id, payload });
    else await create.mutateAsync(payload);
    onClose();
  };

  const pending = create.isPending || update.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <label className={styles.field}>
        <span>Título</span>
        <input className={styles.input} type="text" required {...register('title', { required: true })} />
      </label>
      <label className={styles.field}>
        <span>Descripción</span>
        <textarea className={styles.input} rows={2} {...register('description')} />
      </label>
      <div className={styles.row}>
        <label className={styles.field}>
          <span>Inicio</span>
          <input className={styles.input} type="datetime-local" {...register('startAt', { required: true })} />
        </label>
        <label className={styles.field}>
          <span>Fin</span>
          <input className={styles.input} type="datetime-local" {...register('endAt', { required: true })} />
        </label>
      </div>
      <label className={styles.fieldRow}>
        <input type="checkbox" {...register('allDay')} /> Todo el día
      </label>
      <label className={styles.field}>
        <span>Ubicación</span>
        <input className={styles.input} type="text" {...register('location')} />
      </label>
      <label className={styles.field}>
        <span>Categoría</span>
        <select className={styles.input} {...register('categoryId')}>
          <option value="">Sin categoría</option>
          {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <div className={styles.formActions}>
        <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancelar</button>
        <button type="submit" disabled={pending} className={styles.submitBtn}>
          {pending ? 'Guardando...' : event ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};
