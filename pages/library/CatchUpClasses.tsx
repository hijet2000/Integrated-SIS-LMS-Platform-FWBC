
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { listCatchupClasses, catchupClassApi, getSubjects, getClassrooms } from '@/services/sisApi';
import { useCan } from '@/hooks/useCan';
import { useAuth } from '@/hooks/useAuth';
// FIX: Corrected import path for domain types from '@/constants' to '@/types' to resolve module resolution errors.
import type { CatchupClass, Subject, Classroom, VideoHost } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

// --- Student View Component ---
const StudentView: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const { user } = useAuth();

    const { data: assets, isLoading, isError, error } = useQuery<CatchupClass[], Error>({
        queryKey: ['catchupClasses', siteId, user?.id],
        queryFn: () => listCatchupClasses({ siteId: siteId!, studentId: user?.id }),
        enabled: !!user,
    });
    
    const { data: subjects } = useQuery<Subject[], Error>({
        queryKey: ['subjects', siteId],
        queryFn: () => getSubjects(siteId!),
    });

    const subjectMap = React.useMemo(() => {
        if (!subjects) return new Map<string, string>();
        return new Map(subjects.map(s => [s.id, s.name]));
    }, [subjects]);

    return (
        <div>
            {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
            {isError && <ErrorState title="Failed to load classes" message={error.message} />}
            {!isLoading && !isError && (
                assets && assets.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {assets.map(asset => (
                            <Link to={`/library/${asset.siteId}/catchup/${asset.id}`} className="block group" key={asset.id}>
                                <Card className="flex flex-col h-full">
                                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <CardContent className="flex-grow">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{subjectMap.get(asset.subjectId) || 'Unknown Subject'} - {new Date(asset.date).toLocaleDateString()}</p>
                                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mt-1">{asset.title}</h3>
                                    </CardContent>
                                    <CardFooter><span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">Watch Recording &rarr;</span></CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : ( <EmptyState title="All Caught Up!" message="You have no assigned catch-up classes at this time." />)
            )}
        </div>
    );
};

// --- Management View Component ---
const ManagementView: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<CatchupClass | null>(null);

    const { data: classes = [], isLoading: l1 } = useQuery<CatchupClass[], Error>({ queryKey: ['allCatchupClasses', siteId], queryFn: () => catchupClassApi.get(siteId!) });
    const { data: classrooms = [], isLoading: l2 } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!) });
    const { data: subjects = [], isLoading: l3 } = useQuery<Subject[], Error>({ queryKey: ['subjects', siteId], queryFn: () => getSubjects(siteId!) });

    const classroomMap = useMemo(() => new Map(classrooms.map(c => [c.id, c.name])), [classrooms]);
    const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);

    const mutationOptions = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['allCatchupClasses', siteId] }); setIsModalOpen(false); } };
    const addMutation = useMutation({ mutationFn: (item: Omit<CatchupClass, 'id'|'siteId'>) => catchupClassApi.add(item), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (item: CatchupClass) => catchupClassApi.update(item.id, item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => catchupClassApi.delete(id), ...mutationOptions });
    const handleSave = (item: any) => 'id' in item ? updateMutation.mutate(item) : addMutation.mutate(item);
    
    const isLoading = l1 || l2 || l3;

    return (
        <div>
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <h3 className="font-semibold">Manage Recordings</h3>
                    <Button onClick={() => { setSelected(null); setIsModalOpen(true); }}>Add Recording</Button>
                </CardHeader>
                <CardContent>
                    {isLoading && <Spinner/>}
                    {classes.length > 0 ? (
                        <div className="overflow-x-auto">
                           <table className="min-w-full divide-y">
                                <thead><tr><th className="p-2 text-left">Title</th><th className="p-2 text-left">Class</th><th className="p-2 text-left">Subject</th><th className="p-2 text-left">Date</th><th className="p-2 text-right">Actions</th></tr></thead>
                                <tbody>{classes.map(c => (
                                    <tr key={c.id}>
                                        <td className="p-2 font-semibold">{c.title}</td>
                                        <td className="p-2">{classroomMap.get(c.classId)}</td>
                                        <td className="p-2">{subjectMap.get(c.subjectId)}</td>
                                        <td className="p-2">{new Date(c.date).toLocaleDateString()}</td>
                                        <td className="p-2 text-right space-x-2">
                                            <Button size="sm" variant="secondary" onClick={() => { setSelected(c); setIsModalOpen(true); }}>Edit</Button>
                                            <Button size="sm" variant="danger" onClick={() => deleteMutation.mutate(c.id)}>Delete</Button>
                                        </td>
                                    </tr>
                                ))}</tbody>
                           </table>
                        </div>
                    ) : <EmptyState title="No Recordings" message="Add a class recording to get started." />}
                </CardContent>
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selected ? 'Edit Recording' : 'Add Recording'}>
                <CatchupForm recording={selected} onSave={handleSave} onCancel={() => setIsModalOpen(false)} classrooms={classrooms} subjects={subjects} />
            </Modal>
        </div>
    );
};

