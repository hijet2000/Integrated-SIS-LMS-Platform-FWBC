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
import { getStudents, getTeachers, libraryMemberApi, getClassrooms } from '@/services/sisApi';
// FIX: Corrected import path for domain types.
import type { Student, Teacher, LibraryMember, LibraryMemberStatus } from '@/types';

const statusColors: { [key in LibraryMemberStatus]: string } = {
    Active: 'bg-green-100 text-green-800 dark:bg-green-900/50',
    Suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50',
    Inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700',
};


const MemberForm: React.FC<{
    member?: LibraryMember | null;
    onSave: (data: any) => void;
    isSaving: boolean;
    users: {id: string, name: string, type: 'Student' | 'Teacher'}[];
}> = ({ member, onSave, users }) => {
    const [formState, setFormState] = useState({
        userId: member?.userId ?? '',
        libraryCardNo: member?.libraryCardNo ?? `LIB-${Date.now().toString().slice(-6)}`,
        status: member?.status ?? 'Active',
    });
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedUser = users.find(u => u.id === formState.userId);
        if (!selectedUser) return;
        
        onSave({ ...formState, memberType: selectedUser.type });
    };

    return (
        <form id="member-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label>User (Student/Teacher)</label>
                <select value={formState.userId} onChange={e => setFormState(p=>({...p, userId: e.target.value}))} required className="w-full rounded-md" disabled={!!member}>
                    <option value="">Select a user</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.type})</option>)}
                </select>
            </div>
            <div>
                <label>Library Card No.</label>
                <input value={formState.libraryCardNo} onChange={e => setFormState(p=>({...p, libraryCardNo: e.target.value}))} required className="w-full rounded-md"/>
            </div>
             <div>
                <label>Status</label>
                <select value={formState.status} onChange={e => setFormState(p=>({...p, status: e.target.value as LibraryMemberStatus}))} required className="w-full rounded-md">
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>
            <button type="submit" className="hidden"/>
        </form>
    );
};


const AddMember: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<LibraryMember | null>(null);

    const canManage = can('school:write');

    const { data: members = [], isLoading: l1 } = useQuery<LibraryMember[], Error>({ queryKey: ['libraryMembers', siteId], queryFn: () => libraryMemberApi.get(siteId!) });
    const { data: students = [], isLoading: l2 } = useQuery<Student[], Error>({ queryKey: ['students', siteId], queryFn: () => getStudents(siteId!) });
    const { data: teachers = [], isLoading: l3 } = useQuery<Teacher[], Error>({ queryKey: ['teachers', siteId], queryFn: () => getTeachers(siteId!) });
    
    const users = useMemo(() => [
        ...students.map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, type: 'Student' as const })),
        ...teachers.map(t => ({ id: t.id, name: t.name, type: 'Teacher' as const })),
    ], [students, teachers]);
    
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);
    const memberIds = useMemo(() => new Set(members.map(m => m.userId)), [members]);

    const availableUsers = useMemo(() => users.filter(u => !memberIds.has(u.id)), [users, memberIds]);

    const mutationOptions = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['libraryMembers', siteId] }); setIsModalOpen(false); } };
    const addMutation = useMutation({ mutationFn: (data: any) => libraryMemberApi.add(data), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (data: LibraryMember) => libraryMemberApi.update(data.id, data), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => libraryMemberApi.delete(id), ...mutationOptions });

    const handleSave = (data: any) => {
        if (selectedMember) {
            updateMutation.mutate({ ...selectedMember, ...data });
        } else {
            addMutation.mutate(data);
        }
    };

    const isLoading = l1 || l2 || l3;
    if (isLoading) return <Spinner />;

    return (
        <div>
            <PageHeader title="Library Members" actions={canManage && <Button onClick={() => { setSelectedMember(null); setIsModalOpen(true); }}>Add Member</Button>} />
            <Card>
                <CardContent>
                    {members.length > 0 ? (
                         <table className="min-w-full divide-y">
                            <thead><tr><th className="p-2 text-left">Card No.</th><th className="p-2 text-left">Member Name</th><th className="p-2 text-left">Type</th><th className="p-2 text-left">Status</th><th className="p-2 text-right">Actions</th></tr></thead>
                            <tbody>
                                {members.map(member => (
                                    <tr key={member.id}>
                                        <td className="p-2 font-mono">{member.libraryCardNo}</td>
                                        <td className="p-2 font-semibold">{userMap.get(member.userId)}</td>
                                        <td className="p-2">{member.memberType}</td>
                                        <td className="p-2"><span className={`px-2 py-1 text-xs rounded-full ${statusColors[member.status]}`}>{member.status}</span></td>
                                        <td className="p-2 text-right space-x-2">
                                            {canManage && <>
                                                <Button size="sm" variant="secondary" onClick={() => { setSelectedMember(member); setIsModalOpen(true); }}>Edit</Button>
                                                <Button size="sm" variant="danger" onClick={() => deleteMutation.mutate(member.id)}>Delete</Button>
                                            </>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <EmptyState title="No Members Found" message="Add a student or teacher as a library member to get started." />}
                </CardContent>
            </Card>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedMember ? 'Edit Member' : 'Add Member'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button
                            type="submit"
                            form="member-form"
                            className="ml-2"
                            isLoading={addMutation.isPending || updateMutation.isPending}
                        >
                            Save Member
                        </Button>
                    </>
                }
            >
                <MemberForm
                    member={selectedMember}
                    onSave={handleSave}
                    isSaving={addMutation.isPending || updateMutation.isPending}
                    users={availableUsers}
                />
            </Modal>
        </div>
    );
};
export default AddMember;