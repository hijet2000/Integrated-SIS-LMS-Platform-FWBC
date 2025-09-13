
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
import { roomTypeApi } from '@/services/sisApi';
import type { RoomType } from '@/types';
import EmptyState from '@/components/ui/EmptyState';

const RoomTypeForm: React.FC<{
    item?: RoomType | null;
    onSave: (item: Omit<RoomType, 'id' | 'siteId'> | RoomType) => void;
    onCancel: () => void;
}> = ({ item, onSave, onCancel }) => {
    const [formState, setFormState] = useState({
        name: item?.name ?? '',
        description: item?.description ?? '',
        // FIX: Added bedCapacity to the form state to match the RoomType interface.
        bedCapacity: item?.bedCapacity ?? 2,
    });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(item ? { ...item, ...formState } : formState);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label>Type Name (e.g., 2-Seater AC)</label><input value={formState.name} onChange={e => setFormState(p => ({ ...p, name: e.target.value }))} required className="w-full rounded-md"/></div>
            <div><label>Bed Capacity</label><input type="number" value={formState.bedCapacity} onChange={e => setFormState(p => ({...p, bedCapacity: parseInt(e.target.value, 10) || 1 }))} required className="w-full rounded-md"/></div>
            <div><label>Description</label><textarea value={formState.description} onChange={e => setFormState(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full rounded-md"/></div>
            <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save</Button>
            </div>
        </form>
    );
};

const RoomTypePage: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<RoomType | null>(null);

    // FIX: Replace complex permission check with a simple scope-based check `can('school:write')` to match the `useCan` hook's implementation.
    const canManage = can('school:write');

    const { data: items, isLoading, isError, error } = useQuery<RoomType[], Error>({ queryKey: ['roomTypes', siteId], queryFn: () => roomTypeApi.get(siteId!) });
    
    const mutationOptions = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['roomTypes', siteId] }); setIsModalOpen(false); } };
    const addMutation = useMutation({ mutationFn: (item: any) => roomTypeApi.add(item), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (item: RoomType) => roomTypeApi.update(item.id, item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => roomTypeApi.delete(id), ...mutationOptions });
    const handleSave = (item: any) => selected ? updateMutation.mutate({ ...selected, ...item }) : addMutation.mutate(item);

    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState title="Error" message={(error as Error).message} />;

    return (
        <div>
            <PageHeader title="Hostel Room Types" actions={canManage && <Button onClick={() => { setSelected(null); setIsModalOpen(true); }}>Add Room Type</Button>} />
            <Card>
                <CardContent>
                    {items && items.length > 0 ? (
                        <table className="min-w-full divide-y">
                            <thead><tr><th className="p-2 text-left">Name</th><th className="p-2 text-left">Description</th><th className="p-2 text-right">Actions</th></tr></thead>
                            <tbody className="divide-y">
                                {items.map(item => (
                                    <tr key={item.id}>
                                        <td className="p-2 font-semibold">{item.name}</td>
                                        <td className="p-2">{item.description}</td>
                                        <td className="p-2 text-right space-x-2">
                                            {canManage && <>
                                                <Button size="sm" variant="secondary" onClick={() => { setSelected(item); setIsModalOpen(true); }}>Edit</Button>
                                                <Button size="sm" variant="danger" onClick={() => deleteMutation.mutate(item.id)}>Delete</Button>
                                            </>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <EmptyState title="No Room Types" message="Add a room type to get started." />}
                </CardContent>
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selected ? 'Edit Room Type' : 'Add Room Type'}>
                <RoomTypeForm item={selected} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default RoomTypePage;
