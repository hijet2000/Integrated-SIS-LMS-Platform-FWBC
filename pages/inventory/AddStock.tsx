
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
import { inventoryItemApi, itemCategoryApi, stockReceiveApi, supplierApi, storeApi } from '@/services/sisApi';
import type { InventoryItem, ItemCategory, StockReceive, Supplier, Store } from '@/types';

type Tab = 'items' | 'receive';

// --- Item Form ---
const ItemForm: React.FC<{
    item?: InventoryItem | null;
    onSave: (data: any) => void;
    categories: ItemCategory[];
}> = ({ item, onSave, categories }) => {
    const [form, setForm] = useState({
        name: item?.name ?? '',
        categoryId: item?.categoryId ?? '',
        unit: item?.unit ?? 'pcs',
        minStockLevel: item?.minStockLevel ?? 10,
    });

    const handleChange = (e: React.ChangeEvent<any>) => setForm(p => ({ ...p, [e.target.name]: e.target.type === 'number' ? parseInt(e.target.value) : e.target.value }));

    return (
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div><label>Item Name *</label><input name="name" value={form.name} onChange={handleChange} required className="w-full rounded-md" /></div>
                <div><label>Category *</label><select name="categoryId" value={form.categoryId} onChange={handleChange} required className="w-full rounded-md"><option value="">Select</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label>Unit (e.g., pcs, kg)</label><input name="unit" value={form.unit} onChange={handleChange} className="w-full rounded-md" /></div>
                <div><label>Re-order Level</label><input type="number" name="minStockLevel" value={form.minStockLevel} onChange={handleChange} className="w-full rounded-md" /></div>
            </div>
            <button type="submit" className="hidden"/>
        </form>
    );
};

