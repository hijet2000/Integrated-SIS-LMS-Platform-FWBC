
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { getInvoices, getStudents, getClassrooms } from '@/services/sisApi';
import { useCan } from '@/hooks/useCan';
// FIX: Corrected import path for domain types from '@/constants' to '@/types' to resolve module resolution errors.
import type { FeeInvoice, Student, Classroom } from '@/types';

type Tab = 'payments' | 'dues';

const feeStatusColors: { [key: string]: string } = {
    ISSUED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    PAID: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
};

// --- Search Payments Tab ---
const PaymentsView: React.FC<{
    invoices: FeeInvoice[];
    studentMap: Map<string, Student>;
    classroomMap: Map<string, string>;
}> = ({ invoices, studentMap, classroomMap }) => {
    const [filters, setFilters] = useState({ keyword: '', startDate: '', endDate: '' });

    const paidInvoices = useMemo(() => 
        invoices.filter(inv => inv.status === 'PAID' || inv.status === 'PARTIALLY_PAID'), 
    [invoices]);

    const filteredPayments = useMemo(() => {
        return paidInvoices.filter(inv => {
            const student = studentMap.get(inv.studentId);
            const keyword = filters.keyword.toLowerCase();
            const keywordMatch = !keyword || 
                student?.firstName.toLowerCase().includes(keyword) ||
                student?.lastName.toLowerCase().includes(keyword) ||
                student?.admissionNo.toLowerCase().includes(keyword) ||
                inv.transactionId?.toLowerCase().includes(keyword);

            const startDateMatch = !filters.startDate || (inv.paidOn && inv.paidOn >= filters.startDate);
            const endDateMatch = !filters.endDate || (inv.paidOn && inv.paidOn <= filters.endDate);

            return keywordMatch && startDateMatch && endDateMatch;
        });
    }, [paidInvoices, studentMap, filters]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><h3 className="font-semibold">Filter Payments</h3></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" placeholder="Search by Student, Admission No, Receipt No..." value={filters.keyword} onChange={e => setFilters(f => ({ ...f, keyword: e.target.value }))} className="rounded-md" />
                    <input type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} className="rounded-md" />
                    <input type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} className="rounded-md" />
                </CardContent>
            </Card>
            {filteredPayments.length > 0 ? (
                <div className="overflow-x-auto"><table className="min-w-full divide-y">
                    <thead><tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Receipt No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Class</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Amount Paid</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date</th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                    </tr></thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y"><tr/>
                        {filteredPayments.map(inv => {
                            const student = studentMap.get(inv.studentId);
                            return (
                                <tr key={inv.id}>
                                    <td className="px-6 py-4">{inv.transactionId}</td>
                                    <td className="px-6 py-4 font-medium">{student?.firstName} {student?.lastName}</td>
                                    <td className="px-6 py-4">{classroomMap.get(student?.classroomId ?? '')}</td>
                                    <td className="px-6 py-4">${inv.paidAmount.toFixed(2)}</td>
                                    <td className="px-6 py-4">{inv.paidOn ? new Date(inv.paidOn + 'T00:00:00').toLocaleDateString() : '-'}</td>
                                    <td className="px-6 py-4 text-right"><Button size="sm" variant="secondary">Reprint Receipt</Button></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table></div>
            ) : <EmptyState title="No Payments Found" message="No payments match your search criteria." />}
        </div>
    );
};

// --- Due Fees Tab ---
const DuesView: React.FC<{
    invoices: FeeInvoice[];
    students: Student[];
    classrooms: Classroom[];
    classroomMap: Map<string, string>;
}> = ({ invoices, students, classrooms, classroomMap }) => {
    const { siteId } = useParams<{ siteId: string }>();
    const [filters, setFilters] = useState({ classroomId: 'all' });

    const dueInvoices = useMemo(() => {
        return invoices.filter(inv => inv.status === 'ISSUED' || inv.status === 'OVERDUE' || inv.status === 'PARTIALLY_PAID');
    }, [invoices]);

    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);

    const filteredDues = useMemo(() => {
        return dueInvoices.filter(inv => {
            const student = studentMap.get(inv.studentId);
            return filters.classroomId === 'all' || student?.classroomId === filters.classroomId;
        });
    }, [dueInvoices, studentMap, filters]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><h3 className="font-semibold">Filter Due Fees</h3></CardHeader>
                <CardContent>
                    <select value={filters.classroomId} onChange={e => setFilters(f => ({ ...f, classroomId: e.target.value }))} className="rounded-md">
                        <option value="all">All Classes</option>
                        {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </CardContent>
            </Card>
            {filteredDues.length > 0 ? (
                <div className="overflow-x-auto"><table className="min-w-full divide-y">
                     <thead><tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Class</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Fee Head</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Balance Due</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                    </tr></thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y">
                        {filteredDues.map(inv => {
                            const student = studentMap.get(inv.studentId);
                            return (
                                <tr key={inv.id}>
                                    <td className="px-6 py-4 font-medium">{student?.firstName} {student?.lastName}</td>
                                    <td className="px-6 py-4">{classroomMap.get(student?.classroomId ?? '')}</td>
                                    <td className="px-6 py-4">{inv.term}</td>
                                    <td className="px-6 py-4 font-bold">${(inv.amount - inv.paidAmount).toFixed(2)}</td>
                                    <td className="px-6 py-4">{new Date(inv.dueDate + 'T00:00:00').toLocaleDateString()}</td>
                                    <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${feeStatusColors[inv.status]}`}>{inv.status}</span></td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Link to={`/school/${siteId}/students/${inv.studentId}`}><Button size="sm" variant="secondary">View</Button></Link>
                                        <Button size="sm">Send Reminder</Button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table></div>
            ) : <EmptyState title="No Due Fees Found" message="No outstanding fees match your criteria." />}
        </div>
    );
};


// --- Main Component ---
const SearchPayments: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();
    const [activeTab, setActiveTab] = useState<Tab>('payments');

    // FIX: Corrected useCan call to use a single scope string.
    const canRead = can('school:read');

    const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery<FeeInvoice[], Error>({ queryKey: ['invoices', siteId], queryFn: () => getInvoices(siteId!), enabled: canRead });
    const { data: students = [], isLoading: isLoadingStudents } = useQuery<Student[], Error>({ queryKey: ['students', siteId], queryFn: () => getStudents(siteId!), enabled: canRead });
    const { data: classrooms = [], isLoading: isLoadingClassrooms } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!), enabled: canRead });
    
    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);
    const classroomMap = useMemo(() => new Map(classrooms.map(c => [c.id, c.name])), [classrooms]);

    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to search payments." />;
    }

    const isLoading = isLoadingInvoices || isLoadingStudents || isLoadingClassrooms;
    
    return (
        <div>
            <PageHeader title="Search Payments & Due Fees" subtitle="Locate transactions and track outstanding balances." />

            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('payments')} className={`${activeTab === 'payments' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Search Payments</button>
                    <button onClick={() => setActiveTab('dues')} className={`${activeTab === 'dues' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Due Fees</button>
                </nav>
            </div>
            
            {isLoading ? <div className="flex justify-center p-8"><Spinner /></div> : (
                <>
                    {activeTab === 'payments' && <PaymentsView invoices={invoices} studentMap={studentMap} classroomMap={classroomMap} />}
                    {activeTab === 'dues' && <DuesView invoices={invoices} students={students} classrooms={classrooms} classroomMap={classroomMap} />}
                </>
            )}
        </div>
    );
};

export default SearchPayments;
