
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { getStudents, getClassrooms, updateStudent } from '@/services/sisApi';
import { useCan } from '@/hooks/useCan';
// FIX: Corrected import path for domain types from '@/constants' to '@/types' to resolve module resolution errors.
import type { Student, Classroom, StudentStatus } from '@/types';

const statusOptions: StudentStatus[] = ['TRANSFERRED', 'GRADUATED', 'ARCHIVED'];

const statusColors: { [key in StudentStatus]: string } = {
    ENROLLED: 'bg-green-100 text-green-800 dark:bg-green-900/50',
    TRANSFERRED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50',
    GRADUATED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50',
    ARCHIVED: 'bg-gray-100 text-gray-800 dark:bg-gray-700',
};


const DisabledStudents: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    
    const [filters, setFilters] = useState({
        classroomId: 'all',
        status: 'all',
    });

    const canRead = can('read', 'school.students', { kind: 'site', id: siteId! });
    const canUpdate = can('update', 'school.students', { kind: 'site', id: siteId! });
    
    const { data: students, isLoading: isLoadingStudents, isError, error } = useQuery<Student[], Error>({
        queryKey: ['students', siteId],
        queryFn: () => getStudents(siteId!),
        enabled: !!siteId && canRead,
    });

    const { data: classrooms, isLoading: isLoadingClassrooms } = useQuery<Classroom[], Error>({
        queryKey: ['classrooms', siteId],
        queryFn: () => getClassrooms(siteId!),
        enabled: !!siteId && canRead,
    });
    
    const classroomMap = useMemo(() => 
        classrooms ? new Map(classrooms.map(c => [c.id, c.name])) : new Map(),
    [classrooms]);

    const reactivateMutation = useMutation({
        mutationFn: (studentId: string) => updateStudent(studentId, { status: 'ENROLLED' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students', siteId] });
            alert('Student has been re-enabled.');
        },
        onError: (err: Error) => {
            alert(`Failed to re-enable student: ${err.message}`);
        }
    });

    const filteredStudents = useMemo(() => {
        if (!students) return [];
        // First, filter for only disabled students
        const disabled = students.filter(s => s.status !== 'ENROLLED');
        // Then, apply UI filters
        return disabled.filter(student => {
            const classMatch = filters.classroomId === 'all' || student.classroomId === filters.classroomId;
            const statusMatch = filters.status === 'all' || student.status === filters.status;
            return classMatch && statusMatch;
        });
    }, [students, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to view this page." />;
    }

    const isLoading = isLoadingStudents || isLoadingClassrooms;

    return (
        <div>
            <PageHeader
                title="Disabled Students"
                subtitle="View and manage students who are not currently active."
            />

            <Card className="mb-6">
                <CardHeader><h3 className="font-semibold">Filters</h3></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label htmlFor="classroomId" className="block text-sm font-medium">Classroom</label>
                            <select id="classroomId" name="classroomId" value={filters.classroomId} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600" disabled={isLoadingClassrooms}>
                                <option value="all">All Classrooms</option>
                                {classrooms?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium">Disable Reason</label>
                            <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600">
                                <option value="all">All Reasons</option>
                                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                    {isError && <ErrorState title="Failed to load student data" message={error.message} />}
                    {!isLoading && !isError && (
                        filteredStudents.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Classroom</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Admission No</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Reason (Status)</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredStudents.map(student => (
                                            <tr key={student.id}>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium">{student.firstName} {student.lastName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{classroomMap.get(student.classroomId) || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{student.admissionNo}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[student.status]}`}>{student.status}</span></td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                                    <Link to={`/school/${siteId}/students/${student.id}`}>
                                                        <Button variant="secondary" size="sm">View</Button>
                                                    </Link>
                                                    {canUpdate && (
                                                        <Button 
                                                            size="sm"
                                                            onClick={() => reactivateMutation.mutate(student.id)}
                                                            isLoading={reactivateMutation.isPending && reactivateMutation.variables === student.id}
                                                        >
                                                            Re-enable
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState title="No Disabled Students" message="No students match the current filters or all students are active." />
                        )
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DisabledStudents;