// --- Receive Stock Form ---
const ReceiveForm: React.FC<{
    onSave: (data: any) => void;
    items: InventoryItem[];
    suppliers: Supplier[];
    stores: Store[];
}> = ({ onSave, items, suppliers, stores }) => {
     const [form, setForm] = useState({
        itemId: '',
        supplierId: '',
        storeId: '',
        quantity: 1,
        purchasePrice: 0,
        date: new Date().toISOString().split('T')[0],
     });
    const handleChange = (e: React.ChangeEvent<any>) => setForm(p => ({ ...p, [e.target.name]: e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value }));

    return (
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                 <div><label>Item *</label><select name="itemId" value={form.itemId} onChange={handleChange} required className="w-full rounded-md"><option value="">Select</option>{items.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select></div>
                 <div><label>Store Location *</label><select name="storeId" value={form.storeId} onChange={handleChange} required className="w-full rounded-md"><option value="">Select</option>{stores.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                 <div><label>Supplier</label><select name="supplierId" value={form.supplierId} onChange={handleChange} className="w-full rounded-md"><option value="">Select</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                 <div><label>Quantity *</label><input type="number" name="quantity" value={form.quantity} min="1" onChange={handleChange} required className="w-full rounded-md"/></div>
                 <div><label>Purchase Price ($)</label><input type="number" step="0.01" name="purchasePrice" value={form.purchasePrice} onChange={handleChange} className="w-full rounded-md"/></div>
                 <div><label>Date *</label><input type="date" name="date" value={form.date} onChange={handleChange} required className="w-full rounded-md"/></div>
            </div>
             <button type="submit" className="hidden"/>
        </form>
    );
};

const AddStock: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    
    const [activeTab, setActiveTab] = useState<Tab>('items');
    const [isItemModalOpen, setItemModalOpen] = useState(false);
    const [isReceiveModalOpen, setReceiveModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    // FIX: Corrected useCan call to use a single scope string.
    const canManage = can('school:write');

    const { data: items = [], isLoading: l1 } = useQuery<InventoryItem[], Error>({ queryKey: ['inventoryItems', siteId], queryFn: () => inventoryItemApi.get(siteId!) });
    const { data: categories = [], isLoading: l2 } = useQuery<ItemCategory[], Error>({ queryKey: ['itemCategories', siteId], queryFn: () => itemCategoryApi.get(siteId!) });
    const { data: stockHistory = [], isLoading: l3 } = useQuery<StockReceive[], Error>({ queryKey: ['stockReceives', siteId], queryFn: () => stockReceiveApi.get(siteId!) });
    const { data: suppliers = [], isLoading: l4 } = useQuery<Supplier[], Error>({ queryKey: ['suppliers', siteId], queryFn: () => supplierApi.get(siteId!) });
    const { data: stores = [], isLoading: l5 } = useQuery<Store[], Error>({ queryKey: ['stores', siteId], queryFn: () => storeApi.get(siteId!) });

    const itemMutationOptions = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['inventoryItems', siteId] }); setItemModalOpen(false); } };
    const addItemMutation = useMutation({ mutationFn: (item: any) => inventoryItemApi.add(item), ...itemMutationOptions });
    const updateItemMutation = useMutation({ mutationFn: (item: InventoryItem) => inventoryItemApi.update(item.id, item), ...itemMutationOptions });
    
    const receiveMutation = useMutation({ 
        mutationFn: (item: any) => stockReceiveApi.add(item), 
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['stockReceives', siteId] }); queryClient.invalidateQueries({ queryKey: ['inventoryItems', siteId] }); setReceiveModalOpen(false); }
    });
    
    const handleSaveItem = (data: any) => selectedItem ? updateItemMutation.mutate({ ...selectedItem, ...data }) : addItemMutation.mutate(data);
    const handleReceiveStock = (data: any) => receiveMutation.mutate(data);

    const isLoading = l1 || l2 || l3 || l4 || l5;

    return (
        <div>
            <PageHeader title="Stock Management" subtitle="Manage item catalog and receive new stock." />
            <div className="border-b mb-6"><nav className="-mb-px flex space-x-6">
                <button onClick={() => setActiveTab('items')} className={`${activeTab === 'items' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} py-3 px-1 border-b-2 font-medium text-sm`}>Manage Items</button>
                <button onClick={() => setActiveTab('receive')} className={`${activeTab === 'receive' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} py-3 px-1 border-b-2 font-medium text-sm`}>Receive Stock</button>
            </nav></div>

            {isLoading && <Spinner />}

            {activeTab === 'items' && (
                <Card>
                    <CardHeader className="flex justify-between"><h3 className="font-semibold">Item Catalog</h3><Button onClick={() => { setSelectedItem(null); setItemModalOpen(true); }}>Add Item</Button></CardHeader>
                    <CardContent>
                        {items.length > 0 ? (
                            <table className="min-w-full divide-y">
                                <thead><tr><th className="p-2 text-left">Name</th><th className="p-2 text-left">Category</th><th className="p-2 text-left">Unit</th><th className="p-2 text-left">Stock</th><th className="p-2 text-right">Actions</th></tr></thead>
                                <tbody>{items.map(item => <tr key={item.id}><td className="p-2">{item.name}</td><td className="p-2">{categories.find(c=>c.id===item.categoryId)?.name}</td><td className="p-2">{item.unit}</td><td className="p-2">0</td><td className="p-2 text-right"><Button size="sm" onClick={() => { setSelectedItem(item); setItemModalOpen(true); }}>Edit</Button></td></tr>)}</tbody>
                            </table>
                        ) : <EmptyState title="No Items" message="Add an item to the catalog to begin."/>}
                    </CardContent>
                </Card>
            )}

            {activeTab === 'receive' && (
                <Card>
                    <CardHeader className="flex justify-between"><h3 className="font-semibold">Stock Received History</h3><Button onClick={() => setReceiveModalOpen(true)}>Receive Stock</Button></CardHeader>
                    <CardContent>
                        {stockHistory.length > 0 ? (
                           <table className="min-w-full divide-y">
                                <thead><tr><th className="p-2 text-left">Date</th><th className="p-2 text-left">Item</th><th className="p-2 text-left">Quantity</th><th className="p-2 text-left">Supplier</th></tr></thead>
                                <tbody>{stockHistory.map(rec => <tr key={rec.id}><td className="p-2">{rec.date}</td><td className="p-2">{items.find(i=>i.id===rec.itemId)?.name}</td><td className="p-2">{rec.quantity}</td><td className="p-2">{suppliers.find(s=>s.id===rec.supplierId)?.name}</td></tr>)}</tbody>
                            </table>
                        ) : <EmptyState title="No History" message="No stock has been received yet." />}
                    </CardContent>
                </Card>
            )}

            <Modal isOpen={isItemModalOpen} onClose={() => setItemModalOpen(false)} title={selectedItem ? 'Edit Item' : 'Add Item'}>
                <ItemForm item={selectedItem} onSave={handleSaveItem} categories={categories} />
                <div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={() => setItemModalOpen(false)}>Cancel</Button><Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>Save</Button></div>
            </Modal>
             <Modal isOpen={isReceiveModalOpen} onClose={() => setReceiveModalOpen(false)} title="Receive New Stock">
                <ReceiveForm onSave={handleReceiveStock} items={items} suppliers={suppliers} stores={stores} />
                <div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={() => setReceiveModalOpen(false)}>Cancel</Button><Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>Receive</Button></div>
            </Modal>
        </div>
    );
};

export default AddStock;
