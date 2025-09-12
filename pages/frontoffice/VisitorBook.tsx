
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
import { getVisitors, addVisitor, updateVisitor, deleteVisitor, getTeachers } from '@/services/sisApi';
// FIX: Corrected import path for domain types.
import type { Visitor, Teacher } from '@/types';

// FIX: Corrected type of PURPOSE_OPTIONS to string[] to match its values.
const PURPOSE_OPTIONS: string[] = ['Enquiry', 'Meeting', 'Delivery', 'Other'];

// Helper to format ISO datetime string for input[type=datetime-local]
const formatDateTimeForInput = (isoString?: string) => {
    if (!isoString) return '';
    // The slice(0, 16) gets 'YYYY-MM-DDTHH:mm'
    const d = new Date(isoString);
    // Adjust for timezone offset before slicing
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
};

// FIX: The component was incomplete, returning void. Implemented the form JSX.
const VisitorForm: React.FC<{
    visitor?: Visitor | null;
    onSave: (visitor: Omit<Visitor, 'id' | 'siteId'> | Visitor) => void;
    onCancel: () => void;
    isSaving: boolean;
    staff: Teacher[];
}> = ({ visitor, onSave, onCancel, isSaving, staff }) => {
    const [formState, setFormState] = useState({
        purpose: visitor?.purpose ?? 'Meeting',
        name: visitor?.name ?? '',
        phone: visitor?.phone ?? '',
        toMeet: visitor?.toMeet ?? '',
        numberOfPersons: visitor?.numberOfPersons ?? 1,
        checkIn: visitor?.checkIn ? formatDateTimeForInput(visitor.checkIn) : formatDateTimeForInput(new Date().toISOString()),
        checkOut: visitor?.checkOut ? formatDateTimeForInput(visitor.checkOut) : '',
        notes: visitor?.notes ?? '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'number' ? parseInt(value) || 1 : value;
        setFormState(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submissionData = {
            ...formState,
            checkIn: new Date(formState.checkIn).toISOString(),
            checkOut: formState.checkOut ? new Date(formState.checkOut).toISOString() : undefined,
        };
        if (visitor) {
            onSave({ ...visitor, ...submissionData });
        } else {
            onSave(submissionData as Omit<Visitor, 'id' | 'siteId'>);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium">Name <span className="text-red-500">*</span></label><input type="text" name="name" value={formState.name} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
                <div><label className="block text-sm font-medium">Phone <span className="text-red-500">*</span></label><input type="tel" name="phone" value={formState.phone} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
                <div><label className="block text-sm font-medium">Purpose</label><select name="purpose" value={formState.purpose} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600">{PURPOSE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                <div><label className="block text-sm font-medium">To Meet</label><select name="toMeet" value={formState.toMeet} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"><option value="">Select Staff</option>{staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium">Number of Persons</label><input type="number" name="numberOfPersons" value={formState.numberOfPersons} onChange={handleChange} required min="1" className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
                <div><label className="block text-sm font-medium">Check In</label><input type="datetime-local" name="checkIn" value={formState.checkIn} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
                <div><label className="block text-sm font-medium">Check Out</label><input type="datetime-local" name="checkOut" value={formState.checkOut} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
            </div>
            <div><label className="block text-sm font-medium">Notes</label><textarea name="notes" value={formState.notes} onChange={handleChange} rows={2} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
            <div className="hidden"><button type="submit"/></div>
        </form>
    );
};

const VisitorBook: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const canCreate = can('create', 'frontoffice.visitors', { kind: 'site', id: siteId! });
    const canUpdate = can('update', 'frontoffice.visitors', { kind: 'site', id: siteId! });
    const canDelete = can('delete', 'frontoffice.visitors', { kind: 'site', id: siteId! });

    const { data: visitors, isLoading, isError, error } = useQuery<Visitor[], Error>({
        queryKey: ['visitors', siteId],
        queryFn: () => getVisitors(siteId!),
        enabled: !!siteId,
    });
    
    const { data: staff = [] } = useQuery<Teacher[], Error>({ queryKey: ['teachers', siteId], queryFn: () => getTeachers(siteId!) });

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visitors', siteId] });
            setIsModalOpen(false);
        },
    };
    
    const addMutation = useMutation({ mutationFn: (newVisitor: Omit<Visitor, 'id' | 'siteId'>) => addVisitor(newVisitor), ...mutationOptions, onError: () => alert('Failed to add visitor.') });
    const updateMutation = useMutation({ mutationFn: (visitor: Visitor) => updateVisitor(visitor.id, visitor), ...mutationOptions, onError: () => alert('Failed to update visitor.') });
    const deleteMutation = useMutation({ mutationFn: (visitorId: string) => deleteVisitor(visitorId), ...mutationOptions, onError: () => alert('Failed to delete visitor.') });

    const filteredVisitors = useMemo(() => {
        if (!visitors) return [];
        return visitors.filter(v => 
            v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.phone.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [visitors, searchTerm]);
    
    const handleAddClick = () => { setSelectedVisitor(null); setIsModalOpen(true); };
    const handleEditClick = (visitor: Visitor) => { setSelectedVisitor(visitor); setIsModalOpen(true); };
    const handleDeleteClick = (visitorId: string) => { if (window.confirm('Are you sure?')) deleteMutation.mutate(visitorId); };
    const handleSave = (visitor: Omit<Visitor, 'id' | 'siteId'> | Visitor) => {
        'id' in visitor ? updateMutation.mutate(visitor) : addMutation.mutate(visitor);
    };

    const isMutating = addMutation.isPending || updateMutation.isPending;

    return (
        <div>
            <PageHeader title="Visitor Book" subtitle="Log and manage campus visitors." actions={canCreate && <Button onClick={handleAddClick}>Add Visitor</Button>} />
            
             <Card className="mb-6">
                 <CardHeader><h3 className="font-semibold">Search Visitors</h3></CardHeader>
                 <CardContent>
                    <input type="text" placeholder="Search by name or phone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-1/3 rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600"/>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                    {isError && <ErrorState title="Failed to load visitors" message={error.message} />}
                    {!isLoading && !isError && (
                        filteredVisitors.length > 0 ? (
                             <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Phone</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Purpose</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">To Meet</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Check In</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Check Out</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredVisitors.map(v => (
                                            <tr key={v.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">{v.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{v.phone}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{v.purpose}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{v.toMeet}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(v.checkIn).toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{v.checkOut ? new Date(v.checkOut).toLocaleString() : 'Not checked out'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                                    {canUpdate && <Button size="sm" variant="secondary" onClick={() => handleEditClick(v)}>Edit</Button>}
                                                    {canDelete && <Button size="sm" variant="danger" onClick={() => handleDeleteClick(v.id)} isLoading={deleteMutation.isPending && deleteMutation.variables === v.id}>Delete</Button>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <EmptyState title="No Visitors Found" message="No visitors match your search, or no visitors have been logged yet." />
                    )}
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedVisitor ? 'Edit Visitor' : 'Add Visitor'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} isLoading={isMutating} className="ml-2">Save</Button>
                    </>
                }
            >
                <VisitorForm visitor={selectedVisitor} onSave={handleSave} onCancel={() => setIsModalOpen(false)} isSaving={isMutating} staff={staff} />
            </Modal>
        </div>
    );
};

// FIX: Added default export to resolve lazy loading error in App.tsx.
export default VisitorBook;
