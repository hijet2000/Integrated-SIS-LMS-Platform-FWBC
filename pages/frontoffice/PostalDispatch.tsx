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
import { getPostalDispatches, addPostalDispatch, updatePostalDispatch, deletePostalDispatch } from '@/services/sisApi';
import type { PostalDispatch, DispatchMode } from '@/types';

const MODE_OPTIONS: DispatchMode[] = ['Post', 'Courier', 'Hand Delivery', 'Other'];

const DispatchForm: React.FC<{
    dispatch?: PostalDispatch | null;
    onSave: (dispatch: Omit<PostalDispatch, 'id' | 'siteId'> | PostalDispatch) => void;
    onCancel: () => void;
    isSaving: boolean;
}> = ({ dispatch, onSave, onCancel }) => {
    const [formState, setFormState] = useState({
        toTitle: dispatch?.toTitle ?? '',
        referenceNo: dispatch?.referenceNo ?? '',
        address: dispatch?.address ?? '',
        fromTitle: dispatch?.fromTitle ?? '',
        dispatchDate: dispatch?.dispatchDate ?? new Date().toISOString().split('T')[0],
        mode: dispatch?.mode ?? 'Post',
        trackingNumber: dispatch?.trackingNumber ?? '',
        charges: dispatch?.charges ?? 0,
        notes: dispatch?.notes ?? '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'number' ? parseFloat(value) : value;
        setFormState(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (dispatch) {
            onSave({ ...dispatch, ...formState });
        } else {
            onSave(formState as Omit<PostalDispatch, 'id' | 'siteId'>);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium">To (Recipient) <span className="text-red-500">*</span></label><input type="text" name="toTitle" value={formState.toTitle} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
                <div><label className="block text-sm font-medium">Reference No.</label><input type="text" name="referenceNo" value={formState.referenceNo} onChange={handleChange} className="mt-1 w-full rounded-md"/></div>
                <div><label className="block text-sm font-medium">From (Sender)</label><input type="text" name="fromTitle" value={formState.fromTitle} onChange={handleChange} className="mt-1 w-full rounded-md"/></div>
                <div><label className="block text-sm font-medium">Dispatch Date</label><input type="date" name="dispatchDate" value={formState.dispatchDate} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
                <div><label className="block text-sm font-medium">Mode</label><select name="mode" value={formState.mode} onChange={handleChange} className="mt-1 w-full rounded-md">{MODE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                <div><label className="block text-sm font-medium">Tracking No.</label><input type="text" name="trackingNumber" value={formState.trackingNumber} onChange={handleChange} className="mt-1 w-full rounded-md"/></div>
                <div><label className="block text-sm font-medium">Charges ($)</label><input type="number" step="0.01" name="charges" value={formState.charges} onChange={handleChange} className="mt-1 w-full rounded-md"/></div>
            </div>
            <div><label className="block text-sm font-medium">Address</label><textarea name="address" value={formState.address} onChange={handleChange} rows={2} className="mt-1 w-full rounded-md"/></div>
            <div><label className="block text-sm font-medium">Notes</label><textarea name="notes" value={formState.notes} onChange={handleChange} rows={2} className="mt-1 w-full rounded-md"/></div>
            <div className="hidden"><button type="submit"/></div>
        </form>
    );
};

const PostalDispatch: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDispatch, setSelectedDispatch] = useState<PostalDispatch | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const canCreate = can('create', 'frontoffice.postal', { kind: 'site', id: siteId! });
    const canUpdate = can('update', 'frontoffice.postal', { kind: 'site', id: siteId! });
    const canDelete = can('delete', 'frontoffice.postal', { kind: 'site', id: siteId! });

    const { data: dispatches, isLoading, isError, error } = useQuery<PostalDispatch[], Error>({
        queryKey: ['postalDispatches', siteId],
        queryFn: () => getPostalDispatches(siteId!),
        enabled: !!siteId,
    });
    
    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['postalDispatches', siteId] });
            setIsModalOpen(false);
        },
    };

    const addMutation = useMutation({ mutationFn: (newDispatch: Omit<PostalDispatch, 'id' | 'siteId'>) => addPostalDispatch(newDispatch), ...mutationOptions, onError: () => alert('Failed to add record.') });
    const updateMutation = useMutation({ mutationFn: (dispatch: PostalDispatch) => updatePostalDispatch(dispatch.id, dispatch), ...mutationOptions, onError: () => alert('Failed to update record.') });
    const deleteMutation = useMutation({ mutationFn: (dispatchId: string) => deletePostalDispatch(dispatchId), ...mutationOptions, onError: () => alert('Failed to delete record.') });

    const filteredDispatches = useMemo(() => {
        if (!dispatches) return [];
        return dispatches.filter(d => 
            d.toTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.referenceNo.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [dispatches, searchTerm]);
    
    const handleAddClick = () => { setSelectedDispatch(null); setIsModalOpen(true); };
    const handleEditClick = (dispatch: PostalDispatch) => { setSelectedDispatch(dispatch); setIsModalOpen(true); };
    const handleDeleteClick = (dispatchId: string) => { if (window.confirm('Are you sure?')) deleteMutation.mutate(dispatchId); };
    const handleSave = (dispatch: Omit<PostalDispatch, 'id' | 'siteId'> | PostalDispatch) => {
        'id' in dispatch ? updateMutation.mutate(dispatch) : addMutation.mutate(dispatch);
    };
    
    const isMutating = addMutation.isPending || updateMutation.isPending;

    return (
        <div>
            <PageHeader title="Postal Dispatch" subtitle="Track all outgoing mail and parcels." actions={canCreate && <Button onClick={handleAddClick}>Add Dispatch</Button>} />

             <Card className="mb-6">
                 <CardHeader><h3 className="font-semibold">Search Records</h3></CardHeader>
                 <CardContent>
                    <input type="text" placeholder="Search by recipient or reference..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-1/3 rounded-md"/>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                    {isError && <ErrorState title="Failed to load dispatch records" message={error.message} />}
                    {!isLoading && !isError && (
                        filteredDispatches.length > 0 ? (
                             <div className="overflow-x-auto">
                                <table className="min-w-full divide-y">
                                    <thead><tr>
                                        <th className="px-6 py-3 text-left text-xs uppercase">To (Recipient)</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase">Reference No.</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase">Mode</th>
                                        <th className="px-6 py-3 text-right text-xs uppercase">Actions</th>
                                    </tr></thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y">
                                        {filteredDispatches.map(d => (
                                            <tr key={d.id}>
                                                <td className="px-6 py-4">{d.toTitle}</td>
                                                <td className="px-6 py-4">{d.referenceNo}</td>
                                                <td className="px-6 py-4 text-sm">{new Date(d.dispatchDate + 'T00:00:00').toLocaleDateString()}</td>
                                                <td className="px-6 py-4">{d.mode}</td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    {canUpdate && <Button size="sm" variant="secondary" onClick={() => handleEditClick(d)}>Edit</Button>}
                                                    {canDelete && <Button size="sm" variant="danger" onClick={() => handleDeleteClick(d.id)}>Delete</Button>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <EmptyState title="No Records Found" message="No dispatch records match your search." />
                    )}
                </CardContent>
            </Card>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedDispatch ? 'Edit Dispatch' : 'Add Dispatch'}>
                <DispatchForm dispatch={selectedDispatch} onSave={handleSave} onCancel={() => setIsModalOpen(false)} isSaving={isMutating} />
                 <div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>Save</Button></div>
            </Modal>
        </div>
    );
};

export default PostalDispatch;
