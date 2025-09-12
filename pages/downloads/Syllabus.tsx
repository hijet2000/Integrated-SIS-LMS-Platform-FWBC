
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent } from '@/components/ui/Card';
// FIX: Correct import path for sisApi
import { contentApi, getSubjects } from '@/services/sisApi';
import { useCan } from '@/hooks/useCan';
// FIX: Correct import path for domain types.
import type { Content, Subject } from '@/types';
import Button from '@/components/ui/Button';

const SyllabusList: React.FC<{ content: Content[]; subjectMap: Map<string, string> }> = ({ content, subjectMap }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Syllabus Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Upload Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {content.map(item => (
                    <tr key={item.id}>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.title}</td>
                        <td className="px-6 py-4">{item.subjectId ? subjectMap.get(item.subjectId) : 'General'}</td>
                        <td className="px-6 py-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                             <a href={item.attachmentUrl} download={item.fileName} target="_blank" rel="noreferrer">
                                <Button size="sm">Download</Button>
                            </a>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const Syllabus: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();
    const canRead = can('read', 'downloads.content', { kind: 'site', id: siteId! });

    const { data: content = [], isLoading: l1 } = useQuery<Content[], Error>({ queryKey: ['content', siteId], queryFn: () => contentApi.get(siteId!), enabled: canRead });
    const { data: subjects = [], isLoading: l2 } = useQuery<Subject[], Error>({ queryKey: ['subjects', siteId], queryFn: () => getSubjects(siteId!), enabled: canRead });

    const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);

    const syllabusContent = useMemo(() => {
        return content.filter(c => c.category === 'Syllabus');
    }, [content]);
    
    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to view this content." />;
    }

    const isLoading = l1 || l2;

    return (
        <div>
            <PageHeader title="Syllabus" subtitle="Download the syllabus for your classes." />
            <Card>
                <CardContent>
                    {isLoading ? <div className="flex justify-center p-8"><Spinner /></div> : (
                        syllabusContent.length > 0
                            ? <SyllabusList content={syllabusContent} subjectMap={subjectMap} />
                            : <EmptyState title="No Syllabus Found" message="The syllabus for your classes has not been uploaded yet." />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Syllabus;
