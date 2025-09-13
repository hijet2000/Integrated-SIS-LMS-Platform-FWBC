
import React, { createContext, useContext, useState, useMemo } from 'react';
// FIX: Corrected import path for types.
import type { User, Role, Scope } from '@/types';
// FIX: Corrected import path for constants.
import { ROLES } from '@/constants';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USERS: { [key in Role]: Omit<User, 'scopes'> & { scopes: Scope[] } } = {
    school_admin: { id: 'user_admin', name: 'Admin User', email: 'admin@school.com', role: 'school_admin', siteId: 'site_123', scopes: ['school:admin', 'school:read', 'school:write'] },
    teacher: { id: 'user_teacher', name: 'Teacher User', email: 'teacher@school.com', role: 'teacher', siteId: 'site_123', scopes: ['school:read'] },
    bursar: { id: 'user_bursar', name: 'Bursar User', email: 'bursar@school.com', role: 'bursar', siteId: 'site_123', scopes: ['school:read', 'school:write'] },
    student: { id: 'user_student', name: 'Student User', email: 'student@school.com', role: 'student', siteId: 'site_123', scopes: ['school:read'] },
    lms_admin: { id: 'user_lms_admin', name: 'LMS Admin', email: 'lms@school.com', role: 'lms_admin', siteId: 'site_123', scopes: [] },
    super_admin: { id: 'user_super', name: 'Super Admin', email: 'super@system.com', role: 'super_admin', siteId: 'site_123', scopes: ['school:admin'] },
    librarian: { id: 'user_librarian', name: 'Librarian User', email: 'librarian@school.com', role: 'librarian', siteId: 'site_123', scopes: ['school:read'] },
    front_desk: { id: 'user_frontdesk', name: 'Front Desk User', email: 'frontdesk@school.com', role: 'front_desk', siteId: 'site_123', scopes: ['school:read'] },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(MOCK_USERS.school_admin);

  const switchRole = (role: Role) => {
    setUser(MOCK_USERS[role] || null);
  };

  const value = useMemo(() => ({ user, setUser, switchRole }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
