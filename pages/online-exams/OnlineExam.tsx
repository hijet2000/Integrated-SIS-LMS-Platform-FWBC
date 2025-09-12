import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
import { onlineExamApi, getClassrooms, getSubjects } from '@/services/sisApi';
// FIX: Corrected import path for domain types from '@/constants' to '@/types' to resolve module resolution errors.
import type { OnlineExam, Classroom, Subject, OnlineExamStatus } from '@/types';

const STATUS_OPTIONS: OnlineExamStatus[] = ['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED'];

const statusColors: { [key in OnlineExamStatus]: string } = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-700',
  PUBLISHED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/50',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/50',
};

// --- Form Component ---
const ExamForm: React.FC<{
  exam?: OnlineExam | null;
  onSave: (exam: Omit<OnlineExam, 'id' | 'siteId'> | OnlineExam) => void;
  onCancel: () => void;
  isSaving: boolean;
  classrooms: Classroom[];
  subjects: Subject[];
}> = ({ exam, onSave, onCancel, classrooms, subjects }) => {
  const [formState, setFormState] = useState({
    title: exam?.title ?? '',
    classroomId: exam?.classroomId ?? '',
    subjectId: exam?.subjectId ?? '',
    examDate: exam?.examDate ?? new Date().toISOString().split('T')[0],
    startTime: exam?.startTime ?? '09:00',
    duration: exam?.duration ?? 60,
    totalMarks: exam?.totalMarks ?? 100,
    passingMarks: exam?.passingMarks ?? 40,
    status: exam?.status ?? 'DRAFT',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormState(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (exam) {
      onSave({ ...exam, ...formState });
    } else {
      onSave(formState as Omit<OnlineExam, 'id' | 'siteId'>);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2"><label className="block text-sm font-medium">Exam Title <span className="text-red-500">*</span></label><input type="text" name="title" value={formState.title} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
        <div><label className="block text-sm font-medium">Classroom <span className="text-red-500">*</span></label><select name="classroomId" value={formState.classroomId} onChange={handleChange} required className="mt-1 w-full rounded-md"><option value="">Select Class</option>{classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label className="block text-sm font-medium">Subject <span className="text-red-500">*</span></label><select name="subjectId" value={formState.subjectId} onChange={handleChange} required className="mt-1 w-full rounded-md"><option value="">Select Subject</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><label className="block text-sm font-medium">Date <span className="text-red-500">*</span></label><input type="date" name="examDate" value={formState.examDate} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
        <div><label className="block text-sm font-medium">Start Time <span className="text-red-500">*</span></label><input type="time" name="startTime" value={formState.startTime} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
        <div><label className="block text-sm font-medium">Duration (minutes) <span className="text-red-500">*</span></label><input type="number" name="duration" value={formState.duration} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
        <div><label className="block text-sm font-medium">Total Marks <span className="text-red-500">*</span></label><input type="number" name="totalMarks" value={formState.totalMarks} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
        <div><label className="block text-sm font-medium">Passing Marks <span className="text-red-500">*</span></label><input type="number" name="passingMarks" value={formState.passingMarks} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
        <div><label className="block text-sm font-medium">Status</label><select name="status" value={formState.status} onChange={handleChange} className="mt-1 w-full rounded-md">{STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
      </div>
      <div className="hidden"><button type="submit"/></div>
    </form>
  );
};

// --- Main Component ---
const OnlineExam: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState<OnlineExam | null>(null);

    const canRead = can('read', 'online-exams', { kind: 'site', id: siteId! });
    const canCreate = can('create', 'online-exams', { kind: 'site', id: siteId! });
    const canUpdate = can('update', 'online-exams', { kind: 'site', id: siteId! });
    const canDelete = can('delete', 'online-exams', { kind: 'site', id: siteId! });

    const { data: exams, isLoading, isError, error } = useQuery<OnlineExam[], Error>({
        queryKey: ['onlineExams', siteId],
        queryFn: () => onlineExamApi.get(siteId!),
        enabled: canRead,
    });
    const { data: classrooms = [] } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!), enabled: canRead });
    const { data: subjects = [] } = useQuery<Subject[], Error>({ queryKey: ['subjects', siteId], queryFn: () => getSubjects(siteId!), enabled: canRead });
    
    const classroomMap = useMemo(() => new Map(classrooms.map(c => [c.id, c.name])), [classrooms]);
    const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onlineExams', siteId] });
            setIsModalOpen(false);
        },
        onError: (err: Error) => alert(`Operation failed: ${err.message}`),
    };
    const addMutation = useMutation({ mutationFn: (exam: Omit<OnlineExam, 'id'|'siteId'>) => onlineExamApi.add(exam), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (exam: OnlineExam) => onlineExamApi.update(exam.id, exam), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => onlineExamApi.delete(id), ...mutationOptions });

    const handleSave = (exam: Omit<OnlineExam, 'id' | 'siteId'> | OnlineExam) => {
        'id' in exam ? updateMutation.mutate(exam) : addMutation.mutate(exam);
    };

    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to manage online exams." />;
    }

    return (
        <div>
            <PageHeader title="Online Exam" subtitle="Create and manage digital assessments." actions={canCreate && <Button onClick={() => { setSelectedExam(null); setIsModalOpen(true); }}>Create Exam</Button>} />
            <Card>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                    {isError && <ErrorState title="Failed to load exams" message={error.message} />}
                    {!isLoading && !isError && (
                        exams && exams.length > 0 ? (
                             <div className="overflow-x-auto">
                                <table className="min-w-full divide-y">
                                    <thead><tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Class</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Subject</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date & Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                                    </tr></thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y">
                                        {exams.map(exam => (
                                            <tr key={exam.id}>
                                                <td className="px-6 py-4 font-medium">{exam.title}</td>
                                                <td className="px-6 py-4">{classroomMap.get(exam.classroomId)}</td>
                                                <td className="px-6 py-4">{subjectMap.get(exam.subjectId)}</td>
                                                <td className="px-6 py-4 text-sm">{new Date(exam.examDate + 'T00:00:00').toLocaleDateString()} @ {exam.startTime}</td>
                                                <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[exam.status]}`}>{exam.status}</span></td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    {canUpdate && <Button size="sm" variant="secondary" onClick={() => { setSelectedExam(exam); setIsModalOpen(true); }}>Edit</Button>}
                                                    {canDelete && <Button size="sm" variant="danger" onClick={() => window.confirm('Are you sure?') && deleteMutation.mutate(exam.id)}>Delete</Button>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <EmptyState title="No Online Exams Found" message="Get started by creating a new online exam." actionText={canCreate ? "Create Exam" : undefined} onAction={canCreate ? () => setIsModalOpen(true) : undefined} />
                    )}
                </CardContent>
            </Card>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedExam ? 'Edit Online Exam' : 'Create Online Exam'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} isLoading={addMutation.isPending || updateMutation.isPending} className="ml-2">Save</Button>
                    </>
                }
            >
                <ExamForm exam={selectedExam} onSave={handleSave} onCancel={() => setIsModalOpen(false)} isSaving={addMutation.isPending || updateMutation.isPending} classrooms={classrooms} subjects={subjects} />
            </Modal>
        </div>
    );
};

export default OnlineExam;
