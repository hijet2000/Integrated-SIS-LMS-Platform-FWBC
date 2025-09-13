
import React from 'react';
import { useCan } from '@/hooks/useCan';
import type { Scope } from '@/types/navigation';
import ErrorState from '@/components/ui/ErrorState';

export const RequireScope: React.FC<{ scope: Scope | Scope[], children: React.ReactNode }> = ({ scope, children }) => {
    const can = useCan();

    if (can(scope)) {
        return <>{children}</>;
    }

    return <ErrorState title="Access Denied" message="You do not have the required permissions to view this page." />;
};

export default RequireScope;
