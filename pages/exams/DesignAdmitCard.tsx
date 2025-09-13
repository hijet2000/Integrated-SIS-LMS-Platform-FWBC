
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
import { admitCardTemplateApi } from '@/services/sisApi';
// FIX: Correct import path for domain types.
import type { AdmitCardTemplate } from '@/types';

// --- Admit Card Preview Component ---
const AdmitCardPreview: React.FC<{ 
    template: AdmitCardTemplate | Omit<AdmitCardTemplate, 'id' | 'siteId'>,
    samplePhotoUrl?: string | null 
}> = ({ template, samplePhotoUrl }) => (
    <div className="border-2 border-gray-300 dark:border-gray-600 p-4 rounded-lg bg-white dark:bg-gray-800 w-full aspect-[2/3] max-w-sm mx-auto shadow-lg">
        <div className="text-center border-b-2 pb-2">
            <h2 className="text-xl font-bold">Your School Name</h2>
            <p className="text-sm">Admit Card - {`[Exam Group Name]`}</p>
        </div>
        <div className="flex mt-4 space-x-4">
            {template.settings.showPhoto && (
                <div className="w-24 h-24 border bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm text-gray-500 overflow-hidden">
                    {samplePhotoUrl ? <img src={samplePhotoUrl} alt="Sample Preview" className="w-full h-full object-cover" /> : 'Photo'}
                </div>
            )}
            <div className="text-sm space-y-1">
                <p><strong>Name:</strong> [Student Name]</p>
                <p><strong>Roll No:</strong> [Roll No.]</p>
                <p><strong>Class:</strong> [Class Name]</p>
                {template.settings.showGuardian && <p><strong>Guardian:</strong> [Guardian Name]</p>}
                {template.settings.showAddress && <p><strong>Address:</strong> [Student Address]</p>}
            </div>
        </div>
        {template.settings.showTimetable && (
            <div className="mt-4">
                <h4 className="font-bold text-sm">Exam Schedule</h4>
                <table className="w-full text-xs mt-1 border-collapse border">
                    <thead><tr><th className="border p-1">Subject</th><th className="border p-1">Date</th><th className="border p-1">Time</th></tr></thead>
                    <tbody><tr><td className="border p-1">[Subject 1]</td><td className="border p-1">[Date 1]</td><td className="border p-1">[Time 1]</td></tr></tbody>
                </table>
            </div>
        )}
        {template.settings.instructions && (
             <div className="mt-4 text-xs">
                <h4 className="font-bold">Instructions</h4>
                <p className="whitespace-pre-wrap">{template.settings.instructions}</p>
            </div>
        )}
        <div className="flex justify-between items-end mt-auto pt-4">
             {template.settings.showQRCode && <div className="w-16 h-16 border bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500">QR</div>}
            <p className="text-xs text-center border-t w-32">Controller Signature</p>
        </div>
    </div>
);

// --- Designer Modal Component ---
const DesignerModal: React.FC<{
    template: AdmitCardTemplate | Omit<AdmitCardTemplate, 'id' | 'siteId'>;
    onSave: (template: AdmitCardTemplate | Omit<AdmitCardTemplate, 'id' | 'siteId'>) => void;
    onClose: () => void;
    isSaving: boolean;
}> = ({ template, onSave, onClose, isSaving }) => {
    const [localTemplate, setLocalTemplate] = useState(template);
    const [samplePhoto, setSamplePhoto] = useState<string | null>(null);

    const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, type, checked, value } = e.target as HTMLInputElement;
        setLocalTemplate(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    };
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalTemplate(prev => ({ ...prev, name: e.target.value }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSamplePhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={'id' in localTemplate ? 'Edit Template' : 'Create New Template'}
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
                        {localTemplate.settings.showPhoto && (
                            <div className="pl-6 text-sm">
                                <label htmlFor="photo-upload" className="text-indigo-600 hover:underline cursor-pointer">Change Sample Photo</label>
                                <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                            </div>
                        )}
                        <div className="flex items-center"><input type="checkbox" id="showGuardian" name="showGuardian" checked={localTemplate.settings.showGuardian} onChange={handleSettingChange} className="mr-2"/><label htmlFor="showGuardian">Show Guardian Name</label></div>
                        <div className="flex items-center"><input type="checkbox" id="showAddress" name="showAddress" checked={localTemplate.settings.showAddress} onChange={handleSettingChange} className="mr-2"/><label htmlFor="showAddress">Show Address</label></div>
                        <div className="flex items-center"><input type="checkbox" id="showTimetable" name="showTimetable" checked={localTemplate.settings.showTimetable} onChange={handleSettingChange} className="mr-2"/><label htmlFor="showTimetable">Show Exam Timetable</label></div>
                        <div className="flex items-center"><input type="checkbox" id="showQRCode" name="showQRCode" checked={localTemplate.settings.showQRCode} onChange={handleSettingChange} className="mr-2"/><label htmlFor="showQRCode">Show QR Code</label></div>
                    </fieldset>
                    <div><label className="block text-sm font-medium">Instructions</label><textarea name="instructions" value={localTemplate.settings.instructions} onChange={handleSettingChange} rows={4} className="mt-1 w-full rounded-md"/></div>
                </div>
                <div>
                    <h4 className="font-semibold mb-2 text-center">Live Preview</h4>
                    <AdmitCardPreview template={localTemplate} samplePhotoUrl={samplePhoto} />
                </div>
            </div>
        </Modal>
    );
};

