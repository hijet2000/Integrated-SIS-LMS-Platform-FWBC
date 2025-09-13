
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { useCan } from '@/hooks/useCan';
// FIX: Correct import path for sisApi
import { getTeachers, getTimetables, getSubjects, getClassrooms } from '@/services/sisApi';
// FIX: Correct import path for domain types.
import type { Teacher, Timetable, Subject, Classroom, DayOfWeek } from '@/types';

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const TeacherTimetableGrid: React.FC<{
    teacherId: string;
    timetables: Timetable[];
    subjectMap: Map<string, string>;
    classroomMap: Map<string, string>;
}> = ({ teacherId, timetables, subjectMap, classroomMap }) => {
    
    const teacherSchedule = useMemo(() => {
        const schedule = new Map<string, { subject: string, class: string }>();
        timetables.forEach(tt => {
            tt.slots.forEach(slot => {
                if (slot.teacherId === teacherId) {
                    schedule.set(`${slot.dayOfWeek}-${slot.period}`, {
                        subject: subjectMap.get(slot.subjectId) || '?',
                        class: classroomMap.get(tt.classroomId) || '?',
                    });
                }
            });
        });
        return schedule;
    }, [teacherId, timetables, subjectMap, classroomMap]);

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700">
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="border p-2 text-xs">Period</th>
                        {DAYS_OF_WEEK.map(day => <th key={day} className="border p-2 text-xs">{day}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {PERIODS.map(period => (
                        <tr key={period}>
                            <td className="border p-2 text-center font-semibold text-xs bg-gray-50 dark:bg-gray-700">{period}</td>
                            {DAYS_OF_WEEK.map(day => {
                                const slot = teacherSchedule.get(`${day}-${period}`);
                                return (
                                    <td key={day} className="border p-2 h-20 align-top text-xs">
                                        {slot ? (
                                            <div>
                                                <p className="font-bold">{slot.subject}</p>
                                                <p className="text-gray-600 dark:text-gray-400">{slot.class}</p>
                                            </div>
                                        ) : null}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const TeachersTimetable: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();
    const [selectedTeacherId, setSelectedTeacherId] = useState('');

    const canRead = can('read', 'academics.timetable', { kind: 'site', id: siteId! });

    // Data fetching
    const { data: teachers = [], isLoading: isLoadingTeachers } = useQuery<Teacher[], Error>({ queryKey: ['teachers', siteId], queryFn: () => getTeachers(siteId!) });
    const { data: timetables = [], isLoading: isLoadingTimetables } = useQuery<Timetable[], Error>({ queryKey: ['timetables', siteId], queryFn: () => getTimetables(siteId!) });
    const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery<Subject[], Error>({ queryKey: ['subjects', siteId], queryFn: () => getSubjects(siteId!) });
    const { data: classrooms = [], isLoading: isLoadingClassrooms } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!) });
    
    // Memoized maps
    const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);
    const classroomMap = useMemo(() => new Map(classrooms.map(c => [c.id, c.name])), [classrooms]);

    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to view timetables." />;
    }

    const isLoading = isLoadingTeachers || isLoadingTimetables || isLoadingSubjects || isLoadingClassrooms;

    return (
        <div>
            <PageHeader title="Teacher's Timetable" subtitle="View weekly schedules for each teacher." />

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <label htmlFor="teacher-select" className="font-semibold">Select Teacher:</label>
                        <select
                            id="teacher-select"
                            value={selectedTeacherId}
                            onChange={e => setSelectedTeacherId(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600"
                        >
                            <option value="">-- Select --</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                    {!selectedTeacherId && !isLoading && <EmptyState title="No Teacher Selected" message="Please select a teacher to view their timetable." />}
                    {selectedTeacherId && !isLoading && (
                        <TeacherTimetableGrid 
                            teacherId={selectedTeacherId}
                            timetables={timetables}
                            subjectMap={subjectMap}
                            classroomMap={classroomMap}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

// FIX: Add default export to resolve lazy loading error in App.tsx.
export default TeachersTimetable;
