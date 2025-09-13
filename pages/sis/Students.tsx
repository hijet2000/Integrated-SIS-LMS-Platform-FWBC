
import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
// FIX: Corrected import path for sisApi
import { getStudents, getClassrooms, getGuardians, getStudentGuardians, deleteStudent, bulkDeleteStudents } from '@/services/sisApi';
import { useCan } from '@/hooks/useCan';
// FIX: Corrected import path for domain types.
import type { Student, Classroom, Guardian, StudentGuardian } from '@/types';

type GuardianInfo = { name: string, phone: string | null };

const StudentsTable: React.FC<{
    students: Student[];
    classrooms: Map<string, string>;
    guardians: Map<string, GuardianInfo>;
    onSelectionChange: (selectedIds: string[]) => void;
    selectedIds: string[];
    canUpdate: boolean;
    canDelete: boolean;
    onDelete: (id: string) => void;
    deletingStudentId?: string;
}> = ({ students, classrooms, guardians, selectedIds, onSelectionChange, canUpdate, canDelete, onDelete, deletingStudentId }) => {
    const { siteId } = useParams<{ siteId: string }>();

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            onSelectionChange(students.map(s => s.id));
        } else {
            onSelectionChange([]);
        }
    };

    const handleSelectOne = (id: string) => {
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="p-4">
                            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                checked={selectedIds.length === students.length && students.length > 0}
                                onChange={handleSelectAll}
                                aria-label="Select all students"
                            />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase">Admission No</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase">Roll No</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase">Class</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase">Guardian</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase">Phone</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {students.map((student) => (
                        <tr key={student.id}>
                            <td className="p-4">
                                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={selectedIds.includes(student.id)}
                                    onChange={() => handleSelectOne(student.id)}
                                    aria-label={`Select ${student.firstName}`}
                                />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{student.admissionNo}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{student.rollNo}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Link to={`/school/${siteId}/students/${student.id}`} className="hover:underline text-indigo-600 dark:text-indigo-400">
                                    {student.firstName} {student.lastName}
                                </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{classrooms.get(student.classroomId) || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{guardians.get(student.id)?.name || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{guardians.get(student.id)?.phone || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                               <Link to={`/school/${siteId}/students/${student.id}`}>
                                    <Button variant="secondary" size="sm">View</Button>
                                </Link>
                                {canUpdate && (
                                    <Link to={`/school/${siteId}/students/${student.id}`}>
                                        <Button variant="secondary" size="sm">Edit</Button>
                                    </Link>
                                )}
                                {canDelete && (
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => onDelete(student.id)}
                                        isLoading={deletingStudentId === student.id}
                                    >
                                        Delete
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Students: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();
    const queryClient = useQueryClient();
    
    const [filters, setFilters] = useState({ classroomId: 'all', keyword: '' });
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

    // FIX: The useCan hook expects a single scope string. Mapped 'read' action to 'school:read' scope.
    const canReadStudents = can('school:read');
    // FIX: The useCan hook expects a single scope string. Mapped 'update' action to 'school:write' scope.
    const canUpdate = can('school:write');
    // FIX: The useCan hook expects a single scope string. Mapped 'delete' action to 'school:write' scope.
    const canDelete = can('school:write');

    const { data: students, isLoading: isLoadingStudents, isError, error } = useQuery<Student[], Error>({
        queryKey: ['students', siteId],
        queryFn: () => getStudents(siteId!),
        enabled: !!siteId && canReadStudents,
    });

    const { data: classrooms, isLoading: isLoadingClassrooms } = useQuery<Classroom[], Error>({
        queryKey: ['classrooms', siteId],
        queryFn: () => getClassrooms(siteId!),
        enabled: !!siteId && canReadStudents,
    });

    // Fetch all guardians and relations to build a map
    const { data: guardians } = useQuery<Guardian[], Error>({ queryKey: ['guardians', siteId], queryFn: () => getGuardians(siteId!), enabled: !!siteId });
    const { data: studentGuardians } = useQuery<StudentGuardian[], Error>({ queryKey: ['studentGuardians', siteId], queryFn: () => getStudentGuardians(siteId!), enabled: !!siteId });

    const deleteMutation = useMutation<unknown, Error, string>({
        mutationFn: deleteStudent,
        onSuccess: (_data, studentId) => {
            queryClient.invalidateQueries({ queryKey: ['students', siteId] });
            setSelectedStudentIds(prev => prev.filter(id => id !== studentId));
            alert('Student deleted successfully.');
        },
        onError: (error: Error) => {
            alert(`Failed to delete student: ${error.message}`);
        }
    });

    const bulkDeleteMutation = useMutation<unknown, Error, string[]>({
        mutationFn: bulkDeleteStudents,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students', siteId] });
            alert(`${selectedStudentIds.length} students deleted successfully.`);
            setSelectedStudentIds([]);
        },
        onError: (error: Error) => {
            alert(`Failed to delete students: ${error.message}`);
        }
    });

    const handleDeleteStudent = (studentId: string) => {
        if (window.confirm('Are you sure you want to permanently delete this student? This action cannot be undone.')) {
            deleteMutation.mutate(studentId);
        }
    };

    const handleBulkDelete = () => {
        if (window.confirm(`Are you sure you want to permanently delete ${selectedStudentIds.length} students? This action cannot be undone.`)) {
            bulkDeleteMutation.mutate(selectedStudentIds);
        }
    };

    // Memoized maps for performance
    const classroomMap = useMemo(() => classrooms ? new Map<string, string>(classrooms.map(c => [c.id, c.name])) : new Map<string, string>(), [classrooms]);
    
    const studentGuardianMap = useMemo(() => {
        const map = new Map<string, GuardianInfo>();
        if (!guardians || !studentGuardians) return map;

        const guardianDataMap = new Map(guardians.map(g => [g.id, g]));
        const primaryGuardians = studentGuardians.filter(sg => sg.isPrimary);

        for(const sg of primaryGuardians) {
            const guardian = guardianDataMap.get(sg.guardianId);
            if(guardian) {
                map.set(sg.studentId, { name: guardian.name, phone: guardian.phone });
            }
        }
        return map;
    }, [guardians, studentGuardians]);


    const filteredStudents = useMemo(() => {
        if (!students) return [];
        const keyword = filters.keyword.toLowerCase();
        return students.filter(student => {
            const classMatch = filters.classroomId === 'all' || student.classroomId === filters.classroomId;
            const keywordMatch = !keyword ||
                student.firstName.toLowerCase().includes(keyword) ||
                student.lastName.toLowerCase().includes(keyword) ||
                student.admissionNo.toLowerCase().includes(keyword) ||
                student.rollNo.toLowerCase().includes(keyword);
            return classMatch && keywordMatch;
        });
    }, [students, filters]);

    useEffect(() => {
        // Clear selection when filters change
        setSelectedStudentIds([]);
    }, [filters]);

    if (!canReadStudents) {
        return <ErrorState title="Access Denied" message="You do not have permission to view students." />;
    }

    const isLoading = isLoadingStudents || isLoadingClassrooms;

    return (
        <div>
            <PageHeader
                title="Student Details"
                subtitle="Search, filter, and manage student records."
            />
            
            <Card className="mb-6">
                <CardHeader><h3 className="font-semibold">Find Students</h3></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="classroomId" className="block text-sm font-medium">Class</label>
                        <select id="classroomId" name="classroomId" value={filters.classroomId} onChange={e => setFilters({...filters, classroomId: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600" disabled={isLoadingClassrooms}>
                            <option value="all">All Classes</option>
                            {classrooms?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="keyword" className="block text-sm font-medium">Search Keyword</label>
                        <input id="keyword" name="keyword" type="text" placeholder="Name, Roll No, Admission No..." value={filters.keyword} onChange={e => setFilters({...filters, keyword: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                {(selectedStudentIds.length > 0) && (
                     <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-sm font-semibold">{selectedStudentIds.length} students selected</span>
                        <div className="space-x-2">
                             <Button variant="secondary" size="sm" onClick={() => alert('Bulk print IDs...')}>Print ID Cards</Button>
                             <Button variant="secondary" size="sm" onClick={() => alert('Bulk promote...')}>Promote</Button>
                             {canDelete && (
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={handleBulkDelete}
                                    isLoading={bulkDeleteMutation.isPending}
                                >
                                    Delete Selected
                                </Button>
                             )}
                        </div>
                    </div>
                )}
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                    {isError && <ErrorState title="Failed to load students" message={error.message} />}
                    {!isLoading && !isError && (
                        filteredStudents && filteredStudents.length > 0
                            ? <StudentsTable 
                                students={filteredStudents} 
                                classrooms={classroomMap}
                                guardians={studentGuardianMap}
                                selectedIds={selectedStudentIds}
                                onSelectionChange={setSelectedStudentIds}
                                canUpdate={canUpdate}
                                canDelete={canDelete}
                                onDelete={handleDeleteStudent}
                                deletingStudentId={deleteMutation.variables}
                              />
                            : <EmptyState title="No students found" message="No students match your search criteria." />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Students;
