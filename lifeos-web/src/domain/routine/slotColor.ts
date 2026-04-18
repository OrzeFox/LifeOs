export const slotColor = (time?: string): string => {
  if (!time) return 'var(--color-outline)';
  const h = parseInt(time.split(':')[0], 10);
  if (h < 10) return 'var(--color-tertiary)';
  if (h < 14) return 'var(--color-primary)';
  if (h < 18) return 'var(--color-secondary)';
  return 'var(--color-on-surface-variant)';
};
