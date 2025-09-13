
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent } from '@/components/ui/Card';
import { getResources } from '@/services/lmsApi';
import { useCan } from '@/hooks/useCan';
// FIX: Corrected import path for domain types.
import type { EduResource } from '@/types';

const ResourcesTable: React.FC<{ resources: EduResource[] }> = ({ resources }) => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();
    // FIX: The useCan hook expects a single scope string. Mapped 'pay' action to 'school:write' scope.
    const canPay = can('school:write');

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Access</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {resources.map((res) => (
                        <tr key={res.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{res.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{res.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {res.access === 'PAID' ? (
                                    <span className="font-semibold">${res.price?.toFixed(2)}</span>
                                ) : (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">FREE</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <a href={res.url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="secondary" size="sm">View</Button>
                                </a>
                                {res.access === 'PAID' && canPay && (
                                    <Button size="sm" onClick={() => alert('Payment flow would start.')}>Purchase</Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Resources: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();

    const { data: resources, isLoading, isError, error, refetch } = useQuery<EduResource[], Error>({
        queryKey: ['eduResources', siteId],
        queryFn: () => getResources(siteId!),
        enabled: !!siteId,
    });

    // FIX: The useCan hook expects a single scope string. Mapped 'create' action to 'school:write' scope.
    const canCreate = can('school:write');

    return (
        <div>
            <PageHeader
                title="Resources"
                subtitle="Manage and access learning materials like PDFs, videos, and links."
                actions={
                    canCreate && (
                        <Button onClick={() => alert('New resource form would open.')}>
                            Add Resource
                        </Button>
                    )
                }
            />
            <Card>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                    {isError && <ErrorState title="Failed to load resources" message={error.message} onRetry={refetch} />}
                    {!isLoading && !isError && (
                        resources && resources.length > 0
                            ? <ResourcesTable resources={resources} />
                            : <EmptyState title="No resources found" message="Get started by adding a new resource." actionText={canCreate ? 'Add Resource' : undefined} onAction={canCreate ? () => alert('New resource form') : undefined} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Resources;