// --- Main Page Component ---
const DesignAdmitCard: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();

    const [isDesignerOpen, setIsDesignerOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<AdmitCardTemplate | null>(null);

    // FIX: Corrected useCan calls to use a single scope string.
    const canRead = can('school:read');
    const canCreate = can('school:write');
    const canUpdate = can('school:write');
    const canDelete = can('school:write');

    const { data: templates, isLoading, isError, error } = useQuery<AdmitCardTemplate[], Error>({
        queryKey: ['admitCardTemplates', siteId],
        queryFn: () => admitCardTemplateApi.get(siteId!),
        enabled: canRead,
    });
    
    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admitCardTemplates', siteId] });
            setIsDesignerOpen(false);
        },
        onError: (err: Error) => alert(`Save failed: ${err.message}`),
    };

    const addMutation = useMutation({ mutationFn: (template: Omit<AdmitCardTemplate, 'id' | 'siteId'>) => admitCardTemplateApi.add(template), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (template: AdmitCardTemplate) => admitCardTemplateApi.update(template.id, template), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => admitCardTemplateApi.delete(id), ...mutationOptions });
    
    const handleCreateClick = () => {
        setSelectedTemplate(null);
        setIsDesignerOpen(true);
    };

    const handleEditClick = (template: AdmitCardTemplate) => {
        setSelectedTemplate(template);
        setIsDesignerOpen(true);
    };
    
    const handleDeleteClick = (id: string) => {
        if(window.confirm('Are you sure you want to delete this template?')) {
            deleteMutation.mutate(id);
        }
    };
    
    const handleSave = (template: AdmitCardTemplate | Omit<AdmitCardTemplate, 'id' | 'siteId'>) => {
        'id' in template ? updateMutation.mutate(template) : addMutation.mutate(template);
    };
    
    const newTemplateScaffold: Omit<AdmitCardTemplate, 'id' | 'siteId'> = {
        name: 'New Admit Card Template',
        settings: { showPhoto: true, showGuardian: true, showAddress: false, showTimetable: true, showQRCode: true, instructions: '' }
    };

    if (!canRead) return <ErrorState title="Access Denied" message="You do not have permission to design admit cards." />;
    if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
    if (isError) return <ErrorState title="Error Loading Templates" message={error.message} />;

    return (
        <div>
            <PageHeader title="Design Admit Card" subtitle="Create and manage templates for exam admit cards." actions={canCreate && <Button onClick={handleCreateClick}>Create Template</Button>} />
            
            {templates && templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(template => (
                        <Card key={template.id}>
                            <CardHeader><h3 className="font-bold truncate">{template.name}</h3></CardHeader>
                            <CardContent className="flex justify-center"><AdmitCardPreview template={template} /></CardContent>
                            <CardFooter className="flex justify-end space-x-2">
                                {canUpdate && <Button variant="secondary" size="sm" onClick={() => handleEditClick(template)}>Edit</Button>}
                                {canDelete && <Button variant="danger" size="sm" onClick={() => handleDeleteClick(template.id)} isLoading={deleteMutation.isPending && deleteMutation.variables === template.id}>Delete</Button>}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState title="No Templates Found" message="Get started by creating a new admit card template." actionText={canCreate ? 'Create Template' : undefined} onAction={canCreate ? handleCreateClick : undefined} />
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

export default DesignAdmitCard;
