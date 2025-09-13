
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { useCan } from '@/hooks/useCan';
import { 
    getExamGroups, 
    getClassrooms, 
    getSubjects, 
    getExamSchedules, 
    getStudentsByClassroom, 
    getMarks, 
    saveMarks 
} from '@/services/sisApi';
import type { ExamGroup, Classroom, Subject, ExamSchedule, Student, Mark } from '@/types';

type MarksEntryState = { [studentId: string]: number | null };

// Simple hardcoded grading logic
const calculateGrade = (marks: number | null, maxMarks: number, minMarks: number): { grade: string; status: 'Pass' | 'Fail' } => {
    if (marks === null || marks < minMarks) return { grade: 'F', status: 'Fail' };
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 90) return { grade: 'A+', status: 'Pass' };
    if (percentage >= 80) return { grade: 'A', status: 'Pass' };
    if (percentage >= 70) return { grade: 'B', status: 'Pass' };
    if (percentage >= 60) return { grade: 'C', status: 'Pass' };
    if (percentage >= 50) return { grade: 'D', status: 'Pass' };
    return { grade: 'E', status: 'Pass' };
};

const ExamResult: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();

    const [filters, setFilters] = useState({
        examGroupId: '',
        classroomId: '',
        subjectId: '',
    });
    const [marksData, setMarksData] = useState<MarksEntryState>({});

    // FIX: Corrected useCan calls to use a single scope string.
    const canRead = can('school:read');
    const canCreate = can('school:write');

    // --- DATA FETCHING ---
    const { data: examGroups = [] } = useQuery<ExamGroup[], Error>({ queryKey: ['examGroups', siteId], queryFn: () => getExamGroups(siteId!), enabled: canRead });
    const { data: classrooms = [] } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!), enabled: canRead });
    const { data: subjects = [] } = useQuery<Subject[], Error>({ queryKey: ['subjects', siteId], queryFn: () => getSubjects(siteId!), enabled: canRead });
    const { data: schedules = [] } = useQuery<ExamSchedule[], Error>({ queryKey: ['examSchedules', siteId], queryFn: () => getExamSchedules(siteId!), enabled: canRead });

    const selectedSchedule = useMemo(() => {
        return schedules.find(s => 
            s.examGroupId === filters.examGroupId &&
            s.classroomId === filters.classroomId &&
            s.subjectId === filters.subjectId
        );
    }, [schedules, filters]);

    const { data: students = [], isLoading: isLoadingStudents } = useQuery<Student[], Error>({
        queryKey: ['studentsByClass', filters.classroomId],
        queryFn: () => getStudentsByClassroom(filters.classroomId),
        enabled: !!filters.classroomId && canRead,
    });
    
    const { data: initialMarks, isLoading: isLoadingMarks } = useQuery<Mark[], Error>({
        queryKey: ['marks', selectedSchedule?.id],
        queryFn: () => getMarks(siteId!, selectedSchedule!.id),
        enabled: !!selectedSchedule && canRead,
    });
    
    // --- MUTATIONS ---
    const saveMutation = useMutation({
        mutationFn: (marksToSave: Omit<Mark, 'id' | 'siteId'>[]) => saveMarks(marksToSave),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['marks', selectedSchedule?.id] });
            alert('Marks saved successfully!');
        },
        onError: (err: Error) => alert(`Failed to save marks: ${err.message}`),
    });

    // --- EFFECTS ---
    useEffect(() => {
        const newMarksData: MarksEntryState = {};
        if (students && initialMarks) {
            students.forEach(student => {
                const mark = initialMarks.find(m => m.studentId === student.id);
                newMarksData[student.id] = mark?.marksObtained ?? null;
            });
        }
        setMarksData(newMarksData);
    }, [initialMarks, students]);

    // --- EVENT HANDLERS ---
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({...prev, [e.target.name]: e.target.value}));
    };
    
    const handleMarkChange = (studentId: string, value: string) => {
        const marks = value === '' ? null : Math.max(0, parseInt(value, 10));
        setMarksData(prev => ({...prev, [studentId]: marks}));
    };
    
    const handleSave = () => {
        if (!selectedSchedule) return;
        const marksToSave = Object.entries(marksData)
            .filter(([, marks]) => marks !== null)
            .map(([studentId, marksObtained]) => ({
                studentId,
                examScheduleId: selectedSchedule.id,
                marksObtained: marksObtained!,
            }));
        saveMutation.mutate(marksToSave);
    };

    if (!canRead) return <ErrorState title="Access Denied" message="You do not have permission to view exam results." />;

    const isLoading = isLoadingStudents || isLoadingMarks;

    return (
        <div>
            <PageHeader title="Exam Result" subtitle="Enter and manage student marks for examinations."/>
            <Card className="mb-6">
                <CardHeader><h3 className="font-semibold">Select Exam</h3></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select name="examGroupId" value={filters.examGroupId} onChange={handleFilterChange} className="rounded-md"><option value="">Select Group</option>{examGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
                    <select name="classroomId" value={filters.classroomId} onChange={handleFilterChange} className="rounded-md"><option value="">Select Class</option>{classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                    <select name="subjectId" value={filters.subjectId} onChange={handleFilterChange} className="rounded-md"><option value="">Select Subject</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {!selectedSchedule && <EmptyState title="No Exam Selected" message="Please select an exam to enter marks." />}
                    {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                    {selectedSchedule && !isLoading && (
                        students.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                <table className="min-w-full divide-y">
                                    <thead><tr>
                                        <th className="px-6 py-3 text-left">Student</th>
                                        <th className="px-6 py-3 text-left">Marks (out of {selectedSchedule.maxMarks})</th>
                                        <th className="px-6 py-3 text-left">Status</th>
                                    </tr></thead>
                                    <tbody>{students.map(student => {
                                        const marks = marksData[student.id];
                                        const { status } = calculateGrade(marks, selectedSchedule.maxMarks, selectedSchedule.minMarks);
                                        return (<tr key={student.id}><td className="px-6 py-4">{student.firstName} {student.lastName}</td><td className="px-6 py-4"><input type="number" value={marks ?? ''} onChange={e => handleMarkChange(student.id, e.target.value)} max={selectedSchedule.maxMarks} min="0" className="w-24 rounded-md" disabled={!canCreate}/></td><td className="px-6 py-4">{status}</td></tr>);
                                    })}</tbody>
                                </table>
                                </div>
                                {canCreate && <div className="flex justify-end mt-4"><Button onClick={handleSave} isLoading={saveMutation.isPending}>Save Marks</Button></div>}
                            </>
                        ) : <EmptyState title="No Students" message="No students found in the selected class." />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ExamResult;
