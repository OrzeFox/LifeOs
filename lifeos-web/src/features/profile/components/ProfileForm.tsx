import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { UserProfile, UpdateProfilePayload, Goal } from '../../../ts/user';
import useUpdateProfile from '../hooks/useUpdateProfile';
import styles from '../ProfilePage.module.css';

interface Props { profile: UserProfile; }

type FormValues = {
  name: string;
  birthdate: string;
  heightCm: string;
  weightKg: string;
  goal: Goal | '';
};

const GOALS: { value: Goal; label: string }[] = [
  { value: 'gain', label: 'Ganar peso' },
  { value: 'lose', label: 'Perder peso' },
  { value: 'maintain', label: 'Mantener' },
];

export const ProfileForm = ({ profile }: Props) => {
  const { mutateAsync, isPending } = useUpdateProfile();
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      name: profile.name ?? '',
      birthdate: profile.birthdate ? profile.birthdate.substring(0, 10) : '',
      heightCm: profile.heightCm?.toString() ?? '',
      weightKg: profile.weightKg?.toString() ?? '',
      goal: profile.goal ?? '',
    },
  });

  useEffect(() => {
    reset({
      name: profile.name ?? '',
      birthdate: profile.birthdate ? profile.birthdate.substring(0, 10) : '',
      heightCm: profile.heightCm?.toString() ?? '',
      weightKg: profile.weightKg?.toString() ?? '',
      goal: profile.goal ?? '',
    });
  }, [profile, reset]);

  const onSubmit = async (values: FormValues) => {
    setStatus('idle');
    const payload: UpdateProfilePayload = {};
    if (values.name) payload.name = values.name;
    if (values.birthdate) payload.birthdate = values.birthdate;
    if (values.heightCm) payload.heightCm = parseFloat(values.heightCm);
    if (values.weightKg) payload.weightKg = parseFloat(values.weightKg);
    if (values.goal) payload.goal = values.goal;
    try {
      await mutateAsync(payload);
      setStatus('ok');
    } catch {
      setStatus('err');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <label className={styles.field}>
        <span>Nombre</span>
        <input className={styles.input} type="text" {...register('name')} />
      </label>

      <label className={styles.field}>
        <span>Fecha de nacimiento</span>
        <input className={styles.input} type="date" {...register('birthdate')} />
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Altura (cm)</span>
          <input className={styles.input} type="number" step="0.1" min="50" max="250" {...register('heightCm')} />
        </label>
        <label className={styles.field}>
          <span>Peso (kg)</span>
          <input className={styles.input} type="number" step="0.1" min="20" max="500" {...register('weightKg')} />
        </label>
      </div>

      <label className={styles.field}>
        <span>Objetivo</span>
        <select className={styles.input} {...register('goal')}>
          <option value="">Sin objetivo</option>
          {GOALS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
      </label>

      <button type="submit" disabled={isPending} className={styles.submitBtn}>
        {isPending ? 'Guardando...' : 'Guardar cambios'}
      </button>

      {status === 'ok' && <p className={styles.ok}>Perfil actualizado</p>}
      {status === 'err' && <p className={styles.error}>Error al guardar</p>}
    </form>
  );
};
