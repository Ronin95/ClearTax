import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContextType, User } from '../data/authTypes';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/users/me', {
          withCredentials: true 
        }); 
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false); // This ensures the app stops "Loading..."
      }
    };
    checkSession();
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:3001/api/auth/logout', {}, {
        withCredentials: true
      });
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }}>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
