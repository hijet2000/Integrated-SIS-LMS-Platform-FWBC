
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCan } from '@/hooks/useCan';
import { useAuth } from '@/auth/AuthProvider';
// FIX: Import Scope from the central types file to ensure consistency.
import type { Scope } from '@/types';
import ErrorState from '@/components/ui/ErrorState';

export const RequireScope: React.FC<{ scope: Scope | Scope[], children: React.ReactNode }> = ({ scope, children }) => {
    const { user } = useAuth();
    const can = useCan();

    if (!user) {
        // Unauthenticated users should be redirected.
        // This assumes the root path handles login or public views.
        return <Navigate to="/" replace />;
    }

    if (can(scope)) {
        return <>{children}</>;
    }

    return <ErrorState title="Access Denied" message="You do not have the required permissions to view this page." />;
};

export default RequireScope;
