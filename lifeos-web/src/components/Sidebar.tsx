import { NavLink, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { useAuthStore } from '../store/useAuthStore';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { to: '/',         icon: 'space_dashboard', label: 'Dashboard' },
  { to: '/finances', icon: 'account_balance_wallet', label: 'Finanzas' },
  { to: '/habits',   icon: 'self_improvement', label: 'Hábitos' },
  { to: '/routine',  icon: 'restaurant', label: 'Alimentación' },
  { to: '/gym',      icon: 'fitness_center', label: 'Gimnasio' },
  { to: '/sleep',    icon: 'bedtime', label: 'Sueño' },
  { to: '/events',   icon: 'event', label: 'Eventos' },
  { to: '/profile',  icon: 'person', label: 'Perfil' },
];

export function Sidebar() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={styles.aside}>
      <div className={styles.logoSection}>
        <p className={styles.logoName}>LifeOS</p>
        <p className={styles.logoTagline}>The Private Curator</p>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
              >
                <span className={styles.iconBubble}>
                  <Icon name={icon} size={16} />
                </span>
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        <div className={styles.divider} />
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <span className={styles.iconBubble}>
            <Icon name="logout" size={16} />
          </span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
