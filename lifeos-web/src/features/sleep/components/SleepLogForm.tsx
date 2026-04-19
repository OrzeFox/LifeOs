import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useSleepMutations from '../hooks/useSleepMutations';
import styles from '../SleepPage.module.css';

type FormValues = {
  sleepAt: string;
  wakeAt: string;
  notes: string;
};

const toLocalInput = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const SleepLogForm = () => {
  const { create } = useSleepMutations();
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');

  const now = new Date();
  const lastNight = new Date(now); lastNight.setDate(now.getDate() - 1); lastNight.setHours(23, 0, 0, 0);
  const thisMorning = new Date(now); thisMorning.setHours(7, 0, 0, 0);

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      sleepAt: toLocalInput(lastNight),
      wakeAt: toLocalInput(thisMorning),
      notes: '',
    },
  });

  const onSubmit = async (v: FormValues) => {
    setStatus('idle');
    try {
      await create.mutateAsync({
        sleepAt: new Date(v.sleepAt).toISOString(),
        wakeAt: new Date(v.wakeAt).toISOString(),
        notes: v.notes || undefined,
      });
      setStatus('ok');
      reset({ sleepAt: v.sleepAt, wakeAt: v.wakeAt, notes: '' });
    } catch {
      setStatus('err');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.row}>
        <label className={styles.field}>
          <span>Me dormí</span>
          <input className={styles.input} type="datetime-local" {...register('sleepAt', { required: true })} />
        </label>
        <label className={styles.field}>
          <span>Desperté</span>
          <input className={styles.input} type="datetime-local" {...register('wakeAt', { required: true })} />
        </label>
      </div>
      <label className={styles.field}>
        <span>Notas</span>
        <textarea className={styles.input} rows={2} {...register('notes')} placeholder="Opcional"></textarea>
      </label>
      <button type="submit" disabled={create.isPending} className={styles.submitBtn}>
        {create.isPending ? 'Guardando...' : 'Registrar sueño'}
      </button>
      {status === 'ok' && <p className={styles.ok}>Registrado</p>}
      {status === 'err' && <p className={styles.error}>Error al registrar</p>}
    </form>
  );
};
