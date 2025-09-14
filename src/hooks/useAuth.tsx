// FIX: Create the useAuth hook and AuthProvider to provide authentication context to the application. This resolves numerous 'module not found' errors.
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { Role } from '@/types';
// FIX: Import Scope from central types definition
import type { Scope } from '@/types';

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
      scopes: ['school:admin','lms:admin','attendance:read','attendance:write', 'library:read', 'library:write']
  });

  const login = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    login,
    logout
  }), [user, login, logout]);

  return (
    <AuthContext.Provider value={value}>
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