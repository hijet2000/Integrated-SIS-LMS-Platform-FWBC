
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent } from '@/components/ui/Card';
// FIX: Corrected import path for sisApi
import { getGradesBySite, getStudents } from '@/services/sisApi';
import { useCan } from '@/hooks/useCan';
// FIX: Corrected import path for domain types.
import type { Grade, Student } from '@/types';

const GradesTable: React.FC<{ grades: Grade[], students: Student[] }> = ({ grades, students }) => {
    const studentMap = new Map(students.map(s => [s.id, `${s.firstName} ${s.lastName}`]));
    
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subject</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Grade</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {grades.map((grade) => (
                        <tr key={grade.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{studentMap.get(grade.studentId) || grade.studentId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{grade.subjectName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{grade.itemName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{grade.score}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{grade.gradeLetter}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Grades: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();

    const { data: grades, isLoading, isError, error, refetch } = useQuery<Grade[], Error>({
        queryKey: ['grades', siteId],
        queryFn: () => getGradesBySite(siteId!),
        enabled: !!siteId,
    });
    
    const { data: students } = useQuery<Student[], Error>({
        queryKey: ['students', siteId],
        queryFn: () => getStudents(siteId!),
        enabled: !!siteId,
    });

    // FIX: The useCan hook expects a single scope string. Mapped 'create' action to 'school:write' scope.
    const canCreateGrades = can('school:write');

    return (
        <div>
            <PageHeader
                title="Grades & Exams"
                subtitle="View and manage student grades and assessment results."
                actions={
                    canCreateGrades && (
                        <Button onClick={() => alert('Grade entry form would open.')}>
                            Record Grade
                        </Button>
                    )
                }
            />
            <Card>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                    {isError && <ErrorState title="Failed to load grades" message={error.message} onRetry={refetch} />}
                    {!isLoading && !isError && (
                        grades && grades.length > 0 && students
                            ? <GradesTable grades={grades} students={students} />
                            : <EmptyState title="No grades found" message="Get started by recording a grade for an assignment or exam." actionText={canCreateGrades ? 'Record Grade' : undefined} onAction={canCreateGrades ? () => alert('Grade entry form') : undefined} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Grades;
