import styles from '../RoutinePage.module.css';

interface NutritionPillProps {
  label: string;
  value?: number;
  unit?: string;
}

export const NutritionPill = ({ label, value, unit }: NutritionPillProps) => {
  if (!value) return null;
  return (
    <span className={styles.nutritionPill}>
      {label} <strong>{value}{unit ?? 'g'}</strong>
    </span>
  );
};
