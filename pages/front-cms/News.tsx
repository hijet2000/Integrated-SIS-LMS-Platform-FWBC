
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { useCan } from '@/hooks/useCan';
import { useAuth } from '@/hooks/useAuth';
import { cmsNewsApi, getTeachers } from '@/services/sisApi';
import type { CmsNews, CmsNewsStatus, Teacher } from '@/types';

const STATUS_OPTIONS: CmsNewsStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

const statusColors: { [key in CmsNewsStatus]: string } = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-700',
  SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50',
  PUBLISHED: 'bg-green-100 text-green-800 dark:bg-green-900/50',
  ARCHIVED: 'bg-red-100 text-red-800 dark:bg-red-900/50',
};

// --- News Form Component ---
const NewsForm: React.FC<{
    article?: CmsNews | null;
    onSave: (data: any) => void;
    onCancel: () => void;
    isSaving: boolean;
}> = ({ article, onSave, onCancel, isSaving }) => {
    const [form, setForm] = useState({
        title: article?.title ?? '',
        summary: article?.summary ?? '',
        content: article?.content ?? '',
        featuredImageUrl: article?.featuredImageUrl ?? '',
        status: article?.status ?? 'DRAFT',
        isFeatured: article?.isFeatured ?? false,
        tags: article?.tags?.join(', ') ?? '',
    });

    const handleChange = (e: React.ChangeEvent<any>) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label>Title *</label><input name="title" value={form.title} onChange={handleChange} required className="w-full rounded-md"/></div>
                <div className="md:col-span-2"><label>Summary</label><input name="summary" value={form.summary} onChange={handleChange} className="w-full rounded-md"/></div>
                <div className="md:col-span-2"><label>Content (supports HTML)</label><textarea name="content" value={form.content} onChange={handleChange} rows={8} className="w-full rounded-md"/></div>
                <div className="md:col-span-2"><label>Featured Image URL</label><input name="featuredImageUrl" value={form.featuredImageUrl} onChange={handleChange} className="w-full rounded-md"/></div>
                <div><label>Tags (comma-separated)</label><input name="tags" value={form.tags} onChange={handleChange} className="w-full rounded-md"/></div>
                <div><label>Status</label><select name="status" value={form.status} onChange={handleChange} className="w-full rounded-md">{STATUS_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                <div><label className="flex items-center"><input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="mr-2"/> Pin to Homepage</label></div>
            </div>
            <button type="submit" className="hidden"/>
        </form>
    );
};

const CmsNews: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    const { user } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<CmsNews | null>(null);
    const [statusFilter, setStatusFilter] = useState<CmsNewsStatus | 'all'>('all');

    // FIX: Replace complex permission check with a simple scope-based check `can('school:write')` to match the `useCan` hook's implementation and resolve the argument count error.
    const canManage = can('school:write');

    const { data: articles = [], isLoading: l1 } = useQuery<CmsNews[], Error>({ queryKey: ['cmsNews', siteId], queryFn: () => cmsNewsApi.get(siteId!) });
    const { data: teachers = [] } = useQuery<Teacher[], Error>({ queryKey: ['teachers', siteId], queryFn: () => getTeachers(siteId!) });
    
    const authorMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);

    const mutationOptions = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cmsNews', siteId] }); setIsModalOpen(false); } };
    const addMutation = useMutation({ mutationFn: (item: any) => cmsNewsApi.add(item), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (item: CmsNews) => cmsNewsApi.update(item.id, item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => cmsNewsApi.delete(id), ...mutationOptions });
    
    const handleSave = (item: any) => {
        const payload = { ...item, authorId: user!.id, createdBy: user!.id, createdAt: new Date().toISOString(), publishedAt: new Date().toISOString(), slug: item.title.toLowerCase().replace(/\s+/g, '-') };
        selectedArticle ? updateMutation.mutate({ ...selectedArticle, ...payload }) : addMutation.mutate(payload);
    };
    
    const filteredArticles = useMemo(() => {
        return articles.filter(e => statusFilter === 'all' || e.status === statusFilter);
    }, [articles, statusFilter]);

    const isLoading = l1;

    return (
        <div>
            <PageHeader title="Manage News & Announcements" actions={canManage && <Button onClick={() => { setSelectedArticle(null); setIsModalOpen(true); }}>Create Article</Button>} />
            
            <Card className="mb-6">
                <CardHeader><h3 className="font-semibold">Filter Articles</h3></CardHeader>
                <CardContent>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="rounded-md">
                        <option value="all">All Statuses</option>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </CardContent>
            </Card>
            
            <Card>
                <CardContent>
                    {isLoading && <Spinner/>}
                    {!isLoading && (
                        filteredArticles.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y">
                                    <thead><tr>
                                        <th className="p-2 text-left">Title</th>
                                        <th className="p-2 text-left">Author</th>
                                        <th className="p-2 text-left">Published Date</th>
                                        <th className="p-2 text-left">Status</th>
                                        <th className="p-2 text-right">Actions</th>
                                    </tr></thead>
                                    <tbody className="divide-y">
                                        {filteredArticles.map(article => (
                                            <tr key={article.id}>
                                                <td className="p-2 font-semibold">{article.title} {article.isFeatured && <span className="text-xs text-indigo-500">(Featured)</span>}</td>
                                                <td className="p-2">{authorMap.get(article.authorId) || 'Admin'}</td>
                                                <td className="p-2">{new Date(article.publishedAt).toLocaleDateString()}</td>
                                                <td className="p-2"><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[article.status]}`}>{article.status}</span></td>
                                                <td className="p-2 text-right space-x-2">
                                                    {canManage && <>
                                                        <Button size="sm" variant="secondary" onClick={() => { setSelectedArticle(article); setIsModalOpen(true); }}>Edit</Button>
                                                        <Button size="sm" variant="danger" onClick={() => deleteMutation.mutate(article.id)}>Delete</Button>
                                                    </>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <EmptyState title="No Articles Found" message="Create an article to get started." onAction={canManage ? () => setIsModalOpen(true) : undefined} actionText="Create Article"/>
                    )}
                </CardContent>
            </Card>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedArticle ? 'Edit Article' : 'Create Article'}>
                <NewsForm article={selectedArticle} onSave={handleSave} onCancel={() => setIsModalOpen(false)} isSaving={addMutation.isPending || updateMutation.isPending} />
                 <div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>Save Article</Button></div>
            </Modal>
        </div>
    );
};

export default CmsNews;
