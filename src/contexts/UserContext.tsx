"use client"

import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';

interface User {
  email: string;
  first_name: string;
  last_name: string;
}

export const UserContext = createContext<{
  user: User | null;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  logout: () => void;
}>({
  user: null,
  isLoading: false,
  fetchUser: async () => {},
  logout: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users/me');
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <UserContext.Provider value={{ user, isLoading, fetchUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};