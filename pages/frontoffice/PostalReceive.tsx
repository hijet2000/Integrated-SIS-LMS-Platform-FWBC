
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
import { getPostalReceives, addPostalReceive, updatePostalReceive, deletePostalReceive } from '@/services/sisApi';
import type { PostalReceive, DispatchMode } from '@/types';

const MODE_OPTIONS: DispatchMode[] = ['Post', 'Courier', 'Hand Delivery', 'Other'];

const ReceiveForm: React.FC<{
    receive?: PostalReceive | null;
    onSave: (record: Omit<PostalReceive, 'id' | 'siteId'> | PostalReceive) => void;
    isSaving: boolean;
}> = ({ receive, onSave }) => {
    const [formState, setFormState] = useState({
        fromTitle: receive?.fromTitle ?? '',
        referenceNo: receive?.referenceNo ?? '',
        toTitle: receive?.toTitle ?? '',
        receiveDate: receive?.receiveDate ?? new Date().toISOString().split('T')[0],
        mode: receive?.mode ?? 'Post',
        docType: receive?.docType ?? '',
        notes: receive?.notes ?? '',
        acknowledged: receive?.acknowledged ?? false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (receive) {
            onSave({ ...receive, ...formState });
        } else {
            onSave(formState as Omit<PostalReceive, 'id' | 'siteId'>);
        }
    };

    return (
        <form id="receive-form" onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium">From (Sender) <span className="text-red-500">*</span></label><input type="text" name="fromTitle" value={formState.fromTitle} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
                <div><label className="block text-sm font-medium">Reference No. <span className="text-red-500">*</span></label><input type="text" name="referenceNo" value={formState.referenceNo} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
                <div><label className="block text-sm font-medium">To (Recipient) <span className="text-red-500">*</span></label><input type="text" name="toTitle" value={formState.toTitle} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
                <div><label className="block text-sm font-medium">Receive Date</label><input type="date" name="receiveDate" value={formState.receiveDate} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
                <div><label className="block text-sm font-medium">Mode</label><select name="mode" value={formState.mode} onChange={handleChange} className="mt-1 w-full rounded-md">{MODE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                <div><label className="block text-sm font-medium">Document Type</label><input type="text" name="docType" placeholder="e.g., Letter, Parcel" value={formState.docType} onChange={handleChange} className="mt-1 w-full rounded-md"/></div>
            </div>
            <div><label className="block text-sm font-medium">Notes</label><textarea name="notes" value={formState.notes} onChange={handleChange} rows={2} className="mt-1 w-full rounded-md"/></div>
            <button type="submit" className="hidden"/>
        </form>
    );
};

const PostalReceive: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<PostalReceive | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const canCreate = can('school:write');
    const canUpdate = can('school:write');
    const canDelete = can('school:write');

    const { data: records, isLoading, isError, error } = useQuery<PostalReceive[], Error>({
        queryKey: ['postalReceives', siteId],
        queryFn: () => getPostalReceives(siteId!),
        enabled: !!siteId,
    });
    
    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['postalReceives', siteId] });
            setIsModalOpen(false);
        },
    };

    const addMutation = useMutation({ mutationFn: (newRecord: Omit<PostalReceive, 'id' | 'siteId'>) => addPostalReceive(newRecord), ...mutationOptions, onError: () => alert('Failed to add record.') });
    const updateMutation = useMutation({ mutationFn: (record: PostalReceive) => updatePostalReceive(record.id, record), ...mutationOptions, onError: () => alert('Failed to update record.') });
    const deleteMutation = useMutation({ mutationFn: (recordId: string) => deletePostalReceive(recordId), ...mutationOptions, onError: () => alert('Failed to delete record.') });
    const acknowledgeMutation = useMutation({ mutationFn: (record: PostalReceive) => updatePostalReceive(record.id, { ...record, acknowledged: true }), ...mutationOptions, onError: () => alert('Failed to acknowledge receipt.') });

    const filteredRecords = useMemo(() => {
        if (!records) return [];
        return records.filter(d => 
            d.fromTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.toTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.referenceNo.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [records, searchTerm]);
    
    const handleAddClick = () => { setSelectedRecord(null); setIsModalOpen(true); };
    const handleEditClick = (record: PostalReceive) => { setSelectedRecord(record); setIsModalOpen(true); };
    const handleDeleteClick = (recordId: string) => { if (window.confirm('Are you sure?')) deleteMutation.mutate(recordId); };
    const handleSave = (record: Omit<PostalReceive, 'id' | 'siteId'> | PostalReceive) => {
        'id' in record ? updateMutation.mutate(record) : addMutation.mutate(record);
    };
    
    const isMutating = addMutation.isPending || updateMutation.isPending;

    return (
        <div>
            <PageHeader title="Postal Receive" subtitle="Track all incoming mail and parcels." actions={canCreate && <Button onClick={handleAddClick}>Add Record</Button>} />

             <Card className="mb-6">
                 <CardHeader><h3 className="font-semibold">Search Records</h3></CardHeader>
                 <CardContent>
                    <input type="text" placeholder="Search by sender, recipient, or reference..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-1/3 rounded-md"/>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                    {isError && <ErrorState title="Failed to load receive records" message={error.message} />}
                    {!isLoading && !isError && (
                        filteredRecords.length > 0 ? (
                             <div className="overflow-x-auto">
                                <table className="min-w-full divide-y">
                                    <thead><tr>
                                        <th className="px-6 py-3 text-left">From</th>
                                        <th className="px-6 py-3 text-left">Reference No.</th>
                                        <th className="px-6 py-3 text-left">To</th>
                                        <th className="px-6 py-3 text-left">Date</th>
                                        <th className="px-6 py-3 text-left">Status</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr></thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y">
                                        {filteredRecords.map(d => (
                                            <tr key={d.id}>
                                                <td className="px-6 py-4">{d.fromTitle}</td>
                                                <td className="px-6 py-4">{d.referenceNo}</td>
                                                <td className="px-6 py-4">{d.toTitle}</td>
                                                <td className="px-6 py-4 text-sm">{new Date(d.receiveDate + 'T00:00:00').toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    {d.acknowledged 
                                                        ? <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Acknowledged</span>
                                                        : <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                                                    }
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    {!d.acknowledged && canUpdate && <Button size="sm" onClick={() => acknowledgeMutation.mutate(d)}>Acknowledge</Button>}
                                                    {canUpdate && <Button size="sm" variant="secondary" onClick={() => handleEditClick(d)}>Edit</Button>}
                                                    {canDelete && <Button size="sm" variant="danger" onClick={() => handleDeleteClick(d.id)}>Delete</Button>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <EmptyState title="No Records Found" message="No received mail records match your search." />
                    )}
                </CardContent>
            </Card>
             <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={selectedRecord ? 'Edit Receive Record' : 'Add Receive Record'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button 
                            type="submit" 
                            form="receive-form" 
                            className="ml-2"
                            isLoading={isMutating}
                        >
                            Save
                        </Button>
                    </>
                }
            >
                <ReceiveForm 
                    receive={selectedRecord} 
                    onSave={handleSave} 
                    isSaving={isMutating}
                />
            </Modal>
        </div>
    );
};

export default PostalReceive;
