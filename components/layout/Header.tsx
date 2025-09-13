
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
// FIX: Corrected import paths for type and constant.
import type { Role } from '@/types';
import { ROLES } from '@/constants';

const Header: React.FC = () => {
    const { user, switchRole } = useAuth();

    return (
        <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div>
                {/* Search bar could go here */}
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Switch Role:</span>
                     <select 
                        value={user?.role} 
                        onChange={(e) => switchRole(e.target.value as Role)}
                        className="text-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {ROLES.map(role => (
                            <option key={role} value={role}>
                                {role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="text-right">
                    <div className="font-medium text-gray-800 dark:text-gray-200">{user?.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
                </div>
                 <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0)}
                </div>
            </div>
        </header>
    );
}

export default Header;
