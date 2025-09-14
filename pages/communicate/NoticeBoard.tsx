
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
import { noticeApi, getClassrooms, getTeachers, getStudents } from '@/services/sisApi';
// FIX: Correct import path for domain types.
import type { Notice, Classroom, Teacher, Student, Priority, Audience } from '@/types';

const priorityColors: { [key in Priority]: { border: string, bg: string, text: string } } = {
    Urgent: { border: 'border-red-500', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-200' },
    Regular: { border: 'border-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-800 dark:text-blue-200' },
    Info: { border: 'border-gray-400', bg: 'bg-gray-50 dark:bg-gray-700/20', text: 'text-gray-800 dark:text-gray-200' },
};

// --- Notice Form Component ---
const NoticeForm: React.FC<{
  notice?: Notice | null;
  onSave: (notice: Omit<Notice, 'id' | 'siteId' | 'createdBy' | 'createdAt'> | Notice) => void;
  onCancel: () => void;
  isSaving: boolean;
  classrooms: Classroom[];
}> = ({ notice, onSave, onCancel, isSaving, classrooms }) => {
    const [formState, setFormState] = useState({
        title: notice?.title ?? '',
        description: notice?.description ?? '',
        publishDate: notice?.publishDate ?? new Date().toISOString().split('T')[0],
        expiryDate: notice?.expiryDate ?? '',
        priority: notice?.priority ?? 'Regular',
        audience: notice?.audience ?? 'All',
        audienceIds: notice?.audienceIds ?? [],
        attachmentUrl: notice?.attachmentUrl ?? '',
        fileName: notice?.fileName ?? '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAudienceIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = e.target.options;
        const value: string[] = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                value.push(options[i].value);
            }
        }
        setFormState(prev => ({ ...prev, audienceIds: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (notice) {
            onSave({ ...notice, ...formState });
        } else {
            onSave(formState as Omit<Notice, 'id' | 'siteId' | 'createdBy' | 'createdAt'>);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            <div><label className="block text-sm font-medium">Title <span className="text-red-500">*</span></label><input type="text" name="title" value={formState.title} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
            <div><label className="block text-sm font-medium">Description <span className="text-red-500">*</span></label><textarea name="description" value={formState.description} onChange={handleChange} required rows={4} className="mt-1 w-full rounded-md"/></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label>Publish Date</label><input type="date" name="publishDate" value={formState.publishDate} onChange={handleChange} required className="w-full rounded-md"/></div>
                <div><label>Expiry Date</label><input type="date" name="expiryDate" value={formState.expiryDate} onChange={handleChange} className="w-full rounded-md"/></div>
                <div><label>Priority</label><select name="priority" value={formState.priority} onChange={handleChange} className="w-full rounded-md"><option>Regular</option><option>Urgent</option><option>Info</option></select></div>
                <div><label>Audience</label><select name="audience" value={formState.audience} onChange={handleChange} className="w-full rounded-md"><option>All</option><option>Students</option><option>Staff</option><option>Parents</option><option>Class</option></select></div>
            </div>
            {formState.audience === 'Class' && (
                <div>
                    <label>Select Classes</label>
                    <select multiple value={formState.audienceIds} onChange={handleAudienceIdChange} className="w-full rounded-md h-32">
                        {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            )}
            <div>
                <label>Attachment</label>
                <input type="file" className="mt-1 w-full text-sm"/>
                {formState.fileName && <p className="text-xs mt-1">Current: {formState.fileName}</p>}
            </div>
            <div className="hidden"><button type="submit"/></div>
        </form>
    );
};


// --- Main Component ---
const NoticeBoard: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const can = useCan();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
    const [sortOrder, setSortOrder] = useState('publishDate_desc');

    // FIX: Corrected useCan calls to use a single scope string.
    const canRead = can('school:read');
    const canCreate = can('school:write');
    const canUpdate = can('school:write');
    const canDelete = can('school:write');

    // Data Queries
    const { data: notices, isLoading: l1 } = useQuery<Notice[], Error>({ queryKey: ['notices', siteId], queryFn: () => noticeApi.get(siteId!), enabled: canRead });
    const { data: classrooms = [] } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!), enabled: canRead });
    const { data: teachers = [] } = useQuery<Teacher[], Error>({ queryKey: ['teachers', siteId], queryFn: () => getTeachers(siteId!), enabled: canRead });
    const { data: student } = useQuery<Student | undefined, Error>({ queryKey: ['studentSelf', user?.id], queryFn: () => getStudents(siteId!).then(s => s.find(i => i.id === user!.id)), enabled: user?.role === 'student' });
    
    const isLoading = l1;

    // FIX: Explicitly type the Map to ensure proper type inference.
    const teacherMap = useMemo(() => new Map<string, string>(teachers.map(t => [t.id, t.name])), [teachers]);

    const sortedAndFilteredNotices = useMemo(() => {
        if (!notices || !user) return [];
        const now = new Date().toISOString().split('T')[0];
        const filtered = notices
            .filter(n => n.publishDate <= now && (!n.expiryDate || n.expiryDate >= now))
            .filter(n => {
                if (user.role === 'school_admin' || user.role === 'super_admin') return true;
                switch (n.audience) {
                    case 'All': return true;
                    case 'Staff': return user.role !== 'student';
                    case 'Students': return user.role === 'student';
                    case 'Class':
                        if (user.role === 'student' && student) {
                            return n.audienceIds?.includes(student.classroomId);
                        }
                        if (user.role === 'teacher') return true; // Teachers can see all class notices for simplicity
                        return false;
                    default: return false;
                }
            });
            
        const priorityOrder: Record<Priority, number> = {
            'Urgent': 3,
            'Regular': 2,
            'Info': 1,
        };

        return filtered.sort((a, b) => {
            switch (sortOrder) {
                case 'publishDate_asc':
                    return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
                case 'priority_desc':
                    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
                case 'priority_asc':
                    return (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
                case 'publishDate_desc':
                default:
                    return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
            }
        });

    }, [notices, user, student, sortOrder]);

    // Mutations
    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notices', siteId] });
            setIsModalOpen(false);
        },
        onError: (err: Error) => alert(`Operation failed: ${err.message}`),
    };

    const addMutation = useMutation({ mutationFn: (item: Omit<Notice, 'id'|'siteId'>) => noticeApi.add(item), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (item: Notice) => noticeApi.update(item.id, item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => noticeApi.delete(id), ...mutationOptions });

    const handleSave = (noticeData: Omit<Notice, 'id' | 'siteId' | 'createdBy' | 'createdAt'> | Notice) => {
        if ('id' in noticeData) {
            updateMutation.mutate(noticeData);
        } else {
            addMutation.mutate({ ...noticeData, createdBy: user!.id, createdAt: new Date().toISOString() });
        }
    };

    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to view the notice board." />;
    }

    return (
        <div>
            <PageHeader
                title="Notice Board"
                subtitle="View important announcements and updates from the school."
                actions={
                    <div className="flex items-center gap-4">
                        <div>
                            <select
                                id="sort-notices"
                                aria-label="Sort notices"
                                value={sortOrder}
                                onChange={e => setSortOrder(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="publishDate_desc">Publish Date (Newest)</option>
                                <option value="publishDate_asc">Publish Date (Oldest)</option>
                                <option value="priority_desc">Priority (High to Low)</option>
                                <option value="priority_asc">Priority (Low to High)</option>
                            </select>
                        </div>
                        {canCreate && <Button onClick={() => { setSelectedNotice(null); setIsModalOpen(true); }}>Create Notice</Button>}
                    </div>
                }
            />
            {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
            {!isLoading && (
                sortedAndFilteredNotices.length > 0 ? (
                    <div className="space-y-4">
                        {sortedAndFilteredNotices.map(notice => (
                            <Card key={notice.id} className={`border-l-4 ${priorityColors[notice.priority].border} ${priorityColors[notice.priority].bg}`}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className={`text-lg font-bold ${priorityColors[notice.priority].text}`}>{notice.title}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Posted on {new Date(notice.publishDate + 'T00:00:00').toLocaleDateString()} by {teacherMap.get(notice.createdBy) || 'Admin'}
                                            </p>
                                        </div>
                                        {canUpdate && (
                                            <div className="space-x-2 flex-shrink-0 ml-4">
                                                <Button size="sm" variant="secondary" onClick={() => { setSelectedNotice(notice); setIsModalOpen(true); }}>Edit</Button>
                                                {canDelete && <Button size="sm" variant="danger" onClick={() => deleteMutation.mutate(notice.id)}>Delete</Button>}
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{notice.description}</p>
                                    {notice.attachmentUrl && (
                                        <div className="mt-4">
                                            <a href={notice.attachmentUrl} download={notice.fileName} className="text-indigo-600 hover:underline">
                                                Download Attachment: {notice.fileName}
                                            </a>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No Notices"
                        message="There are no active notices for you at this time."
                        actionText={canCreate ? 'Create a Notice' : undefined}
                        onAction={canCreate ? () => setIsModalOpen(true) : undefined}
                    />
                )
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedNotice ? 'Edit Notice' : 'Create Notice'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} isLoading={addMutation.isPending || updateMutation.isPending} className="ml-2">Save</Button>
                    </>
                }
            >
                <NoticeForm notice={selectedNotice} onSave={handleSave} onCancel={() => setIsModalOpen(false)} isSaving={addMutation.isPending || updateMutation.isPending} classrooms={classrooms} />
            </Modal>
        </div>
    );
};

export default NoticeBoard;
