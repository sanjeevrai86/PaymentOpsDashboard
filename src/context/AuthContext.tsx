import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Environment } from '@/types';

interface AuthUser {
  userId: string;
  name: string;
  role: string;
  environment: Environment;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (userId: string, _password: string, environment: Environment) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = sessionStorage.getItem('payops_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userId: string, _password: string, environment: Environment) => {
    const authed: AuthUser = {
      userId,
      name: 'J. Morgan',
      role: 'Payments Ops Analyst',
      environment,
    };
    setUser(authed);
    sessionStorage.setItem('payops_user', JSON.stringify(authed));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('payops_user');
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
