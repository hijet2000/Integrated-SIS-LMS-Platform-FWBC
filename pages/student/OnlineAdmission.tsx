
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
import { getOnlineAdmissionApplications, updateOnlineAdmissionApplicationStatus, getClassrooms } from '@/services/sisApi';
// FIX: Corrected import path for domain types from '@/constants' to '@/types' to resolve module resolution errors.
import type { OnlineAdmissionApplication, OnlineAdmissionApplicationStatus, Classroom } from '@/types';

const STATUS_OPTIONS: OnlineAdmissionApplicationStatus[] = ['Pending', 'Under Review', 'Approved', 'Rejected', 'Converted'];

const statusColors: { [key in OnlineAdmissionApplicationStatus]: string } = {
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50',
  'Under Review': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50',
  Approved: 'bg-green-100 text-green-800 dark:bg-green-900/50',
  Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50',
  Converted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50',
};

const OnlineAdmission: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const can = useCan();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<OnlineAdmissionApplication | null>(null);
    const [filters, setFilters] = useState({ status: 'all', classSought: 'all' });

    const canUpdate = can('update', 'student.online-admission', { kind: 'site', id: siteId! });

    const { data: applications, isLoading, isError, error } = useQuery<OnlineAdmissionApplication[], Error>({
        queryKey: ['onlineAdmissionApplications', siteId],
        queryFn: () => getOnlineAdmissionApplications(siteId!),
        enabled: !!siteId,
    });
    
    const { data: classrooms = [] } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!) });

    const updateStatusMutation = useMutation({
        mutationFn: ({ applicationId, status }: { applicationId: string, status: OnlineAdmissionApplicationStatus }) => 
            updateOnlineAdmissionApplicationStatus(applicationId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onlineAdmissionApplications', siteId] });
        },
        onError: (e: Error) => alert(`Failed to update status: ${e.message}`),
    });
    
    const convertMutation = useMutation({
        mutationFn: (application: OnlineAdmissionApplication) => updateOnlineAdmissionApplicationStatus(application.id, 'Converted'),
        onSuccess: (updatedApplication) => {
            queryClient.invalidateQueries({ queryKey: ['onlineAdmissionApplications', siteId] });
            navigate(`/student/${siteId}/admission`, { state: { fromApplication: updatedApplication } });
        },
        onError: (e: Error) => alert(`Failed to convert application: ${e.message}`),
    });

    const filteredApplications = useMemo(() => {
        return applications?.filter(a => 
            (filters.status === 'all' || a.status === filters.status) &&
            (filters.classSought === 'all' || a.classSought === filters.classSought)
        ) || [];
    }, [applications, filters]);

    const handleViewClick = (application: OnlineAdmissionApplication) => {
        setSelectedApplication(application);
        setIsModalOpen(true);
    };

    return (
        <div>
            <PageHeader title="Online Admission" subtitle="Review and process applications submitted online." />

            <Card className="mb-6">
                <CardHeader><h3 className="font-semibold">Filter Applications</h3></CardHeader>
                <CardContent className="flex flex-wrap items-center gap-4">
                    <div>
                        <label className="block text-sm font-medium">Status</label>
                        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="mt-1 rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600">
                            <option value="all">All</option>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Class Sought</label>
                        <select value={filters.classSought} onChange={e => setFilters(f => ({ ...f, classSought: e.target.value }))} className="mt-1 rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600">
                            <option value="all">All</option>
                            {classrooms.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                    {isError && <ErrorState title="Failed to load applications" message={error.message} />}
                    {!isLoading && !isError && (
                        filteredApplications.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Applicant</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Class Sought</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Submission Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredApplications.map(app => (
                                            <tr key={app.id}>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium">{app.applicantFirstName} {app.applicantLastName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{app.classSought}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(app.submissionDate).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[app.status]}`}>{app.status}</span></td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                                    <Button size="sm" variant="secondary" onClick={() => handleViewClick(app)}>View</Button>
                                                    {canUpdate && app.status !== 'Converted' && (
                                                        <>
                                                            {app.status !== 'Approved' && <Button size="sm" onClick={() => updateStatusMutation.mutate({ applicationId: app.id, status: 'Approved' })}>Approve</Button>}
                                                            {app.status !== 'Rejected' && <Button size="sm" variant="danger" onClick={() => updateStatusMutation.mutate({ applicationId: app.id, status: 'Rejected' })}>Reject</Button>}
                                                            {app.status === 'Approved' && <Button size="sm" onClick={() => convertMutation.mutate(app)} isLoading={convertMutation.isPending && convertMutation.variables?.id === app.id}>Convert to Admission</Button>}
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <EmptyState title="No Applications Found" message="No online applications match the current filters." />
                    )}
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Application Details">
                {selectedApplication && (
                    <div className="text-sm space-y-3">
                        <p><strong>Applicant:</strong> {selectedApplication.applicantFirstName} {selectedApplication.applicantLastName}</p>
                        <p><strong>Date of Birth:</strong> {new Date(selectedApplication.applicantDob + 'T00:00:00').toLocaleDateString()}</p>
                        <p><strong>Gender:</strong> {selectedApplication.applicantGender}</p>
                        <p><strong>Class Sought:</strong> {selectedApplication.classSought}</p>
                        <hr className="dark:border-gray-600"/>
                        <p><strong>Guardian:</strong> {selectedApplication.guardianName} ({selectedApplication.guardianRelation})</p>
                        <p><strong>Guardian Phone:</strong> {selectedApplication.guardianPhone}</p>
                        <p><strong>Guardian Email:</strong> {selectedApplication.guardianEmail}</p>
                         <hr className="dark:border-gray-600"/>
                        <p><strong>Staff Notes:</strong> {selectedApplication.notes || 'N/A'}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OnlineAdmission;
