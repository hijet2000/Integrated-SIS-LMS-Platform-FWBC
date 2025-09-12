
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
// FIX: Correct import path for sisApi
import { marksheetTemplateApi } from '@/services/sisApi';
// FIX: Corrected import path for domain types.
import type { MarksheetTemplate } from '@/types';

// --- Marksheet Preview Component ---
// FIX: Update prop type to accept new templates that don't have an ID yet.
const MarksheetPreview: React.FC<{ template: MarksheetTemplate | Omit<MarksheetTemplate, 'id' | 'siteId'> }> = ({ template }) => (
    <div className="border-2 border-gray-300 dark:border-gray-600 p-4 rounded-lg bg-white dark:bg-gray-800 w-full aspect-[2/3] max-w-sm mx-auto shadow-lg flex flex-col">
        <div className="text-center border-b-2 pb-2">
            <h2 className="text-xl font-bold">Your School Name</h2>
            <p className="text-sm">Report Card - [Exam Group Name]</p>
        </div>
        <div className="flex mt-4 space-x-4">
            {template.settings.showPhoto && <div className="w-24 h-24 border bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm text-gray-500">Photo</div>}
            <div className="text-sm space-y-1">
                <p><strong>Name:</strong> [Student Name]</p>
                <p><strong>Roll No:</strong> [Roll No.]</p>
                <p><strong>Class:</strong> [Class Name]</p>
                {template.settings.showAttendance && <p><strong>Attendance:</strong> [XX]%</p>}
            </div>
        </div>
        <div className="mt-4">
            <table className="w-full text-xs mt-1 border-collapse border">
                <thead><tr><th className="border p-1">Subject</th><th className="border p-1">Marks</th>{template.settings.showGradePoint && <th className="border p-1">Grade</th>}</tr></thead>
                <tbody>
                    <tr><td className="border p-1">[Subject 1]</td><td className="border p-1">[XX/100]</td>{template.settings.showGradePoint && <td className="border p-1">[A]</td>}</tr>
                    <tr><td className="border p-1">[Subject 2]</td><td className="border p-1">[XX/100]</td>{template.settings.showGradePoint && <td className="border p-1">[B]</td>}</tr>
                </tbody>
            </table>
        </div>
        <div className="mt-4 text-sm text-center font-bold border-t pt-2">
            <p>Total: [XXX/200] | Percentage: [XX.X]% | Result: [Pass]</p>
            {template.settings.showRank && <p>Rank: [X]</p>}
        </div>
        {template.settings.teacherRemarks && (
             <div className="mt-4 text-xs">
                <h4 className="font-bold">Teacher's Remarks</h4>
                <p className="border-b h-8">[Remarks go here]</p>
            </div>
        )}
        <div className="flex justify-between items-end mt-auto pt-4 text-xs">
             <p className="border-t w-32 text-center">Class Teacher</p>
             {template.settings.principalSignature && <p className="border-t w-32 text-center">Principal</p>}
        </div>
    </div>
);

// --- Designer Modal Component ---
const DesignerModal: React.FC<{
    template: MarksheetTemplate | Omit<MarksheetTemplate, 'id' | 'siteId'>;
    onSave: (template: MarksheetTemplate | Omit<MarksheetTemplate, 'id' | 'siteId'>) => void;
    onClose: () => void;
    isSaving: boolean;
}> = ({ template, onSave, onClose, isSaving }) => {
    const [localTemplate, setLocalTemplate] = useState(template);

    const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setLocalTemplate(prev => ({ ...prev, settings: { ...prev.settings, [name]: checked } }));
    };
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalTemplate(prev => ({ ...prev, name: e.target.value }));
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={'id' in localTemplate ? 'Edit Marksheet Template' : 'Create New Template'}
            footer={<>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={() => onSave(localTemplate)} isLoading={isSaving} className="ml-2">Save Template</Button>
            </>}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium">Template Name</label><input type="text" value={localTemplate.name} onChange={handleNameChange} required className="mt-1 w-full rounded-md"/></div>
                    <fieldset className="space-y-2">
                        <legend className="text-sm font-medium">Content Options</legend>
                        <div className="flex items-center"><input type="checkbox" id="showPhoto" name="showPhoto" checked={localTemplate.settings.showPhoto} onChange={handleSettingChange} className="mr-2"/><label htmlFor="showPhoto">Show Student Photo</label></div>
                        <div className="flex items-center"><input type="checkbox" id="showAttendance" name="showAttendance" checked={localTemplate.settings.showAttendance} onChange={handleSettingChange} className="mr-2"/><label htmlFor="showAttendance">Show Attendance %</label></div>
                        <div className="flex items-center"><input type="checkbox" id="showRank" name="showRank" checked={localTemplate.settings.showRank} onChange={handleSettingChange} className="mr-2"/><label htmlFor="showRank">Show Rank</label></div>
                        <div className="flex items-center"><input type="checkbox" id="showGradePoint" name="showGradePoint" checked={localTemplate.settings.showGradePoint} onChange={handleSettingChange} className="mr-2"/><label htmlFor="showGradePoint">Show Grade</label></div>
                        <div className="flex items-center"><input type="checkbox" id="teacherRemarks" name="teacherRemarks" checked={localTemplate.settings.teacherRemarks} onChange={handleSettingChange} className="mr-2"/><label htmlFor="teacherRemarks">Show Teacher Remarks</label></div>
                        <div className="flex items-center"><input type="checkbox" id="principalSignature" name="principalSignature" checked={localTemplate.settings.principalSignature} onChange={handleSettingChange} className="mr-2"/><label htmlFor="principalSignature">Show Principal's Signature</label></div>
                    </fieldset>
                </div>
                <div>
                    <h4 className="font-semibold mb-2 text-center">Live Preview</h4>
                    <MarksheetPreview template={localTemplate} />
                </div>
            </div>
        </Modal>
    );
};

