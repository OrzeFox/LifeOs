import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { FinancesPage } from '../features/finances/FinancesPage';
import { HabitsPage } from '../features/habits/HabitsPage';
import { RoutinePage } from '../features/routine/RoutinePage';
import { GymPage } from '../features/gym/GymPage';
import { SleepPage } from '../features/sleep/SleepPage';
import { EventsPage } from '../features/events/EventsPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { LoginPage } from '../features/auth/LoginPage';
import { Sidebar } from '../components/Sidebar';
import styles from './AppRouter.module.css';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export const AppRouter = () => {
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
                  <Route path="/gym"      element={<GymPage />} />
                  <Route path="/sleep"    element={<SleepPage />} />
                  <Route path="/events"   element={<EventsPage />} />
                  <Route path="/profile"  element={<ProfilePage />} />
                </Routes>
              </AppShell>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
