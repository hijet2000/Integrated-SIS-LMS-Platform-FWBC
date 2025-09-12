
import React, { useState } from 'react';
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
// FIX: Correct import path for sisApi
import { getExamGroups, addExamGroup, updateExamGroup, deleteExamGroup } from '@/services/sisApi';
// FIX: Corrected import path for domain types.
import type { ExamGroup } from '@/types';

// Form Component
const GroupForm: React.FC<{
  group?: ExamGroup | null;
  onSave: (group: Omit<ExamGroup, 'id' | 'siteId'> | ExamGroup) => void;
  onCancel: () => void;
  isSaving: boolean;
}> = ({ group, onSave, onCancel }) => {
  const [name, setName] = useState(group?.name ?? '');
  const [examType, setExamType] = useState<'Term' | 'Test' | 'Final'>(group?.examType ?? 'Term');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (group) {
      onSave({ ...group, name, examType });
    } else {
      onSave({ name, examType });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Group Name <span className="text-red-500">*</span></label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/>
      </div>
      <div>
        <label className="block text-sm font-medium">Exam Type</label>
        <select value={examType} onChange={e => setExamType(e.target.value as any)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600">
          <option value="Term">Term Exam</option>
          <option value="Test">Unit Test</option>
          <option value="Final">Final Exam</option>
        </select>
      </div>
      <div className="hidden"><button type="submit"/></div>
    </form>
  );
};

// Main Component
const ExamGroupPage: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<ExamGroup | null>(null);

    const canRead = can('read', 'exams.schedule', { kind: 'site', id: siteId! });
    const canCreate = can('create', 'exams.schedule', { kind: 'site', id: siteId! });
    const canUpdate = can('update', 'exams.schedule', { kind: 'site', id: siteId! });
    const canDelete = can('delete', 'exams.schedule', { kind: 'site', id: siteId! });
    
    // Data query
    const { data: examGroups, isLoading, isError, error } = useQuery<ExamGroup[], Error>({
        queryKey: ['examGroups', siteId],
        queryFn: () => getExamGroups(siteId!),
        enabled: canRead,
    });
    
    // Mutations
    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['examGroups', siteId] });
            setIsModalOpen(false);
        },
        onError: (e: Error) => alert(`Error: ${e.message}`),
    };
    const addMutation = useMutation({ mutationFn: (newGroup: Omit<ExamGroup, 'id' | 'siteId'>) => addExamGroup(newGroup), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (group: ExamGroup) => updateExamGroup(group.id, group), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => deleteExamGroup(id), ...mutationOptions });

    // Event Handlers
    const handleAddClick = () => { setSelectedGroup(null); setIsModalOpen(true); };
    const handleEditClick = (group: ExamGroup) => { setSelectedGroup(group); setIsModalOpen(true); };
    const handleDeleteClick = (id: string) => { if (window.confirm('Are you sure you want to delete this exam group? This may also delete associated schedules.')) deleteMutation.mutate(id); };
    const handleSave = (group: Omit<ExamGroup, 'id' | 'siteId'> | ExamGroup) => {
        'id' in group ? updateMutation.mutate(group) : addMutation.mutate(group);
    };
    
    if (!canRead) return <ErrorState title="Access Denied" message="You do not have permission to view exam groups." />;
    if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
    if (isError) return <ErrorState title="Failed to load groups" message={error.message} />;

    return (
        <div>
            <PageHeader title="Exam Groups" subtitle="Group multiple exams into a collection (e.g., Mid-Terms, Finals)." actions={canCreate && <Button onClick={handleAddClick}>Add Exam Group</Button>} />
            <Card>
                <CardContent>
                    {examGroups && examGroups.length > 0 ? (
                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Group Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Exam Type</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {examGroups.map(group => (
                                        <tr key={group.id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">{group.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{group.examType}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                                {canUpdate && <Button size="sm" variant="secondary" onClick={() => handleEditClick(group)}>Edit</Button>}
                                                {canDelete && <Button size="sm" variant="danger" onClick={() => handleDeleteClick(group.id)} isLoading={deleteMutation.isPending && deleteMutation.variables === group.id}>Delete</Button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState 
                            title="No Exam Groups Found" 
                            message="Get started by creating a new exam group."
                            actionText={canCreate ? 'Add Exam Group' : undefined}
                            onAction={canCreate ? handleAddClick : undefined}
                        />
                    )}
                </CardContent>
            </Card>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedGroup ? 'Edit Exam Group' : 'Add Exam Group'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} isLoading={addMutation.isPending || updateMutation.isPending} className="ml-2">Save</Button>
                    </>
                }
            >
                <GroupForm group={selectedGroup} onSave={handleSave} onCancel={() => setIsModalOpen(false)} isSaving={addMutation.isPending || updateMutation.isPending} />
            </Modal>
        </div>
    );
};

export default ExamGroupPage;
