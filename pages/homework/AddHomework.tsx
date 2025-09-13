import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
import { useAuth } from '@/hooks/useAuth';
import {
    homeworkApi,
    addHomework,
    getHomeworkSubmissions,
    updateHomeworkSubmissions,
    getClassrooms,
    getSubjects,
    getStudentsByClassroom,
} from '@/services/sisApi';
import type { Homework, HomeworkSubmission, Classroom, Subject, Student, HomeworkStatus, SubmissionStatus } from '@/types';

type Tab = 'list' | 'add';
type EvaluationState = { [submissionId: string]: { marks?: number; remarks?: string } };
// FIX: Corrected type to SubmissionStatus to match the type definition.
const submissionStatusColors: { [key in SubmissionStatus]: string } = {
  Assigned: 'bg-gray-100 text-gray-800 dark:bg-gray-700',
  Submitted: 'bg-green-100 text-green-800 dark:bg-green-900/50',
  Late: 'bg-red-100 text-red-800 dark:bg-red-900/50',
  Graded: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50',
};


// --- Evaluation Modal ---
const EvaluationModal: React.FC<{
    homework: Homework;
    onClose: () => void;
}> = ({ homework, onClose }) => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();

    const { data: students = [], isLoading: l1 } = useQuery<Student[], Error>({
        queryKey: ['studentsByClass', homework.classroomId],
        queryFn: () => getStudentsByClassroom(homework.classroomId),
    });
    const { data: submissions = [], isLoading: l2 } = useQuery<HomeworkSubmission[], Error>({
        queryKey: ['homeworkSubmissions', homework.id],
        queryFn: () => getHomeworkSubmissions(homework.id),
    });

    const [evaluationData, setEvaluationData] = useState<EvaluationState>({});

    const studentSubmissionMap = useMemo(() => {
        return new Map(submissions.map(s => [s.studentId, s]));
    }, [submissions]);

    const mutation = useMutation({
        mutationFn: (updates: Partial<HomeworkSubmission>[]) => updateHomeworkSubmissions(updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['homeworkSubmissions', homework.id] });
            alert('Evaluation saved!');
            onClose();
        },
        onError: (err: Error) => alert(`Error saving evaluation: ${err.message}`),
    });

    const handleSave = () => {
        const updates: Partial<HomeworkSubmission>[] = [];
        Object.entries(evaluationData).forEach(([submissionId, data]) => {
            updates.push({ id: submissionId, ...data, status: 'Graded' });
        });
        if (updates.length > 0) {
            mutation.mutate(updates);
        }
    };

    const handleEvalChange = (id: string, field: 'marks' | 'remarks', value: string | number) => {
        setEvaluationData(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };
    
    const isLoading = l1 || l2;

    return (
        <Modal isOpen={true} onClose={onClose} title={`Evaluate: ${homework.title}`} footer={
            <><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={handleSave} isLoading={mutation.isPending} className="ml-2">Save Evaluation</Button></>
        }>
            {isLoading && <Spinner/>}
            {!isLoading && (
                <div className="overflow-x-auto max-h-[60vh]">
                    <table className="min-w-full divide-y">
                        <thead><tr>
                            <th className="p-2 text-left">Student</th>
                            <th className="p-2 text-left">Status</th>
                            <th className="p-2 text-left">Marks</th>
                            <th className="p-2 text-left">Remarks</th>
                        </tr></thead>
                        <tbody>
                        {students.map(student => {
                            const submission = studentSubmissionMap.get(student.id);
                            const status: SubmissionStatus = submission?.status ?? 'Assigned';
                            const currentEval = submission ? (evaluationData[submission.id] || {}) : {};
                            
                            // IMPROVEMENT: Display all students, disabling inputs for those who haven't submitted.
                            return (
                                <tr key={student.id}>
                                    <td className="p-2">{student.firstName} {student.lastName}</td>
                                    <td className="p-2"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${submissionStatusColors[status]}`}>{status}</span></td>
                                    <td className="p-2"><input type="number" className="w-20 rounded-md disabled:bg-gray-100" value={currentEval.marks ?? submission?.marks ?? ''} onChange={e => submission && handleEvalChange(submission.id, 'marks', parseInt(e.target.value))} disabled={!submission}/></td>
                                    <td className="p-2"><input type="text" className="w-full rounded-md disabled:bg-gray-100" value={currentEval.remarks ?? submission?.remarks ?? ''} onChange={e => submission && handleEvalChange(submission.id, 'remarks', e.target.value)} disabled={!submission} /></td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </Modal>
    );
};


const AddHomework: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    const { user } = useAuth();
    
    const [activeTab, setActiveTab] = useState<Tab>('list');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
    const [evaluationTarget, setEvaluationTarget] = useState<Homework | null>(null);
    const [formState, setFormState] = useState({classroomId: '', subjectId: '', title: '', description: '', assignDate: new Date().toISOString().split('T')[0], dueDate: ''});
    
    const canManage = can('update', 'homework', { kind: 'site', id: siteId! });

    const { data: homeworks, isLoading, isError, error } = useQuery<Homework[], Error>({ queryKey: ['homework', siteId], queryFn: () => homeworkApi.get(siteId!), enabled: canManage });
    const { data: classrooms = [] } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!), enabled: canManage });
    const { data: subjects = [] } = useQuery<Subject[], Error>({ queryKey: ['subjects', siteId], queryFn: () => getSubjects(siteId!), enabled: canManage });

    const classroomMap = useMemo(() => new Map(classrooms.map(c => [c.id, c.name])), [classrooms]);
    const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);

    const addMutation = useMutation({
        mutationFn: (newHomework: Omit<Homework, 'id'|'siteId'>) => addHomework(newHomework),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['homework', siteId] }); alert('Homework added!'); setActiveTab('list'); },
        onError: (err: Error) => alert(`Error: ${err.message}`),
    });

    if (!canManage) {
        return <ErrorState title="Access Denied" message="You do not have permission to manage homework." />;
    }

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormState(prev => ({...prev, [e.target.name]: e.target.value}));
    };
    
    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addMutation.mutate({ ...formState, createdBy: user!.id });
    };

    return (
        <div>
            <PageHeader title="Homework" subtitle="Assign and evaluate homework for your classes." />

            <div className="border-b mb-6"><nav className="-mb-px flex space-x-6">
                <button onClick={() => setActiveTab('list')} className={`${activeTab === 'list' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} py-3 px-1 border-b-2 font-medium text-sm`}>Homework List</button>
                <button onClick={() => setActiveTab('add')} className={`${activeTab === 'add' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} py-3 px-1 border-b-2 font-medium text-sm`}>Add Homework</button>
            </nav></div>

            {activeTab === 'list' && (
                <Card><CardContent>
                    {isLoading && <Spinner/>}
                    {isError && <ErrorState title="Error" message={error.message}/>}
                    {!isLoading && !isError && (
                        <table className="min-w-full divide-y">
                            <thead><tr>
                                <th className="p-2 text-left">Assign Date</th><th className="p-2 text-left">Due Date</th>
                                <th className="p-2 text-left">Class</th><th className="p-2 text-left">Subject</th>
                                <th className="p-2 text-left">Title</th><th className="p-2 text-right">Actions</th>
                            </tr></thead>
                            <tbody>
                            {homeworks?.map(hw => (
                                <tr key={hw.id}>
                                    <td className="p-2">{hw.assignDate}</td><td className="p-2">{hw.dueDate}</td>
                                    <td className="p-2">{classroomMap.get(hw.classroomId)}</td><td className="p-2">{subjectMap.get(hw.subjectId)}</td>
                                    <td className="p-2 font-semibold">{hw.title}</td>
                                    <td className="p-2 text-right space-x-2"><Button size="sm" onClick={() => setEvaluationTarget(hw)}>Evaluate</Button></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </CardContent></Card>
            )}

            {activeTab === 'add' && (
                <Card><form onSubmit={handleAddSubmit}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label>Class <span className="text-red-500">*</span></label><select name="classroomId" value={formState.classroomId} onChange={handleFormChange} required className="w-full rounded-md"><option value="">Select</option>{classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                            <div><label>Subject <span className="text-red-500">*</span></label><select name="subjectId" value={formState.subjectId} onChange={handleFormChange} required className="w-full rounded-md"><option value="">Select</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                            <div><label>Assign Date <span className="text-red-500">*</span></label><input type="date" name="assignDate" value={formState.assignDate} onChange={handleFormChange} required className="w-full rounded-md"/></div>
                            <div><label>Due Date <span className="text-red-500">*</span></label><input type="date" name="dueDate" value={formState.dueDate} onChange={handleFormChange} required className="w-full rounded-md"/></div>
                        </div>
                        <div><label>Title <span className="text-red-500">*</span></label><input name="title" value={formState.title} onChange={handleFormChange} required className="w-full rounded-md"/></div>
                        <div><label>Description</label><textarea name="description" value={formState.description} onChange={handleFormChange} rows={4} className="w-full rounded-md"/></div>
                        <div><label>Attachment</label><input type="file" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/></div>
                    </CardContent>
                    <CardFooter className="text-right"><Button type="submit" isLoading={addMutation.isPending}>Save Homework</Button></CardFooter>
                </form></Card>
            )}

            {evaluationTarget && <EvaluationModal homework={evaluationTarget} onClose={() => setEvaluationTarget(null)} />}
        </div>
    );
};

export default AddHomework;