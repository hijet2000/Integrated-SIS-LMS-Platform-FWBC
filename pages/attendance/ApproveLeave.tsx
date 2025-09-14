
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
import { 
    getStudentLeaveApplications, 
    addStudentLeaveApplication, 
    updateStudentLeaveApplicationStatus, 
    getStudents, 
    getClassrooms 
} from '@/services/sisApi';
import type { StudentLeaveApplication, StudentLeaveApplicationStatus, Student, Classroom } from '@/types';

const STATUS_OPTIONS: StudentLeaveApplicationStatus[] = ['Pending', 'Approved', 'Rejected'];

const statusColors: { [key in StudentLeaveApplicationStatus]: string } = {
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50',
  Approved: 'bg-green-100 text-green-800 dark:bg-green-900/50',
  Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50',
};

// --- Form Component ---
const LeaveForm: React.FC<{
  onSave: (leave: Omit<StudentLeaveApplication, 'id' | 'siteId' | 'status' | 'appliedOn'>) => void;
  onCancel: () => void;
  isSaving: boolean;
  students: Student[];
}> = ({ onSave, onCancel, isSaving, students }) => {
    const [formState, setFormState] = useState({
        studentId: '',
        fromDate: '',
        toDate: '',
        reason: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formState });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Student <span className="text-red-500">*</span></label>
                <select name="studentId" value={formState.studentId} onChange={handleChange} required className="mt-1 w-full rounded-md">
                    <option value="">Select a student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNo})</option>)}
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium">From Date <span className="text-red-500">*</span></label><input type="date" name="fromDate" value={formState.fromDate} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
                <div><label className="block text-sm font-medium">To Date <span className="text-red-500">*</span></label><input type="date" name="toDate" value={formState.toDate} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
            </div>
            <div>
                <label className="block text-sm font-medium">Reason <span className="text-red-500">*</span></label>
                <textarea name="reason" value={formState.reason} onChange={handleChange} required rows={3} className="mt-1 w-full rounded-md"/>
            </div>
            <div className="hidden"><button type="submit"/></div>
        </form>
    );
};


// --- Main Component ---
const ApproveLeave: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState({ classroomId: 'all', status: 'all' });

    // FIX: Replace complex permission checks with simple scope-based checks (`school:read`, `school:write`) to match the `useCan` hook's implementation and resolve argument count errors.
    const canRead = can('school:read');
    // FIX: Replace complex permission checks with simple scope-based checks (`school:read`, `school:write`) to match the `useCan` hook's implementation and resolve argument count errors.
    const canCreate = can('school:write');
    // FIX: Replace complex permission checks with simple scope-based checks (`school:read`, `school:write`) to match the `useCan` hook's implementation and resolve argument count errors.
    const canUpdate = can('school:write');

    const { data: applications = [], isLoading: isLoadingApps } = useQuery<StudentLeaveApplication[], Error>({ queryKey: ['studentLeaveApplications', siteId], queryFn: () => getStudentLeaveApplications(siteId!), enabled: canRead });
    const { data: students = [], isLoading: isLoadingStudents } = useQuery<Student[], Error>({ queryKey: ['students', siteId], queryFn: () => getStudents(siteId!), enabled: canRead });
    const { data: classrooms = [], isLoading: isLoadingClassrooms } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!), enabled: canRead });

    // FIX: Explicitly type the Map to ensure proper type inference.
    const studentMap = useMemo(() => new Map<string, Student>(students.map(s => [s.id, s])), [students]);
    // FIX: Explicitly type the Map to ensure proper type inference.
    const classroomMap = useMemo(() => new Map<string, string>(classrooms.map(c => [c.id, c.name])), [classrooms]);

    const mutationOptions = {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['studentLeaveApplications', siteId] }),
        onError: (err: Error) => alert(`Operation failed: ${err.message}`),
    };

    const addMutation = useMutation({
        // FIX: Corrected logical error by explicitly passing all properties to the API call.
        mutationFn: (leave: Omit<StudentLeaveApplication, 'id'|'siteId'|'status'|'appliedOn'>) => 
            addStudentLeaveApplication({ 
                ...leave,
                status: 'Pending', 
                appliedOn: new Date().toISOString().split('T')[0] 
            }),
        ...mutationOptions,
        onSuccess: () => {
             mutationOptions.onSuccess();
             setIsModalOpen(false);
        }
    });

    const updateStatusMutation = useMutation({ 
        mutationFn: ({ id, status }: { id: string, status: StudentLeaveApplicationStatus }) => 
            updateStudentLeaveApplicationStatus(id, status),
        ...mutationOptions
    });
    
    const filteredApplications = useMemo(() => {
        return applications.filter(app => {
            const student = studentMap.get(app.studentId);
            if (!student) return false;
            const classMatch = filters.classroomId === 'all' || student.classroomId === filters.classroomId;
            const statusMatch = filters.status === 'all' || app.status === filters.status;
            return classMatch && statusMatch;
        });
    }, [applications, studentMap, filters]);

    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to manage leave applications." />;
    }

    const isLoading = isLoadingApps || isLoadingStudents || isLoadingClassrooms;

    return (
        <div>
            <PageHeader
                title="Approve Leave"
                subtitle="Manage student leave applications."
                actions={canCreate && <Button onClick={() => setIsModalOpen(true)}>Add Leave</Button>}
            />

            <Card className="mb-6">
                <CardHeader><h3 className="font-semibold">Filter Applications</h3></CardHeader>
                <CardContent className="flex flex-wrap items-center gap-4">
                    <div><label className="block text-sm font-medium">Class</label><select value={filters.classroomId} onChange={e => setFilters(f => ({ ...f, classroomId: e.target.value }))} className="mt-1 rounded-md"><option value="all">All</option>{classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                    <div><label className="block text-sm font-medium">Status</label><select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="mt-1 rounded-md"><option value="all">All</option>{STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {isLoading ? <div className="flex justify-center p-8"><Spinner /></div> : (
                        filteredApplications.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y">
                                    <thead><tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Class</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Reason</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                                    </tr></thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y">
                                        {filteredApplications.map(app => {
                                            const student = studentMap.get(app.studentId);
                                            return (
                                                <tr key={app.id}>
                                                    <td className="px-6 py-4 font-medium">{student ? `${student.firstName} ${student.lastName}` : 'N/A'}</td>
                                                    <td className="px-6 py-4">{student ? classroomMap.get(student.classroomId) : 'N/A'}</td>
                                                    <td className="px-6 py-4 text-sm">{app.fromDate} to {app.toDate}</td>
                                                    <td className="px-6 py-4 text-sm max-w-xs truncate">{app.reason}</td>
                                                    <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[app.status]}`}>{app.status}</span></td>
                                                    <td className="px-6 py-4 text-right space-x-2">
                                                        {canUpdate && app.status === 'Pending' && (
                                                            <>
                                                                <Button size="sm" onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'Approved' })}>Approve</Button>
                                                                <Button size="sm" variant="danger" onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'Rejected' })}>Reject</Button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : <EmptyState title="No Applications Found" message="No leave applications match your filters." />
                    )}
                </CardContent>
            </Card>
            
             <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add Leave Application"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} isLoading={addMutation.isPending} className="ml-2">Save</Button>
                    </>
                }
            >
                <LeaveForm 
                    onSave={(data) => addMutation.mutate(data)}
                    onCancel={() => setIsModalOpen(false)}
                    isSaving={addMutation.isPending}
                    students={students}
                />
            </Modal>
        </div>
    );
};

export default ApproveLeave;
