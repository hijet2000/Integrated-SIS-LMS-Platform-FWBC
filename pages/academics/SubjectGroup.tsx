
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
import { subjectGroupApi, getSubjects, getClassrooms } from '@/services/sisApi';
// FIX: Correct import path for domain types.
import type { Subject, Classroom, SubjectGroup } from '@/types';

const GroupForm: React.FC<{
    group?: SubjectGroup | null;
    onSave: (group: Omit<SubjectGroup, 'id' | 'siteId'> | SubjectGroup) => void;
    onCancel: () => void;
    isSaving: boolean;
    subjects: Subject[];
    classrooms: Classroom[];
}> = ({ group, onSave, onCancel, subjects, classrooms }) => {
    const [formState, setFormState] = useState({
        name: group?.name ?? '',
        classroomId: group?.classroomId ?? '',
        subjectIds: group?.subjectIds ?? [],
        description: group?.description ?? '',
    });

    const handleSubjectChange = (subjectId: string) => {
        setFormState(prev => ({
            ...prev,
            subjectIds: prev.subjectIds.includes(subjectId)
                ? prev.subjectIds.filter(id => id !== subjectId)
                : [...prev.subjectIds, subjectId]
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(group ? { ...group, ...formState } : formState as Omit<SubjectGroup, 'id' | 'siteId'>);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Group Name <span className="text-red-500">*</span></label>
                <input type="text" value={formState.name} onChange={e => setFormState(p => ({...p, name: e.target.value}))} required className="mt-1 w-full rounded-md"/>
            </div>
             <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea value={formState.description} onChange={e => setFormState(p => ({...p, description: e.target.value}))} rows={2} className="mt-1 w-full rounded-md"/>
            </div>
            <div>
                <label className="block text-sm font-medium">Classroom <span className="text-red-500">*</span></label>
                <select value={formState.classroomId} onChange={e => setFormState(p => ({...p, classroomId: e.target.value}))} required className="mt-1 w-full rounded-md">
                    <option value="">Select Classroom</option>
                    {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium">Subjects</label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border p-2 rounded-md">
                    {subjects.map(subject => (
                        <div key={subject.id}>
                            <label className="flex items-center">
                                <input type="checkbox" checked={formState.subjectIds.includes(subject.id)} onChange={() => handleSubjectChange(subject.id)} className="mr-2"/>
                                {subject.name} ({subject.code})
                            </label>
                        </div>
                    ))}
                </div>
            </div>
            <div className="hidden"><button type="submit"/></div>
        </form>
    );
};


const SubjectGroup: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<SubjectGroup | null>(null);

    // FIX: The useCan hook expects a single scope string. Mapped 'read' action to 'school:read' scope.
    const canRead = can('school:read');
    // FIX: The useCan hook expects a single scope string. Mapped 'create' action to 'school:write' scope.
    const canCreate = can('school:write');
    // FIX: The useCan hook expects a single scope string. Mapped 'update' action to 'school:write' scope.
    const canUpdate = can('school:write');
    // FIX: The useCan hook expects a single scope string. Mapped 'delete' action to 'school:write' scope.
    const canDelete = can('school:write');

    const { data: groups, isLoading, isError, error } = useQuery<SubjectGroup[], Error>({ queryKey: ['subjectGroups', siteId], queryFn: () => subjectGroupApi.get(siteId!), enabled: canRead });
    const { data: subjects = [] } = useQuery<Subject[], Error>({ queryKey: ['subjects', siteId], queryFn: () => getSubjects(siteId!), enabled: canRead });
    const { data: classrooms = [] } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!), enabled: canRead });

    const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);
    const classroomMap = useMemo(() => new Map(classrooms.map(c => [c.id, c.name])), [classrooms]);

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subjectGroups', siteId] });
            setIsModalOpen(false);
        },
        onError: (err: Error) => alert(`Operation failed: ${err.message}`),
    };

    const addMutation = useMutation({ mutationFn: (group: Omit<SubjectGroup, 'id' | 'siteId'>) => subjectGroupApi.add(group), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (group: SubjectGroup) => subjectGroupApi.update(group.id, group), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => subjectGroupApi.delete(id), ...mutationOptions });

    const handleSave = (group: Omit<SubjectGroup, 'id' | 'siteId'> | SubjectGroup) => {
        if ('id' in group) {
            updateMutation.mutate(group);
        } else {
            addMutation.mutate(group);
        }
    };

    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to view subject groups." />;
    }

    return (
        <div>
            <PageHeader
                title="Subject Groups"
                subtitle="Assign groups of elective or optional subjects to classes."
                actions={canCreate && <Button onClick={() => { setSelectedGroup(null); setIsModalOpen(true); }}>Add Group</Button>}
            />
            <Card>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                    {isError && <ErrorState title="Failed to load groups" message={error.message} />}
                    {!isLoading && !isError && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Group Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Class</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Subjects</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {groups?.map(group => (
                                        <tr key={group.id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">{group.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{classroomMap.get(group.classroomId)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{group.subjectIds.map(id => subjectMap.get(id)).join(', ')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                                {canUpdate && <Button size="sm" variant="secondary" onClick={() => { setSelectedGroup(group); setIsModalOpen(true); }}>Edit</Button>}
                                                {canDelete && <Button size="sm" variant="danger" onClick={() => window.confirm('Are you sure?') && deleteMutation.mutate(group.id)} isLoading={deleteMutation.isPending && deleteMutation.variables === group.id}>Delete</Button>}
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
                title={selectedGroup ? 'Edit Subject Group' : 'Add Subject Group'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} isLoading={addMutation.isPending || updateMutation.isPending} className="ml-2">Save</Button>
                    </>
                }
            >
                <GroupForm group={selectedGroup} onSave={handleSave} onCancel={() => setIsModalOpen(false)} isSaving={addMutation.isPending || updateMutation.isPending} subjects={subjects} classrooms={classrooms} />
            </Modal>
        </div>
    );
};

export default SubjectGroup;
