
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { getStudents, getClassrooms } from '@/services/sisApi';
import { useCan } from '@/hooks/useCan';
// FIX: Corrected import path for domain types from '@/constants' to '@/types' to resolve module resolution errors.
import type { Student, Classroom, StudentStatus } from '@/types';

const statusOptions: StudentStatus[] = ['ENROLLED', 'TRANSFERRED', 'GRADUATED', 'ARCHIVED'];

const StudentReport: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();
    
    const [filters, setFilters] = useState({
        classroomId: 'all',
        status: 'all',
        startDate: '',
        endDate: '',
    });

    const canRead = can('read', 'school.students', { kind: 'site', id: siteId! });
    const canExport = can('export', 'school.students', { kind: 'site', id: siteId! });
    
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

    const filteredStudents = useMemo(() => {
        if (!students) return [];
        return students.filter(student => {
            const classMatch = filters.classroomId === 'all' || student.classroomId === filters.classroomId;
            const statusMatch = filters.status === 'all' || student.status === filters.status;
            const startDateMatch = !filters.startDate || new Date(student.dob) >= new Date(filters.startDate); // Using DOB as a mock enrollment date
            const endDateMatch = !filters.endDate || new Date(student.dob) <= new Date(filters.endDate);
            return classMatch && statusMatch && startDateMatch && endDateMatch;
        });
    }, [students, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to view student reports." />;
    }

    return (
        <div>
            <PageHeader
                title="Student Report"
                subtitle="Filter and view student data. Export reports for analysis."
                actions={
                    canExport && (
                        <Button 
                            onClick={() => alert(`Exporting ${filteredStudents.length} records...`)}
                            disabled={filteredStudents.length === 0}
                        >
                            Export Data
                        </Button>
                    )
                }
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
                            <label htmlFor="status" className="block text-sm font-medium">Status</label>
                            <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600">
                                <option value="all">All Statuses</option>
                                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium">Enrollment After</label>
                            <input type="date" id="startDate" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600" />
                        </div>
                         <div>
                            <label htmlFor="endDate" className="block text-sm font-medium">Enrollment Before</label>
                            <input type="date" id="endDate" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {isLoadingStudents && <div className="flex justify-center p-8"><Spinner /></div>}
                    {isError && <ErrorState title="Failed to load student data" message={error.message} />}
                    {!isLoadingStudents && !isError && (
                        filteredStudents.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Classroom</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredStudents.map(student => (
                                            <tr key={student.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{student.firstName} {student.lastName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{classroomMap.get(student.classroomId) || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{student.email || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{student.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState title="No students found" message="No students match the current filter criteria." />
                        )
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default StudentReport;
