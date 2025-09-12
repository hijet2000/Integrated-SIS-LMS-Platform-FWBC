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
import { vehicleApi, getTeachers } from '@/services/sisApi';
import type { Vehicle, Teacher } from '@/types';
import EmptyState from '@/components/ui/EmptyState';

const VehicleForm: React.FC<{
    vehicle?: Vehicle | null;
    onSave: (vehicle: Omit<Vehicle, 'id' | 'siteId' | 'isAvailable'> | Vehicle) => void;
    onCancel: () => void;
    isSaving: boolean;
    drivers: Teacher[];
}> = ({ vehicle, onSave, onCancel, drivers }) => {
    const [formState, setFormState] = useState({
        registrationNo: vehicle?.registrationNo ?? '',
        type: vehicle?.type ?? 'Bus',
        capacity: vehicle?.capacity ?? 40,
        fuelType: vehicle?.fuelType ?? 'Diesel',
        driverId: vehicle?.driverId ?? '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormState(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(vehicle ? { ...vehicle, ...formState } : (formState as Omit<Vehicle, 'id' | 'siteId' | 'isAvailable'>));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium">Registration No <span className="text-red-500">*</span></label><input type="text" name="registrationNo" value={formState.registrationNo} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
                <div><label className="block text-sm font-medium">Vehicle Type</label><select name="type" value={formState.type} onChange={handleChange} className="mt-1 w-full rounded-md"><option>Bus</option><option>Van</option><option>Car</option></select></div>
                <div><label className="block text-sm font-medium">Capacity</label><input type="number" name="capacity" value={formState.capacity} onChange={handleChange} className="mt-1 w-full rounded-md"/></div>
                <div><label className="block text-sm font-medium">Fuel Type</label><select name="fuelType" value={formState.fuelType} onChange={handleChange} className="mt-1 w-full rounded-md"><option>Petrol</option><option>Diesel</option><option>Electric</option></select></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium">Assigned Driver</label><select name="driverId" value={formState.driverId} onChange={handleChange} className="mt-1 w-full rounded-md"><option value="">None</option>{drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            </div>
            <div className="hidden"><button type="submit"/></div>
        </form>
    );
};


const Vehicles: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

    const canManage = can('update', 'transport', { kind: 'site', id: siteId! });

    const { data: vehicles, isLoading, isError, error } = useQuery<Vehicle[], Error>({
        queryKey: ['vehicles', siteId],
        queryFn: () => vehicleApi.get(siteId!),
    });

    const { data: teachers = [] } = useQuery<Teacher[], Error>({
        queryKey: ['teachers', siteId],
        queryFn: () => getTeachers(siteId!),
    });
    
    const driverMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles', siteId] });
            setIsModalOpen(false);
        },
        onError: (err: Error) => alert(`Operation failed: ${err.message}`),
    };

    const addMutation = useMutation({
        mutationFn: (vehicle: Omit<Vehicle, 'id' | 'siteId' | 'isAvailable'>) => vehicleApi.add({ ...vehicle, isAvailable: true }),
        ...mutationOptions
    });
    const updateMutation = useMutation({
        mutationFn: (vehicle: Vehicle) => vehicleApi.update(vehicle.id, vehicle),
        ...mutationOptions
    });
    const deleteMutation = useMutation({
        mutationFn: (id: string) => vehicleApi.delete(id),
        ...mutationOptions
    });

    const handleSave = (vehicle: Omit<Vehicle, 'id' | 'siteId' | 'isAvailable'> | Vehicle) => {
        'id' in vehicle ? updateMutation.mutate(vehicle) : addMutation.mutate(vehicle);
    };

    if (isLoading) return <div className="flex justify-center p-8"><Spinner/></div>;
    if (isError) return <ErrorState title="Error" message={(error as Error).message}/>;

    return (
        <div>
            <PageHeader title="Vehicles" subtitle="Manage school transport fleet." actions={canManage && <Button onClick={() => { setSelectedVehicle(null); setIsModalOpen(true); }}>Add Vehicle</Button>} />
            <Card>
                <CardContent>
                    {vehicles && vehicles.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y">
                                <thead><tr>
                                    <th className="px-6 py-3 text-left">Registration No.</th>
                                    <th className="px-6 py-3 text-left">Type</th>
                                    <th className="px-6 py-3 text-left">Capacity</th>
                                    <th className="px-6 py-3 text-left">Driver</th>
                                    <th className="px-6 py-3 text-left">Availability</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr></thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y">
                                    {vehicles.map(vehicle => (
                                        <tr key={vehicle.id}>
                                            <td className="px-6 py-4 font-mono">{vehicle.registrationNo}</td>
                                            <td className="px-6 py-4">{vehicle.type}</td>
                                            <td className="px-6 py-4">{vehicle.capacity}</td>
                                            <td className="px-6 py-4">{vehicle.driverId ? driverMap.get(vehicle.driverId) : 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${vehicle.isAvailable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {vehicle.isAvailable ? 'Available' : 'On Trip'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                {canManage && <>
                                                    <Button size="sm" variant="secondary" onClick={() => { setSelectedVehicle(vehicle); setIsModalOpen(true); }}>Edit</Button>
                                                    <Button size="sm" variant="danger" onClick={() => window.confirm('Are you sure?') && deleteMutation.mutate(vehicle.id)}>Delete</Button>
                                                </>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState title="No Vehicles Found" message="Get started by adding a vehicle to your fleet." onAction={canManage ? () => setIsModalOpen(true) : undefined} actionText="Add Vehicle" />
                    )}
                </CardContent>
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} isLoading={addMutation.isPending || updateMutation.isPending}>Save</Button>
                    </>
                }>
                <VehicleForm vehicle={selectedVehicle} onSave={handleSave} onCancel={() => setIsModalOpen(false)} isSaving={addMutation.isPending || updateMutation.isPending} drivers={teachers} />
            </Modal>
        </div>
    );
};

export default Vehicles;