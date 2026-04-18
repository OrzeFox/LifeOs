export const energyLabel = (n: number): string => {
  if (n <= 2) return 'Agotado';
  if (n <= 4) return 'Bajo';
  if (n <= 6) return 'Normal';
  if (n <= 8) return 'Bien';
  return 'Excelente';
};

export const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
};
