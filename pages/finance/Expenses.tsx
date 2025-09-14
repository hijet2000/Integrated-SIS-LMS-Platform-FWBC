
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
import { 
    expenseHeadApi,
    getExpenses,
    addExpense,
    updateExpense,
    deleteExpense
} from '@/services/sisApi';
import type { Expense, ExpenseHead, SetupItem } from '@/types';

type Tab = 'search' | 'heads';

// --- ItemForm for Expense Heads ---
const ItemForm: React.FC<{item?: SetupItem | null, onSave: (data: any) => void }> = ({ item, onSave }) => {
    const [name, setName] = useState(item?.name || '');
    const [description, setDescription] = useState(item?.description || '');
    return (
        <form id="expense-head-form" onSubmit={e => { e.preventDefault(); onSave({ name, description }); }} className="space-y-4">
            <div><label>Name</label><input value={name} onChange={e => setName(e.target.value)} required className="w-full rounded-md mt-1 dark:bg-gray-900 dark:border-gray-600"/></div>
            <div><label>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full rounded-md mt-1 dark:bg-gray-900 dark:border-gray-600" rows={2}/></div>
            <button type="submit" className="hidden">Save</button>
        </form>
    );
};

// --- Expense Heads Tab ---
const ExpenseHeadsTab: React.FC<{ siteId: string, can: (a: any) => boolean }> = ({ siteId, can }) => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<ExpenseHead | null>(null);

    const { data: items, isLoading, isError } = useQuery<ExpenseHead[], Error>({ queryKey: ['expenseHeads', siteId], queryFn: () => expenseHeadApi.get(siteId) });
    // FIX: Completed the implementation of the ExpenseHeadsTab component which was previously missing its return statement and logic.
    const mutationOptions = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenseHeads', siteId] }); setIsModalOpen(false); } };
    const addMutation = useMutation({ mutationFn: (item: any) => expenseHeadApi.add(item), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (item: ExpenseHead) => expenseHeadApi.update(item.id, item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => expenseHeadApi.delete(id), ...mutationOptions });
    
    const isMutating = addMutation.isPending || updateMutation.isPending;

    const handleSave = (itemData: any) => {
        selected ? updateMutation.mutate({ ...selected, ...itemData }) : addMutation.mutate(itemData);
    };
    
    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState title="Error" message="Could not load expense heads." />;

    return (
        <div>
            {can('school:write') && <Button className="mb-4" onClick={() => { setSelected(null); setIsModalOpen(true); }}>Add Expense Head</Button>}
            <table className="min-w-full divide-y dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Description</th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y dark:divide-gray-700">
                    {items?.map(item => (
                        <tr key={item.id}>
                            <td className="px-6 py-4">{item.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{item.description}</td>
                            <td className="px-6 py-4 text-right space-x-2">
                                {can('school:write') && <Button size="sm" variant="secondary" onClick={() => { setSelected(item); setIsModalOpen(true); }}>Edit</Button>}
                                {can('school:write') && <Button size="sm" variant="danger" onClick={() => window.confirm('Are you sure?') && deleteMutation.mutate(item.id)}>Delete</Button>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={selected ? 'Edit Expense Head' : 'Add Expense Head'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button
                            type="submit"
                            form="expense-head-form"
                            className="ml-2"
                            isLoading={addMutation.isPending || updateMutation.isPending}
                        >
                            Save
                        </Button>
                    </>
                }
            >
                <ItemForm item={selected} onSave={handleSave} />
            </Modal>
        </div>
    );
};

// --- Expense Form for Search Tab ---
const ExpenseForm: React.FC<{item?: Expense | null, onSave: (data: any) => void, heads: ExpenseHead[]}> = ({ item, onSave, heads }) => {
    const [formState, setFormState] = useState({
        expenseHeadId: item?.expenseHeadId || '',
        name: item?.name || '',
        amount: item?.amount || 0,
        expenseDate: item?.expenseDate || new Date().toISOString().split('T')[0],
        description: item?.description || '',
    });
    const handleChange = (e: React.ChangeEvent<any>) => setFormState(p => ({...p, [e.target.name]: e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value}));
    
    return (
        <form id="expense-form" onSubmit={e => { e.preventDefault(); onSave(formState); }} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label>Expense Head <span className="text-red-500">*</span></label><select name="expenseHeadId" value={formState.expenseHeadId} onChange={handleChange} required className="w-full rounded-md mt-1 dark:bg-gray-900 dark:border-gray-600"><option value="">Select Head</option>{heads.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</select></div>
                <div><label>Name / Reference <span className="text-red-500">*</span></label><input name="name" value={formState.name} onChange={handleChange} required className="w-full rounded-md mt-1 dark:bg-gray-900 dark:border-gray-600"/></div>
                <div><label>Amount ($) <span className="text-red-500">*</span></label><input type="number" step="0.01" name="amount" value={formState.amount} onChange={handleChange} required className="w-full rounded-md mt-1 dark:bg-gray-900 dark:border-gray-600"/></div>
                <div><label>Date <span className="text-red-500">*</span></label><input type="date" name="expenseDate" value={formState.expenseDate} onChange={handleChange} required className="w-full rounded-md mt-1 dark:bg-gray-900 dark:border-gray-600"/></div>
            </div>
            <div><label>Description</label><textarea name="description" value={formState.description} onChange={handleChange} rows={2} className="w-full rounded-md mt-1 dark:bg-gray-900 dark:border-gray-600"/></div>
            <div><label>Attach Proof</label><input type="file" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/></div>
            <button type="submit" className="hidden">Save</button>
        </form>
    );
};

// --- Search Expenses Tab ---
const SearchExpensesTab: React.FC<{ siteId: string, can: (a: any) => boolean }> = ({ siteId, can }) => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<Expense | null>(null);

    const { data: items, isLoading, isError } = useQuery<Expense[], Error>({ queryKey: ['expenses', siteId], queryFn: () => getExpenses(siteId) });
    const { data: heads = [] } = useQuery<ExpenseHead[], Error>({ queryKey: ['expenseHeads', siteId], queryFn: () => expenseHeadApi.get(siteId) });
    const headMap = useMemo(() => new Map(heads.map(h => [h.id, h.name])), [heads]);

    const mutationOptions = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses', siteId] }); setIsModalOpen(false); } };
    const addMutation = useMutation({ mutationFn: (item: any) => addExpense({ ...item, enteredBy: user!.id }), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (item: Expense) => updateExpense(item.id, item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => deleteExpense(id), ...mutationOptions });

    const handleSave = (itemData: any) => {
        selected ? updateMutation.mutate({ ...selected, ...itemData }) : addMutation.mutate(itemData);
    };

    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState title="Error" message="Could not load expense records." />;

    return (
        <div>
            {can('school:write') && <Button className="mb-4" onClick={() => { setSelected(null); setIsModalOpen(true); }}>Add Expense</Button>}
            {items && items.length > 0 ? (
                <table className="min-w-full divide-y">
                     <thead><tr><th className="px-6 py-3 text-left text-xs font-medium uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Expense Head</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Amount</th><th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th></tr></thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y">
                        {items?.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4">{new Date(item.expenseDate + 'T00:00:00').toLocaleDateString()}</td>
                                <td className="px-6 py-4">{headMap.get(item.expenseHeadId)}</td>
                                <td className="px-6 py-4 font-medium">{item.name}</td>
                                <td className="px-6 py-4">${item.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {can('school:write') && <Button size="sm" variant="secondary" onClick={() => { setSelected(item); setIsModalOpen(true); }}>Edit</Button>}
                                    {can('school:write') && <Button size="sm" variant="danger" onClick={() => window.confirm('Are you sure?') && deleteMutation.mutate(item.id)}>Delete</Button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : <EmptyState title="No Expenses Recorded" message="Add an expense record to get started." />}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={selected ? 'Edit Expense' : 'Add Expense'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button 
                            type="submit" 
                            form="expense-form" 
                            className="ml-2"
                            isLoading={addMutation.isPending || updateMutation.isPending}
                        >
                            Save
                        </Button>
                    </>
                }
            >
                <ExpenseForm item={selected} onSave={handleSave} heads={heads} />
            </Modal>
        </div>
    );
};


// --- Main Component ---
const Expenses: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();
    const [activeTab, setActiveTab] = useState<Tab>('search');

    const canRead = can('school:read');

    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to manage expenses." />;
    }

    const tabs: { key: Tab; label: string }[] = [
        { key: 'search', label: 'Search Expenses' },
        { key: 'heads', label: 'Expense Heads' },
    ];
    
    return (
        <div>
            <PageHeader title="Expenses" subtitle="Record and manage all non-payroll expenses." />
            
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6">
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`${activeTab === tab.key ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <Card>
                <CardContent>
                    {activeTab === 'search' && <SearchExpensesTab siteId={siteId!} can={can} />}
                    {activeTab === 'heads' && <ExpenseHeadsTab siteId={siteId!} can={can} />}
                </CardContent>
            </Card>
        </div>
    );
};

export default Expenses;
