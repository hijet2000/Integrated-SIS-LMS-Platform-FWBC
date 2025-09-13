
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
    incomeHeadApi,
    getIncomes,
    addIncome,
    updateIncome,
    deleteIncome
} from '@/services/sisApi';
// FIX: Changed import path from @/constants to @/types to correct the module resolution error.
import type { Income, IncomeHead, SetupItem } from '@/types';

type Tab = 'search' | 'heads';

// --- Income Heads Tab ---
const IncomeHeadsTab: React.FC<{ siteId: string, can: (a: any, b: any) => boolean }> = ({ siteId, can }) => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<IncomeHead | null>(null);

    const { data: items, isLoading, isError } = useQuery<IncomeHead[], Error>({ queryKey: ['incomeHeads', siteId], queryFn: () => incomeHeadApi.get(siteId) });
    const mutationOptions = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['incomeHeads', siteId] }); setIsModalOpen(false); } };
    const addMutation = useMutation({ mutationFn: (item: any) => incomeHeadApi.add(item), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (item: IncomeHead) => incomeHeadApi.update(item.id, item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => incomeHeadApi.delete(id), ...mutationOptions });

    const handleSave = (itemData: any) => {
        selected ? updateMutation.mutate({ ...selected, ...itemData }) : addMutation.mutate(itemData);
    };
    
    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState title="Error" message="Could not load income heads." />;

    return (
        <div>
            {can('create', 'finance.income') && <Button className="mb-4" onClick={() => { setSelected(null); setIsModalOpen(true); }}>Add Income Head</Button>}
            <table className="min-w-full divide-y">
                <tbody>
                    {items?.map(item => (
                        <tr key={item.id}>
                            <td className="px-6 py-4 font-medium">{item.name}</td>
                            <td className="px-6 py-4 text-right space-x-2">
                                {can('update', 'finance.income') && <Button size="sm" variant="secondary" onClick={() => { setSelected(item); setIsModalOpen(true); }}>Edit</Button>}
                                {can('delete', 'finance.income') && <Button size="sm" variant="danger" onClick={() => window.confirm('Are you sure?') && deleteMutation.mutate(item.id)}>Delete</Button>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selected ? 'Edit Income Head' : 'Add Income Head'}>
                <ItemForm item={selected} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};
const ItemForm: React.FC<{item?: SetupItem | null, onSave: (data: any) => void, onCancel: () => void}> = ({ item, onSave, onCancel }) => {
    const [name, setName] = useState(item?.name || '');
    return (
        <form onSubmit={e => { e.preventDefault(); onSave({ name }); }} className="space-y-4">
            <div><label>Name</label><input value={name} onChange={e => setName(e.target.value)} required className="w-full rounded-md"/></div>
            <div className="flex justify-end space-x-2"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit">Save</Button></div>
        </form>
    );
};

// --- Search Income Tab ---
const SearchIncomeTab: React.FC<{ siteId: string, can: (a: any, b: any) => boolean }> = ({ siteId, can }) => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<Income | null>(null);

    const { data: items, isLoading, isError } = useQuery<Income[], Error>({ queryKey: ['incomes', siteId], queryFn: () => getIncomes(siteId) });
    const { data: heads = [] } = useQuery<IncomeHead[], Error>({ queryKey: ['incomeHeads', siteId], queryFn: () => incomeHeadApi.get(siteId) });
    const headMap = useMemo(() => new Map(heads.map(h => [h.id, h.name])), [heads]);

    const mutationOptions = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['incomes', siteId] }); setIsModalOpen(false); } };
    const addMutation = useMutation({ mutationFn: (item: any) => addIncome({ ...item, enteredBy: user!.id }), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (item: Income) => updateIncome(item.id, item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => deleteIncome(id), ...mutationOptions });

    const handleSave = (itemData: any) => {
        selected ? updateMutation.mutate({ ...selected, ...itemData }) : addMutation.mutate(itemData);
    };

    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState title="Error" message="Could not load income records." />;

    return (
        <div>
            {can('create', 'finance.income') && <Button className="mb-4" onClick={() => { setSelected(null); setIsModalOpen(true); }}>Add Income</Button>}
            {items && items.length > 0 ? (
                <table className="min-w-full divide-y">
                     <thead><tr><th className="px-6 py-3 text-left text-xs font-medium uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Income Head</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Amount</th><th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th></tr></thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y">
                        {items?.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4">{new Date(item.incomeDate + 'T00:00:00').toLocaleDateString()}</td>
                                <td className="px-6 py-4">{headMap.get(item.incomeHeadId)}</td>
                                <td className="px-6 py-4 font-medium">{item.name}</td>
                                <td className="px-6 py-4">${item.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {can('update', 'finance.income') && <Button size="sm" variant="secondary" onClick={() => { setSelected(item); setIsModalOpen(true); }}>Edit</Button>}
                                    {can('delete', 'finance.income') && <Button size="sm" variant="danger" onClick={() => window.confirm('Are you sure?') && deleteMutation.mutate(item.id)}>Delete</Button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : <EmptyState title="No Income Recorded" message="Add an income record to get started." />}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selected ? 'Edit Income' : 'Add Income'}>
                <IncomeForm item={selected} onSave={handleSave} onCancel={() => setIsModalOpen(false)} heads={heads} />
            </Modal>
        </div>
    );
};
const IncomeForm: React.FC<{item?: Income | null, onSave: (data: any) => void, onCancel: () => void, heads: IncomeHead[]}> = ({ item, onSave, onCancel, heads }) => {
    const [formState, setFormState] = useState({
        incomeHeadId: item?.incomeHeadId || '',
        name: item?.name || '',
        amount: item?.amount || 0,
        incomeDate: item?.incomeDate || new Date().toISOString().split('T')[0],
        description: item?.description || '',
    });
    const handleChange = (e: React.ChangeEvent<any>) => setFormState(p => ({...p, [e.target.name]: e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value}));
    
    return (
        <form onSubmit={e => { e.preventDefault(); onSave(formState); }} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label>Income Head <span className="text-red-500">*</span></label><select name="incomeHeadId" value={formState.incomeHeadId} onChange={handleChange} required className="w-full rounded-md"><option value="">Select Head</option>{heads.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</select></div>
                <div><label>Name / Reference <span className="text-red-500">*</span></label><input name="name" value={formState.name} onChange={handleChange} required className="w-full rounded-md"/></div>
                <div><label>Amount ($) <span className="text-red-500">*</span></label><input type="number" step="0.01" name="amount" value={formState.amount} onChange={handleChange} required className="w-full rounded-md"/></div>
                <div><label>Date <span className="text-red-500">*</span></label><input type="date" name="incomeDate" value={formState.incomeDate} onChange={handleChange} required className="w-full rounded-md"/></div>
            </div>
            <div><label>Description</label><textarea name="description" value={formState.description} onChange={handleChange} rows={2} className="w-full rounded-md"/></div>
            <div><label>Attach Proof</label><input type="file" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/></div>
            <div className="flex justify-end space-x-2"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit">Save</Button></div>
        </form>
    );
};

// --- Main Component ---
const Income: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();
    const [activeTab, setActiveTab] = useState<Tab>('search');

    const canRead = can('read', 'finance.income', { kind: 'site', id: siteId! });

    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to manage income." />;
    }

    const tabs: { key: Tab; label: string }[] = [
        { key: 'search', label: 'Search Income' },
        { key: 'heads', label: 'Income Heads' },
    ];
    
    return (
        <div>
            <PageHeader title="Income" subtitle="Record and manage non-fee income." />
            
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
                    {activeTab === 'search' && <SearchIncomeTab siteId={siteId!} can={can} />}
                    {activeTab === 'heads' && <IncomeHeadsTab siteId={siteId!} can={can} />}
                </CardContent>
            </Card>
        </div>
    );
};

export default Income;
