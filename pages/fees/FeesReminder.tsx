
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { useCan } from '@/hooks/useCan';
import { getStudents, getInvoices, getClassrooms, getFeeReminderLogs, sendFeeReminders } from '@/services/sisApi';
// FIX: Changed import path from @/constants to @/types to correct the module resolution error.
import type { Student, FeeInvoice, Classroom, FeeReminderLog } from '@/types';

type Tab = 'send' | 'log';
type StudentWithDue = Student & { dueAmount: number };

const FeesReminder: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();
    const [activeTab, setActiveTab] = useState<Tab>('send');

    // FIX: Corrected useCan call to use a single scope string.
    const canRead = can('school:read');

    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to manage fee reminders." />;
    }

    return (
        <div>
            <PageHeader title="Fees Reminder" subtitle="Send reminders to students with outstanding fees." />
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('send')} className={`${activeTab === 'send' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Send Reminder</button>
                    <button onClick={() => setActiveTab('log')} className={`${activeTab === 'log' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Reminder Log</button>
                </nav>
            </div>
            
            {activeTab === 'send' && <SendReminderTab />}
            {activeTab === 'log' && <ReminderLogTab />}
        </div>
    );
};

const SendReminderTab: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();

    const [filters, setFilters] = useState({ classroomId: 'all' });
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [channel, setChannel] = useState<'SMS' | 'Email'>('SMS');
    const [message, setMessage] = useState("Dear Parent, this is a reminder that your fee of {{due_amount}} is pending. Please pay by the due date.");

    // FIX: Corrected useCan call to use a single scope string.
    const canCreate = can('school:write');

    const { data: students = [], isLoading: isLoadingStudents } = useQuery<Student[], Error>({ queryKey: ['students', siteId], queryFn: () => getStudents(siteId!) });
    const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery<FeeInvoice[], Error>({ queryKey: ['invoices', siteId], queryFn: () => getInvoices(siteId!) });
    const { data: classrooms = [], isLoading: isLoadingClassrooms } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!) });

    const studentsWithDues = useMemo<StudentWithDue[]>(() => {
        const studentDues = new Map<string, number>();
        invoices.forEach(inv => {
            if (inv.status !== 'PAID' && inv.status !== 'CANCELLED') {
                const balance = inv.amount - inv.paidAmount;
                if (balance > 0) {
                    studentDues.set(inv.studentId, (studentDues.get(inv.studentId) || 0) + balance);
                }
            }
        });
        
        return students
            .filter(s => studentDues.has(s.id))
            .map(s => ({ ...s, dueAmount: studentDues.get(s.id)! }));
    }, [students, invoices]);

    const filteredStudents = useMemo(() => {
        return studentsWithDues.filter(s => filters.classroomId === 'all' || s.classroomId === filters.classroomId);
    }, [studentsWithDues, filters]);
    
    const sendMutation = useMutation({
        mutationFn: () => sendFeeReminders(selectedStudentIds, channel),
        onSuccess: () => {
            alert(`${selectedStudentIds.length} reminders sent successfully.`);
            setSelectedStudentIds([]);
            queryClient.invalidateQueries({ queryKey: ['feeReminderLogs', siteId] });
        },
        onError: (err: Error) => alert(`Failed to send reminders: ${err.message}`),
    });

    const isLoading = isLoadingStudents || isLoadingInvoices || isLoadingClassrooms;

    if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader><h3 className="font-semibold">Select Students with Due Fees</h3></CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <label className="text-sm font-medium">Filter by Class</label>
                            <select value={filters.classroomId} onChange={e => setFilters({ classroomId: e.target.value })} className="mt-1 w-full md:w-1/3 rounded-md">
                                <option value="all">All Classes</option>
                                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="overflow-x-auto max-h-96">
                            <table className="min-w-full divide-y">
                                <thead><tr><th className="p-2"><input type="checkbox" onChange={e => setSelectedStudentIds(e.target.checked ? filteredStudents.map(s => s.id) : [])}/></th><th className="p-2 text-left">Student</th><th className="p-2 text-left">Class</th><th className="p-2 text-right">Due Amount</th></tr></thead>
                                <tbody>
                                    {filteredStudents.map(s => (
                                        <tr key={s.id}>
                                            <td className="p-2"><input type="checkbox" checked={selectedStudentIds.includes(s.id)} onChange={() => setSelectedStudentIds(p => p.includes(s.id) ? p.filter(id => id !== s.id) : [...p, s.id])}/></td>
                                            <td className="p-2">{s.firstName} {s.lastName}</td>
                                            <td className="p-2">{classrooms.find(c=>c.id === s.classroomId)?.name}</td>
                                            <td className="p-2 text-right font-semibold">${s.dueAmount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div>
                 <Card>
                    <CardHeader><h3 className="font-semibold">Compose & Send</h3></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Channel</label>
                            <div className="flex gap-4 mt-1">
                                <label><input type="radio" name="channel" value="SMS" checked={channel === 'SMS'} onChange={() => setChannel('SMS')} /> SMS</label>
                                <label><input type="radio" name="channel" value="Email" checked={channel === 'Email'} onChange={() => setChannel('Email')} /> Email</label>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Message Template</label>
                            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} className="mt-1 w-full rounded-md"/>
                            <p className="text-xs text-gray-500">Placeholders: {"{{student_name}}"}, {"{{class_name}}"}, {"{{due_amount}}"}, {"{{due_date}}"}</p>
                        </div>
                        <Button onClick={() => sendMutation.mutate()} disabled={selectedStudentIds.length === 0 || !canCreate} isLoading={sendMutation.isPending}>Send {selectedStudentIds.length} Reminders</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const ReminderLogTab: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const { data: logs, isLoading, isError, error } = useQuery<FeeReminderLog[], Error>({ queryKey: ['feeReminderLogs', siteId], queryFn: () => getFeeReminderLogs(siteId!) });
    const { data: students = [] } = useQuery<Student[], Error>({ queryKey: ['students', siteId], queryFn: () => getStudents(siteId!) });
    const studentMap = useMemo(() => new Map(students.map(s => [s.id, `${s.firstName} ${s.lastName}`])), [students]);
    
    if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
    if (isError) return <ErrorState title="Failed to load logs" message={error.message} />;

    return (
        <Card>
            <CardHeader><h3 className="font-semibold">Sent Reminder History</h3></CardHeader>
            <CardContent>
                {logs && logs.length > 0 ? (
                    <div className="overflow-x-auto"><table className="min-w-full divide-y">
                        <thead><tr><th className="px-6 py-3 text-left">Student</th><th className="px-6 py-3 text-left">Channel</th><th className="px-6 py-3 text-left">Date Sent</th><th className="px-6 py-3 text-left">Status</th></tr></thead>
                        <tbody className="divide-y">
                            {logs.map(log => (
                                <tr key={log.id}>
                                    <td className="px-6 py-4">{studentMap.get(log.studentId) || 'Unknown Student'}</td>
                                    <td className="px-6 py-4">{log.channel}</td>
                                    <td className="px-6 py-4">{new Date(log.dateSent).toLocaleString()}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">{log.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table></div>
                ) : <EmptyState title="No Logs Found" message="No reminders have been sent yet." />}
            </CardContent>
        </Card>
    );
};

export default FeesReminder;
