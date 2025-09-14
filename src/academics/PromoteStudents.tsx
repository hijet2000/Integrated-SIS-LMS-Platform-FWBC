import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import { useCan } from '@/hooks/useCan';
import { getStudents, getClassrooms, updateStudent } from '@/services/sisApi';
import type { Student, Classroom } from '@/types';

const PromoteStudents: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();

    const [fromClassId, setFromClassId] = useState('');
    const [toClassId, setToClassId] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    
    const canPromote = can('school:write');
    
    const { data: students, isLoading: isLoadingStudents } = useQuery<Student[], Error>({
        queryKey: ['students', siteId],
        queryFn: () => getStudents(siteId!),
        enabled: !!siteId,
    });
    
    const { data: classrooms, isLoading: isLoadingClassrooms } = useQuery<Classroom[], Error>({
        queryKey: ['classrooms', siteId],
        queryFn: () => getClassrooms(siteId!),
        enabled: !!siteId,
    });

    const studentsInFromClass = useMemo(() => {
        return students?.filter(s => s.classroomId === fromClassId && s.status === 'ENROLLED') || [];
    }, [students, fromClassId]);

    const promoteMutation = useMutation({
        mutationFn: async (studentIds: string[]) => {
            const promises = studentIds.map(id => updateStudent(id, { classroomId: toClassId }));
            return Promise.all(promises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students', siteId] });
            alert(`${selectedStudentIds.length} students promoted successfully!`);
            setSelectedStudentIds([]);
            setFromClassId('');
            setToClassId('');
        },
        onError: (err: Error) => alert(`Promotion failed: ${err.message}`),
    });

    const handlePromoteClick = () => {
        if (selectedStudentIds.length === 0) {
            alert('Please select students to promote.');
            return;
        }
        if (window.confirm(`Are you sure you want to promote ${selectedStudentIds.length} students from ${classrooms?.find(c => c.id === fromClassId)?.name} to ${classrooms?.find(c => c.id === toClassId)?.name}?`)) {
            promoteMutation.mutate(selectedStudentIds);
        }
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedStudentIds(e.target.checked ? studentsInFromClass.map(s => s.id) : []);
    };
    
    const handleSelectOne = (id: string) => {
        setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
    };

    if (!canPromote) {
        return <ErrorState title="Access Denied" message="You do not have permission to promote students." />;
    }

    const isLoading = isLoadingStudents || isLoadingClassrooms;

    return (
        <div>
            <PageHeader
                title="Promote Students"
                subtitle="Move students to the next class for the new academic session."
            />

            <Card>
                <CardHeader>
                    <h3 className="font-semibold text-lg">Promotion Workflow</h3>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Promote From Class</label>
                            <select
                                value={fromClassId}
                                onChange={e => { setFromClassId(e.target.value); setSelectedStudentIds([]); }}
                                className="mt-1 block w-full rounded-md"
                                disabled={isLoading}
                            >
                                <option value="">-- Select Source Class --</option>
                                {classrooms?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Promote To Class</label>
                            <select
                                value={toClassId}
                                onChange={e => setToClassId(e.target.value)}
                                className="mt-1 block w-full rounded-md"
                                disabled={isLoading || !fromClassId}
                            >
                                <option value="">-- Select Destination Class --</option>
                                {classrooms?.filter(c => c.id !== fromClassId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {fromClassId && (
                        <div>
                            <h4 className="font-semibold mb-2">Select Students to Promote ({selectedStudentIds.length} selected)</h4>
                            {studentsInFromClass.length > 0 ? (
                                <div className="overflow-x-auto border rounded-md max-h-96">
                                    <table className="min-w-full divide-y">
                                        <thead>
                                            <tr>
                                                <th className="p-2"><input type="checkbox" checked={selectedStudentIds.length === studentsInFromClass.length && studentsInFromClass.length > 0} onChange={handleSelectAll} /></th>
                                                <th className="p-2 text-left">Name</th>
                                                <th className="p-2 text-left">Admission No</th>
                                                <th className="p-2 text-left">Result</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentsInFromClass.map(student => (
                                                <tr key={student.id}>
                                                    <td className="p-2"><input type="checkbox" checked={selectedStudentIds.includes(student.id)} onChange={() => handleSelectOne(student.id)} /></td>
                                                    <td className="p-2">{student.firstName} {student.lastName}</td>
                                                    <td className="p-2">{student.admissionNo}</td>
                                                    <td className="p-2 text-sm">
                                                        {/* Mock logic based on student ID */}
                                                        {parseInt(student.id.replace( /^\D+/g, '').slice(-1), 10) % 3 !== 0 ? 
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Pass</span> :
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">Fail</span>
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : <p className="text-sm text-gray-500">No active students found in the selected class.</p>}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button
                        onClick={handlePromoteClick}
                        disabled={!fromClassId || !toClassId || selectedStudentIds.length === 0 || promoteMutation.isPending}
                        isLoading={promoteMutation.isPending}
                    >
                        Promote {selectedStudentIds.length} Students
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default PromoteStudents;