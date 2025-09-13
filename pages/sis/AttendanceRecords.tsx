
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent } from '@/components/ui/Card';
// FIX: Corrected import path for sisApi
import { getClassrooms, getStudentsByClassroom, getAttendanceForDateRange } from '@/services/sisApi';
import { useCan } from '@/hooks/useCan';
// FIX: Corrected import path for domain types.
import type { Classroom, Student, Attendance } from '@/types';

// Helper to get today's date in YYYY-MM-DD format
const getTodayString = () => new Date().toISOString().split('T')[0];
// Helper to get date string from X days ago
const getDateStringDaysAgo = (days: number) => new Date(Date.now() - 86400000 * days).toISOString().split('T')[0];

type AttendanceStatus = Attendance['status'];

const statusCell: { [key in AttendanceStatus]: { char: string, className: string } } = {
  PRESENT: { char: 'P', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
  ABSENT: { char: 'A', className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
  LATE: { char: 'L', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
  EXCUSED: { char: 'E', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
};

const InfoIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;

const AttendanceRecords: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();

    const [filter, setFilter] = useState({
        classroomId: '',
        startDate: getDateStringDaysAgo(30),
        endDate: getTodayString(),
    });
    const [threshold, setThreshold] = useState(75);

    const [queryParams, setQueryParams] = useState<{ classroomId: string; startDate: string; endDate: string } | null>(null);

    // FIX: The useCan hook expects a single scope string. Mapped 'read' action to 'school:read' scope.
    const canReadAttendance = can('school:read');

    const { data: classrooms, isLoading: isLoadingClassrooms } = useQuery<Classroom[], Error>({
        queryKey: ['classrooms', siteId],
        queryFn: () => getClassrooms(siteId!),
        enabled: !!siteId,
    });
    
    const { data: students, isLoading: isLoadingStudents } = useQuery<Student[], Error>({
        queryKey: ['students', queryParams?.classroomId],
        queryFn: () => getStudentsByClassroom(queryParams!.classroomId),
        enabled: !!queryParams?.classroomId,
    });

    const { data: attendance, isLoading: isLoadingAttendance, isError, error } = useQuery<Attendance[], Error>({
        queryKey: ['attendanceRecords', queryParams],
        queryFn: () => getAttendanceForDateRange(queryParams!.classroomId, queryParams!.startDate, queryParams!.endDate),
        enabled: !!queryParams,
    });
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilter(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleApplyFilter = () => {
        if (filter.classroomId) {
            setQueryParams(filter);
        } else {
            alert('Please select a classroom.');
        }
    };
    
    const { dateHeaders, processedAttendance, studentStats } = useMemo(() => {
        if (!attendance || !students || !queryParams) return { dateHeaders: [], processedAttendance: new Map(), studentStats: new Map() };

        const dateHeaders: string[] = [];
        const start = new Date(queryParams.startDate + 'T00:00:00');
        const end = new Date(queryParams.endDate + 'T00:00:00');

        for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
            dateHeaders.push(new Date(dt).toISOString().split('T')[0]);
        }
        
        const processed = new Map<string, Map<string, { status: AttendanceStatus; reason?: string | null }>>();
        const stats = new Map<string, { present: number; total: number; percentage: number }>();

        students.forEach(student => {
            processed.set(student.id, new Map());
            let presentCount = 0;
            let totalCount = 0;
            dateHeaders.forEach(date => {
                const record = attendance.find(a => a.studentId === student.id && a.date === date);
                if (record) {
                    processed.get(student.id)!.set(date, { status: record.status, reason: record.reason });
                    totalCount++;
                    if (['PRESENT', 'LATE', 'EXCUSED'].includes(record.status)) {
                        presentCount++;
                    }
                }
            });
            const percentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 100;
            stats.set(student.id, { present: presentCount, total: totalCount, percentage });
        });
        
        return { dateHeaders, processedAttendance: processed, studentStats: stats };
    }, [attendance, students, queryParams]);

    if (!canReadAttendance) {
        return <ErrorState title="Access Denied" message="You do not have permission to view attendance reports." />;
    }

    return (
        <div>
            <PageHeader
                title="Attendance Reports"
                subtitle="Analyze historical attendance data and identify students below threshold."
            />
            <Card>
                <CardContent>
                    <div className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                            <label htmlFor="classroom-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Classroom</label>
                            <select id="classroom-select" name="classroomId" value={filter.classroomId} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" disabled={isLoadingClassrooms}>
                                <option value="">{isLoadingClassrooms ? 'Loading...' : 'Select classroom'}</option>
                                {classrooms?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                            <input type="date" id="start-date" name="startDate" value={filter.startDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                            <input type="date" id="end-date" name="endDate" value={filter.endDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
                        </div>
                         <div>
                            <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alert Threshold (%)</label>
                            <input type="number" id="threshold" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600" />
                        </div>
                        <Button onClick={handleApplyFilter} isLoading={isLoadingAttendance}>View Report</Button>
                    </div>

                    {isLoadingAttendance && <div className="flex justify-center p-8"><Spinner /></div>}
                    {isError && <ErrorState title="Failed to load records" message={(error as Error).message} onRetry={handleApplyFilter} />}
                    
                    {!queryParams && <div className="text-center py-10"><p className="text-gray-500 dark:text-gray-400">Select a classroom and date range to view a report.</p></div>}
                    
                    {queryParams && !isLoadingAttendance && !isError && (
                        students && students.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th scope="col" className="sticky left-0 bg-gray-50 dark:bg-gray-700 px-6 py-3 text-left text-xs font-medium uppercase">Student Name</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase">Present</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase">Total Days</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase">Attendance %</th>
                                            {dateHeaders.map(date => (
                                                <th key={date} scope="col" className="px-2 py-3 text-center text-xs font-medium uppercase">{new Date(date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {students.map(student => {
                                            const stats = studentStats.get(student.id);
                                            const isBelowThreshold = stats && stats.percentage < threshold;
                                            return (
                                            <tr key={student.id} className={isBelowThreshold ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                                                <td className="sticky left-0 bg-white dark:bg-gray-800 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{student.firstName} {student.lastName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{stats?.present || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{stats?.total || 0}</td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${isBelowThreshold ? 'text-red-600' : ''}`}>{stats?.percentage.toFixed(1) || '100.0'}%</td>
                                                {dateHeaders.map(date => {
                                                    const record = processedAttendance.get(student.id)?.get(date);
                                                    const status = record?.status;
                                                    const reason = record?.reason;
                                                    return (
                                                        <td key={date} className="px-2 py-4 whitespace-nowrap text-sm text-center">
                                                            {status ? (
                                                                <div className="flex items-center justify-center" title={reason || undefined}>
                                                                    <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${statusCell[status].className}`}>{statusCell[status].char}</span>
                                                                    {reason && <InfoIcon />}
                                                                </div>
                                                             ) : (
                                                                <span className="text-gray-400">-</span>
                                                             )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        )})}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                           <EmptyState title="No Records Found" message="No attendance records found for the selected criteria, or the class has no students." /> 
                        )
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AttendanceRecords;
