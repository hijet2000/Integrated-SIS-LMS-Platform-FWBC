
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent } from '@/components/ui/Card';
// FIX: Corrected import path for sisApi
import { getTeachers } from '@/services/sisApi';
import { useCan } from '@/hooks/useCan';
// FIX: Corrected import path for domain types.
import type { Teacher } from '@/types';

const FacultyTable: React.FC<{ teachers: Teacher[] }> = ({ teachers }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {teachers.map(teacher => (
                        <tr key={teacher.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{teacher.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{teacher.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{teacher.department}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Faculty: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();

    const { data: teachers, isLoading, isError, error, refetch } = useQuery<Teacher[], Error>({
        queryKey: ['teachers', siteId],
        queryFn: () => getTeachers(siteId!),
        enabled: !!siteId,
    });

    const canCreateFaculty = can('create', 'school.faculty', { kind: 'site', id: siteId! });

    return (
        <div>
            <PageHeader
                title="Faculty"
                subtitle="Manage teacher and staff profiles."
                actions={
                    canCreateFaculty && (
                        <Button onClick={() => alert('New faculty form would open.')}>
                            Add Faculty
                        </Button>
                    )
                }
            />
            <Card>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                    {isError && <ErrorState title="Failed to load faculty" message={error.message} onRetry={refetch} />}
                    {!isLoading && !isError && (
                        teachers && teachers.length > 0
                            ? <FacultyTable teachers={teachers} />
                            : <EmptyState title="No faculty found" message="Get started by adding a new faculty member." actionText={canCreateFaculty ? 'Add Faculty' : undefined} onAction={canCreateFaculty ? () => alert('New faculty form') : undefined} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Faculty;
