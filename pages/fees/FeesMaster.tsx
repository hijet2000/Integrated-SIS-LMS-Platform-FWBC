
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
import { 
    feeTypeApi,
    feeGroupApi,
    feeMasterApi,
    getClassrooms,
} from '@/services/sisApi';
import type { FeeType, FeeGroup, FeeMaster, Classroom } from '@/types';

type CategoryKey = 'types' | 'groups' | 'masters';

// --- Fee Types Tab ---
const FeeTypesTab: React.FC<{ siteId: string, can: (a: any) => boolean }> = ({ siteId, can }) => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<FeeType | null>(null);

    const { data: items, isLoading, isError } = useQuery<FeeType[], Error>({ queryKey: ['feeTypes', siteId], queryFn: () => feeTypeApi.get(siteId) });
    const mutationOptions = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['feeTypes', siteId] }); setIsModalOpen(false); } };
    const addMutation = useMutation({ mutationFn: (item: any) => feeTypeApi.add(item), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (item: FeeType) => feeTypeApi.update(item.id, item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => feeTypeApi.delete(id), ...mutationOptions });

    const handleSave = (itemData: any) => {
        selected ? updateMutation.mutate({ ...selected, ...itemData }) : addMutation.mutate(itemData);
    };

    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState title="Error" message="Could not load fee types." />;
    
    return (
        <div>
            {can('school:write') && <Button className="mb-4" onClick={() => { setSelected(null); setIsModalOpen(true); }}>Add Fee Type</Button>}
            <table className="min-w-full divide-y">
                 <thead><tr><th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Description</th><th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th></tr></thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y">
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
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selected ? 'Edit Fee Type' : 'Add Fee Type'}
                footer={<><Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} className="ml-2">Save</Button></>}
            >
                <FeeTypeForm item={selected} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};
const FeeTypeForm: React.FC<{item?: FeeType | null, onSave: (data: any) => void, onCancel: () => void}> = ({ item, onSave, onCancel }) => {
    const [name, setName] = useState(item?.name || '');
    const [description, setDescription] = useState(item?.description || '');
    return (
        <form onSubmit={e => { e.preventDefault(); onSave({ name, description }); }} className="space-y-4">
            <div><label>Name</label><input value={name} onChange={e => setName(e.target.value)} required className="w-full rounded-md"/></div>
            <div><label>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full rounded-md" rows={2}/></div>
            <div className="hidden"><button type="submit">Save</button></div>
        </form>
    );
};

