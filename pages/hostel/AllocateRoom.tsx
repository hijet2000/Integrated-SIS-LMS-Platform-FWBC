import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { useCan } from '@/hooks/useCan';
import { roomAllocationApi, getStudents, hostelRoomApi, hostelApi } from '@/services/sisApi';
// FIX: Changed RoomAllocation to HostelAllocation to match the exported type.
import type { HostelAllocation, Student, HostelRoom, Hostel } from '@/types';
import EmptyState from '@/components/ui/EmptyState';

const AllocateRoom: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedRoomId, setSelectedRoomId] = useState('');

    const canManage = can('update', 'hostel', { kind: 'site', id: siteId! });

    const { data: allocations = [], isLoading: l1 } = useQuery<HostelAllocation[], Error>({ queryKey: ['roomAllocations', siteId], queryFn: () => roomAllocationApi.get(siteId!) });
    const { data: students = [], isLoading: l2 } = useQuery<Student[], Error>({ queryKey: ['students', siteId], queryFn: () => getStudents(siteId!) });
    const { data: rooms = [], isLoading: l3 } = useQuery<HostelRoom[], Error>({ queryKey: ['hostelRooms', siteId], queryFn: () => hostelRoomApi.get(siteId!) });
    const { data: hostels = [], isLoading: l4 } = useQuery<Hostel[], Error>({ queryKey: ['hostels', siteId], queryFn: () => hostelApi.get(siteId!) });
    
    const studentMap = useMemo(() => new Map(students.map(s => [s.id, `${s.firstName} ${s.lastName}`])), [students]);
    const roomMap = useMemo(() => new Map(rooms.map(r => [r.id, r.roomNumber])), [rooms]);
    const hostelMap = useMemo(() => new Map(hostels.map(h => [h.id, h.name])), [hostels]);

    const allocatedStudentIds = useMemo(() => new Set(allocations.map(a => a.studentId)), [allocations]);
    const availableStudents = useMemo(() => students.filter(s => !allocatedStudentIds.has(s.id)), [students, allocatedStudentIds]);
    
    const mutationOptions = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['roomAllocations', siteId] }); setSelectedStudentId(''); setSelectedRoomId(''); } };
    const addMutation = useMutation({ mutationFn: (item: any) => roomAllocationApi.add(item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => roomAllocationApi.delete(id), ...mutationOptions });
    
    const handleAllocate = () => {
        if (!selectedStudentId || !selectedRoomId) return;
        addMutation.mutate({ studentId: selectedStudentId, roomId: selectedRoomId, allocatedOn: new Date().toISOString().split('T')[0] });
    };

    const isLoading = l1 || l2 || l3 || l4;
    if (isLoading) return <Spinner />;

    return (
        <div>
            <PageHeader title="Allocate Hostel Room" />
            {canManage && (
                <Card className="mb-6">
                    <CardHeader><h3 className="font-semibold">Assign Room</h3></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div><label>Student</label><select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className="w-full rounded-md"><option value="">Select</option>{availableStudents.map(s=><option key={s.id} value={s.id}>{studentMap.get(s.id)}</option>)}</select></div>
                        <div><label>Room</label><select value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)} className="w-full rounded-md"><option value="">Select</option>{rooms.map(r=><option key={r.id} value={r.id}>{r.roomNumber} ({hostelMap.get(r.hostelId)})</option>)}</select></div>
                        <Button onClick={handleAllocate} disabled={!selectedStudentId || !selectedRoomId}>Allocate</Button>
                    </CardContent>
                </Card>
            )}
            <Card>
                <CardHeader><h3 className="font-semibold">Current Allocations</h3></CardHeader>
                <CardContent>
                    {allocations.length > 0 ? (
                        <table className="min-w-full divide-y">
                            <thead><tr><th className="p-2 text-left">Student</th><th className="p-2 text-left">Room</th><th className="p-2 text-left">Hostel</th><th className="p-2 text-left">Date</th><th className="p-2 text-right">Actions</th></tr></thead>
                            <tbody className="divide-y">
                                {allocations.map(item => {
                                    const room = rooms.find(r => r.id === item.roomId);
                                    return (
                                        <tr key={item.id}>
                                            <td className="p-2 font-semibold">{studentMap.get(item.studentId)}</td>
                                            <td className="p-2">{roomMap.get(item.roomId)}</td>
                                            <td className="p-2">{room ? hostelMap.get(room.hostelId) : ''}</td>
                                            <td className="p-2">{new Date(item.allocatedOn).toLocaleDateString()}</td>
                                            <td className="p-2 text-right"><Button size="sm" variant="danger" onClick={() => deleteMutation.mutate(item.id)}>Deallocate</Button></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : <EmptyState title="No Allocations" message="No students are currently allocated to any rooms." />}
                </CardContent>
            </Card>
        </div>
    );
};

export default AllocateRoom;