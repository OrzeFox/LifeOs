import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { FinancesPage } from '../features/finances/FinancesPage';
import { HabitsPage } from '../features/habits/HabitsPage';
import { RoutinePage } from '../features/routine/RoutinePage';
import { LoginPage } from '../features/auth/LoginPage';
import { Sidebar } from '../components/Sidebar';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

/**
 * AppShell — The Monolithic Archive layout.
 *
 * Sidebar: floating glass column, 24px from left edge, 24px top/bottom.
 * Content: margin-left = 24 (sidebar left gap) + 220 (sidebar width) + 24 (gap to content) = 268px
 *          padding: 40px 40px 40px 0  (breathing room around content)
 * Global background: #0E0E0E — the obsidian canvas.
 */
function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-background)',
      display: 'flex',
    }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: '268px',   /* 24 + 220 + 24 */
        padding: '40px 40px 40px 0',
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <AppShell>
                <Routes>
                  <Route path="/"         element={<DashboardPage />} />
                  <Route path="/finances" element={<FinancesPage />} />
                  <Route path="/habits"   element={<HabitsPage />} />
                  <Route path="/routine"  element={<RoutinePage />} />
                </Routes>
              </AppShell>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
