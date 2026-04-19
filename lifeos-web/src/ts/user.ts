export type Goal = 'gain' | 'lose' | 'maintain';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  googleId?: string | null;
  birthdate?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  goal?: Goal | null;
  createdAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  birthdate?: string;
  heightCm?: number;
  weightKg?: number;
  goal?: Goal;
}
