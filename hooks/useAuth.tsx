
// FIX: Create the useAuth hook and AuthProvider to provide authentication context to the application. This resolves numerous 'module not found' errors.
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Role } from '@/types';
import type { Scope } from '@/types/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  scopes: Scope[];
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
      id: 'user_super_admin',
      name: 'Super Admin',
      email: 'admin@faitedu.com',
      role: 'super_admin',
      scopes: ['school:admin', 'school:read', 'school:write']
  });

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
