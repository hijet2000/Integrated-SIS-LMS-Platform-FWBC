
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
    visitorPurposeApi,
    enquirySourceApi,
    complaintTypeApi,
    enquiryReferenceApi,
} from '@/services/sisApi';
// FIX: Corrected import path for domain types.
import type { SetupItem } from '@/types';

type Category = 'purposes' | 'sources' | 'complaintTypes' | 'references';

const categoryConfig = {
    purposes: {
        title: 'Visitor Purposes',
        api: visitorPurposeApi,
        queryKey: 'visitorPurposes',
    },
    sources: {
        title: 'Enquiry/Complaint Sources',
        api: enquirySourceApi,
        queryKey: 'enquirySources',
    },
    complaintTypes: {
        title: 'Complaint Types',
        api: complaintTypeApi,
        queryKey: 'complaintTypes',
    },
    references: {
        title: 'Enquiry References',
        api: enquiryReferenceApi,
        queryKey: 'enquiryReferences',
    },
};

// --- Form Component ---
const ItemForm: React.FC<{
    item?: SetupItem | null;
    onSave: (item: Omit<SetupItem, 'id' | 'siteId'>) => void;
}> = ({ item, onSave }) => {
    const [name, setName] = useState(item?.name || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave({ name });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
                type="text"
                id="itemName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-900 dark:border-gray-600"
            />
             <button type="submit" className="hidden" />
        </form>
    );
};


// --- Tab Content Component ---
const SetupCategoryTab: React.FC<{
    categoryKey: Category,
    siteId: string,
    canCreate: boolean,
    canUpdate: boolean,
    canDelete: boolean,
}> = ({ categoryKey, siteId, canCreate, canUpdate, canDelete }) => {
    const queryClient = useQueryClient();
    const config = categoryConfig[categoryKey];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<SetupItem | null>(null);

    const { data: items, isLoading, isError, error } = useQuery<SetupItem[], Error>({
        queryKey: [config.queryKey, siteId],
        queryFn: () => config.api.get(siteId),
    });

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [config.queryKey, siteId] });
            setIsModalOpen(false);
            setSelectedItem(null);
        },
        onError: (err: any) => {
            alert(`Operation failed: ${err.message || 'An unknown error occurred'}`);
        }
    };

    const addMutation = useMutation({ mutationFn: (item: Omit<SetupItem, 'id'|'siteId'>) => config.api.add(item), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (item: SetupItem) => config.api.update(item.id, item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => config.api.delete(id), ...mutationOptions });

    const handleSave = (itemData: Omit<SetupItem, 'id'|'siteId'>) => {
        if (selectedItem) {
            updateMutation.mutate({ ...selectedItem, ...itemData });
        } else {
            addMutation.mutate(itemData);
        }
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            deleteMutation.mutate(id);
        }
    };
    
    if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
    if (isError) return <ErrorState title={`Failed to load ${config.title}`} message={error.message} />;

    return (
        <div>
            {canCreate && <Button onClick={() => { setSelectedItem(null); setIsModalOpen(true); }} className="mb-4">Add New</Button>}
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {items?.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                    {canUpdate && <Button size="sm" variant="secondary" onClick={() => { setSelectedItem(item); setIsModalOpen(true); }}>Edit</Button>}
                                    {canDelete && <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)} isLoading={deleteMutation.isPending && deleteMutation.variables === item.id}>Delete</Button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedItem ? `Edit ${config.title.slice(0, -1)}` : `Add ${config.title.slice(0, -1)}`}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button
                            onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
                            isLoading={addMutation.isPending || updateMutation.isPending}
                            className="ml-2"
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

const SetupFrontOffice: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();
    const [activeTab, setActiveTab] = useState<Category>('purposes');

    // FIX: Corrected useCan calls to use a single scope string.
    const canRead = can('school:read');
    const canCreate = can('school:write');
    const canUpdate = can('school:write');
    const canDelete = can('school:write');
    
    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to configure Front Office settings." />;
    }

    const tabs: { key: Category; label: string }[] = [
        { key: 'purposes', label: 'Visitor Purposes' },
        { key: 'sources', label: 'Sources' },
        { key: 'complaintTypes', label: 'Complaint Types' },
        { key: 'references', label: 'References' },
    ];
    
    return (
        <div>
            <PageHeader
                title="Setup Front Office"
                subtitle="Configure the dropdown options used across the Front Office modules."
            />
            
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`${activeTab === tab.key ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <Card>
                <CardContent>
                    <SetupCategoryTab
                        key={activeTab}
                        categoryKey={activeTab}
                        siteId={siteId!}
                        canCreate={canCreate}
                        canUpdate={canUpdate}
                        canDelete={canDelete}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default SetupFrontOffice;
