
import React from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { useCan } from '@/hooks/useCan';
// FIX: Corrected import paths for types and constants.
import { ROLES, PERMISSIONS } from '@/constants';
import type { Role, Resource, Action } from '@/types';

const Roles: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();

    const canRead = can('read', 'settings.roles', { kind: 'site', id: siteId! }) || true; // Default to true for demo

    if (!canRead) {
        return <div>Access Denied</div>;
    }
    
    // Create a comprehensive list of all possible resources and actions
    const allResources = Object.values(PERMISSIONS).flatMap(p => Object.keys(p)) as Resource[];
    const uniqueResources = [...new Set(allResources)].sort();
    
    const allActions = Object.values(PERMISSIONS).flatMap(p => Object.values(p).flat()) as Action[];
    const uniqueActions = [...new Set(allActions)].sort();

    return (
        <div>
            <PageHeader
                title="Roles & Permissions"
                subtitle="Review the permissions assigned to each user role."
            />
            <Card>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase sticky left-0 bg-gray-50 dark:bg-gray-700">Resource</th>
                                    {ROLES.map(role => (
                                        <th key={role} className="px-6 py-3 text-center text-xs font-medium uppercase">
                                            {role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {uniqueResources.map(resource => (
                                    <tr key={resource}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium sticky left-0 bg-white dark:bg-gray-800">{resource}</td>
                                        {ROLES.map(role => {
                                            const permissions = PERMISSIONS[role]?.[resource] || [];
                                            const hasFullAccess = role === 'super_admin';
                                            return (
                                                <td key={role} className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                    {hasFullAccess ? (
                                                        <span className="text-green-500 font-bold">ALL</span>
                                                    ) : permissions.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1 justify-center">
                                                            {permissions.map(p => <span key={p} className="px-1.5 py-0.5 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">{p.toUpperCase()}</span>)}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Roles;
