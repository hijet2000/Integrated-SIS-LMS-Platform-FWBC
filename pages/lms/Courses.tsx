
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardFooter } from '@/components/ui/Card';
import { getCourses } from '@/services/lmsApi';
import { useCan } from '@/hooks/useCan';
// FIX: Corrected import path for type definition.
import type { Course } from '@/types';

const statusColors: { [key: string]: string } = {
    OPEN: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    CLOSED: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const CourseCard: React.FC<{ course: Course }> = ({ course }) => (
    <Card className="flex flex-col">
        <CardContent className="flex-grow">
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{course.title}</h3>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[course.status]}`}>
                    {course.status}
                </span>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{course.description}</p>
        </CardContent>
        <CardFooter>
            <div className="flex justify-end">
                {/* FIX: Corrected link to match /education/:siteId/courses/:courseId pattern */}
                <Link to={`/education/${course.siteId}/courses/${course.id}`}>
                    <Button variant="secondary" size="sm">View Course</Button>
                </Link>
            </div>
        </CardFooter>
    </Card>
);

const Courses: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();

    const { data: courses, isLoading, isError, error, refetch } = useQuery<Course[], Error>({
        queryKey: ['courses', siteId],
        queryFn: () => getCourses(siteId!),
        enabled: !!siteId,
    });

    // FIX: The useCan hook expects a single scope string. Mapped 'create' action to 'school:write' scope.
    const canCreateCourses = can('school:write');

    return (
        <div>
            <PageHeader
                title="Courses"
                subtitle="Browse and manage all available courses."
                actions={
                    canCreateCourses && (
                        <Button onClick={() => alert('New course form would open.')}>
                            Create Course
                        </Button>
                    )
                }
            />
            {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
            {isError && <ErrorState title="Failed to load courses" message={error.message} onRetry={refetch} />}
            {!isLoading && !isError && (
                courses && courses.length > 0
                    ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map(course => <CourseCard key={course.id} course={course} />)}
                        </div>
                    )
                    : <EmptyState title="No courses found" message="Get started by creating a new course." actionText={canCreateCourses ? 'Create Course' : undefined} onAction={canCreateCourses ? () => alert('New course form') : undefined} />
            )}
        </div>
    );
};

export default Courses;
