
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { getEduCurricula } from '@/services/lmsApi';
import { useCan } from '@/hooks/useCan';
// FIX: Corrected import path for type definition.
import type { EduCurriculum } from '@/types';

const CurriculumCard: React.FC<{ curriculum: EduCurriculum }> = ({ curriculum }) => (
    <Card>
        <CardHeader className="flex justify-between items-center">
            <h3 className="font-bold">Curriculum {curriculum.version}</h3>
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${curriculum.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {curriculum.status}
            </span>
        </CardHeader>
        <CardContent>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Objectives:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-500 dark:text-gray-400">
                {curriculum.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
            </ul>
        </CardContent>
    </Card>
);

const Curriculum: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();

    const { data: curricula, isLoading, isError, error, refetch } = useQuery<EduCurriculum[], Error>({
        queryKey: ['eduCurricula', siteId],
        queryFn: () => getEduCurricula(siteId!),
        enabled: !!siteId,
    });

    // FIX: The useCan hook expects a single scope string. Mapped 'create' action to 'school:write' scope.
    const canCreate = can('school:write');

    return (
        <div>
            <PageHeader
                title="LMS Curriculum"
                subtitle="Manage curriculum versions, objectives, and standards."
                actions={
                    canCreate && (
                        <Button onClick={() => alert('New curriculum form would open.')}>
                            Create Curriculum
                        </Button>
                    )
                }
            />
            {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
            {isError && <ErrorState title="Failed to load curricula" message={error.message} onRetry={refetch} />}
            {!isLoading && !isError && (
                curricula && curricula.length > 0
                    ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {curricula.map(c => <CurriculumCard key={c.id} curriculum={c} />)}
                        </div>
                    )
                    : <EmptyState title="No curricula found" message="Get started by creating a new curriculum version." actionText={canCreate ? 'Create Curriculum' : undefined} onAction={canCreate ? () => alert('New curriculum form') : undefined} />
            )}
        </div>
    );
};

export default Curriculum;
