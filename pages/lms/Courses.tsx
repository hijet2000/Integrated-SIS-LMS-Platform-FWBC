import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardFooter } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { getCourses, createCourse } from '@/services/lmsApi';
import { getTeachers } from '@/services/sisApi';
import { useCan } from '@/hooks/useCan';
// FIX: Corrected import path for type definition.
import type { Course, Teacher } from '@/types';

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

const CourseForm: React.FC<{
    onSave: (data: Omit<Course, 'id' | 'siteId'>) => void;
    onCancel: () => void;
    isSaving: boolean;
    teachers: Teacher[];
}> = ({ onSave, onCancel, isSaving, teachers }) => {
    const [formState, setFormState] = useState({
        code: '',
        title: '',
        description: '',
        status: 'DRAFT' as 'DRAFT' | 'OPEN' | 'CLOSED',
        visibility: 'SITE' as 'PUBLIC' | 'SITE' | 'PRIVATE',
        teachers: [] as string[],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };
    
    const handleTeacherChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTeacherIds = Array.from(e.target.selectedOptions, option => option.value);
        setFormState(prev => ({ ...prev, teachers: selectedTeacherIds }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formState);
    };

    return (
        <form id="course-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Title *</label>
                    <input name="title" value={formState.title} onChange={handleChange} required className="mt-1 w-full rounded-md"/>
                </div>
                <div>
                    <label className="block text-sm font-medium">Course Code *</label>
                    <input name="code" value={formState.code} onChange={handleChange} required className="mt-1 w-full rounded-md"/>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium">Description</label>
                    <textarea name="description" value={formState.description} onChange={handleChange} rows={3} className="mt-1 w-full rounded-md"/>
                </div>
                <div>
                    <label className="block text-sm font-medium">Status</label>
                    <select name="status" value={formState.status} onChange={handleChange} className="mt-1 w-full rounded-md">
                        <option value="DRAFT">Draft</option>
                        <option value="OPEN">Open</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">Visibility</label>
                    <select name="visibility" value={formState.visibility} onChange={handleChange} className="mt-1 w-full rounded-md">
                        <option value="SITE">Site (Enrolled Students)</option>
                        <option value="PUBLIC">Public</option>
                        <option value="PRIVATE">Private (Assigned Teachers Only)</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium">Assign Teachers</label>
                    <select multiple name="teachers" value={formState.teachers} onChange={handleTeacherChange} className="mt-1 w-full rounded-md h-32">
                        {teachers.map(teacher => (
                            <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <button type="submit" className="hidden"/>
        </form>
    );
};

const Courses: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();
    const queryClient = useQueryClient();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: courses, isLoading, isError, error, refetch } = useQuery<Course[], Error>({
        queryKey: ['courses', siteId],
        queryFn: () => getCourses(siteId!),
        enabled: !!siteId,
    });
    
    const { data: teachers = [] } = useQuery<Teacher[], Error>({
        queryKey: ['teachers', siteId],
        queryFn: () => getTeachers(siteId!),
        enabled: !!siteId,
    });

    const createCourseMutation = useMutation({
        mutationFn: (newCourse: Omit<Course, 'id' | 'siteId'>) => createCourse(siteId!, newCourse),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses', siteId] });
            setIsModalOpen(false);
            alert('Course created successfully!');
        },
        onError: (err: Error) => {
            alert(`Failed to create course: ${err.message}`);
        }
    });

    const canCreateCourses = can('school:write');

    return (
        <div>
            <PageHeader
                title="Courses"
                subtitle="Browse and manage all available courses."
                actions={
                    canCreateCourses && (
                        <Button onClick={() => setIsModalOpen(true)}>
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
                    : <EmptyState title="No courses found" message="Get started by creating a new course." actionText={canCreateCourses ? 'Create Course' : undefined} onAction={canCreateCourses ? () => setIsModalOpen(true) : undefined} />
            )}
             <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Course"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button
                            type="submit"
                            form="course-form"
                            className="ml-2"
                            isLoading={createCourseMutation.isPending}
                        >
                            Save Course
                        </Button>
                    </>
                }
            >
                <CourseForm 
                    onSave={(data) => createCourseMutation.mutate(data)}
                    onCancel={() => setIsModalOpen(false)}
                    isSaving={createCourseMutation.isPending}
                    teachers={teachers}
                />
            </Modal>
        </div>
    );
};

export default Courses;