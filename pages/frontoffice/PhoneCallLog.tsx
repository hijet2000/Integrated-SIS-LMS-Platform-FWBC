
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
import { getPhoneCallLogs, addPhoneCallLog, updatePhoneCallLog, deletePhoneCallLog, getTeachers } from '@/services/sisApi';
// FIX: Changed import path from @/constants to @/types to correct the module resolution error.
import type { PhoneCallLog, CallTypeValue, Teacher } from '@/types';

// FIX: Correctly typed call type options with CallTypeValue and purpose options as a string array.
const CALL_TYPE_OPTIONS: CallTypeValue[] = ['Incoming', 'Outgoing'];
const PURPOSE_OPTIONS: string[] = ['Enquiry', 'Complaint', 'Information Request', 'Other'];

const formatDateTimeForInput = (isoString?: string) => {
    if (!isoString) return '';
    return new Date(isoString).toISOString().slice(0, 16);
};

const CallLogForm: React.FC<{
    call?: PhoneCallLog | null;
    onSave: (call: Omit<PhoneCallLog, 'id' | 'siteId'> | PhoneCallLog) => void;
    onCancel: () => void;
    isSaving: boolean;
    staff: Teacher[];
}> = ({ call, onSave, onCancel, isSaving, staff }) => {
    const [formState, setFormState] = useState({
        callType: call?.callType ?? 'Incoming',
        name: call?.name ?? '',
        phone: call?.phone ?? '',
        date: call?.date ? formatDateTimeForInput(call.date) : formatDateTimeForInput(new Date().toISOString()),
        callDuration: call?.callDuration ?? '',
        purpose: call?.purpose ?? 'Enquiry',
        description: call?.description ?? '',
        assignedTo: call?.assignedTo ?? '',
        nextFollowUpDate: call?.nextFollowUpDate ?? '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submissionData = {
            ...formState,
            date: new Date(formState.date).toISOString(),
        };
        if (call) {
            onSave({ ...call, ...submissionData });
        } else {
            onSave(submissionData as Omit<PhoneCallLog, 'id' | 'siteId'>);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium">Call Type</label><select name="callType" value={formState.callType} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600">{CALL_TYPE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                <div><label className="block text-sm font-medium">Name <span className="text-red-500">*</span></label><input type="text" name="name" value={formState.name} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
                <div><label className="block text-sm font-medium">Phone <span className="text-red-500">*</span></label><input type="tel" name="phone" value={formState.phone} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
                <div><label className="block text-sm font-medium">Purpose</label><select name="purpose" value={formState.purpose} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600">{PURPOSE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                <div><label className="block text-sm font-medium">Date & Time</label><input type="datetime-local" name="date" value={formState.date} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
                <div><label className="block text-sm font-medium">Duration (e.g. 5m)</label><input type="text" name="callDuration" value={formState.callDuration} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
                <div><label className="block text-sm font-medium">Assigned To</label><select name="assignedTo" value={formState.assignedTo} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"><option value="">Unassigned</option>{staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium">Next Follow-up</label><input type="date" name="nextFollowUpDate" value={formState.nextFollowUpDate} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
            </div>
            <div><label className="block text-sm font-medium">Description / Notes</label><textarea name="description" value={formState.description} onChange={handleChange} rows={3} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
            <div className="hidden"><button type="submit"/></div>
        </form>
    );
};

const PhoneCallLog: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCall, setSelectedCall] = useState<PhoneCallLog | null>(null);
    const [filters, setFilters] = useState({ callType: 'all' });

    // FIX: Corrected useCan calls to use a single scope string.
    const canCreate = can('school:write');
    const canUpdate = can('school:write');
    const canDelete = can('school:write');

    const { data: callLogs, isLoading, isError, error } = useQuery<PhoneCallLog[], Error>({
        queryKey: ['phoneCallLogs', siteId],
        queryFn: () => getPhoneCallLogs(siteId!),
        enabled: !!siteId,
    });
    
    const { data: staff = [] } = useQuery<Teacher[], Error>({ queryKey: ['teachers', siteId], queryFn: () => getTeachers(siteId!) });

    const mutationOptions = {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['phoneCallLogs', siteId] }),
    };
    
    const addMutation = useMutation({ mutationFn: (newCall: Omit<PhoneCallLog, 'id' | 'siteId'>) => addPhoneCallLog(newCall), ...mutationOptions, onSuccess: mutationOptions.onSuccess, onError: () => alert('Failed to add call log.') });
    const updateMutation = useMutation({ mutationFn: (call: PhoneCallLog) => updatePhoneCallLog(call.id, call), ...mutationOptions, onSuccess: mutationOptions.onSuccess, onError: () => alert('Failed to update call log.') });
    const deleteMutation = useMutation({ mutationFn: (callId: string) => deletePhoneCallLog(callId), ...mutationOptions, onError: () => alert('Failed to delete call log.') });

    const filteredLogs = useMemo(() => {
        return callLogs?.filter(log => filters.callType === 'all' || log.callType === filters.callType) || [];
    }, [callLogs, filters]);

    const handleAddClick = () => { setSelectedCall(null); setIsModalOpen(true); };
    const handleEditClick = (call: PhoneCallLog) => { setSelectedCall(call); setIsModalOpen(true); };
    const handleDeleteClick = (callId: string) => { if (window.confirm('Are you sure?')) deleteMutation.mutate(callId); };
    const handleSave = (call: Omit<PhoneCallLog, 'id' | 'siteId'> | PhoneCallLog) => {
        if ('id' in call) {
            updateMutation.mutate(call);
        } else {
            addMutation.mutate(call);
        }
        setIsModalOpen(false);
    };
    
    const isMutating = addMutation.isPending || updateMutation.isPending;

    return (
        <div>
            <PageHeader title="Phone Call Log" subtitle="Track all incoming and outgoing calls." actions={canCreate && <Button onClick={handleAddClick}>Log Call</Button>} />
            
            <Card className="mb-6">
                 <CardHeader><h3 className="font-semibold">Filters</h3></CardHeader>
                 <CardContent>
                    <div><label className="block text-sm font-medium">Call Type</label><select value={filters.callType} onChange={e => setFilters(f => ({...f, callType: e.target.value}))} className="mt-1 rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600"><option value="all">All</option>{CALL_TYPE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                    {isError && <ErrorState title="Failed to load call logs" message={error.message} />}
                    {!isLoading && !isError && (
                        filteredLogs.length > 0 ? (
                             <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Phone</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date & Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Purpose</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredLogs.map(log => (
                                            <tr key={log.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${log.callType === 'Incoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50' : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50'}`}>{log.callType}</span></td>
                                                <td className="px-6 py-4 whitespace-nowrap">{log.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{log.phone}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(log.date).toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{log.purpose}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                                    {canUpdate && <Button size="sm" variant="secondary" onClick={() => handleEditClick(log)}>Edit</Button>}
                                                    {canDelete && <Button size="sm" variant="danger" onClick={() => handleDeleteClick(log.id)} isLoading={deleteMutation.isPending && deleteMutation.variables === log.id}>Delete</Button>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <EmptyState title="No Call Logs Found" message="No calls match the current filters, or no calls have been logged yet." />
                    )}
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedCall ? 'Edit Call Log' : 'Add Call Log'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} isLoading={isMutating} className="ml-2">Save</Button>
                    </>
                }
            >
                <CallLogForm call={selectedCall} onSave={handleSave} onCancel={() => setIsModalOpen(false)} isSaving={isMutating} staff={staff} />
            </Modal>
        </div>
    );
};

export default PhoneCallLog;
