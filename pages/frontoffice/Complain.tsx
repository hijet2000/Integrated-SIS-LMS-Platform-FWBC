
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
import { getComplaints, addComplaint, updateComplaint, deleteComplaint, getTeachers } from '@/services/sisApi';
// FIX: Changed import path from @/constants to @/types to correct the module resolution error.
import type { Complaint, ComplaintPriority, ComplaintStatus, Teacher } from '@/types';

// FIX: Explicitly typed options as string arrays.
const TYPE_OPTIONS: string[] = ['Academic', 'Finance', 'Facilities', 'HR', 'General'];
const SOURCE_OPTIONS: string[] = ['Phone', 'In-Person', 'Online', 'Letter'];
const PRIORITY_OPTIONS: ComplaintPriority[] = ['Low', 'Medium', 'High'];
const STATUS_OPTIONS: ComplaintStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed'];

const statusColors: { [key in ComplaintStatus]: string } = {
  Open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50',
  'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50',
  Resolved: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50',
  Closed: 'bg-green-100 text-green-800 dark:bg-green-900/50',
};

const ComplaintForm: React.FC<{
    complaint?: Complaint | null;
    onSave: (complaint: Omit<Complaint, 'id' | 'siteId'> | Complaint) => void;
    onCancel: () => void;
    isSaving: boolean;
    staff: Teacher[];
}> = ({ complaint, onSave, onCancel, isSaving, staff }) => {
    const [formState, setFormState] = useState({
        complainantName: complaint?.complainantName ?? '',
        phone: complaint?.phone ?? '',
        complaintType: complaint?.complaintType ?? 'General',
        source: complaint?.source ?? 'Phone',
        date: complaint?.date ?? new Date().toISOString().split('T')[0],
        description: complaint?.description ?? '',
        priority: complaint?.priority ?? 'Medium',
        assignedTo: complaint?.assignedTo ?? '',
        actionTaken: complaint?.actionTaken ?? '',
        status: complaint?.status ?? 'Open',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (complaint) {
            onSave({ ...complaint, ...formState });
        } else {
            onSave(formState as Omit<Complaint, 'id' | 'siteId'>);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium">Complainant Name <span className="text-red-500">*</span></label><input type="text" name="complainantName" value={formState.complainantName} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
                <div><label className="block text-sm font-medium">Phone</label><input type="tel" name="phone" value={formState.phone} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
                <div><label className="block text-sm font-medium">Complaint Type</label><select name="complaintType" value={formState.complaintType} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600">{TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                <div><label className="block text-sm font-medium">Source</label><select name="source" value={formState.source} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600">{SOURCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                <div><label className="block text-sm font-medium">Date</label><input type="date" name="date" value={formState.date} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
                <div><label className="block text-sm font-medium">Priority</label><select name="priority" value={formState.priority} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600">{PRIORITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                <div><label className="block text-sm font-medium">Assigned To</label><select name="assignedTo" value={formState.assignedTo} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"><option value="">Unassigned</option>{staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium">Status</label><select name="status" value={formState.status} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600">{STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
            </div>
            <div><label className="block text-sm font-medium">Description <span className="text-red-500">*</span></label><textarea name="description" value={formState.description} onChange={handleChange} required rows={3} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
            <div><label className="block text-sm font-medium">Action Taken</label><textarea name="actionTaken" value={formState.actionTaken} onChange={handleChange} rows={3} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
            <div className="hidden"><button type="submit"/></div>
        </form>
    );
};


const Complain: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [filters, setFilters] = useState({ type: 'all', status: 'all' });

    // FIX: Corrected useCan calls to use a single scope string.
    const canCreate = can('school:write');
    const canUpdate = can('school:write');
    const canDelete = can('school:write');

    const { data: complaints, isLoading, isError, error } = useQuery<Complaint[], Error>({
        queryKey: ['complaints', siteId],
        queryFn: () => getComplaints(siteId!),
        enabled: !!siteId,
    });
    
    const { data: staff = [] } = useQuery<Teacher[], Error>({ queryKey: ['teachers', siteId], queryFn: () => getTeachers(siteId!) });

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complaints', siteId] });
            setIsModalOpen(false);
        },
    };

    const addMutation = useMutation({ mutationFn: (newComplaint: Omit<Complaint, 'id' | 'siteId'>) => addComplaint(newComplaint), ...mutationOptions, onError: () => alert('Failed to add complaint.')});
    const updateMutation = useMutation({ mutationFn: (complaint: Complaint) => updateComplaint(complaint.id, complaint), ...mutationOptions, onError: () => alert('Failed to update complaint.') });
    const deleteMutation = useMutation({ mutationFn: (complaintId: string) => deleteComplaint(complaintId), ...mutationOptions, onError: () => alert('Failed to delete complaint.') });

    const filteredComplaints = useMemo(() => {
        return complaints?.filter(c => 
            (filters.type === 'all' || c.complaintType === filters.type) &&
            (filters.status === 'all' || c.status === filters.status)
        ) || [];
    }, [complaints, filters]);
    
    const handleAddClick = () => { setSelectedComplaint(null); setIsModalOpen(true); };
    const handleEditClick = (complaint: Complaint) => { setSelectedComplaint(complaint); setIsModalOpen(true); };
    const handleDeleteClick = (complaintId: string) => { if (window.confirm('Are you sure?')) deleteMutation.mutate(complaintId); };
    const handleSave = (complaint: Omit<Complaint, 'id' | 'siteId'> | Complaint) => {
        'id' in complaint ? updateMutation.mutate(complaint) : addMutation.mutate(complaint);
    };
    
    const isMutating = addMutation.isPending || updateMutation.isPending;

    return (
        <div>
            <PageHeader title="Complain Register" subtitle="Log, track, and resolve complaints." actions={canCreate && <Button onClick={handleAddClick}>Add Complaint</Button>} />

            <Card className="mb-6">
                <CardHeader><h3 className="font-semibold">Filters</h3></CardHeader>
                <CardContent className="flex items-center gap-4">
                     <div><label className="block text-sm font-medium">Complaint Type</label><select value={filters.type} onChange={e => setFilters(f => ({...f, type: e.target.value}))} className="mt-1 rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600"><option value="all">All</option>{TYPE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                     <div><label className="block text-sm font-medium">Status</label><select value={filters.status} onChange={e => setFilters(f => ({...f, status: e.target.value}))} className="mt-1 rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600"><option value="all">All</option>{STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                    {isError && <ErrorState title="Failed to load complaints" message={error.message} />}
                    {!isLoading && !isError && (
                        filteredComplaints.length > 0 ? (
                             <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Complainant</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Priority</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredComplaints.map(c => (
                                            <tr key={c.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">{c.complaintType}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{c.complainantName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(c.date + 'T00:00:00').toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{c.priority}</td>
                                                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[c.status]}`}>{c.status}</span></td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                                    {canUpdate && <Button size="sm" variant="secondary" onClick={() => handleEditClick(c)}>Edit</Button>}
                                                    {canDelete && <Button size="sm" variant="danger" onClick={() => handleDeleteClick(c.id)} isLoading={deleteMutation.isPending && deleteMutation.variables === c.id}>Delete</Button>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <EmptyState title="No Complaints Found" message="No complaints match the current filters, or no complaints have been logged yet." />
                    )}
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedComplaint ? 'Edit Complaint' : 'Add Complaint'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} isLoading={isMutating} className="ml-2">Save</Button>
                    </>
                }
            >
                <ComplaintForm complaint={selectedComplaint} onSave={handleSave} onCancel={() => setIsModalOpen(false)} isSaving={isMutating} staff={staff} />
            </Modal>
        </div>
    );
};

export default Complain;
