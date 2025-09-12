
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent } from '@/components/ui/Card';
import { getQuizzes, getCourses } from '@/services/lmsApi';
import { useCan } from '@/hooks/useCan';
// FIX: Corrected import path for type definitions.
import type { Quiz, Course } from '@/types';

const QuizzesTable: React.FC<{ quizzes: Quiz[], courses: Course[] }> = ({ quizzes, courses }) => {
    const courseMap = new Map(courses.map(c => [c.id, c.title]));

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time Limit</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {quizzes.map((quiz) => (
                        <tr key={quiz.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{quiz.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{courseMap.get(quiz.courseId) || quiz.courseId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{quiz.timeLimit} mins</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${quiz.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {quiz.published ? 'Published' : 'Draft'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Quizzes: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();

    const { data: quizzes, isLoading, isError, error, refetch } = useQuery<Quiz[], Error>({
        queryKey: ['quizzes', siteId],
        queryFn: () => getQuizzes(siteId!),
        enabled: !!siteId,
    });

    const { data: courses } = useQuery<Course[], Error>({
        queryKey: ['courses', siteId],
        queryFn: () => getCourses(siteId!),
        enabled: !!siteId,
    });

    const canCreate = can('create', 'edu.quizzes', { kind: 'site', id: siteId! });

    return (
        <div>
            <PageHeader
                title="Quizzes"
                subtitle="Manage course quizzes and question banks."
                actions={
                    canCreate && (
                        <Button onClick={() => alert('New quiz form would open.')}>
                            Create Quiz
                        </Button>
                    )
                }
            />
            <Card>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                    {isError && <ErrorState title="Failed to load quizzes" message={error.message} onRetry={refetch} />}
                    {!isLoading && !isError && (
                        quizzes && quizzes.length > 0 && courses
                            ? <QuizzesTable quizzes={quizzes} courses={courses} />
                            : <EmptyState title="No quizzes found" message="Get started by creating a new quiz." actionText={canCreate ? 'Create Quiz' : undefined} onAction={canCreate ? () => alert('New quiz form') : undefined} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Quizzes;
