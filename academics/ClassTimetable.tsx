
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
import { getClassrooms, getTeachers, getSubjects, getTimetableForClass, saveTimetableForClass, getTimetables } from '@/services/sisApi';
import type { Classroom, Teacher, Subject, Timetable, TimetableSlot, DayOfWeek } from '@/types';

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const TimetableGrid: React.FC<{
    timetable: Timetable | undefined;
    onSlotClick: (day: DayOfWeek, period: number) => void;
    subjectMap: Map<string, string>;
    teacherMap: Map<string, string>;
    canUpdate: boolean;
}> = ({ timetable, onSlotClick, subjectMap, teacherMap, canUpdate }) => {
    
    const slotsMap = useMemo(() => {
        const map = new Map<string, TimetableSlot>();
        timetable?.slots.forEach(slot => {
            map.set(`${slot.dayOfWeek}-${slot.period}`, slot);
        });
        return map;
    }, [timetable]);

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
                                const slot = slotsMap.get(`${day}-${period}`);
                                return (
                                    <td 
                                        key={day} 
                                        className={`border p-2 h-24 align-top text-xs relative ${canUpdate ? 'cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/50' : ''}`}
                                        onClick={() => canUpdate && onSlotClick(day, period)}
                                    >
                                        {slot ? (
                                            <div>
                                                <p className="font-bold">{subjectMap.get(slot.subjectId) || 'Unknown Subject'}</p>
                                                <p className="text-gray-600 dark:text-gray-400">{teacherMap.get(slot.teacherId) || 'Unknown Teacher'}</p>
                                                {slot.room && <p className="text-xs text-gray-500 mt-1">Room: {slot.room}</p>}
                                            </div>
                                        ) : (
                                            canUpdate && <span className="text-gray-400">+</span>
                                        )}
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


const ClassTimetable: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    
    const [selectedClassroomId, setSelectedClassroomId] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<{ day: DayOfWeek, period: number, subjectId: string, teacherId: string, room: string } | null>(null);

    const canRead = can('read', 'academics.timetable', { kind: 'site', id: siteId! });
    const canUpdate = can('update', 'academics.timetable', { kind: 'site', id: siteId! });

    // Data fetching
    const { data: classrooms = [] } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!) });
    const { data: teachers = [] } = useQuery<Teacher[], Error>({ queryKey: ['teachers', siteId], queryFn: () => getTeachers(siteId!) });
    const { data: subjects = [] } = useQuery<Subject[], Error>({ queryKey: ['subjects', siteId], queryFn: () => getSubjects(siteId!) });
    
    const { data: timetable, isLoading: isLoadingTimetable } = useQuery<Timetable | undefined, Error>({
        queryKey: ['timetable', selectedClassroomId],
        queryFn: () => getTimetableForClass(selectedClassroomId),
        enabled: !!selectedClassroomId,
    });

    const { data: allTimetables = [] } = useQuery<Timetable[], Error>({
        queryKey: ['timetables', siteId],
        queryFn: () => getTimetables(siteId!),
        enabled: canUpdate, // Only fetch all timetables if user can update (for conflict checks)
    });
    
    // Memoized maps
    const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);
    const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);
    
    // Mutation
    const saveMutation = useMutation({
        mutationFn: (newSlots: TimetableSlot[]) => saveTimetableForClass(selectedClassroomId, newSlots),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timetable', selectedClassroomId] });
            queryClient.invalidateQueries({ queryKey: ['timetables', siteId] });
            setIsModalOpen(false);
        },
        onError: (err: Error) => alert(`Failed to save timetable: ${err.message}`),
    });

    // Event Handlers
    const handleSlotClick = (day: DayOfWeek, period: number) => {
        const existingSlot = timetable?.slots.find(s => s.dayOfWeek === day && s.period === period);
        setEditingSlot({ 
            day, 
            period, 
            subjectId: existingSlot?.subjectId || '', 
            teacherId: existingSlot?.teacherId || '',
            room: existingSlot?.room || '' 
        });
        setIsModalOpen(true);
    };

    const handleModalSave = () => {
        if (!editingSlot) return;

        // --- Teacher Conflict Detection ---
        const { day, period, teacherId } = editingSlot;
        if (teacherId) {
            for (const tt of allTimetables) {
                // Don't check against the current class's own timetable
                if (tt.classroomId === selectedClassroomId) continue;
                
                const conflict = tt.slots.find(slot => 
                    slot.dayOfWeek === day && 
                    slot.period === period && 
                    slot.teacherId === teacherId
                );
                
                if (conflict) {
                    const conflictingClass = classrooms.find(c => c.id === tt.classroomId)?.name || 'another class';
                    alert(`Conflict Detected: ${teacherMap.get(teacherId)} is already assigned to ${conflictingClass} at this time.`);
                    return; // Stop the save
                }
            }
        }

        const otherSlots = timetable?.slots.filter(s => !(s.dayOfWeek === editingSlot.day && s.period === editingSlot.period)) || [];
        
        let newSlots = [...otherSlots];
        if (editingSlot.subjectId && editingSlot.teacherId) { // Only add/update if both are selected
             newSlots.push({
                dayOfWeek: editingSlot.day,
                period: editingSlot.period,
                subjectId: editingSlot.subjectId,
                teacherId: editingSlot.teacherId,
                room: editingSlot.room,
            });
        }
        
        saveMutation.mutate(newSlots);
    };

    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to view timetables." />;
    }

    return (
        <div>
            <PageHeader title="Class Timetable" subtitle="View and manage weekly schedules for each class." />

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <label htmlFor="classroom-select" className="font-semibold">Select Classroom:</label>
                        <select
                            id="classroom-select"
                            value={selectedClassroomId}
                            onChange={e => setSelectedClassroomId(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600"
                        >
                            <option value="">-- Select --</option>
                            {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoadingTimetable && <div className="flex justify-center p-8"><Spinner /></div>}
                    {!selectedClassroomId && <EmptyState title="No Class Selected" message="Please select a classroom to view its timetable." />}
                    {selectedClassroomId && !isLoadingTimetable && (
                        <TimetableGrid 
                            timetable={timetable} 
                            onSlotClick={handleSlotClick}
                            subjectMap={subjectMap}
                            teacherMap={teacherMap}
                            canUpdate={canUpdate}
                        />
                    )}
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Edit Slot: ${editingSlot?.day}, Period ${editingSlot?.period}`}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleModalSave} isLoading={saveMutation.isPending} className="ml-2">Save Slot</Button>
                    </>
                }
            >
                {editingSlot && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Subject</label>
                            <select value={editingSlot.subjectId} onChange={e => setEditingSlot(s => s ? {...s, subjectId: e.target.value} : null)} className="mt-1 w-full rounded-md">
                                <option value="">-- Remove Slot --</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Teacher</label>
                            <select value={editingSlot.teacherId} onChange={e => setEditingSlot(s => s ? {...s, teacherId: e.target.value} : null)} className="mt-1 w-full rounded-md">
                                <option value="">-- Select Teacher --</option>
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Room</label>
                            <input type="text" value={editingSlot.room} onChange={e => setEditingSlot(s => s ? { ...s, room: e.target.value } : null)} className="mt-1 w-full rounded-md" placeholder="e.g. Room 101, Lab A" />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ClassTimetable;
