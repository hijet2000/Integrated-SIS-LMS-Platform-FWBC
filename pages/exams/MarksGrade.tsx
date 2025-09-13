
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
import { marksGradeApi } from '@/services/sisApi';
// FIX: Changed import path from @/constants to @/types to correct the module resolution error.
import type { MarksGrade } from '@/types';

// --- Form Component ---
const GradeForm: React.FC<{
  grade?: MarksGrade | null;
  onSave: (grade: Omit<MarksGrade, 'id' | 'siteId'> | MarksGrade) => void;
  onCancel: () => void;
  isSaving: boolean;
}> = ({ grade, onSave, onCancel, isSaving }) => {
  const [formState, setFormState] = useState({
    name: grade?.name ?? '',
    minPercentage: grade?.minPercentage ?? 0,
    description: grade?.description ?? '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormState(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (grade) {
      onSave({ ...grade, ...formState });
    } else {
      onSave(formState as Omit<MarksGrade, 'id' | 'siteId'>);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Grade Name (e.g., A+, B) <span className="text-red-500">*</span></label>
        <input type="text" name="name" value={formState.name} onChange={handleChange} required className="mt-1 w-full rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium">Minimum Percentage (%) <span className="text-red-500">*</span></label>
        <input type="number" name="minPercentage" value={formState.minPercentage} onChange={handleChange} required min="0" max="100" className="mt-1 w-full rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium">Description / Remarks</label>
        <textarea name="description" value={formState.description} onChange={handleChange} rows={2} className="mt-1 w-full rounded-md" />
      </div>
      <div className="hidden"><button type="submit" /></div>
    </form>
  );
};

// --- Main Component ---
const MarksGradePage: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState<MarksGrade | null>(null);

    const canRead = can('read', 'exams.grades', { kind: 'site', id: siteId! });
    const canCreate = can('create', 'exams.grades', { kind: 'site', id: siteId! });
    const canUpdate = can('update', 'exams.grades', { kind: 'site', id: siteId! });
    const canDelete = can('delete', 'exams.grades', { kind: 'site', id: siteId! });
    
    // Data query
    const { data: grades, isLoading, isError, error } = useQuery<MarksGrade[], Error>({
        queryKey: ['marksGrades', siteId],
        queryFn: () => marksGradeApi.get(siteId!),
        enabled: canRead,
    });
    
    // Mutations
    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['marksGrades', siteId] });
            setIsModalOpen(false);
        },
        onError: (e: Error) => alert(`Error: ${e.message}`),
    };
    const addMutation = useMutation({ mutationFn: (newGrade: Omit<MarksGrade, 'id' | 'siteId'>) => marksGradeApi.add(newGrade), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (grade: MarksGrade) => marksGradeApi.update(grade.id, grade), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => marksGradeApi.delete(id), ...mutationOptions });

    // Event Handlers
    const handleAddClick = () => { setSelectedGrade(null); setIsModalOpen(true); };
    const handleEditClick = (grade: MarksGrade) => { setSelectedGrade(grade); setIsModalOpen(true); };
    const handleDeleteClick = (id: string) => { if (window.confirm('Are you sure you want to delete this grade?')) deleteMutation.mutate(id); };
    const handleSave = (grade: Omit<MarksGrade, 'id' | 'siteId'> | MarksGrade) => {
        'id' in grade ? updateMutation.mutate(grade) : addMutation.mutate(grade);
    };
    
    if (!canRead) return <ErrorState title="Access Denied" message="You do not have permission to view marks grades." />;
    if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
    if (isError) return <ErrorState title="Failed to load grades" message={error.message} />;

    const sortedGrades = grades?.sort((a, b) => b.minPercentage - a.minPercentage);

    return (
        <div>
            <PageHeader title="Marks Grade" subtitle="Define the grading scale for your examinations." actions={canCreate && <Button onClick={handleAddClick}>Add Grade</Button>} />
            <Card>
                <CardContent>
                    {sortedGrades && sortedGrades.length > 0 ? (
                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Grade Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Minimum Percentage</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Description / Remarks</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {sortedGrades.map(grade => (
                                        <tr key={grade.id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-lg">{grade.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">&ge; {grade.minPercentage}%</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{grade.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                                {canUpdate && <Button size="sm" variant="secondary" onClick={() => handleEditClick(grade)}>Edit</Button>}
                                                {canDelete && <Button size="sm" variant="danger" onClick={() => handleDeleteClick(grade.id)} isLoading={deleteMutation.isPending && deleteMutation.variables === grade.id}>Delete</Button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState 
                            title="No Grades Defined" 
                            message="Get started by adding a new grade to your grading scale."
                            actionText={canCreate ? 'Add Grade' : undefined}
                            onAction={canCreate ? handleAddClick : undefined}
                        />
                    )}
                </CardContent>
            </Card>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedGrade ? 'Edit Grade' : 'Add Grade'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} isLoading={addMutation.isPending || updateMutation.isPending} className="ml-2">Save</Button>
                    </>
                }
            >
                {/* FIX: Passed GradeForm as a child to the Modal component to resolve the missing 'children' prop error. */}
                <GradeForm grade={selectedGrade} onSave={handleSave} onCancel={() => setIsModalOpen(false)} isSaving={addMutation.isPending || updateMutation.isPending} />
            </Modal>
        </div>
    );
};

// FIX: Added a default export to resolve lazy loading error in App.tsx.
export default MarksGradePage;
