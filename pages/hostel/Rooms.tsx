import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
import { hostelRoomApi, hostelApi, roomTypeApi } from '@/services/sisApi';
import type { HostelRoom, Hostel, RoomType } from '@/types';
import EmptyState from '@/components/ui/EmptyState';

const RoomForm: React.FC<{
    item?: HostelRoom | null;
    onSave: (item: Omit<HostelRoom, 'id' | 'siteId'> | HostelRoom) => void;
    onCancel: () => void;
    hostels: Hostel[];
    roomTypes: RoomType[];
}> = ({ item, onSave, onCancel, hostels, roomTypes }) => {
    const [formState, setFormState] = useState({
        hostelId: item?.hostelId ?? '',
        roomTypeId: item?.roomTypeId ?? '',
        roomNumber: item?.roomNumber ?? '',
        // FIX: These properties are now part of the type, so this is correct.
        capacity: item?.capacity ?? 2,
        costPerBed: item?.costPerBed ?? 500,
        // FIX: Added missing 'status' property to initial form state.
        status: item?.status ?? 'Available',
    });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(item ? { ...item, ...formState } : formState as Omit<HostelRoom, 'id' | 'siteId'>);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div><label>Hostel</label><select value={formState.hostelId} onChange={e => setFormState(p => ({ ...p, hostelId: e.target.value }))} required className="w-full rounded-md"><option value="">Select</option>{hostels.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}</select></div>
                <div><label>Room Type</label><select value={formState.roomTypeId} onChange={e => setFormState(p => ({ ...p, roomTypeId: e.target.value }))} required className="w-full rounded-md"><option value="">Select</option>{roomTypes.map(rt=><option key={rt.id} value={rt.id}>{rt.name}</option>)}</select></div>
                <div><label>Room Number</label><input value={formState.roomNumber} onChange={e => setFormState(p => ({ ...p, roomNumber: e.target.value }))} required className="w-full rounded-md"/></div>
                <div><label>Capacity</label><input type="number" value={formState.capacity} onChange={e => setFormState(p => ({ ...p, capacity: parseInt(e.target.value) }))} required className="w-full rounded-md"/></div>
                <div><label>Cost per Bed ($)</label><input type="number" step="0.01" value={formState.costPerBed} onChange={e => setFormState(p => ({ ...p, costPerBed: parseFloat(e.target.value) }))} required className="w-full rounded-md"/></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save</Button>
            </div>
        </form>
    );
};

const RoomsPage: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<HostelRoom | null>(null);

    const canManage = can('update', 'hostel', { kind: 'site', id: siteId! });

    const { data: items = [], isLoading: l1 } = useQuery<HostelRoom[], Error>({ queryKey: ['hostelRooms', siteId], queryFn: () => hostelRoomApi.get(siteId!) });
    const { data: hostels = [], isLoading: l2 } = useQuery<Hostel[], Error>({ queryKey: ['hostels', siteId], queryFn: () => hostelApi.get(siteId!) });
    const { data: roomTypes = [], isLoading: l3 } = useQuery<RoomType[], Error>({ queryKey: ['roomTypes', siteId], queryFn: () => roomTypeApi.get(siteId!) });

    const hostelMap = useMemo(() => new Map(hostels.map(h=>[h.id, h.name])), [hostels]);
    const roomTypeMap = useMemo(() => new Map(roomTypes.map(rt=>[rt.id, rt.name])), [roomTypes]);
    
    const mutationOptions = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['hostelRooms', siteId] }); setIsModalOpen(false); } };
    const addMutation = useMutation({ mutationFn: (item: any) => hostelRoomApi.add(item), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (item: HostelRoom) => hostelRoomApi.update(item.id, item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => hostelRoomApi.delete(id), ...mutationOptions });
    const handleSave = (item: any) => selected ? updateMutation.mutate({ ...selected, ...item }) : addMutation.mutate(item);

    const isLoading = l1 || l2 || l3;
    if (isLoading) return <Spinner />;

    return (
        <div>
            <PageHeader title="Hostel Rooms" actions={canManage && <Button onClick={() => { setSelected(null); setIsModalOpen(true); }}>Add Room</Button>} />
            <Card>
                <CardContent>
                    {items.length > 0 ? (
                        <table className="min-w-full divide-y">
                            <thead><tr><th className="p-2 text-left">Room No.</th><th className="p-2 text-left">Hostel</th><th className="p-2 text-left">Type</th><th className="p-2 text-left">Capacity</th><th className="p-2 text-left">Cost</th><th className="p-2 text-right">Actions</th></tr></thead>
                            <tbody className="divide-y">
                                {items.map(item => (
                                    <tr key={item.id}>
                                        <td className="p-2 font-semibold">{item.roomNumber}</td>
                                        <td className="p-2">{hostelMap.get(item.hostelId)}</td>
                                        <td className="p-2">{roomTypeMap.get(item.roomTypeId)}</td>
                                        {/* FIX: Corrected property access to match updated type. */}
                                        <td className="p-2">{item.capacity}</td>
                                        <td className="p-2">${item.costPerBed.toFixed(2)}</td>
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
                    ) : <EmptyState title="No Rooms" message="Add a room to get started." />}
                </CardContent>
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selected ? 'Edit Room' : 'Add Room'}>
                <RoomForm item={selected} onSave={handleSave} onCancel={() => setIsModalOpen(false)} hostels={hostels} roomTypes={roomTypes} />
            </Modal>
        </div>
    );
};

export default RoomsPage;