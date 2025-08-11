// Define the shape of the user object we'll get from the token
export interface User {
  id: number;
  username: string;
}

// Define the shape of our context
export interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}
