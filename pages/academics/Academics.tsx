import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent } from '@/components/ui/Card';
import { getPrograms, getSubjects, getCurricula, getClassrooms, getTeachers } from '@/services/sisApi';
import { useCan } from '@/hooks/useCan';
import type { Program, Subject, Curriculum, Classroom, Teacher } from '@/types';

type Tab = 'programs' | 'subjects' | 'curricula' | 'classrooms';
const TABS: { id: Tab, label: string }[] = [
    { id: 'programs', label: 'Programs' },
    { id: 'subjects', label: 'Subjects' },
    { id: 'curricula', label: 'Curricula' },
    { id: 'classrooms', label: 'Classrooms' },
];

const ProgramsTab: React.FC<{ siteId: string, canCreate: boolean }> = ({ siteId, canCreate }) => {
    const { data: programs, isLoading, isError, error, refetch } = useQuery<Program[], Error>({
        queryKey: ['programs', siteId],
        queryFn: () => getPrograms(siteId),
    });

    if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
    if (isError) return <ErrorState title="Failed to load programs" message={error.message} onRetry={refetch} />;

    return (
        <>
            {programs && programs.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Level</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Duration (Years)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {programs.map(p => (
                                <tr key={p.id}><td className="px-6 py-4">{p.name}</td><td className="px-6 py-4">{p.level}</td><td className="px-6 py-4">{p.duration}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : <EmptyState title="No programs found" message="Get started by adding a new program." actionText={canCreate ? 'Add Program' : undefined} onAction={canCreate ? () => alert('New program form') : undefined} />}
        </>
    );
};

const SubjectsTab: React.FC<{ siteId: string, canCreate: boolean }> = ({ siteId, canCreate }) => {
    const { data: subjects, isLoading, isError, error, refetch } = useQuery<Subject[], Error>({
        queryKey: ['subjects', siteId],
        queryFn: () => getSubjects(siteId),
    });

    if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
    if (isError) return <ErrorState title="Failed to load subjects" message={error.message} onRetry={refetch} />;
    
    return (
         <>
            {subjects && subjects.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                                {/* FIX: Changed column header from "Credits" to "Max Marks" to match the available data in the Subject type. */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Max Marks</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {subjects.map(s => (
                                // FIX: The 'Subject' type does not have a 'credits' property. Replaced with 'maxMarks' which is available.
                                <tr key={s.id}><td className="px-6 py-4">{s.code}</td><td className="px-6 py-4">{s.name}</td><td className="px-6 py-4">{s.maxMarks}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : <EmptyState title="No subjects found" message="Get started by adding a new subject." actionText={canCreate ? 'Add Subject' : undefined} onAction={canCreate ? () => alert('New subject form') : undefined} />}
        </>
    );
};

const ClassroomsTab: React.FC<{ siteId: string, canCreate: boolean }> = ({ siteId, canCreate }) => {
    const { data: classrooms, isLoading: isLoadingClassrooms } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId) });
    const { data: programs } = useQuery<Program[], Error>({ queryKey: ['programs', siteId], queryFn: () => getPrograms(siteId) });
    const { data: teachers } = useQuery<Teacher[], Error>({ queryKey: ['teachers', siteId], queryFn: () => getTeachers(siteId) });

    // FIX: Explicitly type the Map to ensure proper type inference, preventing 'unknown' type errors when rendering.
    const programMap = useMemo(() => new Map<string, string>(programs?.map(p => [p.id, p.name])), [programs]);
    // FIX: Explicitly type the Map to ensure proper type inference, preventing 'unknown' type errors when rendering.
    const teacherMap = useMemo(() => new Map<string, string>(teachers?.map(t => [t.id, t.name])), [teachers]);

    if (isLoadingClassrooms) return <div className="flex justify-center p-8"><Spinner /></div>;

    return (
         <>
            {classrooms && classrooms.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                         <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Program</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Capacity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tutor</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {classrooms.map(c => (
                                <tr key={c.id}>
                                    <td className="px-6 py-4">{c.name}</td>
                                    <td className="px-6 py-4">{c.programId ? programMap.get(c.programId) || 'N/A' : 'N/A'}</td>
                                    <td className="px-6 py-4">{c.capacity}</td>
                                    <td className="px-6 py-4">{c.tutorId ? teacherMap.get(c.tutorId) || 'N/A' : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : <EmptyState title="No classrooms found" message="Get started by adding a new classroom." actionText={canCreate ? 'Add Classroom' : undefined} onAction={canCreate ? () => alert('New classroom form') : undefined} />}
        </>
    );
};


const CurriculaTab: React.FC<{ siteId: string, canCreate: boolean }> = ({ siteId, canCreate }) => {
    const { data: curricula, isLoading: isLoadingCurricula } = useQuery<Curriculum[], Error>({ queryKey: ['curricula', siteId], queryFn: () => getCurricula(siteId) });
    const { data: programs } = useQuery<Program[], Error>({ queryKey: ['programs', siteId], queryFn: () => getPrograms(siteId) });
    const { data: subjects } = useQuery<Subject[], Error>({ queryKey: ['subjects', siteId], queryFn: () => getSubjects(siteId) });

    const programMap = useMemo(() => new Map(programs?.map(p => [p.id, p.name])), [programs]);
    const subjectMap = useMemo(() => new Map(subjects?.map(s => [s.id, s.name])), [subjects]);
    
    if (isLoadingCurricula) return <div className="flex justify-center p-8"><Spinner /></div>;
    
    return (
         <>
            {curricula && curricula.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                         <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Program / Year</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Subjects</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {curricula.map(c => (
                                <tr key={c.id}>
                                    <td className="px-6 py-4">{c.programId ? programMap.get(c.programId) || 'N/A' : 'N/A'} - Year {c.year}</td>
                                    <td className="px-6 py-4">{c.subjects.map(sId => subjectMap.get(sId) || sId).join(', ')}</td>
                                    <td className="px-6 py-4">{c.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : <EmptyState title="No curricula found" message="Get started by defining a new curriculum." actionText={canCreate ? 'Add Curriculum' : undefined} onAction={canCreate ? () => alert('New curriculum form') : undefined} />}
        </>
    );
};

const Academics: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();
    const [activeTab, setActiveTab] = useState<Tab>('programs');

    const canCreate = can('create', 'school.academics', { kind: 'site', id: siteId! });
    const canRead = can('read', 'school.academics', { kind: 'site', id: siteId! });

    const activeTabLabel = TABS.find(t => t.id === activeTab)?.label || '';

    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to view academic information." />;
    }

    return (
        <div>
            <PageHeader
                title="Academics"
                subtitle="Manage programs, subjects, curricula, and classrooms."
                actions={canCreate && (
                    <Button onClick={() => alert(`New ${activeTabLabel.slice(0, -1)} form would open.`)}>
                        Add {activeTabLabel.slice(0, -1)}
                    </Button>
                )}
            />

            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`${activeTab === tab.id ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <Card>
                <CardContent>
                    {activeTab === 'programs' && <ProgramsTab siteId={siteId!} canCreate={canCreate} />}
                    {activeTab === 'subjects' && <SubjectsTab siteId={siteId!} canCreate={canCreate} />}
                    {activeTab === 'classrooms' && <ClassroomsTab siteId={siteId!} canCreate={canCreate} />}
                    {activeTab === 'curricula' && <CurriculaTab siteId={siteId!} canCreate={canCreate} />}
                </CardContent>
            </Card>
        </div>
    );
};

export default Academics;