const CatchupForm: React.FC<{recording?:CatchupClass|null, onSave:(data:any)=>void, onCancel:()=>void, classrooms:Classroom[], subjects:Subject[]}> = ({ recording, onSave, onCancel, classrooms, subjects }) => {
    const [form, setForm] = useState({
        title: recording?.title ?? '',
        description: recording?.description ?? '',
        classId: recording?.classId ?? '',
        subjectId: recording?.subjectId ?? '',
        date: recording?.date ? new Date(recording.date).toISOString().split('T')[0] : '',
        host: recording?.host ?? 'YOUTUBE',
        sourceKey: recording?.sourceKey ?? '',
        durationSec: recording?.durationSec ?? 0,
        status: recording?.status ?? 'PUBLISHED',
    });
    const handleChange = (e: React.ChangeEvent<any>) => setForm(p=>({...p, [e.target.name]: e.target.type === 'number' ? parseInt(e.target.value) : e.target.value}));
    
    return(
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label>Title</label><input name="title" value={form.title} onChange={handleChange} required className="w-full rounded-md"/></div>
                <div><label>Class</label><select name="classId" value={form.classId} onChange={handleChange} required className="w-full rounded-md"><option value="">Select</option>{classrooms.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label>Subject</label><select name="subjectId" value={form.subjectId} onChange={handleChange} required className="w-full rounded-md"><option value="">Select</option>{subjects.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label>Original Lesson Date</label><input type="date" name="date" value={form.date} onChange={handleChange} required className="w-full rounded-md"/></div>
                <div><label>Duration (Seconds)</label><input type="number" name="durationSec" value={form.durationSec} onChange={handleChange} required className="w-full rounded-md"/></div>
                <div><label>Host</label><select name="host" value={form.host} onChange={handleChange} className="w-full rounded-md"><option value="YOUTUBE">YouTube</option><option value="SELF">Self-Hosted</option></select></div>
                <div className="col-span-2"><label>Source Key</label><input name="sourceKey" value={form.sourceKey} onChange={handleChange} placeholder={form.host === 'YOUTUBE' ? 'YouTube Video ID' : 'HLS Manifest URL'} required className="w-full rounded-md"/></div>
                <div className="col-span-2"><label>Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={2} className="w-full rounded-md"/></div>
            </div>
            <div className="flex justify-end space-x-2 pt-4"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit">Save</Button></div>
        </form>
    );
};

// --- Main Page Component ---
const CatchUpClasses: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();
    const canManage = can('create', 'library.catchup', { kind: 'site', id: siteId! });

    if (!can('read', 'library.catchup', { kind: 'site', id: siteId! })) {
        return <ErrorState title="Access Denied" message="You do not have permission to view catch-up classes." />;
    }

    return (
        <div>
            <PageHeader
                title="Catch-Up Classes"
                subtitle="Watch recordings of missed classes to get attendance credit."
            />
            {canManage ? <ManagementView/> : <StudentView/>}
        </div>
    );
};

export default CatchUpClasses;
