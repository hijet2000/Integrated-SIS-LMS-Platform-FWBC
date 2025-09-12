
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
    programApi,
    classroomApi,
    feeGroupApi,
    getTeachers,
    getStudents,
// FIX: Correct import path for sisApi
} from '@/services/sisApi';
// FIX: Correct import path for domain types.
import type { Program, Classroom, FeeGroup, Teacher, Student } from '@/types';

type Tab = 'classes' | 'sections';

// --- Classes (Programs) Tab ---
const ClassesTab: React.FC<{ siteId: string, can: (a: any, b: any) => boolean }> = ({ siteId, can }) => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<Program | null>(null);

    const { data: items = [], isLoading, isError } = useQuery<Program[], Error>({ queryKey: ['programs', siteId], queryFn: () => programApi.get(siteId) });
    const { data: feeGroups = [] } = useQuery<FeeGroup[], Error>({ queryKey: ['feeGroups', siteId], queryFn: () => feeGroupApi.get(siteId) });
    const feeGroupMap = useMemo(() => new Map(feeGroups.map(fg => [fg.id, fg.name])), [feeGroups]);

    const mutationOptions = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['programs', siteId] }); setIsModalOpen(false); } };
    const addMutation = useMutation({ mutationFn: (item: Omit<Program, 'id'|'siteId'>) => programApi.add(item), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (item: Program) => programApi.update(item.id, item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => programApi.delete(id), ...mutationOptions });

    const handleSave = (itemData: any) => {
        selected ? updateMutation.mutate({ ...selected, ...itemData }) : addMutation.mutate(itemData);
    };

    return (
        <div>
            {can('create', 'school.academics') && <Button className="mb-4" onClick={() => { setSelected(null); setIsModalOpen(true); }}>Add Class</Button>}
            {isLoading && <Spinner/>}
            {isError && <ErrorState title="Error" message="Could not load classes." />}
            {!isLoading && !isError && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y">
                        <thead><tr>
                            <th className="px-6 py-3 text-left">Class Name</th>
                            <th className="px-6 py-3 text-left">Code</th>
                            <th className="px-6 py-3 text-left">Session</th>
                            <th className="px-6 py-3 text-left">Fee Group</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr></thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y">
                            {items.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 font-medium">{item.name}</td>
                                    <td className="px-6 py-4">{item.code}</td>
                                    <td className="px-6 py-4">{item.session}</td>
                                    <td className="px-6 py-4">{item.feeGroupId ? feeGroupMap.get(item.feeGroupId) : 'N/A'}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {can('update', 'school.academics') && <Button size="sm" variant="secondary" onClick={() => { setSelected(item); setIsModalOpen(true); }}>Edit</Button>}
                                        {can('delete', 'school.academics') && <Button size="sm" variant="danger" onClick={() => window.confirm('Are you sure?') && deleteMutation.mutate(item.id)}>Delete</Button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selected ? 'Edit Class' : 'Add Class'}
                footer={<><Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} className="ml-2">Save</Button></>}>
                <ClassForm item={selected} onSave={handleSave} feeGroups={feeGroups} />
            </Modal>
        </div>
    );
};
const ClassForm: React.FC<{item?: Program | null, onSave: (data: any) => void, feeGroups: FeeGroup[]}> = ({ item, onSave, feeGroups }) => {
    const [formState, setFormState] = useState({ name: item?.name || '', code: item?.code || '', session: item?.session || '2024-2025', feeGroupId: item?.feeGroupId || '' });
    return (
        <form onSubmit={e => { e.preventDefault(); onSave(formState); }} className="space-y-4">
            <div><label>Class Name</label><input value={formState.name} onChange={e => setFormState(p=>({...p, name: e.target.value}))} required className="w-full rounded-md"/></div>
            <div><label>Code</label><input value={formState.code} onChange={e => setFormState(p=>({...p, code: e.target.value}))} className="w-full rounded-md"/></div>
            <div><label>Session</label><input value={formState.session} onChange={e => setFormState(p=>({...p, session: e.target.value}))} className="w-full rounded-md"/></div>
            <div><label>Fee Group</label><select value={formState.feeGroupId} onChange={e => setFormState(p=>({...p, feeGroupId: e.target.value}))} className="w-full rounded-md"><option value="">None</option>{feeGroups.map(fg=><option key={fg.id} value={fg.id}>{fg.name}</option>)}</select></div>
            <div className="hidden"><button type="submit">Save</button></div>
        </form>
    );
};

// --- Sections (Classrooms) Tab ---
const SectionsTab: React.FC<{ siteId: string, can: (a: any, b: any) => boolean }> = ({ siteId, can }) => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<Classroom | null>(null);

    const { data: items = [], isLoading, isError } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => classroomApi.get(siteId) });
    const { data: programs = [] } = useQuery<Program[], Error>({ queryKey: ['programs', siteId], queryFn: () => programApi.get(siteId) });
    const { data: teachers = [] } = useQuery<Teacher[], Error>({ queryKey: ['teachers', siteId], queryFn: () => getTeachers(siteId) });
    const { data: students = [] } = useQuery<Student[], Error>({ queryKey: ['students', siteId], queryFn: () => getStudents(siteId!) });
    
    const programMap = useMemo(() => new Map(programs.map(p => [p.id, p.name])), [programs]);
    const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);
    const studentCountMap = useMemo(() => {
        const counts = new Map<string, number>();
        students.forEach(s => {
            counts.set(s.classroomId, (counts.get(s.classroomId) || 0) + 1);
        });
        return counts;
    }, [students]);

    const mutationOptions = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['classrooms', siteId] }); setIsModalOpen(false); } };
    const addMutation = useMutation({ mutationFn: (item: Omit<Classroom, 'id'|'siteId'>) => classroomApi.add(item), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (item: Classroom) => classroomApi.update(item.id, item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => classroomApi.delete(id), ...mutationOptions });

    const handleSave = (itemData: any) => {
        selected ? updateMutation.mutate({ ...selected, ...itemData }) : addMutation.mutate(itemData);
    };
    
    return (
        <div>
            {can('create', 'school.academics') && <Button className="mb-4" onClick={() => { setSelected(null); setIsModalOpen(true); }}>Add Section</Button>}
            {isLoading && <Spinner/>}
            {isError && <ErrorState title="Error" message="Could not load sections." />}
            {!isLoading && !isError && (
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y">
                        <thead><tr>
                            <th className="px-6 py-3 text-left">Parent Class</th>
                            <th className="px-6 py-3 text-left">Section Name</th>
                            <th className="px-6 py-3 text-left">Stream</th>
                            <th className="px-6 py-3 text-left">Class Teacher</th>
                            <th className="px-6 py-3 text-left">Enrollment</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr></thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y">
                            {items.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4">{programMap.get(item.programId)}</td>
                                    <td className="px-6 py-4 font-medium">{item.name}</td>
                                    <td className="px-6 py-4">{item.stream}</td>
                                    <td className="px-6 py-4">{item.tutorId ? teacherMap.get(item.tutorId) : 'N/A'}</td>
                                    <td className="px-6 py-4">{studentCountMap.get(item.id) || 0} / {item.capacity}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {can('update', 'school.academics') && <Button size="sm" variant="secondary" onClick={() => { setSelected(item); setIsModalOpen(true); }}>Edit</Button>}
                                        {can('delete', 'school.academics') && <Button size="sm" variant="danger" onClick={() => window.confirm('Are you sure?') && deleteMutation.mutate(item.id)}>Delete</Button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selected ? 'Edit Section' : 'Add Section'}
                 footer={<><Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} className="ml-2">Save</Button></>}>
                <SectionForm item={selected} onSave={handleSave} programs={programs} teachers={teachers} />
            </Modal>
        </div>
    );
};
const SectionForm: React.FC<{item?: Classroom | null, onSave: (data: any) => void, programs: Program[], teachers: Teacher[]}> = ({ item, onSave, programs, teachers }) => {
    const [formState, setFormState] = useState({ name: item?.name || '', programId: item?.programId || '', stream: item?.stream || '', capacity: item?.capacity || 30, tutorId: item?.tutorId || '' });
    return (
        <form onSubmit={e => { e.preventDefault(); onSave(formState); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div><label>Parent Class</label><select value={formState.programId} onChange={e => setFormState(p=>({...p, programId: e.target.value}))} required className="w-full rounded-md"><option value="">Select Class</option>{programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                <div><label>Section Name</label><input value={formState.name} onChange={e => setFormState(p=>({...p, name: e.target.value}))} required className="w-full rounded-md"/></div>
                <div><label>Stream</label><input value={formState.stream} onChange={e => setFormState(p=>({...p, stream: e.target.value}))} className="w-full rounded-md"/></div>
                <div><label>Capacity</label><input type="number" value={formState.capacity} onChange={e => setFormState(p=>({...p, capacity: parseInt(e.target.value)}))} required className="w-full rounded-md"/></div>
                <div className="col-span-2"><label>Class Teacher</label><select value={formState.tutorId} onChange={e => setFormState(p=>({...p, tutorId: e.target.value}))} className="w-full rounded-md"><option value="">None</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
            </div>
            <div className="hidden"><button type="submit">Save</button></div>
        </form>
    );
};


// --- Main Component ---
const ClassesAndSections: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();
    const [activeTab, setActiveTab] = useState<Tab>('classes');

    const canRead = can('read', 'school.academics', { kind: 'site', id: siteId! });

    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to configure classes and sections." />;
    }

    const tabs: { key: Tab; label: string }[] = [
        { key: 'classes', label: 'Classes' },
        { key: 'sections', label: 'Sections' },
    ];
    
    return (
        <div>
            <PageHeader title="Class / Sections" subtitle="Manage the foundational academic structure of the school." />
            
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
                    {activeTab === 'classes' && <ClassesTab siteId={siteId!} can={can} />}
                    {activeTab === 'sections' && <SectionsTab siteId={siteId!} can={can} />}
                </CardContent>
            </Card>
        </div>
    );
};

export default ClassesAndSections;
