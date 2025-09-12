import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { useCan } from '@/hooks/useCan';
import { idCardTemplateApi } from '@/services/sisApi';
import type { IdCardTemplate } from '@/types';

const IdCardPreview: React.FC<{ template: Partial<IdCardTemplate> }> = ({ template }) => {
    return (
        <div 
            className="w-full max-w-sm mx-auto aspect-[54/86] p-4 rounded-lg shadow-lg flex flex-col text-xs relative overflow-hidden"
            style={{ 
                backgroundColor: template.backgroundColor, 
                color: template.textColor,
                backgroundImage: template.backgroundImageUrl ? `url(${template.backgroundImageUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Header */}
            <div className="flex items-center space-x-2 border-b pb-2 border-current/20">
                {template.logoUrl && <img src={template.logoUrl} alt="Logo" className="h-10 w-10 object-contain"/>}
                <div>
                    <h3 className="font-bold text-sm">FAITH-EDU Institutions</h3>
                    <p className="opacity-80">123 Learning Lane, Knowledge City</p>
                </div>
            </div>
            
            {/* Body */}
            <div className="flex-grow flex flex-col items-center justify-center text-center mt-4">
                {template.showPhoto && (
                    <div className="w-24 h-24 border-2 border-current/30 bg-black/10 rounded-md mb-2 flex items-center justify-center text-current/50">
                        Photo
                    </div>
                )}
                <h4 className="font-bold text-lg">[Student Name]</h4>
                <p>Class: [Class Name]</p>
                <p>Admission No: [Admission No.]</p>
                {template.showGuardian && <p>Guardian: [Guardian Name]</p>}
                {template.showBloodGroup && <p>Blood Group: [Blood Group]</p>}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end mt-4">
                {template.showQRCode && <div className="w-16 h-16 border bg-white flex items-center justify-center text-black text-xs">QR Code</div>}
                <div className="text-right">
                    <p className="font-bold border-t border-current/20 pt-1">[Principal's Signature]</p>
                    <p className="text-xs">Principal</p>
                    {template.showValidity && <p className="text-xs mt-1">Valid Till: [Expiry Date]</p>}
                </div>
            </div>
        </div>
    );
};

const IdCardDesigner: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('new');
    const [designState, setDesignState] = useState<Partial<IdCardTemplate>>({
        name: 'New Custom Template',
        type: 'Student',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        showPhoto: true,
        showQRCode: true,
        showBloodGroup: false,
        showGuardian: false,
        showValidity: true,
    });

    const canManage = can('update', 'certificate.id-card-designer', { kind: 'site', id: siteId! });

    const { data: templates = [], isLoading, isError } = useQuery<IdCardTemplate[], Error>({
        queryKey: ['idCardTemplates', siteId],
        queryFn: () => idCardTemplateApi.get(siteId!),
    });

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['idCardTemplates', siteId] });
            alert('Template saved successfully!');
        },
        onError: (err: Error) => alert(`Failed to save: ${err.message}`),
    };

    const addMutation = useMutation({ mutationFn: (data: any) => idCardTemplateApi.add(data), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (data: IdCardTemplate) => idCardTemplateApi.update(data.id, data), ...mutationOptions });

    useEffect(() => {
        if (selectedTemplateId === 'new') {
            setDesignState({
                name: 'New Custom Template',
                type: 'Student',
                backgroundColor: '#ffffff',
                textColor: '#000000',
                showPhoto: true,
                showQRCode: true,
            });
        } else {
            const template = templates.find(t => t.id === selectedTemplateId);
            if (template) {
                setDesignState(template);
            }
        }
    }, [selectedTemplateId, templates]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setDesignState(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSave = () => {
        if (!designState.name) {
            alert('Template name is required.');
            return;
        }
        if (selectedTemplateId === 'new') {
            addMutation.mutate(designState as Omit<IdCardTemplate, 'id'|'siteId'>);
        } else {
            updateMutation.mutate(designState as IdCardTemplate);
        }
    };
    
    if (!canManage) {
        return <ErrorState title="Access Denied" message="You do not have permission to design ID cards." />;
    }

    return (
        <div>
            <PageHeader title="ID Card Designer" subtitle="Create and manage custom ID card templates." />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <main className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <h3 className="font-semibold">Live Preview</h3>
                        </CardHeader>
                        <CardContent className="bg-gray-100 dark:bg-gray-900 p-8">
                            <IdCardPreview template={designState} />
                        </CardContent>
                    </Card>
                </main>
                <aside className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <h3 className="font-semibold">Controls</h3>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium">Load Template</label>
                                <select value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)} className="mt-1 w-full rounded-md">
                                    <option value="new">-- Create New --</option>
                                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            
                             <div>
                                <label className="block text-sm font-medium">Template Name</label>
                                <input type="text" name="name" value={designState.name || ''} onChange={handleInputChange} className="mt-1 w-full rounded-md"/>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Background Color</label>
                                    <input type="color" name="backgroundColor" value={designState.backgroundColor || '#ffffff'} onChange={handleInputChange} className="mt-1 w-full h-10 p-1 border rounded-md"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Text Color</label>
                                    <input type="color" name="textColor" value={designState.textColor || '#000000'} onChange={handleInputChange} className="mt-1 w-full h-10 p-1 border rounded-md"/>
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium">School Logo URL</label>
                                <input type="text" name="logoUrl" value={designState.logoUrl || ''} onChange={handleInputChange} placeholder="https://..." className="mt-1 w-full rounded-md"/>
                            </div>

                            <fieldset>
                                <legend className="text-sm font-medium">Visible Fields</legend>
                                <div className="mt-2 space-y-2">
                                    <div className="flex items-center"><input type="checkbox" name="showPhoto" checked={designState.showPhoto ?? false} onChange={handleInputChange} className="mr-2"/><label>Show Photo</label></div>
                                    <div className="flex items-center"><input type="checkbox" name="showQRCode" checked={designState.showQRCode ?? false} onChange={handleInputChange} className="mr-2"/><label>Show QR Code</label></div>
                                    <div className="flex items-center"><input type="checkbox" name="showBloodGroup" checked={designState.showBloodGroup ?? false} onChange={handleInputChange} className="mr-2"/><label>Show Blood Group</label></div>
                                    <div className="flex items-center"><input type="checkbox" name="showGuardian" checked={designState.showGuardian ?? false} onChange={handleInputChange} className="mr-2"/><label>Show Guardian Name</label></div>
                                    <div className="flex items-center"><input type="checkbox" name="showValidity" checked={designState.showValidity ?? false} onChange={handleInputChange} className="mr-2"/><label>Show Valid Thru Date</label></div>
                                </div>
                            </fieldset>

                            <div className="pt-4 border-t">
                                <Button className="w-full" onClick={handleSave} isLoading={addMutation.isPending || updateMutation.isPending}>
                                    Save Template
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
};

export default IdCardDesigner;