// --- Main Page Component ---
const DesignMarksheet: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();

    const [isDesignerOpen, setIsDesignerOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<MarksheetTemplate | null>(null);

    const canRead = can('read', 'exams.marksheet', { kind: 'site', id: siteId! });
    const canCreate = can('create', 'exams.marksheet', { kind: 'site', id: siteId! });
    const canUpdate = can('update', 'exams.marksheet', { kind: 'site', id: siteId! });
    const canDelete = can('delete', 'exams.marksheet', { kind: 'site', id: siteId! });

    const { data: templates, isLoading, isError, error } = useQuery<MarksheetTemplate[], Error>({
        queryKey: ['marksheetTemplates', siteId],
        queryFn: () => marksheetTemplateApi.get(siteId!),
        enabled: canRead,
    });
    
    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['marksheetTemplates', siteId] });
            setIsDesignerOpen(false);
        },
        onError: (err: Error) => alert(`Save failed: ${err.message}`),
    };

    const addMutation = useMutation({ mutationFn: (template: Omit<MarksheetTemplate, 'id' | 'siteId'>) => marksheetTemplateApi.add(template), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (template: MarksheetTemplate) => marksheetTemplateApi.update(template.id, template), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => marksheetTemplateApi.delete(id), ...mutationOptions });
    
    const handleCreateClick = () => {
        setSelectedTemplate(null);
        setIsDesignerOpen(true);
    };

    const handleEditClick = (template: MarksheetTemplate) => {
        setSelectedTemplate(template);
        setIsDesignerOpen(true);
    };
    
    const handleDeleteClick = (id: string) => {
        if(window.confirm('Are you sure you want to delete this template?')) {
            deleteMutation.mutate(id);
        }
    };
    
    const handleSave = (template: MarksheetTemplate | Omit<MarksheetTemplate, 'id' | 'siteId'>) => {
        'id' in template ? updateMutation.mutate(template) : addMutation.mutate(template);
    };
    
    const newTemplateScaffold: Omit<MarksheetTemplate, 'id' | 'siteId'> = {
        name: 'New Marksheet Template',
        settings: { showPhoto: true, showRank: true, showAttendance: true, showGradePoint: true, teacherRemarks: true, principalSignature: true }
    };

    if (!canRead) return <ErrorState title="Access Denied" message="You do not have permission to design marksheets." />;
    if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
    if (isError) return <ErrorState title="Error Loading Templates" message={error.message} />;

    return (
        <div>
            <PageHeader title="Design Marksheet" subtitle="Create and manage templates for student report cards." actions={canCreate && <Button onClick={handleCreateClick}>Create Template</Button>} />
            
            {templates && templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(template => (
                        <Card key={template.id}>
                            <CardHeader><h3 className="font-bold truncate">{template.name}</h3></CardHeader>
                            <CardContent className="flex justify-center"><MarksheetPreview template={template} /></CardContent>
                            <CardFooter className="flex justify-end space-x-2">
                                {canUpdate && <Button variant="secondary" size="sm" onClick={() => handleEditClick(template)}>Edit</Button>}
                                {canDelete && <Button variant="danger" size="sm" onClick={() => handleDeleteClick(template.id)} isLoading={deleteMutation.isPending && deleteMutation.variables === template.id}>Delete</Button>}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState title="No Templates Found" message="Get started by creating a new marksheet template." actionText={canCreate ? 'Create Template' : undefined} onAction={canCreate ? handleCreateClick : undefined} />
            )}
            
            {isDesignerOpen && (
                <DesignerModal 
                    template={selectedTemplate || newTemplateScaffold}
                    onSave={handleSave}
                    onClose={() => setIsDesignerOpen(false)}
                    isSaving={addMutation.isPending || updateMutation.isPending}
                />
            )}
        </div>
    );
};

export default DesignMarksheet;
