export type EnergyBand = 'low' | 'medium' | 'high' | 'peak';

export interface EnergyComponent {
  key: 'sleep' | 'self' | 'habits' | 'activity' | 'mood' | 'finance';
  label: string;
  score: number;
  max: number;
  note: string;
}

export interface EnergyScore {
  userId: string;
  date: string;
  total: number;
  band: EnergyBand;
  components: EnergyComponent[];
  generatedAt: string;
}
