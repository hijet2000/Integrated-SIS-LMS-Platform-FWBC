
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
import { useAuth } from '@/hooks/useAuth';
// FIX: Correct import path for sisApi
import { communicationLogApi, getTeachers } from '@/services/sisApi';
// FIX: Correct import path for domain types.
import type { CommunicationLog, CommunicationLogStatus, Teacher } from '@/types';

const statusColors: { [key in CommunicationLogStatus]: string } = {
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50',
  Sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50',
  Delivered: 'bg-green-100 text-green-800 dark:bg-green-900/50',
  Failed: 'bg-red-100 text-red-800 dark:bg-red-900/50',
};

const Logs: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const { user } = useAuth();
    const can = useCan();

    const [filters, setFilters] = useState({
        channel: 'all',
        searchTerm: '',
        startDate: '',
        endDate: '',
    });
    const [viewingLog, setViewingLog] = useState<CommunicationLog | null>(null);

    // FIX: Corrected useCan call to use a single scope string.
    const canRead = can('school:read');
    // FIX: Corrected useCan call to use a single scope string.
    const canExport = can('school:write');

    const { data: logs, isLoading: isLoadingLogs } = useQuery<CommunicationLog[], Error>({
        queryKey: ['communicationLogs', siteId],
        queryFn: () => communicationLogApi.get(siteId!),
        enabled: canRead,
    });
    const { data: teachers, isLoading: isLoadingTeachers } = useQuery<Teacher[], Error>({
        queryKey: ['teachers', siteId],
        queryFn: () => getTeachers(siteId!),
        enabled: canRead,
    });

    // FIX: Explicitly type the Map to ensure proper type inference.
    const teacherMap = useMemo(() => {
        if (!teachers) return new Map<string, string>();
        return new Map<string, string>(teachers.map(t => [t.id, t.name]));
    }, [teachers]);

    const filteredLogs = useMemo(() => {
        if (!logs) return [];
        let data = logs;

        // Role-based filtering: Teachers only see their own logs.
        if (user?.role === 'teacher') {
            data = data.filter(log => log.senderId === user.id);
        }

        // UI filters
        return data.filter(log => {
            const channelMatch = filters.channel === 'all' || log.channel === filters.channel;
            const term = filters.searchTerm.toLowerCase();
            const searchMatch = !term ||
                log.recipientsDescription.toLowerCase().includes(term) ||
                log.subject?.toLowerCase().includes(term) ||
                log.messageSnippet.toLowerCase().includes(term);
            const startDateMatch = !filters.startDate || new Date(log.sentAt) >= new Date(filters.startDate);
            const endDateMatch = !filters.endDate || new Date(log.sentAt) <= new Date(filters.endDate + 'T23:59:59');
            
            return channelMatch && searchMatch && startDateMatch && endDateMatch;
        }).sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
    }, [logs, user, filters]);

    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have the required permissions to view this page." />;
    }

    const isLoading = isLoadingLogs || isLoadingTeachers;

    return (
        <div>
            <PageHeader
                title="Communication Logs"
                subtitle="Audit trail for all messages sent via the system."
                actions={canExport && <Button disabled={filteredLogs.length === 0} onClick={() => alert(`Exporting ${filteredLogs.length} log records...`)}>Export</Button>}
            />

            <Card className="mb-6">
                <CardHeader><h3 className="font-semibold">Filter Logs</h3></CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <input type="text" placeholder="Search recipient, subject..." value={filters.searchTerm} onChange={e => setFilters(f => ({ ...f, searchTerm: e.target.value }))} className="rounded-md"/>
                    <select value={filters.channel} onChange={e => setFilters(f => ({ ...f, channel: e.target.value }))} className="rounded-md">
                        <option value="all">All Channels</option>
                        <option>Notice</option>
                        <option>Email</option>
                        <option>SMS</option>
                    </select>
                    <input type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} className="rounded-md"/>
                    <input type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} className="rounded-md"/>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {isLoading ? <div className="flex justify-center p-8"><Spinner/></div> : (
                        filteredLogs.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs uppercase">Date & Time</th>
                                            <th className="px-6 py-3 text-left text-xs uppercase">Sender</th>
                                            <th className="px-6 py-3 text-left text-xs uppercase">Channel</th>
                                            <th className="px-6 py-3 text-left text-xs uppercase">Recipient(s)</th>
                                            <th className="px-6 py-3 text-left text-xs uppercase">Message Snippet</th>
                                            <th className="px-6 py-3 text-left text-xs uppercase">Status</th>
                                            <th className="px-6 py-3 text-right text-xs uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredLogs.map(log => (
                                            <tr key={log.id}>
                                                <td className="px-6 py-4 text-sm">{new Date(log.sentAt).toLocaleString()}</td>
                                                <td className="px-6 py-4">{teacherMap.get(log.senderId) || 'System'}</td>
                                                <td className="px-6 py-4 font-semibold">{log.channel}</td>
                                                <td className="px-6 py-4">{log.recipientsDescription}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500 italic">"{log.messageSnippet}"</td>
                                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[log.status]}`}>{log.status}</span></td>
                                                <td className="px-6 py-4 text-right"><Button size="sm" variant="secondary" onClick={() => setViewingLog(log)}>View</Button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <EmptyState title="No Logs Found" message="No communication logs match your filters." />
                    )}
                </CardContent>
            </Card>

            <Modal isOpen={!!viewingLog} onClose={() => setViewingLog(null)} title="View Message Log">
                {viewingLog && (
                    <div className="space-y-4">
                        <div><strong className="font-semibold">Recipient(s):</strong> {viewingLog.recipientsDescription}</div>
                        <div><strong className="font-semibold">Subject:</strong> {viewingLog.subject || 'N/A'}</div>
                        <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                            <p className="whitespace-pre-wrap text-sm">{viewingLog.fullMessage}</p>
                        </div>
                        {viewingLog.failureReason && (
                             <div><strong className="font-semibold text-red-600">Failure Reason:</strong> {viewingLog.failureReason}</div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

// FIX: Add a default export to the component.
export default Logs;
