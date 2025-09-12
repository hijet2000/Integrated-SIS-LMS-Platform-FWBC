import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { useCan } from '@/hooks/useCan';
// FIX: Changed import from getOnlineExams to onlineExamApi to match the exported member from sisApi.
import { onlineExamApi, getOnlineExamResults, getStudents } from '@/services/sisApi';
// FIX: Corrected import path for domain types from '@/constants' to '@/types' to resolve module resolution errors.
import type { OnlineExam, OnlineExamResult, Student } from '@/types';

// Simple hardcoded grading logic
const calculateGrade = (score: number, maxMarks: number, minMarks: number): { grade: string; status: 'Pass' | 'Fail' } => {
    if (score < minMarks) return { grade: 'F', status: 'Fail' };
    const percentage = (score / maxMarks) * 100;
    if (percentage >= 90) return { grade: 'A+', status: 'Pass' };
    if (percentage >= 80) return { grade: 'A', status: 'Pass' };
    if (percentage >= 70) return { grade: 'B', status: 'Pass' };
    if (percentage >= 60) return { grade: 'C', status: 'Pass' };
    if (percentage >= 50) return { grade: 'D', status: 'Pass' };
    return { grade: 'E', status: 'Pass' };
};

const OnlineExamResult: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();
    const [selectedExamId, setSelectedExamId] = useState('');

    const canRead = can('read', 'online-exams.result', { kind: 'site', id: siteId! });

    const { data: exams = [], isLoading: l1 } = useQuery<OnlineExam[], Error>({
        queryKey: ['onlineExams', siteId],
        queryFn: () => onlineExamApi.get(siteId!),
        enabled: canRead,
    });

    const { data: results = [], isLoading: l2 } = useQuery<OnlineExamResult[], Error>({
        queryKey: ['onlineExamResults', selectedExamId],
        queryFn: () => getOnlineExamResults(siteId!, selectedExamId),
        enabled: canRead && !!selectedExamId,
    });

    const { data: students = [], isLoading: l3 } = useQuery<Student[], Error>({
        queryKey: ['students', siteId],
        queryFn: () => getStudents(siteId!),
        enabled: canRead,
    });
    
    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);
    const selectedExam = useMemo(() => exams.find(e => e.id === selectedExamId), [exams, selectedExamId]);

    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to view online exam results." />;
    }
    
    const isLoading = l1 || l2 || l3;

    return (
        <div>
            <PageHeader title="Online Exam Result" subtitle="View results for completed digital assessments." />
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <label htmlFor="exam-select" className="font-semibold">Select Exam:</label>
                        <select
                            id="exam-select"
                            value={selectedExamId}
                            onChange={e => setSelectedExamId(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600"
                        >
                            <option value="">-- Select --</option>
                            {exams.filter(e => e.status === 'COMPLETED').map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                        </select>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading && selectedExamId && <Spinner />}
                    {!selectedExamId && <EmptyState title="No Exam Selected" message="Please select an exam to view results." />}
                    {selectedExamId && !isLoading && (
                        results.length > 0 ? (
                             <div className="overflow-x-auto">
                                <table className="min-w-full divide-y">
                                    <thead><tr>
                                        <th className="px-6 py-3 text-left">Student</th>
                                        <th className="px-6 py-3 text-left">Score</th>
                                        <th className="px-6 py-3 text-left">Percentage</th>
                                        <th className="px-6 py-3 text-left">Grade</th>
                                        <th className="px-6 py-3 text-left">Status</th>
                                    </tr></thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y">
                                        {results.map(result => {
                                            const student = studentMap.get(result.studentId);
                                            if (!student || !selectedExam) return null;
                                            const { grade, status } = calculateGrade(result.score, selectedExam.totalMarks, selectedExam.passingMarks);
                                            const percentage = ((result.score / selectedExam.totalMarks) * 100).toFixed(2);
                                            return (
                                                <tr key={result.id}>
                                                    <td className="px-6 py-4 font-medium">{student.firstName} {student.lastName}</td>
                                                    <td className="px-6 py-4">{result.score} / {selectedExam.totalMarks}</td>
                                                    <td className="px-6 py-4">{percentage}%</td>
                                                    <td className="px-6 py-4 font-bold">{grade}</td>
                                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${status === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{status}</span></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : <EmptyState title="No Results Found" message="No results have been recorded for this exam yet." />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default OnlineExamResult;