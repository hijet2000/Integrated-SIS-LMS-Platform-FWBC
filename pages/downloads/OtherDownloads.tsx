
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
// FIX: Correct import path for sisApi
import { contentApi, getTeachers } from '@/services/sisApi';
import { useCan } from '@/hooks/useCan';
// FIX: Correct import path for domain types.
import type { Content, Teacher, ContentCategory } from '@/types';
import Button from '@/components/ui/Button';

const OTHER_DOWNLOAD_CATEGORIES: ContentCategory[] = ['Circular', 'Policy', 'Form', 'Miscellaneous'];

const ContentList: React.FC<{ 
    content: Content[]; 
    teacherMap: Map<string, string>;
}> = ({ content, teacherMap }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Uploaded By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Upload Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {content.map(item => (
                    <tr key={item.id}>
                        <td className="px-6 py-4">
                            <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                        </td>
                        <td className="px-6 py-4">{item.category}</td>
                        <td className="px-6 py-4">{teacherMap.get(item.uploadedBy) || 'N/A'}</td>
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

const OtherDownloads: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();
    const [filters, setFilters] = useState({ 
        searchTerm: '', 
        categoryId: 'all' 
    });

    // FIX: Corrected useCan call to use a single scope string.
    const canRead = can('school:read');

    const { data: content = [], isLoading: l1 } = useQuery<Content[], Error>({ queryKey: ['content', siteId], queryFn: () => contentApi.get(siteId!), enabled: canRead });
    const { data: teachers = [], isLoading: l2 } = useQuery<Teacher[], Error>({ queryKey: ['teachers', siteId], queryFn: () => getTeachers(siteId!), enabled: canRead });

    const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);

    const filteredContent = useMemo(() => {
        const lowercasedTerm = filters.searchTerm.toLowerCase();
        return content
            .filter(c => OTHER_DOWNLOAD_CATEGORIES.includes(c.category))
            .filter(c => filters.categoryId === 'all' || c.category === filters.categoryId)
            .filter(c => !lowercasedTerm || 
                c.title.toLowerCase().includes(lowercasedTerm) || 
                c.description?.toLowerCase().includes(lowercasedTerm)
            );
    }, [content, filters]);
    
    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to view this content." />;
    }

    const isLoading = l1 || l2;

    return (
        <div>
            <PageHeader title="Other Downloads" subtitle="Access circulars, notices, forms, and other general documents." />
            <Card>
                <CardHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="search-filter" className="block text-sm font-medium mb-1">Search:</label>
                             <input id="search-filter" type="text" placeholder="Search by title or description..." value={filters.searchTerm} onChange={e => setFilters(f => ({...f, searchTerm: e.target.value}))} className="w-full rounded-md"/>
                        </div>
                        <div>
                            <label htmlFor="category-filter" className="block text-sm font-medium mb-1">Filter by Category:</label>
                            <select id="category-filter" value={filters.categoryId} onChange={e => setFilters(f => ({...f, categoryId: e.target.value}))} className="w-full rounded-md"><option value="all">All Categories</option>{OTHER_DOWNLOAD_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? <div className="flex justify-center p-8"><Spinner /></div> : (
                        filteredContent.length > 0
                            ? <ContentList content={filteredContent} teacherMap={teacherMap} />
                            : <EmptyState title="No Documents Found" message="There are no documents available that match your filters." />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default OtherDownloads;
