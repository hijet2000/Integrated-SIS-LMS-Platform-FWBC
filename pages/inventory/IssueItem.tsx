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
import { useAuth } from '@/hooks/useAuth';
import { itemIssueApi, inventoryItemApi, getTeachers, getStudents } from '@/services/sisApi';
import type { ItemIssue, InventoryItem, Teacher, Student } from '@/types';

type Tab = 'issue' | 'history';

// --- Issue Form ---
const IssueForm: React.FC<{
    onSave: (data: any) => void;
    items: InventoryItem[];
    users: {id: string, name: string}[];
}> = ({ onSave, items, users }) => {
    const [form, setForm] = useState({
        itemId: '',
        issueTo: '',
        quantity: 1,
        issueDate: new Date().toISOString().split('T')[0],
    });
    const handleChange = (e: React.ChangeEvent<any>) => setForm(p => ({ ...p, [e.target.name]: e.target.type === 'number' ? parseInt(e.target.value) : e.target.value }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <form id="issue-item-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                 <div><label>Item *</label><select name="itemId" value={form.itemId} onChange={handleChange} required className="w-full rounded-md"><option value="">Select</option>{items.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select></div>
                 <div><label>Issue To *</label><select name="issueTo" value={form.issueTo} onChange={handleChange} required className="w-full rounded-md"><option value="">Select</option>{users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
                 <div><label>Quantity *</label><input type="number" name="quantity" value={form.quantity} min="1" onChange={handleChange} required className="w-full rounded-md"/></div>
                 <div><label>Date *</label><input type="date" name="issueDate" value={form.issueDate} onChange={handleChange} required className="w-full rounded-md"/></div>
            </div>
        </form>
    );
};

const IssueItem: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    
    const [isIssueModalOpen, setIssueModalOpen] = useState(false);

    const canManage = can('school:write');

    const { data: issues = [], isLoading: l1 } = useQuery<ItemIssue[], Error>({ queryKey: ['itemIssues', siteId], queryFn: () => itemIssueApi.get(siteId!) });
    const { data: items = [], isLoading: l2 } = useQuery<InventoryItem[], Error>({ queryKey: ['inventoryItems', siteId], queryFn: () => inventoryItemApi.get(siteId!) });
    const { data: teachers = [] } = useQuery<Teacher[], Error>({ queryKey: ['teachers', siteId], queryFn: () => getTeachers(siteId!) });
    const { data: students = [] } = useQuery<Student[], Error>({ queryKey: ['students', siteId], queryFn: () => getStudents(siteId!) });

    const users = useMemo(() => [
        ...teachers.map(t => ({ id: t.id, name: `${t.name} (Staff)` })),
        ...students.map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName} (Student)` })),
    ], [teachers, students]);

    const userMap = new Map(users.map(u => [u.id, u.name]));
    const itemMap = new Map(items.map(i => [i.id, i.name]));

    const issueMutation = useMutation({ 
        mutationFn: (item: any) => itemIssueApi.add(item), 
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['itemIssues', siteId] }); queryClient.invalidateQueries({ queryKey: ['inventoryItems', siteId] }); setIssueModalOpen(false); }
    });
    
    const handleIssueStock = (data: any) => issueMutation.mutate(data);
    
    const isLoading = l1 || l2;

    return (
        <div>
            <PageHeader title="Issue Item" subtitle="Record items issued to staff or departments." />
             <Card>
                <CardHeader className="flex justify-between"><h3 className="font-semibold">Issue History</h3><Button onClick={() => setIssueModalOpen(true)}>Issue New Item</Button></CardHeader>
                <CardContent>
                    {isLoading && <Spinner/>}
                    {issues.length > 0 ? (
                        <table className="min-w-full divide-y">
                            <thead><tr><th className="p-2 text-left">Date</th><th className="p-2 text-left">Item</th><th className="p-2 text-left">Qty</th><th className="p-2 text-left">Issued To</th></tr></thead>
                            <tbody>{issues.map(iss => <tr key={iss.id}><td className="p-2">{iss.issueDate}</td><td className="p-2">{itemMap.get(iss.itemId)}</td><td className="p-2">{iss.quantity}</td><td className="p-2">{userMap.get(iss.issueTo)}</td></tr>)}</tbody>
                        </table>
                    ) : <EmptyState title="No History" message="No items have been issued yet." />}
                </CardContent>
            </Card>

            <Modal
                isOpen={isIssueModalOpen}
                onClose={() => setIssueModalOpen(false)}
                title="Issue Item"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIssueModalOpen(false)}>Cancel</Button>
                        <Button
                            type="submit"
                            form="issue-item-form"
                            className="ml-2"
                            isLoading={issueMutation.isPending}
                        >
                            Issue
                        </Button>
                    </>
                }
            >
                <IssueForm onSave={handleIssueStock} items={items} users={users} />
            </Modal>
        </div>
    );
};

export default IssueItem;