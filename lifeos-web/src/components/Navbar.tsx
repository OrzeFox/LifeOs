import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/finances', label: 'Finanzas' },
  { to: '/habits', label: 'Hábitos' },
  { to: '/routine', label: 'Rutina' },
];

export function Navbar() {
  const { pathname } = useLocation();
  const { logout } = useAuthStore();

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
      <span className="font-bold text-lg text-violet-400">LifeOS</span>
      <div className="flex gap-1">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              pathname === to
                ? 'bg-violet-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
      <button
        onClick={logout}
        className="text-sm text-slate-400 hover:text-white transition-colors"
      >
        Salir
      </button>
    </nav>
  );
}