// --- Fee Groups Tab ---
const FeeGroupsTab: React.FC<{ siteId: string, can: (a: any) => boolean }> = ({ siteId, can }) => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<FeeGroup | null>(null);

    const { data: items, isLoading, isError } = useQuery<FeeGroup[], Error>({ queryKey: ['feeGroups', siteId], queryFn: () => feeGroupApi.get(siteId) });
    const { data: feeTypes = [] } = useQuery<FeeType[], Error>({ queryKey: ['feeTypes', siteId], queryFn: () => feeTypeApi.get(siteId) });
    const feeTypeMap = useMemo(() => new Map(feeTypes.map(ft => [ft.id, ft.name])), [feeTypes]);

    const mutationOptions = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['feeGroups', siteId] }); setIsModalOpen(false); } };
    const addMutation = useMutation({ mutationFn: (item: any) => feeGroupApi.add(item), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (item: FeeGroup) => feeGroupApi.update(item.id, item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => feeGroupApi.delete(id), ...mutationOptions });

    const handleSave = (itemData: any) => {
        selected ? updateMutation.mutate({ ...selected, ...itemData }) : addMutation.mutate(itemData);
    };

    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState title="Error" message="Could not load fee groups." />;
    
    return (
        <div>
            {can('school:write') && <Button className="mb-4" onClick={() => { setSelected(null); setIsModalOpen(true); }}>Add Fee Group</Button>}
            <table className="min-w-full divide-y">
                <thead><tr><th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Included Fee Types</th><th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th></tr></thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y">
                    {items?.map(item => (
                        <tr key={item.id}>
                            <td className="px-6 py-4">{item.name}</td>
                            <td className="px-6 py-4 text-sm">{item.feeTypeIds.map(id => feeTypeMap.get(id)).join(', ')}</td>
                            <td className="px-6 py-4 text-right space-x-2">
                                {can('school:write') && <Button size="sm" variant="secondary" onClick={() => { setSelected(item); setIsModalOpen(true); }}>Edit</Button>}
                                {can('school:write') && <Button size="sm" variant="danger" onClick={() => window.confirm('Are you sure?') && deleteMutation.mutate(item.id)}>Delete</Button>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selected ? 'Edit Fee Group' : 'Add Fee Group'}
                footer={<><Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} className="ml-2">Save</Button></>}
            >
                <FeeGroupForm item={selected} onSave={handleSave} onCancel={() => setIsModalOpen(false)} feeTypes={feeTypes} />
            </Modal>
        </div>
    );
};
const FeeGroupForm: React.FC<{item?: FeeGroup | null, onSave: (data: any) => void, onCancel: () => void, feeTypes: FeeType[]}> = ({ item, onSave, onCancel, feeTypes }) => {
    const [name, setName] = useState(item?.name || '');
    const [feeTypeIds, setFeeTypeIds] = useState<string[]>(item?.feeTypeIds || []);

    const handleFeeTypeChange = (id: string) => {
        setFeeTypeIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    return (
        <form onSubmit={e => { e.preventDefault(); onSave({ name, feeTypeIds }); }} className="space-y-4">
            <div><label>Group Name</label><input value={name} onChange={e => setName(e.target.value)} required className="w-full rounded-md"/></div>
            <div><label>Include Fee Types</label><div className="mt-2 space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">{feeTypes.map(ft => <div key={ft.id}><label><input type="checkbox" checked={feeTypeIds.includes(ft.id)} onChange={() => handleFeeTypeChange(ft.id)} className="mr-2"/>{ft.name}</label></div>)}</div></div>
            <div className="hidden"><button type="submit">Save</button></div>
        </form>
    );
};


// --- Fee Masters Tab ---
const FeeMastersTab: React.FC<{ siteId: string, can: (a: any) => boolean }> = ({ siteId, can }) => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<FeeMaster | null>(null);

    const { data: items, isLoading, isError } = useQuery<FeeMaster[], Error>({ queryKey: ['feeMasters', siteId], queryFn: () => feeMasterApi.get(siteId) });
    const { data: feeGroups = [] } = useQuery<FeeGroup[], Error>({ queryKey: ['feeGroups', siteId], queryFn: () => feeGroupApi.get(siteId) });
    const { data: classrooms = [] } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId) });

    const feeGroupMap = useMemo(() => new Map(feeGroups.map(fg => [fg.id, fg.name])), [feeGroups]);
    const classroomMap = useMemo(() => new Map(classrooms.map(c => [c.id, c.name])), [classrooms]);

    const mutationOptions = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['feeMasters', siteId] }); setIsModalOpen(false); } };
    const addMutation = useMutation({ mutationFn: (item: any) => feeMasterApi.add(item), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (item: FeeMaster) => feeMasterApi.update(item.id, item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => feeMasterApi.delete(id), ...mutationOptions });

    const handleSave = (itemData: any) => {
        selected ? updateMutation.mutate({ ...selected, ...itemData }) : addMutation.mutate(itemData);
    };
    
    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState title="Error" message="Could not load fee masters." />;

    return (
        <div>
            {can('school:write') && <Button className="mb-4" onClick={() => { setSelected(null); setIsModalOpen(true); }}>Add Fee Master</Button>}
            <table className="min-w-full divide-y">
                <thead><tr><th className="px-6 py-3 text-left text-xs font-medium uppercase">Fee Group</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Class</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Amount</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Due Date</th><th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th></tr></thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y">
                    {items?.map(item => (
                        <tr key={item.id}>
                            <td className="px-6 py-4">{feeGroupMap.get(item.feeGroupId)}</td>
                            <td className="px-6 py-4">{classroomMap.get(item.classroomId)}</td>
                            <td className="px-6 py-4">${item.amount.toFixed(2)}</td>
                            <td className="px-6 py-4">{new Date(item.dueDate + 'T00:00:00').toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-right space-x-2">
                                {can('school:write') && <Button size="sm" variant="secondary" onClick={() => { setSelected(item); setIsModalOpen(true); }}>Edit</Button>}
                                {can('school:write') && <Button size="sm" variant="danger" onClick={() => window.confirm('Are you sure?') && deleteMutation.mutate(item.id)}>Delete</Button>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selected ? 'Edit Fee Master' : 'Add Fee Master'}
                footer={<><Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} className="ml-2">Save</Button></>}
            >
                <FeeMasterForm item={selected} onSave={handleSave} onCancel={() => setIsModalOpen(false)} feeGroups={feeGroups} classrooms={classrooms} />
            </Modal>
        </div>
    );
};

const FeeMasterForm: React.FC<{item?: FeeMaster | null, onSave: (data: any) => void, onCancel: () => void, feeGroups: FeeGroup[], classrooms: Classroom[]}> = ({ item, onSave, onCancel, feeGroups, classrooms }) => {
    const [formState, setFormState] = useState({
        feeGroupId: item?.feeGroupId || '',
        classroomId: item?.classroomId || '',
        amount: item?.amount || 0,
        dueDate: item?.dueDate || '',
    });
    const handleChange = (e: React.ChangeEvent<any>) => setFormState(p => ({...p, [e.target.name]: e.target.value}));
    return (
        <form onSubmit={e => { e.preventDefault(); onSave(formState); }} className="space-y-4">
             <div><label>Fee Group</label><select name="feeGroupId" value={formState.feeGroupId} onChange={handleChange} required className="w-full rounded-md"><option value="">Select Group</option>{feeGroups.map(fg => <option key={fg.id} value={fg.id}>{fg.name}</option>)}</select></div>
             <div><label>Classroom</label><select name="classroomId" value={formState.classroomId} onChange={handleChange} required className="w-full rounded-md"><option value="">Select Class</option>{classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
             <div><label>Amount</label><input type="number" name="amount" value={formState.amount} onChange={handleChange} required className="w-full rounded-md"/></div>
             <div><label>Due Date</label><input type="date" name="dueDate" value={formState.dueDate} onChange={handleChange} required className="w-full rounded-md"/></div>
            <div className="hidden"><button type="submit">Save</button></div>
        </form>
    );
};


// --- Main Component ---
const FeesMaster: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();
    const [activeTab, setActiveTab] = useState<CategoryKey>('types');

    // FIX: Corrected useCan call to use a single scope string.
    const canRead = can('school:read');

    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to configure fees." />;
    }

    const tabs: { key: CategoryKey; label: string }[] = [
        { key: 'types', label: 'Fee Types' },
        { key: 'groups', label: 'Fee Groups' },
        { key: 'masters', label: 'Fee Masters' },
    ];
    
    return (
        <div>
            <PageHeader title="Fees Master" subtitle="Configure fee types, groups, and master fee schedules." />
            
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`${activeTab === tab.key ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <Card>
                <CardContent>
                    {activeTab === 'types' && <FeeTypesTab siteId={siteId!} can={can} />}
                    {activeTab === 'groups' && <FeeGroupsTab siteId={siteId!} can={can} />}
                    {activeTab === 'masters' && <FeeMastersTab siteId={siteId!} can={can} />}
                </CardContent>
            </Card>
        </div>
    );
};

export default FeesMaster;
