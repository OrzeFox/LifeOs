export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export interface LoginForm {
  email: string;
  password: string;
  name: string;
}
