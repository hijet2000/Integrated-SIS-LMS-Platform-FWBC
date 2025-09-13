
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
import { getClassrooms, getTeachers, updateClassroom } from '@/services/sisApi';
import type { Classroom, Teacher } from '@/types';

const AssignTeacher: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
    const [selectedTutorId, setSelectedTutorId] = useState<string | undefined>('');

    const canUpdate = can('update', 'academics.assign-teacher', { kind: 'site', id: siteId! });
    // If a user can update, they should also be able to read the necessary data.
    const canRead = can('read', 'academics.assign-teacher', { kind: 'site', id: siteId! }) || canUpdate;

    const { data: classrooms, isLoading: isLoadingClassrooms, isError, error } = useQuery<Classroom[], Error>({
        queryKey: ['classrooms', siteId],
        queryFn: () => getClassrooms(siteId!),
        enabled: !!siteId && canRead,
    });

    const { data: teachers, isLoading: isLoadingTeachers } = useQuery<Teacher[], Error>({
        queryKey: ['teachers', siteId],
        queryFn: () => getTeachers(siteId!),
        enabled: !!siteId && canRead,
    });

    const teacherMap = useMemo(() => new Map(teachers?.map(t => [t.id, t.name])), [teachers]);

    const assignMutation = useMutation({
        mutationFn: ({ classroomId, tutorId }: { classroomId: string, tutorId?: string }) => 
            updateClassroom(classroomId, { tutorId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classrooms', siteId] });
            setIsModalOpen(false);
        },
        onError: (err: Error) => alert(`Failed to assign teacher: ${err.message}`),
    });

    const handleAssignClick = (classroom: Classroom) => {
        setSelectedClassroom(classroom);
        setSelectedTutorId(classroom.tutorId || '');
        setIsModalOpen(true);
    };

    const handleSaveAssignment = () => {
        if (selectedClassroom) {
            assignMutation.mutate({ classroomId: selectedClassroom.id, tutorId: selectedTutorId });
        }
    };

    if (!canRead) {
         return <ErrorState title="Access Denied" message="You do not have permission to view this page." />;
    }

    if (isLoadingClassrooms || isLoadingTeachers) {
        return <div className="flex justify-center p-8"><Spinner /></div>;
    }
    
    if (isError) {
        return <ErrorState title="Failed to load data" message={(error as Error).message} />;
    }

    return (
        <div>
            <PageHeader
                title="Assign Class Teacher"
                subtitle="Assign a primary tutor to each classroom."
            />

            <Card>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Classroom</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Assigned Teacher</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {classrooms?.map(classroom => (
                                    <tr key={classroom.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">{classroom.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {classroom.tutorId ? teacherMap.get(classroom.tutorId) : <span className="text-gray-500">Not Assigned</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {canUpdate && (
                                                <Button size="sm" onClick={() => handleAssignClick(classroom)}>
                                                    {classroom.tutorId ? 'Change' : 'Assign'} Teacher
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Assign Teacher for ${selectedClassroom?.name}`}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveAssignment} isLoading={assignMutation.isPending} className="ml-2">Save</Button>
                    </>
                }
            >
                <div>
                    <label htmlFor="teacher-select" className="block text-sm font-medium">Select Teacher</label>
                    <select
                        id="teacher-select"
                        value={selectedTutorId}
                        onChange={(e) => setSelectedTutorId(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"
                    >
                        <option value="">-- No Teacher --</option>
                        {teachers?.map(teacher => (
                            <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                        ))}
                    </select>
                </div>
            </Modal>
        </div>
    );
};

export default AssignTeacher;
