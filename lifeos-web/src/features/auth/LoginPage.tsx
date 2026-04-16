import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/useAuthStore';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await authApi.login(form.email, form.password)
        : await authApi.register(form.email, form.password, form.name);
      login(res.data.access_token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al conectar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-slate-800 rounded-2xl border border-slate-700 p-8">
        <h1 className="text-2xl font-bold text-violet-400 mb-1">LifeOS</h1>
        <p className="text-slate-400 text-sm mb-6">
          {mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500"
            required
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-medium transition-colors"
          >
            {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Registrarse'}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="w-full text-center text-slate-400 text-xs mt-4 hover:text-slate-200 transition-colors"
        >
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  );
}
