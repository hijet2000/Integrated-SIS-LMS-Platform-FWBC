
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
import { questionApi, getSubjects, getClassrooms } from '@/services/sisApi';
// FIX: Corrected import path for domain types from '@/constants' to '@/types' to resolve module resolution errors.
import type { Question, QuestionType, Difficulty, Subject, Classroom } from '@/types';

const QUESTION_TYPES: QuestionType[] = ['MCQ', 'True/False', 'Short Answer', 'Long Answer'];
const DIFFICULTY_LEVELS: Difficulty[] = ['Easy', 'Medium', 'Hard'];

// --- Form Component ---
const QuestionForm: React.FC<{
  question?: Question | null;
  onSave: (question: Omit<Question, 'id' | 'siteId'> | Question) => void;
  onCancel: () => void;
  isSaving: boolean;
  subjects: Subject[];
  classrooms: Classroom[];
}> = ({ question, onSave, onCancel, subjects, classrooms }) => {
  const [formState, setFormState] = useState({
    question: question?.question ?? '',
    type: question?.type ?? 'MCQ',
    subjectId: question?.subjectId ?? '',
    classroomId: question?.classroomId ?? '',
    options: question?.options ?? ['', '', '', ''],
    correctAnswers: question?.correctAnswers ?? [],
    marks: question?.marks ?? 1,
    difficulty: question?.difficulty ?? 'Medium',
  });

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formState.options];
    newOptions[index] = value;
    setFormState(prev => ({ ...prev, options: newOptions }));
  };
  
  const handleCorrectAnswerChange = (index: number) => {
    const newAnswers = formState.correctAnswers.includes(index)
      ? formState.correctAnswers.filter(i => i !== index)
      : [...formState.correctAnswers, index];
    setFormState(prev => ({ ...prev, correctAnswers: newAnswers }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(question ? { ...question, ...formState } : formState as Omit<Question, 'id' | 'siteId'>);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        <div><label className="block text-sm font-medium">Question <span className="text-red-500">*</span></label><textarea name="question" value={formState.question} onChange={e => setFormState(p => ({...p, question: e.target.value}))} required rows={3} className="mt-1 w-full rounded-md"/></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium">Question Type</label><select name="type" value={formState.type} onChange={e => setFormState(p => ({...p, type: e.target.value as QuestionType, options: ['', '', '', ''], correctAnswers: [] }))} className="mt-1 w-full rounded-md">{QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className="block text-sm font-medium">Difficulty</label><select name="difficulty" value={formState.difficulty} onChange={e => setFormState(p => ({...p, difficulty: e.target.value as Difficulty}))} className="mt-1 w-full rounded-md">{DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            <div><label className="block text-sm font-medium">Class</label><select name="classroomId" value={formState.classroomId} onChange={e => setFormState(p => ({...p, classroomId: e.target.value}))} className="mt-1 w-full rounded-md"><option value="">All Classes</option>{classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium">Subject</label><select name="subjectId" value={formState.subjectId} onChange={e => setFormState(p => ({...p, subjectId: e.target.value}))} className="mt-1 w-full rounded-md"><option value="">Select Subject</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium">Marks</label><input type="number" name="marks" value={formState.marks} onChange={e => setFormState(p => ({...p, marks: parseInt(e.target.value)}))} min="1" className="mt-1 w-full rounded-md"/></div>
        </div>
        {formState.type === 'MCQ' && (
            <div>
                <label className="block text-sm font-medium">Options</label>
                {formState.options.map((option, index) => (
                    <div key={index} className="flex items-center mt-1">
                        <input type="checkbox" checked={formState.correctAnswers.includes(index)} onChange={() => handleCorrectAnswerChange(index)} className="mr-2"/>
                        <input type="text" value={option} onChange={e => handleOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`} className="w-full rounded-md"/>
                    </div>
                ))}
            </div>
        )}
         {formState.type === 'True/False' && (
            <div>
                <label className="block text-sm font-medium">Correct Answer</label>
                <div className="flex gap-4 mt-1">
                    <label><input type="radio" name="tf" checked={formState.correctAnswers[0] === 0} onChange={() => setFormState(p => ({...p, correctAnswers: [0]}))} /> True</label>
                    <label><input type="radio" name="tf" checked={formState.correctAnswers[0] === 1} onChange={() => setFormState(p => ({...p, correctAnswers: [1]}))} /> False</label>
                </div>
            </div>
        )}
        <div className="hidden"><button type="submit"/></div>
    </form>
  );
};

// --- Main Component ---
const QuestionBank: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [filters, setFilters] = useState({ subjectId: 'all', classroomId: 'all' });

    // FIX: Corrected useCan call to use a single scope string.
    const canManage = can('school:write');

    const { data: questions, isLoading, isError, error } = useQuery<Question[], Error>({ queryKey: ['questions', siteId], queryFn: () => questionApi.get(siteId!) });
    const { data: subjects = [] } = useQuery<Subject[], Error>({ queryKey: ['subjects', siteId], queryFn: () => getSubjects(siteId!) });
    const { data: classrooms = [] } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!) });

    const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);
    const classroomMap = useMemo(() => new Map(classrooms.map(c => [c.id, c.name])), [classrooms]);

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questions', siteId] });
            setIsModalOpen(false);
        },
        onError: (err: Error) => alert(`Operation failed: ${err.message}`),
    };
    const addMutation = useMutation({ mutationFn: (q: Omit<Question, 'id'|'siteId'>) => questionApi.add(q), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (q: Question) => questionApi.update(q.id, q), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => questionApi.delete(id), ...mutationOptions });

    const handleSave = (q: Omit<Question, 'id'|'siteId'> | Question) => {
        'id' in q ? updateMutation.mutate(q) : addMutation.mutate(q);
    };

    const filteredQuestions = useMemo(() => {
        return questions?.filter(q => 
            (filters.subjectId === 'all' || q.subjectId === filters.subjectId) &&
            (filters.classroomId === 'all' || q.classroomId === filters.classroomId)
        ) || [];
    }, [questions, filters]);

    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState title="Error" message={error.message} />;

    return (
        <div>
            <PageHeader title="Question Bank" actions={canManage && <Button onClick={() => { setSelectedQuestion(null); setIsModalOpen(true); }}>Add Question</Button>} />
            <Card className="mb-6">
                <CardHeader><h3 className="font-semibold">Filter Questions</h3></CardHeader>
                <CardContent className="flex gap-4">
                     <div><label className="block text-sm font-medium">Class</label><select value={filters.classroomId} onChange={e => setFilters(f => ({...f, classroomId: e.target.value}))} className="mt-1 rounded-md"><option value="all">All</option>{classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                     <div><label className="block text-sm font-medium">Subject</label><select value={filters.subjectId} onChange={e => setFilters(f => ({...f, subjectId: e.target.value}))} className="mt-1 rounded-md"><option value="all">All</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    {filteredQuestions.length > 0 ? (
                        <div className="space-y-3">
                            {filteredQuestions.map(q => (
                                <div key={q.id} className="p-4 border rounded-md">
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold flex-grow mr-4">{q.question}</p>
                                        {canManage && <div className="space-x-2 flex-shrink-0">
                                            <Button size="sm" variant="secondary" onClick={() => { setSelectedQuestion(q); setIsModalOpen(true); }}>Edit</Button>
                                            <Button size="sm" variant="danger" onClick={() => window.confirm('Are you sure?') && deleteMutation.mutate(q.id)}>Delete</Button>
                                        </div>}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2 flex gap-4"><span>Type: {q.type}</span><span>Subject: {subjectMap.get(q.subjectId)}</span><span>Class: {classroomMap.get(q.classroomId) || 'All'}</span><span>Marks: {q.marks}</span></div>
                                </div>
                            ))}
                        </div>
                    ) : <EmptyState title="No Questions Found" message="Add a question to get started." />}
                </CardContent>
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedQuestion ? 'Edit Question' : 'Add Question'}
                footer={<><Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} className="ml-2">Save</Button></>}>
                <QuestionForm question={selectedQuestion} onSave={handleSave} onCancel={() => setIsModalOpen(false)} isSaving={false} subjects={subjects} classrooms={classrooms} />
            </Modal>
        </div>
    );
};

export default QuestionBank;
