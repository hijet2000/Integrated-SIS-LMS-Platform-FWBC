import React, { useState } from 'react';
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
    itemCategoryApi,
    storeApi,
    supplierApi,
} from '@/services/sisApi';
import type { ItemCategory, Store, Supplier, SetupItem } from '@/types';

type CategoryKey = 'categories' | 'stores' | 'suppliers';

const categoryConfig = {
    categories: { title: 'Item Categories', api: itemCategoryApi, queryKey: 'itemCategories' },
    stores: { title: 'Stores / Locations', api: storeApi, queryKey: 'stores' },
    suppliers: { title: 'Suppliers', api: supplierApi, queryKey: 'suppliers' },
};

// --- Generic Form & Tab Components ---
const ItemForm: React.FC<{ item?: SetupItem | null; onSave: (data: any) => void; }> = ({ item, onSave }) => {
    const [name, setName] = useState(item?.name || '');
    const [description, setDescription] = useState(item?.description || '');
    return (
        <form id="setup-item-form" onSubmit={e => { e.preventDefault(); onSave({ name, description }); }} className="space-y-4">
            <div><label>Name</label><input value={name} onChange={e => setName(e.target.value)} required className="w-full rounded-md"/></div>
            <div><label>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full rounded-md"/></div>
            <button type="submit" className="hidden"/>
        </form>
    );
};

const SetupCategoryTab: React.FC<{ categoryKey: CategoryKey; siteId: string; canManage: boolean; }> = ({ categoryKey, siteId, canManage }) => {
    const queryClient = useQueryClient();
    const config = categoryConfig[categoryKey];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<SetupItem | null>(null);

    const { data: items, isLoading } = useQuery<SetupItem[], Error>({ queryKey: [config.queryKey, siteId], queryFn: () => config.api.get(siteId) });
    const mutationOptions = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: [config.queryKey, siteId] }); setIsModalOpen(false); } };
    const addMutation = useMutation({ mutationFn: (item: any) => config.api.add(item), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (item: SetupItem) => config.api.update(item.id, item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => config.api.delete(id), ...mutationOptions });

    const handleSave = (data: any) => selectedItem ? updateMutation.mutate({ ...selectedItem, ...data }) : addMutation.mutate(data);
    
    return (
        <div>
            {canManage && <Button className="mb-4" onClick={() => { setSelectedItem(null); setIsModalOpen(true); }}>Add New</Button>}
            {isLoading ? <Spinner/> : (
                <table className="min-w-full divide-y">
                    <tbody>{items?.map(item => (<tr key={item.id}><td className="p-2 font-medium">{item.name}</td><td className="p-2 text-right space-x-2">{canManage && <><Button size="sm" variant="secondary" onClick={() => { setSelectedItem(item); setIsModalOpen(true); }}>Edit</Button><Button size="sm" variant="danger" onClick={() => deleteMutation.mutate(item.id)}>Delete</Button></>}</td></tr>))}</tbody>
                </table>
            )}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={selectedItem ? `Edit ${config.title}` : `Add ${config.title}`}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button 
                            type="submit" 
                            form="setup-item-form" 
                            className="ml-2"
                            isLoading={addMutation.isPending || updateMutation.isPending}
                        >
                            Save
                        </Button>
                    </>
                }
            >
                <ItemForm item={selectedItem} onSave={handleSave} />
            </Modal>
        </div>
    );
};

const Setup: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();
    const [activeTab, setActiveTab] = useState<CategoryKey>('categories');

    // FIX: Corrected useCan call to use a single scope string.
    const canManage = can('school:write');
    
    const tabs: { key: CategoryKey; label: string }[] = [
        { key: 'categories', label: 'Item Categories' },
        { key: 'stores', label: 'Stores' },
        { key: 'suppliers', label: 'Suppliers' },
    ];
    
    return (
        <div>
            <PageHeader title="Inventory Setup" subtitle="Configure categories, stores, and suppliers." />
             <div className="border-b mb-6"><nav className="-mb-px flex space-x-6">
                {tabs.map(tab => (<button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`${activeTab === tab.key ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} py-3 px-1 border-b-2 font-medium text-sm`}>{tab.label}</button>))}
            </nav></div>
            <Card>
                <CardContent>
                    <SetupCategoryTab categoryKey={activeTab} siteId={siteId!} canManage={canManage} />
                </CardContent>
            </Card>
        </div>
    );
};

export default Setup;