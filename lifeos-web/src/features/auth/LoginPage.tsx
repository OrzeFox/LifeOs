import { useState, type FormEvent } from 'react';
import type { LoginForm } from '../../ts/auth';
import useLogin from './hooks/useLogin';
import styles from './LoginPage.module.css';

export const LoginPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState<LoginForm>({ email: '', password: '', name: '' });
  const { error, loading, submit } = useLogin();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit(mode, form.email, form.password, form.name);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>LifeOS</h1>
        <p className={styles.subtitle}>
          {mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={styles.input}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={styles.input}
            required
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
