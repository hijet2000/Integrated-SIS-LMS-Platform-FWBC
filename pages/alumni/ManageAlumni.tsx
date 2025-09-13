
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
import { alumniApi, getClassrooms } from '@/services/sisApi';
import type { Alumni, Classroom } from '@/types';

// --- Form Component ---
const AlumniForm: React.FC<{
    alumni?: Alumni | null;
    onSave: (data: Omit<Alumni, 'id' | 'siteId'> | Alumni) => void;
    onCancel: () => void;
    isSaving: boolean;
    classrooms: Classroom[];
}> = ({ alumni, onSave, onCancel, classrooms }) => {
    const [form, setForm] = useState({
        name: alumni?.name ?? '',
        studentId: alumni?.studentId ?? '',
        graduationYear: alumni?.graduationYear ?? new Date().getFullYear(),
        lastClassroomId: alumni?.lastClassroomId ?? '',
        email: alumni?.email ?? '',
        phone: alumni?.phone ?? '',
        occupation: alumni?.occupation ?? '',
        organization: alumni?.organization ?? '',
    });

    const handleChange = (e: React.ChangeEvent<any>) => {
        const { name, value, type } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(alumni ? { ...alumni, ...form } : form);
    };

    return (
        <form id="alumni-form" onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label>Full Name *</label><input name="name" value={form.name} onChange={handleChange} required className="w-full rounded-md"/></div>
                <div><label>Graduation Year *</label><input type="number" name="graduationYear" value={form.graduationYear} onChange={handleChange} required className="w-full rounded-md"/></div>
                <div><label>Last Class Attended</label><select name="lastClassroomId" value={form.lastClassroomId} onChange={handleChange} className="w-full rounded-md"><option value="">Select</option>{classrooms.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label>Original Student ID</label><input name="studentId" value={form.studentId} onChange={handleChange} className="w-full rounded-md"/></div>
                <div><label>Email</label><input type="email" name="email" value={form.email} onChange={handleChange} className="w-full rounded-md"/></div>
                <div><label>Phone</label><input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-md"/></div>
                <div><label>Occupation</label><input name="occupation" value={form.occupation} onChange={handleChange} className="w-full rounded-md"/></div>
                <div><label>Organization</label><input name="organization" value={form.organization} onChange={handleChange} className="w-full rounded-md"/></div>
            </div>
            <button type="submit" className="hidden"/>
        </form>
    );
};

// --- Main Component ---
const ManageAlumni: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);
    const [filters, setFilters] = useState({ searchTerm: '', year: 'all' });

    const canManage = can('school:write');

    const { data: alumni = [], isLoading: l1 } = useQuery<Alumni[], Error>({ queryKey: ['alumni', siteId], queryFn: () => alumniApi.get(siteId!) });
    const { data: classrooms = [], isLoading: l2 } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!) });

    const classroomMap = useMemo(() => new Map(classrooms.map(c => [c.id, c.name])), [classrooms]);
    const uniqueYears = useMemo(() => [...new Set(alumni.map(a => a.graduationYear))].sort((a, b) => b - a), [alumni]);

    const mutationOptions = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['alumni', siteId] }); setIsModalOpen(false); } };
    const addMutation = useMutation({ mutationFn: (item: any) => alumniApi.add(item), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (item: Alumni) => alumniApi.update(item.id, item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => alumniApi.delete(id), ...mutationOptions });
    const handleSave = (item: any) => selectedAlumni ? updateMutation.mutate({ ...selectedAlumni, ...item }) : addMutation.mutate(item);
    
    const filteredAlumni = useMemo(() => {
        const term = filters.searchTerm.toLowerCase();
        return alumni.filter(a => 
            (filters.year === 'all' || a.graduationYear === parseInt(filters.year)) &&
            (!term || a.name.toLowerCase().includes(term) || a.occupation?.toLowerCase().includes(term))
        );
    }, [alumni, filters]);

    const isLoading = l1 || l2;

    return (
        <div>
            <PageHeader title="Manage Alumni" actions={canManage && <Button onClick={() => { setSelectedAlumni(null); setIsModalOpen(true); }}>Add Alumni</Button>} />

            <Card className="mb-6">
                <CardHeader><h3 className="font-semibold">Filter Alumni</h3></CardHeader>
                <CardContent className="flex gap-4">
                    <input type="text" placeholder="Search by name or occupation..." value={filters.searchTerm} onChange={e => setFilters(f => ({...f, searchTerm: e.target.value}))} className="w-full md:w-1/3 rounded-md"/>
                    <select value={filters.year} onChange={e => setFilters(f => ({...f, year: e.target.value}))} className="rounded-md">
                        <option value="all">All Years</option>
                        {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {isLoading && <Spinner/>}
                    {!isLoading && (
                        filteredAlumni.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y">
                                    <thead><tr>
                                        <th className="p-2 text-left">Name</th>
                                        <th className="p-2 text-left">Graduation Year</th>
                                        <th className="p-2 text-left">Last Class</th>
                                        <th className="p-2 text-left">Occupation</th>
                                        <th className="p-2 text-right">Actions</th>
                                    </tr></thead>
                                    <tbody className="divide-y">
                                        {filteredAlumni.map(item => (
                                            <tr key={item.id}>
                                                <td className="p-2 font-semibold">{item.name}</td>
                                                <td className="p-2">{item.graduationYear}</td>
                                                <td className="p-2">{classroomMap.get(item.lastClassroomId)}</td>
                                                <td className="p-2">{item.occupation} @ {item.organization}</td>
                                                <td className="p-2 text-right space-x-2">
                                                    {canManage && <>
                                                        <Button size="sm" variant="secondary" onClick={() => { setSelectedAlumni(item); setIsModalOpen(true); }}>Edit</Button>
                                                        <Button size="sm" variant="danger" onClick={() => deleteMutation.mutate(item.id)}>Delete</Button>
                                                    </>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <EmptyState title="No Alumni Found" message="No alumni match your filters. Add one to get started."/>
                    )}
                </CardContent>
            </Card>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedAlumni ? 'Edit Alumni' : 'Add Alumni'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button 
                            type="submit" 
                            form="alumni-form" 
                            className="ml-2"
                            isLoading={addMutation.isPending || updateMutation.isPending}
                        >
                            Save
                        </Button>
                    </>
                }
            >
                <AlumniForm 
                    alumni={selectedAlumni} 
                    onSave={handleSave} 
                    onCancel={() => setIsModalOpen(false)} 
                    isSaving={addMutation.isPending || updateMutation.isPending} 
                    classrooms={classrooms} 
                />
            </Modal>
        </div>
    );
};

export default ManageAlumni;
