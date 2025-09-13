
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useCan } from '@/hooks/useCan';
import { assignmentApi, getSubjects, getStudents, assignmentSubmissionApi } from '@/services/sisApi';
import type { Assignment, Subject, Student, AssignmentSubmission } from '@/types';

const DownloadAssignments: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const { user } = useAuth();
    const can = useCan();

    // FIX: Corrected useCan call to use a single scope string.
    const canRead = can('school:read');

    const { data: assignments = [], isLoading: l1 } = useQuery<Assignment[], Error>({ queryKey: ['assignments', siteId], queryFn: () => assignmentApi.get(siteId!) });
    const { data: subjects = [], isLoading: l2 } = useQuery<Subject[], Error>({ queryKey: ['subjects', siteId], queryFn: () => getSubjects(siteId!) });
    const { data: students = [], isLoading: l3 } = useQuery<Student[], Error>({ queryKey: ['students', siteId], queryFn: () => getStudents(siteId!) });
    const { data: submissions = [], isLoading: l4 } = useQuery<AssignmentSubmission[], Error>({ queryKey: ['submissions', siteId], queryFn: () => assignmentSubmissionApi.get(siteId!) });
    
    const student = useMemo(() => students.find(s => s.id === user?.id), [students, user]);
    const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);
    
    const myAssignments = useMemo(() => {
        if (!student) return [];
        return assignments.filter(a => a.classroomId === student.classroomId);
    }, [assignments, student]);

    const mySubmissionsMap = useMemo(() => {
        return new Map(submissions.filter(s => s.studentId === user?.id).map(s => [s.assignmentId, s]));
    }, [submissions, user]);

    const isLoading = l1 || l2 || l3 || l4;

    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to view this page." />;
    }

    return (
        <div>
            <PageHeader title="Download Assignments" subtitle="View and download assignment files from your teachers." />
            <Card>
                <CardContent>
                    {isLoading ? <div className="flex justify-center p-8"><Spinner /></div> : (
                        myAssignments.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y">
                                    <thead>
                                        <tr>
                                            <th className="p-2 text-left">Title</th>
                                            <th className="p-2 text-left">Subject</th>
                                            <th className="p-2 text-left">Due Date</th>
                                            <th className="p-2 text-left">Status</th>
                                            <th className="p-2 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myAssignments.map(a => {
                                            const submission = mySubmissionsMap.get(a.id);
                                            return (
                                                <tr key={a.id}>
                                                    <td className="p-2 font-semibold">{a.title}</td>
                                                    <td className="p-2">{subjectMap.get(a.subjectId) || 'N/A'}</td>
                                                    <td className="p-2">{new Date(a.dueDate + 'T00:00:00').toLocaleDateString()}</td>
                                                    <td className="p-2">{submission?.status || 'Assigned'}</td>
                                                    <td className="p-2 text-right">
                                                        {a.attachmentUrl && (
                                                            <a href={a.attachmentUrl} download={a.fileName}>
                                                                <Button size="sm">Download</Button>
                                                            </a>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : <EmptyState title="No Assignments Found" message="Your teachers have not posted any assignments for your class yet."/>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DownloadAssignments;
