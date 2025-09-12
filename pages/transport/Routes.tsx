
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
import { transportRouteApi } from '@/services/sisApi';
// FIX: Corrected import path for domain types from '@/constants' to '@/types' to resolve module resolution errors.
import type { TransportRoute } from '@/types';

const RouteForm: React.FC<{
    route?: TransportRoute | null;
    onSave: (route: Omit<TransportRoute, 'id' | 'siteId'> | TransportRoute) => void;
    onCancel: () => void;
}> = ({ route, onSave, onCancel }) => {
    const [formState, setFormState] = useState({
        name: route?.name ?? '',
        description: route?.description ?? '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(route ? { ...route, ...formState } : formState as Omit<TransportRoute, 'id' | 'siteId'>);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium">Route Name <span className="text-red-500">*</span></label><input type="text" name="name" value={formState.name} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
            <div><label className="block text-sm font-medium">Description</label><textarea name="description" value={formState.description} onChange={handleChange} rows={3} className="mt-1 w-full rounded-md"/></div>
            <div className="hidden"><button type="submit"/></div>
        </form>
    );
};

const Routes: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<TransportRoute | null>(null);

    const canManage = can('update', 'transport', { kind: 'site', id: siteId! });

    const { data: routes, isLoading, isError, error } = useQuery<TransportRoute[], Error>({ queryKey: ['transportRoutes', siteId], queryFn: () => transportRouteApi.get(siteId!) });

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transportRoutes', siteId] });
            setIsModalOpen(false);
        },
        onError: (err: Error) => alert(`Operation failed: ${err.message}`),
    };

    const addMutation = useMutation({ mutationFn: (route: Omit<TransportRoute, 'id' | 'siteId'>) => transportRouteApi.add(route), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (route: TransportRoute) => transportRouteApi.update(route.id, route), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => transportRouteApi.delete(id), ...mutationOptions });

    const handleSave = (route: Omit<TransportRoute, 'id' | 'siteId'> | TransportRoute) => {
        'id' in route ? updateMutation.mutate(route) : addMutation.mutate(route);
    };

    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState title="Error" message={error.message} />;

    return (
        <div>
            <PageHeader title="Transport Routes" actions={canManage && <Button onClick={() => { setSelected(null); setIsModalOpen(true); }}>Add Route</Button>} />
            <Card>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y">
                            <thead><tr><th className="px-6 py-3 text-left">Name</th><th className="px-6 py-3 text-left">Description</th><th className="px-6 py-3 text-right">Actions</th></tr></thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y">
                                {routes?.map(route => (
                                    <tr key={route.id}>
                                        <td className="px-6 py-4 font-medium">{route.name}</td>
                                        <td className="px-6 py-4">{route.description}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {canManage && <>
                                                <Button size="sm" variant="secondary" onClick={() => { setSelected(route); setIsModalOpen(true); }}>Edit</Button>
                                                <Button size="sm" variant="danger" onClick={() => window.confirm('Are you sure?') && deleteMutation.mutate(route.id)}>Delete</Button>
                                            </>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selected ? 'Edit Route' : 'Add Route'}
                footer={<><Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>Save</Button></>}>
                <RouteForm route={selected} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Routes;
