
import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
import { 
    getStudents, 
    getClassrooms, 
    getGuardians, 
    getStudentGuardians, 
    bulkDeleteStudents
} from '@/services/sisApi';
// FIX: Corrected import path for domain types from '@/constants' to '@/types' to resolve module resolution errors.
import type { Student, Classroom, Guardian, StudentGuardian } from '@/types';

type GuardianInfo = { name: string, phone: string | null };

const BulkDelete: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    
    // State
    const [filters, setFilters] = useState({ classroomId: 'all', searchKeyword: '' });
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Permissions
    // FIX: Corrected useCan call to use a single scope string.
    const canDelete = can('school:write');

    // Data Fetching
    const { data: students, isLoading: isLoadingStudents, isError, error } = useQuery<Student[], Error>({
        queryKey: ['students', siteId],
        queryFn: () => getStudents(siteId!),
        enabled: !!siteId,
    });

    const { data: classrooms, isLoading: isLoadingClassrooms } = useQuery<Classroom[], Error>({
        queryKey: ['classrooms', siteId],
        queryFn: () => getClassrooms(siteId!),
        enabled: !!siteId,
    });
    
    const { data: guardians } = useQuery<Guardian[], Error>({ queryKey: ['guardians', siteId], queryFn: () => getGuardians(siteId!), enabled: !!siteId });
    const { data: studentGuardians } = useQuery<StudentGuardian[], Error>({ queryKey: ['studentGuardians', siteId], queryFn: () => getStudentGuardians(siteId!), enabled: !!siteId });
    
    // Data Processing
    const classroomMap = useMemo(() => classrooms ? new Map(classrooms.map(c => [c.id, c.name])) : new Map<string, string>(), [classrooms]);
    
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
        const keyword = filters.searchKeyword.toLowerCase();
        return students.filter(student => {
            const classMatch = filters.classroomId === 'all' || student.classroomId === filters.classroomId;
            const keywordMatch = !keyword ||
                `${student.firstName} ${student.lastName}`.toLowerCase().includes(keyword) ||
                student.admissionNo.toLowerCase().includes(keyword) ||
                student.rollNo.toLowerCase().includes(keyword);
            return classMatch && keywordMatch;
        });
    }, [students, filters]);

    // Clear selection when filters change
    useEffect(() => {
        setSelectedStudentIds([]);
    }, [filters]);
    
    // Mutation
    const deleteMutation = useMutation({
        mutationFn: (studentIds: string[]) => bulkDeleteStudents(studentIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students', siteId] });
            setSelectedStudentIds([]);
            setIsModalOpen(false);
            alert(`${selectedStudentIds.length} student(s) deleted successfully.`);
        },
        onError: (err: Error) => {
            alert(`Error deleting students: ${err.message}`);
            setIsModalOpen(false);
        }
    });

    // Event Handlers
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedStudentIds(e.target.checked ? filteredStudents.map(s => s.id) : []);
    };

    const handleSelectOne = (id: string) => {
        setSelectedStudentIds(prev => 
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const handleDeleteClick = () => {
        if (selectedStudentIds.length > 0) {
            setIsModalOpen(true);
        }
    };
    
    const confirmDelete = () => {
        deleteMutation.mutate(selectedStudentIds);
    };

    // Render Logic
    if (!canDelete) {
        return <ErrorState title="Access Denied" message="You do not have permission to bulk delete students." />;
    }

    const isLoading = isLoadingStudents || isLoadingClassrooms;

    return (
        <div>
            <PageHeader
                title="Bulk Delete Students"
                subtitle="Select and permanently delete multiple student records."
            />
            
            <Card className="mb-6">
                <CardHeader><h3 className="font-semibold">Find Students to Delete</h3></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="classroomId" className="block text-sm font-medium">Class</label>
                        <select id="classroomId" name="classroomId" value={filters.classroomId} onChange={e => setFilters({...filters, classroomId: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600" disabled={isLoadingClassrooms}>
                            <option value="all">All Classes</option>
                            {classrooms?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="searchKeyword" className="block text-sm font-medium">Search</label>
                        <input id="searchKeyword" name="searchKeyword" type="text" placeholder="Name, Roll No, Admission No..." value={filters.searchKeyword} onChange={e => setFilters({...filters, searchKeyword: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex justify-between items-center">
                    <h3 className="font-semibold">{selectedStudentIds.length} student(s) selected</h3>
                    <Button 
                        variant="danger" 
                        onClick={handleDeleteClick}
                        disabled={selectedStudentIds.length === 0}
                    >
                        Delete Selected Students
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                    {isError && <ErrorState title="Failed to load students" message={error.message} />}
                    {!isLoading && !isError && (
                        filteredStudents.length > 0 ? (
                             <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th scope="col" className="p-4">
                                                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                                                    onChange={handleSelectAll}
                                                    aria-label="Select all students"
                                                />
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase">Admission No</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase">Class</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase">Guardian</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase">Phone</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredStudents.map((student) => (
                                            <tr key={student.id} className={selectedStudentIds.includes(student.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}>
                                                <td className="p-4">
                                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        checked={selectedStudentIds.includes(student.id)}
                                                        onChange={() => handleSelectOne(student.id)}
                                                        aria-label={`Select ${student.firstName}`}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{student.firstName} {student.lastName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{student.admissionNo}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{classroomMap.get(student.classroomId) || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{studentGuardianMap.get(student.id)?.name || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{studentGuardianMap.get(student.id)?.phone || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <EmptyState title="No students found" message="No students match your search criteria." />
                    )}
                </CardContent>
            </Card>
            
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Confirm Deletion"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button
                            variant="danger"
                            onClick={confirmDelete}
                            isLoading={deleteMutation.isPending}
                            className="ml-2"
                        >
                            Confirm & Delete
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Are you sure you want to permanently delete <strong>{selectedStudentIds.length}</strong> student record(s)?
                </p>
                <p className="mt-2 font-bold text-red-600 dark:text-red-400">This action is irreversible and cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default BulkDelete;
