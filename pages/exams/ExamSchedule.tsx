
import React, { useState, useMemo } from 'react';
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
import { examScheduleApi, getExamGroups, getClassrooms, getSubjects, getTeachers } from '@/services/sisApi';
import type { ExamSchedule, ExamGroup, Classroom, Subject, Teacher } from '@/types';

// --- Form Component ---
const ScheduleForm: React.FC<{
  schedule?: ExamSchedule | null;
  onSave: (schedule: Omit<ExamSchedule, 'id' | 'siteId'> | ExamSchedule) => void;
  onCancel: () => void;
  isSaving: boolean;
  examGroups: ExamGroup[];
  classrooms: Classroom[];
  subjects: Subject[];
  teachers: Teacher[];
}> = ({ schedule, onSave, onCancel, isSaving, examGroups, classrooms, subjects, teachers }) => {
  const [formState, setFormState] = useState({
    examGroupId: schedule?.examGroupId ?? '',
    classroomId: schedule?.classroomId ?? '',
    subjectId: schedule?.subjectId ?? '',
    examDate: schedule?.examDate ?? '',
    startTime: schedule?.startTime ?? '',
    endTime: schedule?.endTime ?? '',
    roomNo: schedule?.roomNo ?? '',
    maxMarks: schedule?.maxMarks ?? 100,
    minMarks: schedule?.minMarks ?? 40,
    invigilatorId: schedule?.invigilatorId ?? '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormState(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (schedule) {
      onSave({ ...schedule, ...formState });
    } else {
      onSave(formState as Omit<ExamSchedule, 'id' | 'siteId'>);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium">Exam Group<span className="text-red-500">*</span></label><select name="examGroupId" value={formState.examGroupId} onChange={handleChange} required className="mt-1 w-full rounded-md"><option value="">Select Group</option>{examGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
        <div><label className="block text-sm font-medium">Classroom<span className="text-red-500">*</span></label><select name="classroomId" value={formState.classroomId} onChange={handleChange} required className="mt-1 w-full rounded-md"><option value="">Select Class</option>{classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label className="block text-sm font-medium">Subject<span className="text-red-500">*</span></label><select name="subjectId" value={formState.subjectId} onChange={handleChange} required className="mt-1 w-full rounded-md"><option value="">Select Subject</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label className="block text-sm font-medium">Date<span className="text-red-500">*</span></label><input type="date" name="examDate" value={formState.examDate} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
        <div><label className="block text-sm font-medium">Start Time<span className="text-red-500">*</span></label><input type="time" name="startTime" value={formState.startTime} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
        <div><label className="block text-sm font-medium">End Time<span className="text-red-500">*</span></label><input type="time" name="endTime" value={formState.endTime} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
        <div><label className="block text-sm font-medium">Room No.<span className="text-red-500">*</span></label><input type="text" name="roomNo" value={formState.roomNo} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
        <div><label className="block text-sm font-medium">Max Marks<span className="text-red-500">*</span></label><input type="number" name="maxMarks" value={formState.maxMarks} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
        <div><label className="block text-sm font-medium">Passing Marks<span className="text-red-500">*</span></label><input type="number" name="minMarks" value={formState.minMarks} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
        <div><label className="block text-sm font-medium">Invigilator</label><select name="invigilatorId" value={formState.invigilatorId} onChange={handleChange} className="mt-1 w-full rounded-md"><option value="">Select Teacher</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
      </div>
      <div className="hidden"><button type="submit"/></div>
    </form>
  );
};

// --- Table Component ---
const SchedulesTable: React.FC<{
  schedules: ExamSchedule[];
  onEdit: (schedule: ExamSchedule) => void;
  onDelete: (id: string) => void;
  canUpdate: boolean;
  canDelete: boolean;
  subjectMap: Map<string, string>;
  teacherMap: Map<string, string>;
  deleteMutation: any;
}> = ({ schedules, onEdit, onDelete, canUpdate, canDelete, subjectMap, teacherMap, deleteMutation }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Subject</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date & Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Room</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Invigilator</th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {schedules.map(s => (
            <tr key={s.id}>
              <td className="px-6 py-4 whitespace-nowrap font-medium">{subjectMap.get(s.subjectId) || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap">{new Date(s.examDate + 'T00:00:00').toLocaleDateString()} ({s.startTime} - {s.endTime})</td>
              <td className="px-6 py-4 whitespace-nowrap">{s.roomNo}</td>
              <td className="px-6 py-4 whitespace-nowrap">{s.invigilatorId ? teacherMap.get(s.invigilatorId) : 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                {canUpdate && <Button size="sm" variant="secondary" onClick={() => onEdit(s)}>Edit</Button>}
                {canDelete && <Button size="sm" variant="danger" onClick={() => onDelete(s.id)} isLoading={deleteMutation.isPending && deleteMutation.variables === s.id}>Delete</Button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Main Component ---
const ExamSchedulePage: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<ExamSchedule | null>(null);
    const [filters, setFilters] = useState({ examGroupId: 'all', classroomId: 'all' });

    const canRead = can('read', 'exams.schedule', { kind: 'site', id: siteId! });
    const canCreate = can('create', 'exams.schedule', { kind: 'site', id: siteId! });
    const canUpdate = can('update', 'exams.schedule', { kind: 'site', id: siteId! });
    const canDelete = can('delete', 'exams.schedule', { kind: 'site', id: siteId! });

    // Data queries
    const { data: schedules, isLoading, isError, error } = useQuery<ExamSchedule[], Error>({ queryKey: ['examSchedules', siteId], queryFn: () => examScheduleApi.get(siteId!), enabled: canRead });
    const { data: examGroups = [] } = useQuery<ExamGroup[], Error>({ queryKey: ['examGroups', siteId], queryFn: () => getExamGroups(siteId!), enabled: canRead });
    const { data: classrooms = [] } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!), enabled: canRead });
    const { data: subjects = [] } = useQuery<Subject[], Error>({ queryKey: ['subjects', siteId], queryFn: () => getSubjects(siteId!), enabled: canRead });
    const { data: teachers = [] } = useQuery<Teacher[], Error>({ queryKey: ['teachers', siteId], queryFn: () => getTeachers(siteId!), enabled: canRead });
    
    // Memoized maps for display
    const examGroupMap = useMemo(() => new Map(examGroups.map(g => [g.id, g.name])), [examGroups]);
    const classroomMap = useMemo(() => new Map(classrooms.map(c => [c.id, c.name])), [classrooms]);
    const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);
    const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);

    // Mutations
    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['examSchedules', siteId] });
            setIsModalOpen(false);
        },
        onError: (e: Error) => alert(`Error: ${e.message}`),
    };
    const addMutation = useMutation({ mutationFn: (newSchedule: Omit<ExamSchedule, 'id' | 'siteId'>) => examScheduleApi.add(newSchedule), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (schedule: ExamSchedule) => examScheduleApi.update(schedule.id, schedule), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => examScheduleApi.delete(id), ...mutationOptions });

    // Event Handlers
    const handleAddClick = () => { setSelectedSchedule(null); setIsModalOpen(true); };
    const handleEditClick = (schedule: ExamSchedule) => { setSelectedSchedule(schedule); setIsModalOpen(true); };
    const handleDeleteClick = (id: string) => { if (window.confirm('Are you sure you want to delete this schedule?')) deleteMutation.mutate(id); };
    const handleSave = (schedule: Omit<ExamSchedule, 'id' | 'siteId'> | ExamSchedule) => {
        'id' in schedule ? updateMutation.mutate(schedule) : addMutation.mutate(schedule);
    };

    const filteredSchedules = useMemo(() => {
        return schedules?.filter(s =>
            (filters.examGroupId === 'all' || s.examGroupId === filters.examGroupId) &&
            (filters.classroomId === 'all' || s.classroomId === filters.classroomId)
        ) || [];
    }, [schedules, filters]);

    const groupedSchedules = useMemo(() => {
        const groups = new Map<string, ExamSchedule[]>();
        filteredSchedules.forEach(schedule => {
            const key = schedule.classroomId;
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(schedule);
        });
        groups.forEach(schedulesInGroup => schedulesInGroup.sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()));
        return groups;
    }, [filteredSchedules]);
    
    if (!canRead) return <ErrorState title="Access Denied" message="You do not have permission to view exam schedules." />;
    if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
    if (isError) return <ErrorState title="Failed to load schedules" message={error.message} />;

    return (
        <div>
            <PageHeader title="Exam Schedule" subtitle="Create and manage exam timetables." actions={canCreate && <Button onClick={handleAddClick}>Schedule Exam</Button>} />
            
            <Card className="mb-6">
                <CardHeader><h3 className="font-semibold">Filter Schedule</h3></CardHeader>
                <CardContent className="flex flex-wrap items-center gap-4">
                    <div><label className="block text-sm font-medium">Exam Group</label><select value={filters.examGroupId} onChange={e => setFilters(f => ({ ...f, examGroupId: e.target.value }))} className="mt-1 rounded-md"><option value="all">All Groups</option>{examGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
                    <div><label className="block text-sm font-medium">Classroom</label><select value={filters.classroomId} onChange={e => setFilters(f => ({ ...f, classroomId: e.target.value }))} className="mt-1 rounded-md"><option value="all">All Classes</option>{classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                </CardContent>
            </Card>

            {Array.from(groupedSchedules.entries()).length > 0 ? (
                Array.from(groupedSchedules.entries()).map(([classroomId, schedulesForClass]) => (
                    <Card key={classroomId} className="mb-6">
                        <CardHeader>
                            <div>
                                <h3 className="font-semibold text-lg">{classroomMap.get(classroomId) || 'Unknown Class'}</h3>
                                <p className="text-sm text-gray-500">{examGroupMap.get(schedulesForClass[0]?.examGroupId) || 'General'}</p>
                            </div>
                        </CardHeader>
                        <SchedulesTable schedules={schedulesForClass} onEdit={handleEditClick} onDelete={handleDeleteClick} canUpdate={canUpdate} canDelete={canDelete} subjectMap={subjectMap} teacherMap={teacherMap} deleteMutation={deleteMutation} />
                    </Card>
                ))
            ) : (
                <Card><CardContent><EmptyState title="No Schedules Found" message="No exam schedules match your filters. Try creating one." actionText={canCreate ? 'Schedule Exam' : undefined} onAction={canCreate ? handleAddClick : undefined} /></CardContent></Card>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedSchedule ? 'Edit Exam Schedule' : 'Schedule New Exam'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} isLoading={addMutation.isPending || updateMutation.isPending} className="ml-2">Save</Button>
                    </>
                }>
                <ScheduleForm schedule={selectedSchedule} onSave={handleSave} onCancel={() => setIsModalOpen(false)} isSaving={addMutation.isPending || updateMutation.isPending} examGroups={examGroups} classrooms={classrooms} subjects={subjects} teachers={teachers} />
            </Modal>
        </div>
    );
};

export default ExamSchedulePage;
