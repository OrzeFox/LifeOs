import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { LoginForm } from '../../ts/auth';
import useLogin from './hooks/useLogin';
import styles from './LoginPage.module.css';

export const LoginPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { error, loading, submit } = useLogin();

  const { register, handleSubmit } = useForm<LoginForm>({
    defaultValues: { email: '', password: '', name: '' },
  });

  const onSubmit = (data: LoginForm) => {
    submit(mode, data.email, data.password, data.name);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>LifeOS</h1>
        <p className={styles.subtitle}>
          {mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Nombre"
              className={styles.input}
              {...register('name', { required: mode === 'register' })}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className={styles.input}
            {...register('email', { required: true })}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className={styles.input}
            {...register('password', { required: true })}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Registrarse'}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className={styles.toggleBtn}
        >
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  );
};
