
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { useCan } from '@/hooks/useCan';
import { 
    getStudents, 
    getClassrooms, 
    getMultiClassEnrollments, 
    addMultiClassEnrollment, 
    deleteMultiClassEnrollment 
} from '@/services/sisApi';
// FIX: Corrected import path for domain types from '@/constants' to '@/types' to resolve module resolution errors.
import type { Student, Classroom, MultiClassEnrollment } from '@/types';

// Main Component
const MultiClassStudent: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();

    // Permissions
    const canRead = can('read', 'student.multi-class', { kind: 'site', id: siteId! });
    const canCreate = can('create', 'student.multi-class', { kind: 'site', id: siteId! });
    const canDelete = can('delete', 'student.multi-class', { kind: 'site', id: siteId! });

    // State for the assignment form
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedClassroomId, setSelectedClassroomId] = useState('');

    // Data fetching
    const { data: students = [], isLoading: isLoadingStudents } = useQuery<Student[], Error>({
        queryKey: ['students', siteId],
        queryFn: () => getStudents(siteId!),
        enabled: canRead
    });
    const { data: classrooms = [], isLoading: isLoadingClassrooms } = useQuery<Classroom[], Error>({
        queryKey: ['classrooms', siteId],
        queryFn: () => getClassrooms(siteId!),
        enabled: canRead
    });
    const { data: enrollments = [], isLoading: isLoadingEnrollments } = useQuery<MultiClassEnrollment[], Error>({
        queryKey: ['multiClassEnrollments', siteId],
        queryFn: () => getMultiClassEnrollments(siteId!),
        enabled: canRead
    });

    // Mutations
    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['multiClassEnrollments', siteId] });
            setSelectedStudentId('');
            setSelectedClassroomId('');
        },
        onError: (err: Error) => alert(`Operation failed: ${err.message}`),
    };

    const addMutation = useMutation({
        mutationFn: (data: { studentId: string; classroomId: string }) => addMultiClassEnrollment(data),
        ...mutationOptions
    });

    const deleteMutation = useMutation({
        mutationFn: (enrollmentId: string) => deleteMultiClassEnrollment(enrollmentId),
        ...mutationOptions
    });

    // Memoized maps and data processing
    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);
    const classroomMap = useMemo(() => new Map(classrooms.map(c => [c.id, c.name])), [classrooms]);

    const selectedStudent = useMemo(() => studentMap.get(selectedStudentId), [selectedStudentId, studentMap]);

    const enrollmentsByStudent = useMemo(() => {
        const map = new Map<string, MultiClassEnrollment[]>();
        enrollments.forEach(enrollment => {
            if (!map.has(enrollment.studentId)) {
                map.set(enrollment.studentId, []);
            }
            map.get(enrollment.studentId)!.push(enrollment);
        });
        return map;
    }, [enrollments]);

    // Event Handlers
    const handleAssign = () => {
        if (!selectedStudentId || !selectedClassroomId) {
            alert('Please select a student and a class.');
            return;
        }
        if (enrollments.some(e => e.studentId === selectedStudentId && e.classroomId === selectedClassroomId)) {
            alert('This student is already enrolled in this class.');
            return;
        }
        addMutation.mutate({ studentId: selectedStudentId, classroomId: selectedClassroomId });
    };

    const handleDelete = (enrollmentId: string) => {
        if (window.confirm('Are you sure you want to remove this class assignment?')) {
            deleteMutation.mutate(enrollmentId);
        }
    };

    // Render logic
    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to manage multi-class students." />;
    }

    const isLoading = isLoadingStudents || isLoadingClassrooms || isLoadingEnrollments;

    return (
        <div>
            <PageHeader
                title="Multi Class Student"
                subtitle="Assign students to additional classes or subject groups."
            />

            {canCreate && (
                <Card className="mb-6">
                    <CardHeader>
                        <h3 className="font-semibold text-lg">Assign Student to an Additional Class</h3>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium">Select Student</label>
                            <select 
                                value={selectedStudentId} 
                                onChange={e => setSelectedStudentId(e.target.value)}
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600"
                                disabled={isLoadingStudents}
                            >
                                <option value="">-- Select a student --</option>
                                {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNo})</option>)}
                            </select>
                            {selectedStudent && <p className="text-xs text-gray-500 mt-1">Main Class: {classroomMap.get(selectedStudent.classroomId)}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Select Additional Class</label>
                             <select 
                                value={selectedClassroomId} 
                                onChange={e => setSelectedClassroomId(e.target.value)}
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600"
                                disabled={isLoadingClassrooms || !selectedStudent}
                            >
                                <option value="">-- Select a class --</option>
                                {classrooms
                                    .filter(c => c.id !== selectedStudent?.classroomId)
                                    .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <Button 
                                onClick={handleAssign} 
                                disabled={!selectedStudentId || !selectedClassroomId || addMutation.isPending}
                                isLoading={addMutation.isPending}
                            >
                                Assign
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <h3 className="font-semibold text-lg">Multi-Class Enrollments</h3>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                    {!isLoading && enrollmentsByStudent.size === 0 && (
                        <EmptyState title="No Multi-Class Enrollments" message="No students are currently assigned to additional classes." />
                    )}
                    {!isLoading && enrollmentsByStudent.size > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Main Class</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Additional Classes</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {Array.from(enrollmentsByStudent.entries()).map(([studentId, studentEnrollments]) => {
                                        const student = studentMap.get(studentId);
                                        if (!student) return null;
                                        return (
                                            <tr key={studentId}>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium">
                                                    <Link to={`/school/${siteId}/students/${studentId}`} className="hover:underline text-indigo-600 dark:text-indigo-400">
                                                        {student.firstName} {student.lastName}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">{classroomMap.get(student.classroomId) || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col space-y-2">
                                                        {studentEnrollments.map(enrollment => (
                                                            <div key={enrollment.id} className="flex items-center justify-between">
                                                                <span>{classroomMap.get(enrollment.classroomId) || 'N/A'}</span>
                                                                {canDelete && (
                                                                    <Button 
                                                                        variant="danger" 
                                                                        size="sm" 
                                                                        className="ml-4"
                                                                        onClick={() => handleDelete(enrollment.id)}
                                                                        isLoading={deleteMutation.isPending && deleteMutation.variables === enrollment.id}
                                                                    >
                                                                        Remove
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MultiClassStudent;
