export interface User {
  id: string; // Changed to string because you use UUIDs in Postgres
  username: string;
  email: string;
  role_id: number;
  company_name?: string | null;
}

export interface AuthContextType {
  user: User | null;
  login: (user: User, token: string) => void; 
  logout: () => void;
  isAuthenticated: boolean;
}
