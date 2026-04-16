import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import styles from './Navbar.module.css';

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
    <nav className={styles.nav}>
      <span className={styles.logo}>LifeOS</span>
      <div className={styles.links}>
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={pathname === to ? `${styles.link} ${styles.linkActive}` : styles.link}
          >
            {label}
          </Link>
        ))}
      </div>
      <button onClick={logout} className={styles.logoutBtn}>
        Salir
      </button>
    </nav>
  );
}
