import type { CardProps } from '../ts/common';
import styles from './Card.module.css';

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`${styles.card}${className ? ` ${className}` : ''}`}>
      <h2 className={styles.title}>{title}</h2>
      {children}
    </div>
  );
}
