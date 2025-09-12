
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
// FIX: Correct import path for sisApi
import { subjectApi, getTeachers } from '@/services/sisApi';
// FIX: Correct import path for domain types.
import type { Subject, Teacher } from '@/types';

const SubjectForm: React.FC<{
    subject?: Subject | null;
    onSave: (subject: Omit<Subject, 'id' | 'siteId'> | Subject) => void;
    onCancel: () => void;
    isSaving: boolean;
    teachers: Teacher[];
}> = ({ subject, onSave, onCancel, teachers }) => {
    const [formState, setFormState] = useState({
        name: subject?.name ?? '',
        code: subject?.code ?? '',
        type: subject?.type ?? 'Core',
        maxMarks: subject?.maxMarks ?? 100,
        passingMarks: subject?.passingMarks ?? 40,
        teacherId: subject?.teacherId ?? '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormState(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (subject) {
            onSave({ ...subject, ...formState });
        } else {
            onSave(formState as Omit<Subject, 'id' | 'siteId'>);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Subject Name <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={formState.name} onChange={handleChange} required className="mt-1 w-full rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Subject Code</label>
                    <input type="text" name="code" value={formState.code} onChange={handleChange} className="mt-1 w-full rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Subject Type</label>
                    <select name="type" value={formState.type} onChange={handleChange} className="mt-1 w-full rounded-md">
                        <option value="Core">Core</option>
                        <option value="Elective">Elective</option>
                        <option value="Practical">Practical</option>
                        <option value="Theory">Theory</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Assigned Teacher (Optional)</label>
                    <select name="teacherId" value={formState.teacherId} onChange={handleChange} className="mt-1 w-full rounded-md">
                        <option value="">None</option>
                        {teachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">Max Marks</label>
                    <input type="number" name="maxMarks" value={formState.maxMarks} onChange={handleChange} className="mt-1 w-full rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Passing Marks</label>
                    <input type="number" name="passingMarks" value={formState.passingMarks} onChange={handleChange} className="mt-1 w-full rounded-md" />
                </div>
            </div>
            <div className="hidden"><button type="submit" /></div>
        </form>
    );
};

const Subjects: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

    const canRead = can('read', 'academics.subjects', { kind: 'site', id: siteId! });
    const canCreate = can('create', 'academics.subjects', { kind: 'site', id: siteId! });
    const canUpdate = can('update', 'academics.subjects', { kind: 'site', id: siteId! });
    const canDelete = can('delete', 'academics.subjects', { kind: 'site', id: siteId! });

    const { data: subjects, isLoading, isError, error } = useQuery<Subject[], Error>({
        queryKey: ['subjects', siteId],
        queryFn: () => subjectApi.get(siteId!),
        enabled: canRead,
    });
    const { data: teachers = [] } = useQuery<Teacher[], Error>({ queryKey: ['teachers', siteId], queryFn: () => getTeachers(siteId!), enabled: canRead });
    
    const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subjects', siteId] });
            setIsModalOpen(false);
        },
        onError: (err: Error) => alert(`Operation failed: ${err.message}`),
    };

    const addMutation = useMutation({ mutationFn: (newSubject: Omit<Subject, 'id' | 'siteId'>) => subjectApi.add(newSubject), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (subject: Subject) => subjectApi.update(subject.id, subject), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => subjectApi.delete(id), ...mutationOptions });

    const handleSave = (subject: Omit<Subject, 'id' | 'siteId'> | Subject) => {
        'id' in subject ? updateMutation.mutate(subject) : addMutation.mutate(subject);
    };

    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to view subjects." />;
    }

    return (
        <div>
            <PageHeader
                title="Subjects"
                subtitle="Manage all academic subjects offered."
                actions={canCreate && <Button onClick={() => { setSelectedSubject(null); setIsModalOpen(true); }}>Add Subject</Button>}
            />
            <Card>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                    {isError && <ErrorState title="Failed to load subjects" message={error.message} />}
                    {!isLoading && !isError && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Marks (Max/Pass)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Assigned Teacher</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {subjects?.map(subject => (
                                        <tr key={subject.id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">{subject.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{subject.code}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{subject.type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{subject.maxMarks} / {subject.passingMarks}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{teacherMap.get(subject.teacherId || '') || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                                {canUpdate && <Button size="sm" variant="secondary" onClick={() => { setSelectedSubject(subject); setIsModalOpen(true); }}>Edit</Button>}
                                                {canDelete && <Button size="sm" variant="danger" onClick={() => window.confirm('Are you sure?') && deleteMutation.mutate(subject.id)} isLoading={deleteMutation.isPending && deleteMutation.variables === subject.id}>Delete</Button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedSubject ? 'Edit Subject' : 'Add Subject'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} isLoading={addMutation.isPending || updateMutation.isPending} className="ml-2">Save</Button>
                    </>
                }
            >
                <SubjectForm subject={selectedSubject} onSave={handleSave} onCancel={() => setIsModalOpen(false)} isSaving={addMutation.isPending || updateMutation.isPending} teachers={teachers} />
            </Modal>
        </div>
    );
};

export default Subjects;
