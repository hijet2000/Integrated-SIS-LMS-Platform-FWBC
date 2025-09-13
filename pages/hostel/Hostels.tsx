
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
import { hostelApi } from '@/services/sisApi';
import type { Hostel } from '@/types';
import EmptyState from '@/components/ui/EmptyState';


const HostelForm: React.FC<{
    item?: Hostel | null;
    onSave: (item: Omit<Hostel, 'id' | 'siteId'> | Hostel) => void;
}> = ({ item, onSave }) => {
    const [formState, setFormState] = useState({
        name: item?.name ?? '',
        type: item?.type ?? 'Boys',
        address: item?.address ?? '',
        intake: item?.intake ?? 100,
    });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(item ? { ...item, ...formState } : formState);
    };

    return (
        <form id="hostel-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div><label>Hostel Name</label><input value={formState.name} onChange={e => setFormState(p => ({ ...p, name: e.target.value }))} required className="w-full rounded-md"/></div>
                <div><label>Type</label><select value={formState.type} onChange={e => setFormState(p => ({ ...p, type: e.target.value as 'Boys'|'Girls' }))} className="w-full rounded-md"><option>Boys</option><option>Girls</option></select></div>
                <div className="col-span-2"><label>Address</label><textarea value={formState.address} onChange={e => setFormState(p => ({ ...p, address: e.target.value }))} rows={2} className="w-full rounded-md"/></div>
                <div><label>Intake (Capacity)</label><input type="number" value={formState.intake} onChange={e => setFormState(p => ({ ...p, intake: parseInt(e.target.value) }))} required className="w-full rounded-md"/></div>
            </div>
            <button type="submit" className="hidden" />
        </form>
    );
};

const HostelsPage: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<Hostel | null>(null);

    const canManage = can('school:write');

    const { data: items, isLoading, isError, error } = useQuery<Hostel[], Error>({ queryKey: ['hostels', siteId], queryFn: () => hostelApi.get(siteId!) });
    
    const mutationOptions = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['hostels', siteId] }); setIsModalOpen(false); } };
    const addMutation = useMutation({ mutationFn: (item: any) => hostelApi.add(item), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (item: Hostel) => hostelApi.update(item.id, item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => hostelApi.delete(id), ...mutationOptions });
    const handleSave = (item: any) => selected ? updateMutation.mutate({ ...selected, ...item }) : addMutation.mutate(item);

    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState title="Error" message={(error as Error).message} />;

    return (
        <div>
            <PageHeader title="Hostels" actions={canManage && <Button onClick={() => { setSelected(null); setIsModalOpen(true); }}>Add Hostel</Button>} />
            <Card>
                <CardContent>
                    {items && items.length > 0 ? (
                        <table className="min-w-full divide-y">
                            <thead><tr><th className="p-2 text-left">Name</th><th className="p-2 text-left">Type</th><th className="p-2 text-left">Intake</th><th className="p-2 text-right">Actions</th></tr></thead>
                            <tbody className="divide-y">
                                {items.map(item => (
                                    <tr key={item.id}>
                                        <td className="p-2 font-semibold">{item.name}</td>
                                        <td className="p-2">{item.type}</td>
                                        <td className="p-2">{item.intake}</td>
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
                    ) : <EmptyState title="No Hostels" message="Add a hostel to get started." />}
                </CardContent>
            </Card>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selected ? 'Edit Hostel' : 'Add Hostel'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button
                            type="submit"
                            form="hostel-form"
                            className="ml-2"
                            isLoading={addMutation.isPending || updateMutation.isPending}
                        >
                            Save
                        </Button>
                    </>
                }
            >
                <HostelForm item={selected} onSave={handleSave} />
            </Modal>
        </div>
    );
};

export default HostelsPage;
