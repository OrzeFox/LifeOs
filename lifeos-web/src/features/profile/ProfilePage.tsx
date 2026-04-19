import useProfile from './hooks/useProfile';
import { ProfileForm } from './components/ProfileForm';
import styles from './ProfilePage.module.css';

export const ProfilePage = () => {
  const { data: profile, isLoading, isError } = useProfile();

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Perfil</h1>
        <p className={styles.heroSub}>Gestiona tus datos personales</p>
      </div>

      <div className={styles.card}>
        {isLoading && <p className={styles.hint}>Cargando...</p>}
        {isError && <p className={styles.error}>Error cargando perfil</p>}
        {profile && (
          <>
            <div className={styles.emailRow}>
              <span className={styles.emailLabel}>Email</span>
              <span className={styles.emailValue}>{profile.email}</span>
            </div>
            <ProfileForm profile={profile} />
          </>
        )}
      </div>
    </div>
  );
};
