
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
import { getAdmissionEnquiries, addAdmissionEnquiry, updateAdmissionEnquiry, deleteAdmissionEnquiry, getTeachers, getClassrooms } from '@/services/sisApi';
// FIX: Changed import path from @/constants to @/types to correct the module resolution error.
import type { AdmissionEnquiry, AdmissionEnquiryStatus, AdmissionEnquirySourceValue, Teacher, Classroom } from '@/types';

// FIX: Corrected type from AdmissionEnquirySource[] to AdmissionEnquirySourceValue[]
const SOURCE_OPTIONS: AdmissionEnquirySourceValue[] = ['Online', 'Phone', 'Walk-in', 'Referral', 'Letter', 'Other'];
// FIX: Define STATUS_OPTIONS for filtering enquiries by status.
const STATUS_OPTIONS: AdmissionEnquiryStatus[] = ['ACTIVE', 'PASSIVE', 'DEAD', 'WON', 'LOST'];

const EnquiryForm: React.FC<{
  enquiry?: AdmissionEnquiry | null;
  onSave: (enquiry: Omit<AdmissionEnquiry, 'id' | 'siteId'> | AdmissionEnquiry) => void;
  onCancel: () => void;
  isSaving: boolean;
  staff: Teacher[];
  classrooms: Classroom[];
}> = ({ enquiry, onSave, onCancel, isSaving, staff, classrooms }) => {
  const [formState, setFormState] = useState<Partial<AdmissionEnquiry>>({
    name: enquiry?.name ?? '',
    phone: enquiry?.phone ?? '',
    email: enquiry?.email ?? '',
    address: enquiry?.address ?? '',
    description: enquiry?.description ?? '',
    note: enquiry?.note ?? '',
    enquiryDate: enquiry?.enquiryDate ?? new Date().toISOString().split('T')[0],
    nextFollowUpDate: enquiry?.nextFollowUpDate ?? '',
    assignedTo: enquiry?.assignedTo ?? '',
    reference: enquiry?.reference ?? '',
    source: enquiry?.source ?? 'Online',
    classSought: enquiry?.classSought ?? '',
    numberOfChildren: enquiry?.numberOfChildren ?? 1,
    status: enquiry?.status ?? 'ACTIVE',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enquiry) {
        onSave({ ...enquiry, ...formState });
    } else {
        onSave(formState as Omit<AdmissionEnquiry, 'id' | 'siteId'>);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium">Name <span className="text-red-500">*</span></label><input type="text" name="name" value={formState.name} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
            <div><label className="block text-sm font-medium">Phone <span className="text-red-500">*</span></label><input type="tel" name="phone" value={formState.phone} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
            <div><label className="block text-sm font-medium">Email</label><input type="email" name="email" value={formState.email} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
            <div><label className="block text-sm font-medium">Enquiry Date</label><input type="date" name="enquiryDate" value={formState.enquiryDate} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
            <div><label className="block text-sm font-medium">Source</label><select name="source" value={formState.source} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600">{SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className="block text-sm font-medium">Class Sought</label><select name="classSought" value={formState.classSought} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"><option value="">Select Class</option>{classrooms.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium">Assigned To</label><select name="assignedTo" value={formState.assignedTo} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"><option value="">Unassigned</option>{staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium">Next Follow-up Date</label><input type="date" name="nextFollowUpDate" value={formState.nextFollowUpDate} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
        </div>
        <div><label className="block text-sm font-medium">Description</label><textarea name="description" value={formState.description} onChange={handleChange} rows={2} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
        <div><label className="block text-sm font-medium">Internal Notes</label><textarea name="note" value={formState.note} onChange={handleChange} rows={2} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
        <div className="hidden"><button type="submit"/></div>
    </form>
  );
};

const AdmissionEnquiry: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState<AdmissionEnquiry | null>(null);
    const [filters, setFilters] = useState({ source: 'all', status: 'all' });

    // FIX: Corrected useCan calls to use a single scope string.
    const canCreate = can('school:write');
    const canUpdate = can('school:write');
    const canDelete = can('school:write');

    const { data: enquiries, isLoading, isError, error } = useQuery<AdmissionEnquiry[], Error>({
        queryKey: ['admissionEnquiries', siteId],
        queryFn: () => getAdmissionEnquiries(siteId!),
        enabled: !!siteId,
    });

    const { data: staff = [] } = useQuery<Teacher[], Error>({ queryKey: ['teachers', siteId], queryFn: () => getTeachers(siteId!) });
    const { data: classrooms = [] } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!) });

    const addMutation = useMutation({
        mutationFn: (newEnquiry: Omit<AdmissionEnquiry, 'id' | 'siteId'>) => addAdmissionEnquiry(newEnquiry),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissionEnquiries', siteId] });
            setIsModalOpen(false);
        },
        onError: () => alert('Failed to add enquiry.')
    });

    const updateMutation = useMutation({
        mutationFn: (enquiry: AdmissionEnquiry) => updateAdmissionEnquiry(enquiry.id, enquiry),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissionEnquiries', siteId] });
            setIsModalOpen(false);
        },
        onError: () => alert('Failed to update enquiry.')
    });
    
    const deleteMutation = useMutation({
        mutationFn: (enquiryId: string) => deleteAdmissionEnquiry(enquiryId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admissionEnquiries', siteId] }),
        onError: () => alert('Failed to delete enquiry.')
    });

    const filteredEnquiries = useMemo(() => {
        return enquiries?.filter(e => 
            (filters.source === 'all' || e.source === filters.source) &&
            (filters.status === 'all' || e.status === filters.status)
        ) || [];
    }, [enquiries, filters]);

    const handleAddClick = () => {
        setSelectedEnquiry(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (enquiry: AdmissionEnquiry) => {
        setSelectedEnquiry(enquiry);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (enquiryId: string) => {
        if (window.confirm('Are you sure you want to delete this enquiry?')) {
            deleteMutation.mutate(enquiryId);
        }
    };

    const handleSave = (enquiry: Omit<AdmissionEnquiry, 'id' | 'siteId'> | AdmissionEnquiry) => {
        if ('id' in enquiry) {
            updateMutation.mutate(enquiry);
        } else {
            addMutation.mutate(enquiry);
        }
    };

    return (
        <div>
            <PageHeader title="Admission Enquiry" subtitle="Log and manage new student enquiries." actions={canCreate && <Button onClick={handleAddClick}>Add Enquiry</Button>} />
            
            <Card className="mb-6">
                <CardHeader><h3 className="font-semibold">Filters</h3></CardHeader>
                <CardContent className="flex items-center gap-4">
                     <div><label className="block text-sm font-medium">Source</label><select value={filters.source} onChange={e => setFilters(f => ({...f, source: e.target.value}))} className="mt-1 rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600"><option value="all">All</option>{SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                    <div><label className="block text-sm font-medium">Status</label><select value={filters.status} onChange={e => setFilters(f => ({...f, status: e.target.value}))} className="mt-1 rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600"><option value="all">All</option>{STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                    {isError && <ErrorState title="Failed to load enquiries" message={error.message} />}
                    {!isLoading && !isError && (
                        filteredEnquiries.length > 0 ? (
                             <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Phone</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Enquiry Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Next Follow-up</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Source</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredEnquiries.map(e => (
                                            <tr key={e.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">{e.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{e.phone}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{new Date(e.enquiryDate + 'T00:00:00').toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{e.nextFollowUpDate ? new Date(e.nextFollowUpDate + 'T00:00:00').toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{e.source}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{e.status}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                                    {canUpdate && <Button size="sm" variant="secondary" onClick={() => handleEditClick(e)}>Edit</Button>}
                                                    {canDelete && <Button size="sm" variant="danger" onClick={() => handleDeleteClick(e.id)} isLoading={deleteMutation.isPending && deleteMutation.variables === e.id}>Delete</Button>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <EmptyState title="No Enquiries Found" message="No enquiries match the current filters, or no enquiries have been added yet." />
                    )}
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedEnquiry ? 'Edit Enquiry' : 'Add Enquiry'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button 
                            onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
                            isLoading={addMutation.isPending || updateMutation.isPending}
                            className="ml-2"
                        >
                           Save
                        </Button>
                    </>
                }
            >
                <EnquiryForm 
                    enquiry={selectedEnquiry}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                    isSaving={addMutation.isPending || updateMutation.isPending}
                    staff={staff}
                    classrooms={classrooms}
                />
            </Modal>
        </div>
    );
};

export default AdmissionEnquiry;
