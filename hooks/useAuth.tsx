
// FIX: Create the useAuth hook and AuthProvider to provide authentication context to the application. This resolves numerous 'module not found' errors.
import React, { createContext, useContext, useState, ReactNode } from 'react';
// FIX: Consolidate type imports and use central Scope definition.
import type { Role, Scope } from '@/types';

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
      id: 'teacher_1',
      name: 'Alice Johnson',
      email: 'alice.j@school.com',
      role: 'teacher',
      scopes: ['school:read', 'school:write']
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
