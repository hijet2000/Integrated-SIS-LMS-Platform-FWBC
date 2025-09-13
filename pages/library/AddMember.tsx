import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent } from '@/components/ui/Card';
import { useCan } from '@/hooks/useCan';
import { getStudents, getTeachers, libraryMemberApi, getClassrooms } from '@/services/sisApi';
// FIX: Corrected import path for domain types.
import type { Student, Teacher, LibraryMember, Classroom, LibraryMemberStatus } from '@/types';
import EmptyState from '@/components/ui/EmptyState';

type User = (Student & { userType: 'Student' }) | (Teacher & { userType: 'Teacher' });

const statusColors: { [key in LibraryMemberStatus]: string } = {
  Active: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  Suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  Inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};


const AddMember: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    const [activeTab, setActiveTab] = useState<'active' | 'add'>('active');

    const canRead = can('read', 'library.members', { kind: 'site', id: siteId! });
    const canCreate = can('create', 'library.members', { kind: 'site', id: siteId! });
    const canUpdate = can('update', 'library.members', { kind: 'site', id: siteId! });
    const canDelete = can('delete', 'library.members', { kind: 'site', id: siteId! });
    
    // --- Data Fetching ---
    const { data: students = [], isLoading: l1 } = useQuery<Student[], Error>({ queryKey: ['students', siteId], queryFn: () => getStudents(siteId!) });
    const { data: teachers = [], isLoading: l2 } = useQuery<Teacher[], Error>({ queryKey: ['teachers', siteId], queryFn: () => getTeachers(siteId!) });
    const { data: members = [], isLoading: l3 } = useQuery<LibraryMember[], Error>({ queryKey: ['libraryMembers', siteId], queryFn: () => libraryMemberApi.get(siteId!) });
    const { data: classrooms = [], isLoading: l4 } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!) });

    const isLoading = l1 || l2 || l3 || l4;

    // --- Mutations ---
    const mutationOptions = {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['libraryMembers', siteId] }),
        onError: (err: Error) => alert(`Operation failed: ${err.message}`),
    };

    const addMutation = useMutation({
        mutationFn: (newMember: Omit<LibraryMember, 'id'|'siteId'>) => libraryMemberApi.add(newMember),
        ...mutationOptions,
        onSuccess: () => {
            mutationOptions.onSuccess();
            alert('Member added successfully!');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ memberId, status }: { memberId: string, status: LibraryMemberStatus }) => 
            libraryMemberApi.update(memberId, { status }),
        ...mutationOptions,
        onSuccess: () => {
            mutationOptions.onSuccess();
            alert('Member status updated!');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (memberId: string) => libraryMemberApi.delete(memberId),
        ...mutationOptions,
        onSuccess: () => {
            mutationOptions.onSuccess();
            alert('Membership revoked successfully!');
        },
    });

    // --- Memoized Data ---
    const allUsers: User[] = useMemo(() => [
        ...students.map(s => ({ ...s, userType: 'Student' as const })),
        ...teachers.map(t => ({ ...t, userType: 'Teacher' as const })),
    ], [students, teachers]);

    const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u])), [allUsers]);
    const memberMap = useMemo(() => new Map(members.map(m => [m.userId, m])), [members]);
    const classroomMap = useMemo(() => new Map(classrooms.map(c => [c.id, c.name])), [classrooms]);

    const nonMembers = useMemo(() => allUsers.filter(u => !memberMap.has(u.id)), [allUsers, memberMap]);

    if (!canRead) return <ErrorState title="Access Denied" message="You do not have permission to manage library members." />;

    return (
        <div>
            <PageHeader title="Manage Library Members" subtitle="Manage student and staff library memberships."/>
            
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('active')} className={`${activeTab === 'active' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Active Members ({members.length})</button>
                    <button onClick={() => setActiveTab('add')} className={`${activeTab === 'add' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Add New Member ({nonMembers.length})</button>
                </nav>
            </div>

            <Card>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Spinner/></div>}
                    {!isLoading && activeTab === 'active' && (
                        members.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y">
                                    <thead><tr>
                                        <th className="px-6 py-3 text-left text-xs uppercase">Member Name</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase">Class/Dept</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase">Library Card No.</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase">Status</th>
                                        <th className="px-6 py-3 text-right text-xs uppercase">Actions</th>
                                    </tr></thead>
                                    {/* FIX: Map over members to render table rows instead of trying to render the array directly. */}
                                    <tbody className="bg-white dark:bg-gray-800 divide-y">
                                        {members.map(member => {
                                            const user = userMap.get(member.userId);
                                            if (!user) return null;
                                            const name = user.userType === 'Student' ? `${user.firstName} ${user.lastName}` : user.name;
                                            const classOrDept = user.userType === 'Student' ? classroomMap.get(user.classroomId) : user.department;
                                            
                                            return (
                                                <tr key={member.id}>
                                                    <td className="px-6 py-4 font-medium">{name}</td>
                                                    <td className="px-6 py-4">{member.memberType}</td>
                                                    <td className="px-6 py-4">{classOrDept}</td>
                                                    <td className="px-6 py-4 font-mono">{member.libraryCardNo}</td>
                                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[member.status]}`}>{member.status}</span></td>
                                                    <td className="px-6 py-4 text-right space-x-2">
                                                        {canUpdate && member.status !== 'Suspended' && <Button size="sm" onClick={() => updateMutation.mutate({ memberId: member.id, status: 'Suspended'})}>Suspend</Button>}
                                                        {canUpdate && member.status === 'Suspended' && <Button size="sm" onClick={() => updateMutation.mutate({ memberId: member.id, status: 'Active'})}>Re-activate</Button>}
                                                        {canDelete && <Button size="sm" variant="danger" onClick={() => window.confirm('Are you sure?') && deleteMutation.mutate(member.id)}>Revoke</Button>}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : <EmptyState title="No Active Members" message="Add a member from the next tab to get started." />
                    )}
                    
                     {!isLoading && activeTab === 'add' && (
                         nonMembers.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y">
                                     <thead><tr>
                                        <th className="px-6 py-3 text-left text-xs uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs uppercase">Class/Dept</th>
                                        <th className="px-6 py-3 text-right text-xs uppercase">Actions</th>
                                    </tr></thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y">
                                        {nonMembers.map(user => {
                                            const name = user.userType === 'Student' ? `${user.firstName} ${user.lastName}` : user.name;
                                            const classOrDept = user.userType === 'Student' ? classroomMap.get(user.classroomId) : user.department;
                                            
                                            return (
                                                <tr key={user.id}>
                                                    <td className="px-6 py-4 font-medium">{name}</td>
                                                    <td className="px-6 py-4">{user.userType}</td>
                                                    <td className="px-6 py-4">{classOrDept}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        {canCreate && <Button size="sm" onClick={() => addMutation.mutate({
                                                            userId: user.id,
                                                            memberType: user.userType,
                                                            libraryCardNo: `${user.userType === 'Student' ? 'S' : 'T'}${user.id.slice(-4)}${new Date().getFullYear()}`,
                                                            status: 'Active',
                                                        })} isLoading={addMutation.isPending && addMutation.variables?.userId === user.id}>Add as Member</Button>}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                         ) : <EmptyState title="All Users are Members" message="All students and staff in the system have been added to the library." />
                     )}
                </CardContent>
            </Card>
        </div>
    );
};

// FIX: Added default export to resolve lazy loading error in App.tsx.
export default AddMember;
