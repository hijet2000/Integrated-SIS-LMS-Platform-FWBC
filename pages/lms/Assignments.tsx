
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent } from '@/components/ui/Card';
import { getEduAssignments, getCourses } from '@/services/lmsApi';
import { useCan } from '@/hooks/useCan';
// FIX: Corrected import path for type definitions.
import type { EduAssignment, Course } from '@/types';

const AssignmentsTable: React.FC<{ assignments: EduAssignment[], courses: Course[] }> = ({ assignments, courses }) => {
    const courseMap = new Map(courses.map(c => [c.id, c.title]));

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Marks</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {assignments.map((assignment) => (
                        <tr key={assignment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{assignment.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{courseMap.get(assignment.courseId) || assignment.courseId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(assignment.dueAt + 'T00:00:00').toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{assignment.totalMarks}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Assignments: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();

    const { data: assignments, isLoading, isError, error, refetch } = useQuery<EduAssignment[], Error>({
        queryKey: ['eduAssignments', siteId],
        queryFn: () => getEduAssignments(siteId!),
        enabled: !!siteId,
    });
    
    const { data: courses } = useQuery<Course[], Error>({
        queryKey: ['courses', siteId],
        queryFn: () => getCourses(siteId!),
        enabled: !!siteId,
    });

    // FIX: The useCan hook expects a single scope string. Mapped 'create' action to 'school:write' scope.
    const canCreate = can('school:write');

    return (
        <div>
            <PageHeader
                title="Assignments"
                subtitle="Manage and grade student assignments."
                actions={
                    canCreate && (
                        <Button onClick={() => alert('New assignment form would open.')}>
                            Create Assignment
                        </Button>
                    )
                }
            />
            <Card>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                    {isError && <ErrorState title="Failed to load assignments" message={error.message} onRetry={refetch} />}
                    {!isLoading && !isError && (
                        assignments && assignments.length > 0 && courses
                            ? <AssignmentsTable assignments={assignments} courses={courses} />
                            : <EmptyState title="No assignments found" message="Get started by creating a new assignment." actionText={canCreate ? 'Create Assignment' : undefined} onAction={canCreate ? () => alert('New assignment form') : undefined} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Assignments;
