
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
// FIX: Corrected import path for sisApi
import { getStudents, getClassrooms, getInvoicesForStudent, recordPayment } from '@/services/sisApi';
import { useCan } from '@/hooks/useCan';
// FIX: Corrected import path for domain types.
import type { FeeInvoice, Student, Classroom } from '@/types';

const statusColors: { [key: string]: string } = {
    DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    ISSUED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    PAID: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const PAYMENT_MODES = ['Cash', 'Cheque', 'Card', 'Online', 'Bank Transfer'];

const Fees: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();

    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({ amount: '', method: 'Cash', notes: '' });

    // FIX: The useCan hook expects a single scope string. Mapped 'pay' action to 'school:write' scope.
    const canCollectFees = can('school:write');

    const { data: students = [], isLoading: isLoadingStudents } = useQuery<Student[], Error>({
        queryKey: ['students', siteId],
        queryFn: () => getStudents(siteId!),
        enabled: !!siteId,
    });

    const { data: classrooms = [] } = useQuery<Classroom[], Error>({
        queryKey: ['classrooms', siteId],
        queryFn: () => getClassrooms(siteId!),
        enabled: !!siteId,
    });
    
    const { data: studentInvoices, isLoading: isLoadingInvoices, refetch: refetchInvoices } = useQuery<FeeInvoice[], Error>({
        queryKey: ['studentInvoices', selectedStudent?.id],
        queryFn: () => getInvoicesForStudent(selectedStudent!.id),
        enabled: !!selectedStudent,
    });

    const paymentMutation = useMutation({
        mutationFn: ({ invoice, amount }: { invoice: FeeInvoice, amount: number }) => recordPayment(invoice.id, amount, paymentDetails.method),
        onSuccess: () => {
            alert('Payment recorded successfully! A receipt has been generated.');
            queryClient.invalidateQueries({ queryKey: ['studentInvoices', selectedStudent?.id] });
            setIsModalOpen(false);
        },
        onError: (error: Error) => alert(`Payment failed: ${error.message}`),
    });

    const filteredStudents = useMemo(() => {
        if (!searchKeyword) return [];
        const keyword = searchKeyword.toLowerCase();
        return students.filter(s =>
            s.firstName.toLowerCase().includes(keyword) ||
            s.lastName.toLowerCase().includes(keyword) ||
            s.admissionNo.toLowerCase().includes(keyword)
        ).slice(0, 5);
    }, [searchKeyword, students]);

    const classroomMap = useMemo(() => new Map(classrooms.map(c => [c.id, c.name])), [classrooms]);

    const { totalDue, totalPaid, totalBalance } = useMemo(() => {
        if (!studentInvoices) return { totalDue: 0, totalPaid: 0, totalBalance: 0 };
        return studentInvoices.reduce((acc, inv) => {
            acc.totalDue += inv.amount;
            acc.totalPaid += inv.paidAmount;
            acc.totalBalance += (inv.amount - inv.paidAmount);
            return acc;
        }, { totalDue: 0, totalPaid: 0, totalBalance: 0 });
    }, [studentInvoices]);

    const handleStudentSelect = (student: Student) => {
        setSelectedStudent(student);
        setSearchKeyword(`${student.firstName} ${student.lastName}`);
    };
    
    const handleCollectFeesClick = () => {
        setPaymentDetails({ amount: totalBalance > 0 ? totalBalance.toFixed(2) : '', method: 'Cash', notes: '' });
        setIsModalOpen(true);
    };

    const handlePaymentSubmit = () => {
        const amountToPay = parseFloat(paymentDetails.amount);
        if (isNaN(amountToPay) || amountToPay <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        let remainingAmount = amountToPay;
        const unpaidInvoices = studentInvoices?.filter(inv => inv.status !== 'PAID').sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) || [];

        for (const invoice of unpaidInvoices) {
            if (remainingAmount <= 0) break;
            const dueOnInvoice = invoice.amount - invoice.paidAmount;
            const amountToPayForInvoice = Math.min(remainingAmount, dueOnInvoice);
            
            paymentMutation.mutate({ invoice, amount: amountToPayForInvoice });
            remainingAmount -= amountToPayForInvoice;
        }

        if(remainingAmount > 0 && unpaidInvoices.length === 0) {
             alert('No outstanding balance to pay against.');
        }
    };
    
    return (
        <div>
            <PageHeader title="Collect Fees" subtitle="Search for a student to view their fee details and record payments." />
            
            <Card className="mb-6">
                <CardHeader><h3 className="font-semibold">Search Student</h3></CardHeader>
                <CardContent>
                    <div className="relative">
                         <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            placeholder="Enter Admission No, Name, or Class..."
                            className="w-full md:w-1/2 rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600"
                        />
                        {filteredStudents.length > 0 && (
                             <ul className="absolute z-10 mt-1 w-full md:w-1/2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                                {filteredStudents.map(student => (
                                    <li key={student.id} onClick={() => handleStudentSelect(student)} className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer">
                                        {student.firstName} {student.lastName} ({student.admissionNo})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </CardContent>
            </Card>

            {selectedStudent ? (
                <div className="space-y-6">
                    <Card>
                        <CardHeader><h3 className="font-semibold">Student Details</h3></CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div><span className="font-medium">Name:</span> {selectedStudent.firstName} {selectedStudent.lastName}</div>
                            <div><span className="font-medium">Admission No:</span> {selectedStudent.admissionNo}</div>
                            <div><span className="font-medium">Class:</span> {classroomMap.get(selectedStudent.classroomId)}</div>
                            <Button size="sm" variant="secondary" onClick={() => setSelectedStudent(null)}>Clear Selection</Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <h3 className="font-semibold">Fee Summary</h3>
                            {canCollectFees && totalBalance > 0 && <Button onClick={handleCollectFeesClick}>Collect Fees</Button>}
                        </CardHeader>
                        <CardContent>
                           {isLoadingInvoices ? <div className="flex justify-center p-8"><Spinner/></div> : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Fee Head / Term</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Due Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase">Due Amount</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase">Paid Amount</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {studentInvoices?.map(invoice => (
                                            <tr key={invoice.id}>
                                                <td className="px-6 py-4">{invoice.term}</td>
                                                <td className="px-6 py-4">{new Date(invoice.dueDate + 'T00:00:00').toLocaleDateString()}</td>
                                                <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[invoice.status]}`}>{invoice.status}</span></td>
                                                <td className="px-6 py-4 text-right">${invoice.amount.toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right">${invoice.paidAmount.toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right font-semibold">${(invoice.amount - invoice.paidAmount).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 dark:bg-gray-700 font-bold">
                                        <tr>
                                            <td colSpan={3} className="px-6 py-3 text-right">Totals:</td>
                                            <td className="px-6 py-3 text-right">${totalDue.toFixed(2)}</td>
                                            <td className="px-6 py-3 text-right">${totalPaid.toFixed(2)}</td>
                                            <td className="px-6 py-3 text-right">${totalBalance.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                           )}
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <EmptyState title="No Student Selected" message="Please search for and select a student to view their fee details." />
            )}
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Collect Fees for ${selectedStudent?.firstName}`} footer={
                <>
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button onClick={handlePaymentSubmit} isLoading={paymentMutation.isPending} className="ml-2">Record Payment</Button>
                </>
            }>
                 <div className="space-y-4">
                    <div><label className="block text-sm font-medium">Amount to Pay</label><input type="number" step="0.01" value={paymentDetails.amount} onChange={e => setPaymentDetails(p => ({...p, amount: e.target.value}))} className="mt-1 w-full rounded-md"/></div>
                    <div><label className="block text-sm font-medium">Payment Method</label><select value={paymentDetails.method} onChange={e => setPaymentDetails(p => ({...p, method: e.target.value}))} className="mt-1 w-full rounded-md">{PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}</select></div>
                    <div><label className="block text-sm font-medium">Notes (Optional)</label><textarea value={paymentDetails.notes} onChange={e => setPaymentDetails(p => ({...p, notes: e.target.value}))} rows={2} className="mt-1 w-full rounded-md"/></div>
                 </div>
            </Modal>
        </div>
    );
};

export default Fees;
