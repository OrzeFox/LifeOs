import { NavLink, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { useAuthStore } from '../store/useAuthStore';

const NAV_ITEMS = [
  { to: '/',         icon: 'space_dashboard', label: 'Dashboard' },
  { to: '/finances', icon: 'account_balance_wallet', label: 'Finanzas' },
  { to: '/habits',   icon: 'self_improvement', label: 'Hábitos' },
  { to: '/routine',  icon: 'restaurant', label: 'Rutina' },
];

export function Sidebar() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    /* Floating glass column — 24px from all screen edges */
    <aside
      style={{
        position: 'fixed',
        top: '24px',
        left: '24px',
        bottom: '24px',
        width: '220px',
        display: 'flex',
        flexDirection: 'column',

        /* Glassmorphism: surface-container-highest at 70% + blur */
        background: 'rgba(48, 48, 48, 0.70)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '1rem',   /* radius-2xl */

        /* Bioluminescent ambient lift */
        boxShadow: '0 0 48px rgba(78, 222, 163, 0.04)',

        /* No border — depth comes from glass layer */
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div style={{ padding: '28px 20px 20px' }}>
        <p style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '15px',
          letterSpacing: '-0.02em',
          color: 'var(--color-primary)',
        }}>
          LifeOS
        </p>
        <p style={{
          margin: '3px 0 0',
          fontSize: '0.625rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-on-surface-variant)',
          fontWeight: 500,
        }}>
          The Private Curator
        </p>
      </div>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '4px 12px', overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '0.5rem',  /* radius-lg */
                  textDecoration: 'none',
                  fontSize: '0.8125rem',   /* 13px */
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--color-on-primary-container)' : 'var(--color-on-surface-variant)',
                  background: isActive
                    ? `linear-gradient(135deg, var(--color-primary-container), var(--color-primary))`
                    : 'transparent',
                  transition: 'all 0.15s ease',
                  /* Active: glow */
                  boxShadow: isActive ? '0 2px 16px rgba(78, 222, 163, 0.20)' : 'none',
                })}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  if (!el.getAttribute('aria-current')) {
                    el.style.background = 'var(--color-surface-container-high)';
                    el.style.color = 'var(--color-on-surface)';
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  if (!el.getAttribute('aria-current')) {
                    el.style.background = 'transparent';
                    el.style.color = 'var(--color-on-surface-variant)';
                  }
                }}
              >
                {/* Icon in surface-container-high circle for weight */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)',
                  flexShrink: 0,
                }}>
                  <Icon name={icon} size={16} />
                </span>
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div style={{ padding: '12px 12px 20px' }}>
        {/* Divider via luminosity shift, not a line */}
        <div style={{
          height: '1px',
          background: 'rgba(255,255,255,0.04)',
          marginBottom: '12px',
          borderRadius: '1px',
        }} />
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '0.5rem',
            border: 'none',
            background: 'transparent',
            color: 'var(--color-on-surface-variant)',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget).style.background = 'rgba(242, 139, 130, 0.10)';
            (e.currentTarget).style.color = 'var(--color-error)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget).style.background = 'transparent';
            (e.currentTarget).style.color = 'var(--color-on-surface-variant)';
          }}
        >
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)', flexShrink: 0,
          }}>
            <Icon name="logout" size={16} />
          </span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
