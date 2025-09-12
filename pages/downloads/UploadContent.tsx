
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
import { useAuth } from '@/hooks/useAuth';
// FIX: Correct import path for sisApi
import { contentApi, getClassrooms, getSubjects } from '@/services/sisApi';
// FIX: Correct import path for domain types.
import type { Content, Classroom, Subject, ContentCategory } from '@/types';

const CATEGORY_OPTIONS: ContentCategory[] = ['Syllabus', 'Class Notes', 'Revision Guide', 'Supplementary Reading', 'Lab Manual', 'Assignment Resource', 'Circular', 'Policy', 'Form', 'Miscellaneous'];

// --- Form Component ---
const ContentForm: React.FC<{
    content?: Content | null;
    onSave: (content: Omit<Content, 'id' | 'siteId' | 'uploadedBy' | 'createdAt'> | Content) => void;
    onCancel: () => void;
    isSaving: boolean;
    classrooms: Classroom[];
    subjects: Subject[];
}> = ({ content, onSave, onCancel, classrooms, subjects }) => {
    const [formState, setFormState] = useState({
        title: content?.title ?? '',
        description: content?.description ?? '',
        classroomId: content?.classroomId ?? '',
        subjectId: content?.subjectId ?? '',
        category: content?.category ?? 'Class Notes',
        accessLevel: content?.accessLevel ?? 'Public',
        attachmentUrl: content?.attachmentUrl ?? '',
        fileName: content?.fileName ?? '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormState(prev => ({
                ...prev,
                fileName: file.name,
                attachmentUrl: `/mock/${file.name}`, // Mock URL
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content) {
            onSave({ ...content, ...formState });
        } else {
            onSave(formState as Omit<Content, 'id' | 'siteId' | 'uploadedBy' | 'createdAt'>);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label className="block text-sm font-medium">Title <span className="text-red-500">*</span></label><input type="text" name="title" value={formState.title} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
                <div><label className="block text-sm font-medium">Class <span className="text-red-500">*</span></label><select name="classroomId" value={formState.classroomId} onChange={handleChange} required className="mt-1 w-full rounded-md"><option value="">Select Class</option>{classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium">Subject</label><select name="subjectId" value={formState.subjectId} onChange={handleChange} className="mt-1 w-full rounded-md"><option value="">For All Subjects</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium">Category <span className="text-red-500">*</span></label><select name="category" value={formState.category} onChange={handleChange} required className="mt-1 w-full rounded-md">{CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="block text-sm font-medium">Access Level</label><select name="accessLevel" value={formState.accessLevel} onChange={handleChange} className="mt-1 w-full rounded-md"><option value="Public">Public</option><option value="Restricted">Restricted</option></select></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium">Description</label><textarea name="description" value={formState.description} onChange={handleChange} rows={2} className="mt-1 w-full rounded-md"/></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium">Attachment <span className="text-red-500">*</span></label><input type="file" onChange={handleFileChange} required={!content} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>{formState.fileName && <p className="text-xs text-gray-500 mt-1">File: {formState.fileName}</p>}</div>
            </div>
            <div className="hidden"><button type="submit"/></div>
        </form>
    );
};


// --- Main Component ---
const UploadContent: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    const { user } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContent, setSelectedContent] = useState<Content | null>(null);

    const canRead = can('read', 'downloads.content', { kind: 'site', id: siteId! });
    const canCreate = can('create', 'downloads.content', { kind: 'site', id: siteId! });
    const canUpdate = can('update', 'downloads.content', { kind: 'site', id: siteId! });
    const canDelete = can('delete', 'downloads.content', { kind: 'site', id: siteId! });

    const { data: content = [], isLoading: l1 } = useQuery<Content[], Error>({ queryKey: ['content', siteId], queryFn: () => contentApi.get(siteId!), enabled: canRead });
    const { data: classrooms = [], isLoading: l2 } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!), enabled: canRead });
    const { data: subjects = [], isLoading: l3 } = useQuery<Subject[], Error>({ queryKey: ['subjects', siteId], queryFn: () => getSubjects(siteId!), enabled: canRead });

    const classroomMap = useMemo(() => new Map(classrooms.map(c => [c.id, c.name])), [classrooms]);
    const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['content', siteId] });
            setIsModalOpen(false);
        },
        onError: (err: Error) => alert(`Operation failed: ${err.message}`),
    };

    const addMutation = useMutation({ mutationFn: (item: Omit<Content, 'id' | 'siteId'>) => contentApi.add(item), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (item: Content) => contentApi.update(item.id, item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => contentApi.delete(id), ...mutationOptions });

    const handleSave = (itemData: Omit<Content, 'id' | 'siteId' | 'uploadedBy' | 'createdAt'> | Content) => {
        if ('id' in itemData) {
            updateMutation.mutate(itemData);
        } else {
            const finalData = {
                ...itemData,
                uploadedBy: user!.id,
                createdAt: new Date().toISOString(),
            };
            addMutation.mutate(finalData);
        }
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this content?')) {
            deleteMutation.mutate(id);
        }
    };

    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to manage content." />;
    }
    
    const isLoading = l1 || l2 || l3;

    return (
        <div>
            <PageHeader title="Upload Content" subtitle="Share learning materials with students." actions={canCreate && <Button onClick={() => { setSelectedContent(null); setIsModalOpen(true); }}>Add Content</Button>} />
            <Card>
                <CardContent>
                    {isLoading ? <div className="flex justify-center p-8"><Spinner /></div> : (
                        content.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Class</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Subject</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Upload Date</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {content.map(item => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 font-medium">{item.title}</td>
                                                <td className="px-6 py-4">{classroomMap.get(item.classroomId)}</td>
                                                <td className="px-6 py-4">{item.subjectId ? subjectMap.get(item.subjectId) : 'All'}</td>
                                                <td className="px-6 py-4">{item.category}</td>
                                                <td className="px-6 py-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <a href={item.attachmentUrl} download={item.fileName} target="_blank" rel="noreferrer"><Button size="sm" variant="secondary">View</Button></a>
                                                    {canUpdate && <Button size="sm" variant="secondary" onClick={() => { setSelectedContent(item); setIsModalOpen(true); }}>Edit</Button>}
                                                    {canDelete && <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>Delete</Button>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <EmptyState title="No Content Uploaded" message="Get started by adding some content." actionText={canCreate ? 'Add Content' : undefined} onAction={canCreate ? () => setIsModalOpen(true) : undefined} />
                    )}
                </CardContent>
            </Card>

             <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedContent ? 'Edit Content' : 'Add Content'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} isLoading={addMutation.isPending || updateMutation.isPending} className="ml-2">Save</Button>
                    </>
                }
            >
                <ContentForm
                    content={selectedContent}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                    isSaving={addMutation.isPending || updateMutation.isPending}
                    classrooms={classrooms}
                    subjects={subjects}
                />
            </Modal>
        </div>
    );
};

export default UploadContent;
