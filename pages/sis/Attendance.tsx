
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
// FIX: Corrected import path for sisApi
import { getClassrooms, getStudentsByClassroom, getAttendanceForClass, saveAttendance } from '@/services/sisApi';
import { useCan } from '@/hooks/useCan';
// FIX: Corrected import path for domain types.
import type { Classroom, Student, Attendance } from '@/types';

// Helper to get today's date in YYYY-MM-DD format
const getTodayString = () => new Date().toISOString().split('T')[0];

type AttendanceStatus = Attendance['status'];
const ATTENDANCE_STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

const statusColors: { [key in AttendanceStatus]: string } = {
  PRESENT: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
  ABSENT: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
  LATE: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
  EXCUSED: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
};

type AttendanceState = {
    status: AttendanceStatus;
    reason: string;
};

const Attendance: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();
    const queryClient = useQueryClient();

    const [selectedDate, setSelectedDate] = useState(getTodayString);
    const [selectedClassroom, setSelectedClassroom] = useState('');
    const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceState>>({});

    const canRecordAttendance = can('create', 'school.attendance', { kind: 'site', id: siteId! });
    const canReadAttendance = can('read', 'school.attendance', { kind: 'site', id: siteId! });

    const { data: classrooms, isLoading: isLoadingClassrooms } = useQuery<Classroom[], Error>({
        queryKey: ['classrooms', siteId],
        queryFn: () => getClassrooms(siteId!),
        enabled: !!siteId,
    });
    
    const { data: students, isLoading: isLoadingStudents, isError: isErrorStudents } = useQuery<Student[], Error>({
        queryKey: ['students', selectedClassroom],
        queryFn: () => getStudentsByClassroom(selectedClassroom),
        enabled: !!selectedClassroom,
    });

    const { data: initialAttendance } = useQuery<Attendance[], Error>({
        queryKey: ['attendance', selectedClassroom, selectedDate],
        queryFn: () => getAttendanceForClass(selectedClassroom, selectedDate),
        enabled: !!selectedClassroom && !!selectedDate,
    });

    useEffect(() => {
        const newAttendanceData: Record<string, AttendanceState> = {};
        if (students) {
            students.forEach(student => {
                const record = initialAttendance?.find(att => att.studentId === student.id);
                // Default to 'PRESENT' if no record exists for the day
                newAttendanceData[student.id] = {
                    status: record ? record.status : 'PRESENT',
                    reason: record ? record.reason || '' : ''
                };
            });
        }
        setAttendanceData(newAttendanceData);
    }, [students, initialAttendance]);

    const attendanceSummary = useMemo(() => {
        if (!students) return { total: 0, present: 0, absent: 0, late: 0, excused: 0 };
        const counts = {
            total: students.length,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
        };
        students.forEach(student => {
            const status = attendanceData[student.id]?.status;
            switch (status) {
                case 'PRESENT': counts.present++; break;
                case 'ABSENT': counts.absent++; break;
                case 'LATE': counts.late++; break;
                case 'EXCUSED': counts.excused++; break;
            }
        });
        return counts;
    }, [students, attendanceData]);

    const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                status: status
            }
        }));
    };
    
    const handleReasonChange = (studentId: string, reason: string) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                reason: reason
            }
        }));
    };

    const handleMarkAll = (status: AttendanceStatus) => {
        if (!students) return;
        const newAttendanceData: Record<string, AttendanceState> = {};
        students.forEach(student => {
            newAttendanceData[student.id] = {
                status: status,
                reason: '' // Clear reason when bulk updating
            };
        });
        setAttendanceData(newAttendanceData);
    };
    
    const handleNotifyParents = () => {
        const absentStudents = students?.filter(s => attendanceData[s.id]?.status === 'ABSENT') || [];
        if (absentStudents.length === 0) {
            alert('No students are marked as absent.');
            return;
        }
        alert(`Simulating sending SMS/Email notifications to parents of ${absentStudents.length} absent students.`);
    };


    const saveMutation = useMutation({
        mutationFn: () => {
            const recordsToSave = Object.entries(attendanceData).map(([studentId, data]) => ({
                studentId,
                status: data.status,
                reason: data.reason,
                date: selectedDate,
            }));
            return saveAttendance(recordsToSave);
        },
        onSuccess: () => {
            alert('Attendance saved successfully!');
            queryClient.invalidateQueries({ queryKey: ['attendance', selectedClassroom, selectedDate] });
        },
        onError: (error: any) => {
            alert(`Failed to save attendance: ${error.message}`);
        }
    });
    
    const hasChanges = useMemo(() => {
        if (!students || !initialAttendance) return Object.keys(attendanceData).length > 0 && !initialAttendance;

        for (const student of students) {
            const initialRecord = initialAttendance?.find(r => r.studentId === student.id);
            const initialStatus = initialRecord?.status ?? 'PRESENT';
            const initialReason = initialRecord?.reason ?? '';
            
            const currentData = attendanceData[student.id];
            if (!currentData) return false; // Data not loaded yet

            if (currentData.status !== initialStatus || currentData.reason !== initialReason) {
                return true;
            }
        }
        return false;
    }, [attendanceData, initialAttendance, students]);

    return (
        <div>
            <PageHeader
                title="Attendance by Date"
                subtitle="View, verify, and manage attendance records for a specific date."
                actions={
                    canReadAttendance && (
                        <Link to={`/school/${siteId}/attendance/records`}>
                            <Button variant="secondary">View Reports</Button>
                        </Link>
                    )
                }
            />
            <Card>
                <CardContent>
                    <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                            <label htmlFor="date-picker" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                            <input
                                type="date"
                                id="date-picker"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="classroom-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Classroom</label>
                            <select
                                id="classroom-select"
                                value={selectedClassroom}
                                onChange={(e) => setSelectedClassroom(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                disabled={isLoadingClassrooms}
                            >
                                <option value="">{isLoadingClassrooms ? 'Loading...' : 'Select a classroom'}</option>
                                {classrooms?.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {!selectedClassroom && (
                        <div className="text-center py-10">
                            <p className="text-gray-500 dark:text-gray-400">Please select a classroom to view attendance.</p>
                        </div>
                    )}

                    {selectedClassroom && students && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <Card>
                                <CardHeader><h3 className="font-semibold">Attendance Summary</h3></CardHeader>
                                <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                                    <div><p className="text-2xl font-bold">{attendanceSummary.total}</p><p className="text-sm text-gray-500">Total</p></div>
                                    <div><p className="text-2xl font-bold text-green-600">{attendanceSummary.present}</p><p className="text-sm text-gray-500">Present</p></div>
                                    <div><p className="text-2xl font-bold text-red-600">{attendanceSummary.absent}</p><p className="text-sm text-gray-500">Absent</p></div>
                                    <div><p className="text-2xl font-bold text-yellow-600">{attendanceSummary.late}</p><p className="text-sm text-gray-500">Late</p></div>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><h3 className="font-semibold">Auto-Attendance Tools</h3></CardHeader>
                                <CardContent className="flex flex-col sm:flex-row gap-4">
                                    <Button variant="secondary" className="w-full" onClick={() => alert('This would import attendance from a Zoom/Meet log for this class and date.')}>Import from Zoom/Meet</Button>
                                    <Button variant="secondary" className="w-full" onClick={() => alert('This would open a camera view to scan student ID QR codes.')}>Start QR Scan</Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {selectedClassroom && (
                        <>
                            {isLoadingStudents && <div className="flex justify-center p-8"><Spinner /></div>}
                            {isErrorStudents && <ErrorState title="Failed to load students" message="Could not fetch student list for this class." />}
                            {students && students.length === 0 && <EmptyState title="No students in class" message="This classroom does not have any enrolled students." />}
                            
                            {students && students.length > 0 && (
                                <>
                                    <div className="flex flex-wrap justify-between items-center mb-4 px-1">
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Mark Individual Attendance</h3>
                                        {canRecordAttendance && (
                                            <div className="space-x-2 flex-shrink-0 mt-2 sm:mt-0">
                                                <Button variant="secondary" size="sm" onClick={() => handleMarkAll('PRESENT')}>Mark All Present</Button>
                                                <Button variant="secondary" size="sm" onClick={() => handleMarkAll('ABSENT')}>Mark All Absent</Button>
                                                <Button variant="secondary" size="sm" onClick={handleNotifyParents}>Notify Absentees</Button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        {students.map(student => {
                                        const currentStudentData = attendanceData[student.id];
                                        const showReasonInput = currentStudentData && ['ABSENT', 'LATE', 'EXCUSED'].includes(currentStudentData.status);
                                        return (
                                            <div key={student.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                                                <p className="font-medium text-gray-900 dark:text-white mb-2 sm:mb-0 sm:w-1/4">{student.firstName} {student.lastName}</p>
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 w-full sm:w-3/4">
                                                    <fieldset>
                                                        <legend className="sr-only">Attendance for {student.firstName}</legend>
                                                        <div className="flex items-center flex-wrap gap-x-2 gap-y-2">
                                                            {ATTENDANCE_STATUSES.map(status => (
                                                                <div key={status} className="flex items-center">
                                                                    <input
                                                                        id={`${student.id}-${status}`}
                                                                        name={`attendance-${student.id}`}
                                                                        type="radio"
                                                                        checked={currentStudentData?.status === status}
                                                                        onChange={() => handleStatusChange(student.id, status)}
                                                                        disabled={!canRecordAttendance}
                                                                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                                                    />
                                                                    <label htmlFor={`${student.id}-${status}`} className={`ml-1 block text-sm font-medium leading-6 px-2 py-0.5 rounded-md border ${currentStudentData?.status === status ? statusColors[status] : 'text-gray-900 dark:text-gray-300 border-transparent'}`}>
                                                                        {status}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </fieldset>
                                                    {showReasonInput && (
                                                        <input
                                                            type="text"
                                                            placeholder="Reason (optional)"
                                                            value={currentStudentData.reason}
                                                            onChange={(e) => handleReasonChange(student.id, e.target.value)}
                                                            disabled={!canRecordAttendance}
                                                            className="mt-2 sm:mt-0 block w-full sm:w-auto flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-900 dark:border-gray-600"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        )
                                        })}
                                        {canRecordAttendance && (
                                            <div className="flex justify-end pt-4">
                                                <Button
                                                    onClick={() => saveMutation.mutate()}
                                                    isLoading={saveMutation.isPending}
                                                    disabled={!hasChanges || saveMutation.isPending}
                                                >
                                                    Save Attendance
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Attendance;
