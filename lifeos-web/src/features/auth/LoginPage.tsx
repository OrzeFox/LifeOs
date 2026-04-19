import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Icon } from '../../components/Icon';
import type { LoginForm } from '../../ts/auth';
import useLogin from './hooks/useLogin';
import useGoogleLogin from './hooks/useGoogleLogin';
import styles from './LoginPage.module.css';

export const LoginPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const { error, loading, submit } = useLogin();
  const { redirectToGoogle, loading: googleLoading } = useGoogleLogin();

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
              aria-label="Nombre"
              {...register('name', { required: mode === 'register' })}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className={styles.input}
            aria-label="Email"
            {...register('email', { required: true })}
          />
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              className={`${styles.input} ${styles.passwordInput}`}
              aria-label="Contraseña"
              {...register('password', { required: true })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className={styles.passwordToggle}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showPassword}
              tabIndex={0}
            >
              <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={18} />
            </button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Registrarse'}
          </button>
        </form>

        {mode === 'login' && (
          <>
            <div className={styles.divider}>
              <span>O</span>
            </div>
            <button
              type="button"
              onClick={redirectToGoogle}
              disabled={googleLoading}
              className={styles.googleBtn}
              aria-label="Inicia sesión con Google"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Inicia sesión con Google
            </button>
          </>
        )}

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
