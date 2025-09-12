
import { useAuth } from './useAuth';
// FIX: Corrected import paths for constants and types.
import { PERMISSIONS } from '@/constants';
import type { Resource, Action } from '@/types';

interface Scope {
    kind: 'site';
    id: string;
}

export const useCan = () => {
    const { user } = useAuth();

    const can = (action: Action, resource: Resource, scope?: Scope): boolean => {
        if (!user) {
            return false;
        }

        // Super admin can do anything, but only if the scope matches or is not provided.
        // In a real app, super_admin might bypass site scope checks. For this implementation, we keep it simple.
        if (user.role === 'super_admin') {
            if(scope && scope.kind === 'site' && scope.id !== user.siteId) {
                // A super admin scoped to one site can't access another
                return false;
            }
            return true;
        }

        // Deny if the action is on a resource from a different site
        if (scope && scope.kind === 'site' && scope.id !== user.siteId) {
            return false;
        }

        const userPermissions = PERMISSIONS[user.role];
        if (!userPermissions || !userPermissions[resource]) {
            return false;
        }
        
        return userPermissions[resource]?.includes(action) ?? false;
    };

    return can;
};
