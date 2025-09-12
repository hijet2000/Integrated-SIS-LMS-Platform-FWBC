
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { digitalAssetApi, getClassrooms } from '@/services/sisApi';
import { useCan } from '@/hooks/useCan';
// FIX: Corrected import path for domain types from '@/constants' to '@/types' to resolve module resolution errors.
import type { DigitalAsset, DigitalKind, Classroom } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

// --- Student View Component ---
const StudentView: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const [activeTab, setActiveTab] = useState<DigitalKind>('VIDEO');
    
    const { data: assets, isLoading, isError, error } = useQuery<DigitalAsset[], Error>({
        queryKey: ['digitalAssets', siteId],
        queryFn: () => digitalAssetApi.get(siteId!),
    });

    const filteredAssets = useMemo(() => {
        return assets?.filter(asset => asset.kind === activeTab) || [];
    }, [assets, activeTab]);

    const tabs: { key: DigitalKind; label: string }[] = [
        { key: 'EBOOK', label: 'eBooks' },
        { key: 'AUDIO', label: 'Audio' },
        { key: 'VIDEO', label: 'Video' },
    ];
    
    return (
        <div>
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`${activeTab === tab.key ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
             {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
            {isError && <ErrorState title="Failed to load assets" message={error.message} />}
            {!isLoading && !isError && (
                filteredAssets.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredAssets.map(asset => (
                             <Link to={`/library/${asset.siteId}/viewer/${asset.id}`} className="block group" key={asset.id}>
                                <Card className="flex flex-col h-full">
                                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                        {asset.coverUrl ? <img src={asset.coverUrl} alt={asset.title} className="object-cover h-full w-full" /> : <span className="text-gray-500">{asset.kind}</span>}
                                    </div>
                                    <CardContent className="flex-grow">
                                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{asset.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{asset.subject}</p>
                                    </CardContent>
                                    <CardFooter><span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">View Asset &rarr;</span></CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : ( <EmptyState title={`No ${activeTab.toLowerCase()}s available`} message="There are currently no assets in this category." /> )
            )}
        </div>
    )
}

// --- Management View Component ---
const ManagementView: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<DigitalAsset | null>(null);

    const canCreate = can('create', 'library.digital', { kind: 'site', id: siteId! });
    const canUpdate = can('update', 'library.digital', { kind: 'site', id: siteId! });
    const canDelete = can('delete', 'library.digital', { kind: 'site', id: siteId! });

    const { data: assets = [], isLoading: l1 } = useQuery<DigitalAsset[], Error>({ queryKey: ['digitalAssets', siteId], queryFn: () => digitalAssetApi.get(siteId!) });
    const { data: classrooms = [], isLoading: l2 } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!) });
    
    const classroomMap = useMemo(() => new Map(classrooms.map(c => [c.id, c.name])), [classrooms]);

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['digitalAssets', siteId] });
            setIsModalOpen(false);
        },
        onError: (err: Error) => alert(`Save failed: ${err.message}`),
    };

    const addMutation = useMutation({ mutationFn: (item: Omit<DigitalAsset, 'id' | 'siteId'>) => digitalAssetApi.add(item), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (item: DigitalAsset) => digitalAssetApi.update(item.id, item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => digitalAssetApi.delete(id), ...mutationOptions });

    const handleSave = (item: Omit<DigitalAsset, 'id'|'siteId'> | DigitalAsset) => {
        'id' in item ? updateMutation.mutate(item) : addMutation.mutate(item);
    };

    const isLoading = l1 || l2;

    return (
        <div>
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <h3 className="font-semibold">Manage Digital Assets</h3>
                    {canCreate && <Button onClick={() => { setSelectedAsset(null); setIsModalOpen(true); }}>Add Asset</Button>}
                </CardHeader>
                <CardContent>
                    {isLoading && <Spinner/>}
                    {assets.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y">
                                <thead><tr><th className="p-2 text-left">Title</th><th className="p-2 text-left">Kind</th><th className="p-2 text-left">Subject</th><th className="p-2 text-left">Class</th><th className="p-2 text-right">Actions</th></tr></thead>
                                <tbody>{assets.map(asset => (
                                    <tr key={asset.id}>
                                        <td className="p-2 font-semibold">{asset.title}</td>
                                        <td className="p-2">{asset.kind}</td>
                                        <td className="p-2">{asset.subject}</td>
                                        <td className="p-2">{asset.classId ? classroomMap.get(asset.classId) : 'All'}</td>
                                        <td className="p-2 text-right space-x-2">
                                            {canUpdate && <Button size="sm" variant="secondary" onClick={() => { setSelectedAsset(asset); setIsModalOpen(true); }}>Edit</Button>}
                                            {canDelete && <Button size="sm" variant="danger" onClick={() => deleteMutation.mutate(asset.id)}>Delete</Button>}
                                        </td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    ) : <EmptyState title="No Digital Assets" message="Get started by adding an eBook, audio, or video file." />}
                </CardContent>
            </Card>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedAsset ? 'Edit Asset' : 'Add Digital Asset'}>
                <AssetForm asset={selectedAsset} onSave={handleSave} onCancel={() => setIsModalOpen(false)} classrooms={classrooms} />
             </Modal>
        </div>
    );
};

const AssetForm: React.FC<{ asset?: DigitalAsset|null, onSave: (data:any)=>void, onCancel:()=>void, classrooms: Classroom[]}> = ({ asset, onSave, onCancel, classrooms }) => {
    const [form, setForm] = useState({ title: asset?.title ?? '', kind: asset?.kind ?? 'VIDEO', subject: asset?.subject ?? '', classId: asset?.classId ?? '', storageKey: asset?.storageKey ?? '', coverUrl: asset?.coverUrl ?? '' });
    const handleChange = (e: React.ChangeEvent<any>) => setForm(p => ({...p, [e.target.name]: e.target.value}));
    
    return(
        <form onSubmit={e => { e.preventDefault(); onSave({ ...form, drm: 'NONE' }); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label>Title</label><input name="title" value={form.title} onChange={handleChange} required className="w-full rounded-md"/></div>
                <div><label>Kind</label><select name="kind" value={form.kind} onChange={handleChange} className="w-full rounded-md"><option>EBOOK</option><option>AUDIO</option><option>VIDEO</option></select></div>
                <div><label>Subject</label><input name="subject" value={form.subject} onChange={handleChange} className="w-full rounded-md"/></div>
                <div><label>Class</label><select name="classId" value={form.classId} onChange={handleChange} className="w-full rounded-md"><option value="">All Classes</option>{classrooms.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div className="col-span-2"><label>Source URL/Path</label><input name="storageKey" value={form.storageKey} onChange={handleChange} placeholder="e.g., https://.../playlist.m3u8" required className="w-full rounded-md"/></div>
                <div className="col-span-2"><label>Cover Image URL</label><input name="coverUrl" value={form.coverUrl} onChange={handleChange} placeholder="https://.../cover.jpg" className="w-full rounded-md"/></div>
            </div>
            <div className="flex justify-end space-x-2 pt-4"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit">Save Asset</Button></div>
        </form>
    );
};


// --- Main Page Component ---
const DigitalLibrary: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();
    const canManage = can('create', 'library.digital', { kind: 'site', id: siteId! });

    if (!can('read', 'library.digital', { kind: 'site', id: siteId! })) {
        return <ErrorState title="Access Denied" message="You do not have permission to view the digital library." />;
    }

    return (
        <div>
            <PageHeader
                title="Digital Library"
                subtitle="Access eBooks, audio lectures, and video classes."
            />
            {canManage ? <ManagementView /> : <StudentView />}
        </div>
    );
};

export default DigitalLibrary;
