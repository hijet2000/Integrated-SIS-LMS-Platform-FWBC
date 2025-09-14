import { useAuth } from '@/auth/AuthProvider';
import type { Scope } from '@/types/navigation';

export const useCan = () => {
    const { user } = useAuth();

    const can = (requiredScope: Scope | Scope[]): boolean => {
        if (!user) {
            return false;
        }

        const userScopes = user.scopes || [];

        // Super admin can do anything school related
        if (userScopes.includes('school:admin')) {
            return true;
        }

        const required = Array.isArray(requiredScope) ? requiredScope : [requiredScope];

        // Check if the user has every required scope
        return required.every(scope => userScopes.includes(scope));
    };

    return can;
};