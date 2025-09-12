
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { getCourseById, getModulesForCourse, getLessonsForModule } from '@/services/lmsApi';
// FIX: Corrected import path for type definitions.
import type { Module, Lesson } from '@/types';

const LessonItem: React.FC<{ lesson: Lesson }> = ({ lesson }) => (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md">
        <div className="flex items-center space-x-3">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{lesson.title}</p>
        </div>
        {lesson.status === 'DRAFT' && (
             <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                Draft
            </span>
        )}
    </div>
);

const ModuleSection: React.FC<{ module: Module }> = ({ module }) => {
    const { data: lessons, isLoading, isError } = useQuery<Lesson[], Error>({
        queryKey: ['lessons', module.id],
        queryFn: () => getLessonsForModule(module.id),
    });

    return (
        <Card className="mb-4">
            <CardHeader>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white">{module.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{module.summary}</p>
            </CardHeader>
            <CardContent>
                {isLoading && <Spinner size="sm" />}
                {isError && <p className="text-red-500 text-sm">Could not load lessons.</p>}
                {lessons && (
                    <div className="space-y-2">
                        {lessons.map(lesson => <LessonItem key={lesson.id} lesson={lesson} />)}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

const CourseDetail: React.FC = () => {
    const { courseId, siteId } = useParams<{ courseId: string, siteId: string }>();

    const { data: course, isLoading: isLoadingCourse, isError: isErrorCourse, error: courseError } = useQuery({
        queryKey: ['course', courseId],
        queryFn: () => getCourseById(courseId!),
        enabled: !!courseId,
    });
    
    const { data: modules, isLoading: isLoadingModules, isError: isErrorModules, error: modulesError } = useQuery<Module[], Error>({
        queryKey: ['modules', courseId],
        queryFn: () => getModulesForCourse(courseId!),
        enabled: !!courseId,
    });

    if (isLoadingCourse) return <div className="flex justify-center p-8"><Spinner /></div>;
    if (isErrorCourse) return <ErrorState title="Failed to load course" message={(courseError as Error).message} />;
    if (!course) return <ErrorState title="Course not found" message="This course does not exist." />;

    return (
        <div>
            <div className="mb-4">
                {/* FIX: Corrected link to navigate back to the main courses page */}
                <Link to={`/education/${siteId}/courses`} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">&larr; Back to Courses</Link>
            </div>
            <PageHeader
                title={course.title}
                subtitle={course.description}
            />

            <div className="mt-6">
                {isLoadingModules && <div className="flex justify-center p-8"><Spinner /></div>}
                {isErrorModules && <ErrorState title="Failed to load modules" message={(modulesError as Error).message} />}
                {modules && modules.map(module => <ModuleSection key={module.id} module={module} />)}
            </div>
        </div>
    );
};

export default CourseDetail;
