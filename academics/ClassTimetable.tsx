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
import { getClassrooms, getTeachers, getSubjects, getTimetableForClass, saveTimetableForClass } from '@/services/sisApi';
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

const SlotEditForm: React.FC<{
    slotInfo: { day: DayOfWeek, period: number, slot: TimetableSlot | null };
    onSave: (data: Partial<Omit<TimetableSlot, 'dayOfWeek' | 'period'>>) => void;
    subjects: Subject[];
    teachers: Teacher[];
}> = ({ slotInfo, onSave, subjects, teachers }) => {
    const [formState, setFormState] = useState({
        subjectId: slotInfo.slot?.subjectId || '',
        teacherId: slotInfo.slot?.teacherId || '',
        room: slotInfo.slot?.room || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formState);
    };

    return (
        <form id="slot-edit-form" onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium">Subject</label><select value={formState.subjectId} onChange={e => setFormState(p => ({...p, subjectId: e.target.value}))} className="mt-1 w-full rounded-md"><option value="">- Select Subject -</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium">Teacher</label><select value={formState.teacherId} onChange={e => setFormState(p => ({...p, teacherId: e.target.value}))} className="mt-1 w-full rounded-md"><option value="">- Select Teacher -</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium">Room (Optional)</label><input type="text" value={formState.room} onChange={e => setFormState(p => ({...p, room: e.target.value}))} className="mt-1 w-full rounded-md"/></div>
            <button type="submit" className="hidden" />
        </form>
    );
};

const ClassTimetable: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    
    const [selectedClassroomId, setSelectedClassroomId] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<{ day: DayOfWeek, period: number, slot: TimetableSlot | null } | null>(null);

    const canRead = can('school:read');
    const canUpdate = can('school:write');

    const { data: classrooms = [], isLoading: isLoadingClassrooms } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!), enabled: canRead });
    const { data: teachers = [] } = useQuery<Teacher[], Error>({ queryKey: ['teachers', siteId], queryFn: () => getTeachers(siteId!), enabled: canRead });
    const { data: subjects = [] } = useQuery<Subject[], Error>({ queryKey: ['subjects', siteId], queryFn: () => getSubjects(siteId!), enabled: canRead });
    const { data: timetable, isLoading: isLoadingTimetable } = useQuery<Timetable | undefined, Error>({ queryKey: ['timetable', selectedClassroomId], queryFn: () => getTimetableForClass(selectedClassroomId), enabled: !!selectedClassroomId });

    const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);
    const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);

    const saveMutation = useMutation({
        mutationFn: (slots: TimetableSlot[]) => saveTimetableForClass(selectedClassroomId, slots),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timetable', selectedClassroomId] });
            setIsModalOpen(false);
        },
        onError: (err: Error) => alert(`Failed to save: ${err.message}`),
    });

    const handleSlotClick = (day: DayOfWeek, period: number) => {
        const slot = timetable?.slots.find(s => s.dayOfWeek === day && s.period === period);
        setEditingSlot({ day, period, slot: slot || null });
        setIsModalOpen(true);
    };

    const handleSaveSlot = (slotData: Partial<Omit<TimetableSlot, 'dayOfWeek' | 'period'>>) => {
        if (!editingSlot) return;

        let newSlots = timetable?.slots ? [...timetable.slots] : [];
        newSlots = newSlots.filter(s => !(s.dayOfWeek === editingSlot.day && s.period === editingSlot.period));

        if (slotData.subjectId && slotData.teacherId) {
            newSlots.push({
                dayOfWeek: editingSlot.day,
                period: editingSlot.period,
                subjectId: slotData.subjectId,
                teacherId: slotData.teacherId,
                room: slotData.room,
            });
        }
        saveMutation.mutate(newSlots);
    };

    if (!canRead) return <ErrorState title="Access Denied" message="You do not have permission to view timetables." />;

    return (
        <div>
            <PageHeader
                title="Class Timetable"
                subtitle="View and manage weekly schedules for each class."
            />

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <label htmlFor="classroom-select" className="font-semibold">Select Classroom:</label>
                        <select
                            id="classroom-select"
                            value={selectedClassroomId}
                            onChange={(e) => setSelectedClassroomId(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600"
                            disabled={isLoadingClassrooms}
                        >
                            <option value="">-- Select --</option>
                            {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </CardHeader>
                <CardContent>
                    {selectedClassroomId ? (
                        isLoadingTimetable ? (
                            <div className="flex justify-center p-8"><Spinner /></div>
                        ) : (
                            <TimetableGrid 
                                timetable={timetable} 
                                onSlotClick={handleSlotClick} 
                                subjectMap={subjectMap} 
                                teacherMap={teacherMap} 
                                canUpdate={canUpdate}
                            />
                        )
                    ) : (
                        <EmptyState title="Select a Class" message="Please select a classroom to view or manage its timetable." />
                    )}
                </CardContent>
            </Card>

            {editingSlot && (
                <Modal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    title={`Edit Slot: ${editingSlot.day} - Period ${editingSlot.period}`}
                    footer={
                        <div className="w-full flex justify-between items-center">
                            <Button
                                variant="danger"
                                onClick={() => handleSaveSlot({})}
                            >
                                Clear Slot
                            </Button>
                            <div className="space-x-2">
                                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button
                                    type="submit"
                                    form="slot-edit-form"
                                    isLoading={saveMutation.isPending}
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    }
                >
                    <SlotEditForm 
                        slotInfo={editingSlot}
                        onSave={handleSaveSlot}
                        subjects={subjects}
                        teachers={teachers}
                    />
                </Modal>
            )}
        </div>
    );
};

export default ClassTimetable;