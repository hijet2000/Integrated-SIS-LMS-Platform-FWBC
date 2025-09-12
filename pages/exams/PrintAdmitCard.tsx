
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
import { 
    getExamGroups, 
    getClassrooms, 
    admitCardTemplateApi, 
    getStudentsByClassroom,
    getExamSchedules
} from '@/services/sisApi';
// FIX: Corrected import path for domain types from '@/constants' to '@/types' to resolve module resolution errors.
import type { AdmitCardTemplate, ExamGroup, Classroom, Student, ExamSchedule, Guardian, StudentGuardian } from '@/types';

// --- Admit Card Preview Component (for print modal) ---
const AdmitCard: React.FC<{ 
    template: AdmitCardTemplate, 
    student: Student, 
    examGroup: ExamGroup,
    classroomName: string,
    schedule: ExamSchedule[]
}> = ({ template, student, examGroup, classroomName, schedule }) => (
    <div className="border-2 border-gray-300 p-4 rounded-lg bg-white w-full aspect-[2/3] max-w-sm mx-auto shadow-lg text-black print:shadow-none print:border-black">
        <div className="text-center border-b-2 pb-2">
            <h2 className="text-xl font-bold">Your School Name</h2>
            <p className="text-sm">Admit Card - {examGroup.name}</p>
        </div>
        <div className="flex mt-4 space-x-4">
            {template.settings.showPhoto && (
                 <div className="w-24 h-24 border bg-gray-200 flex items-center justify-center text-sm text-gray-500">
                    {student.photoUrl ? <img src={student.photoUrl} alt="student" className="w-full h-full object-cover"/> : 'Photo'}
                </div>
            )}
            <div className="text-sm space-y-1">
                <p><strong>Name:</strong> {student.firstName} {student.lastName}</p>
                <p><strong>Roll No:</strong> {student.rollNo}</p>
                <p><strong>Class:</strong> {classroomName}</p>
            </div>
        </div>
         {template.settings.showTimetable && (
            <div className="mt-4">
                <h4 className="font-bold text-sm">Exam Schedule</h4>
                <table className="w-full text-xs mt-1 border-collapse border">
                    <thead><tr><th className="border p-1">Subject</th><th className="border p-1">Date</th><th className="border p-1">Time</th></tr></thead>
                    <tbody>
                        {schedule.slice(0, 3).map(s => <tr key={s.id}><td className="border p-1">[Subject]</td><td className="border p-1">{s.examDate}</td><td className="border p-1">{s.startTime}</td></tr>)}
                    </tbody>
                </table>
            </div>
        )}
        <div className="mt-auto pt-4 text-xs">
            <h4 className="font-bold">Instructions</h4>
            <p className="whitespace-pre-wrap">{template.settings.instructions || 'Follow all exam rules.'}</p>
        </div>
    </div>
);


// --- Main Page Component ---
const PrintAdmitCard: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();

    const [filters, setFilters] = useState({ examGroupId: '', classroomId: '', templateId: '' });
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const canRead = can('read', 'exams.admit-card', { kind: 'site', id: siteId! });
    
    // Data Queries
    const { data: templates = [], isLoading: l1 } = useQuery<AdmitCardTemplate[], Error>({ queryKey: ['admitCardTemplates', siteId], queryFn: () => admitCardTemplateApi.get(siteId!), enabled: canRead });
    const { data: examGroups = [], isLoading: l2 } = useQuery<ExamGroup[], Error>({ queryKey: ['examGroups', siteId], queryFn: () => getExamGroups(siteId!), enabled: canRead });
    const { data: classrooms = [], isLoading: l3 } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!), enabled: canRead });
    const { data: schedules = [] } = useQuery<ExamSchedule[], Error>({ queryKey: ['examSchedules', siteId], queryFn: () => getExamSchedules(siteId!), enabled: canRead });
    
    const { data: students = [], isLoading: l4 } = useQuery<Student[], Error>({ 
        queryKey: ['studentsByClass', filters.classroomId], 
        queryFn: () => getStudentsByClassroom(filters.classroomId), 
        enabled: canRead && !!filters.classroomId 
    });
    
    // Memoized data
    const selectedTemplate = useMemo(() => templates.find(t => t.id === filters.templateId), [templates, filters.templateId]);
    const selectedExamGroup = useMemo(() => examGroups.find(t => t.id === filters.examGroupId), [examGroups, filters.examGroupId]);
    const classroomMap = useMemo(() => new Map(classrooms.map(c => [c.id, c.name])), [classrooms]);

    const handleGenerate = () => {
        if (selectedStudentIds.length === 0) {
            alert('Please select at least one student.');
            return;
        }
        setIsPreviewOpen(true);
    };

    const handlePrint = () => {
        window.print();
    };
    
    if (!canRead) return <ErrorState title="Access Denied" message="You do not have permission to print admit cards." />;
    const isLoading = l1 || l2 || l3 || l4;

    return (
        <div>
            <style>{`@media print { body * { visibility: hidden; } #print-section, #print-section * { visibility: visible; } #print-section { position: absolute; left: 0; top: 0; right: 0; } }`}</style>

            <PageHeader title="Print Admit Card" subtitle="Generate and print admit cards for students." />
            
            <Card className="mb-6">
                <CardHeader><h3 className="font-semibold">Select Criteria</h3></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className="block text-sm font-medium">Exam Group</label><select value={filters.examGroupId} onChange={e => setFilters(f => ({...f, examGroupId: e.target.value}))} className="mt-1 w-full rounded-md"><option value="">Select Group</option>{examGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
                    <div><label className="block text-sm font-medium">Classroom</label><select value={filters.classroomId} onChange={e => setFilters(f => ({...f, classroomId: e.target.value}))} className="mt-1 w-full rounded-md"><option value="">Select Class</option>{classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                    <div><label className="block text-sm font-medium">Template</label><select value={filters.templateId} onChange={e => setFilters(f => ({...f, templateId: e.target.value}))} className="mt-1 w-full rounded-md"><option value="">Select Template</option>{templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex justify-between items-center">
                    <h3 className="font-semibold">Select Students ({selectedStudentIds.length} selected)</h3>
                    <Button onClick={handleGenerate} disabled={!selectedTemplate || selectedStudentIds.length === 0}>Generate & Preview</Button>
                </CardHeader>
                <CardContent>
                     {isLoading && filters.classroomId && <div className="flex justify-center p-8"><Spinner /></div>}
                     {!filters.classroomId ? (
                        <EmptyState title="Select a Class" message="Please select a classroom to see the list of students." />
                     ) : students.length > 0 ? (
                        <div className="overflow-x-auto max-h-96">
                            <table className="min-w-full divide-y">
                                <thead><tr>
                                    <th className="p-2"><input type="checkbox" onChange={e => setSelectedStudentIds(e.target.checked ? students.map(s => s.id) : [])} /></th>
                                    <th className="p-2 text-left">Student</th><th className="p-2 text-left">Admission No</th>
                                </tr></thead>
                                <tbody>
                                    {students.map(s => (
                                        <tr key={s.id}>
                                            <td className="p-2"><input type="checkbox" checked={selectedStudentIds.includes(s.id)} onChange={() => setSelectedStudentIds(p => p.includes(s.id) ? p.filter(id => id !== s.id) : [...p, s.id])} /></td>
                                            <td className="p-2">{s.firstName} {s.lastName}</td>
                                            <td className="p-2">{s.admissionNo}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     ) : (
                         <EmptyState title="No Students Found" message="The selected class has no students." />
                     )}
                </CardContent>
            </Card>
            
            <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Print Preview"
                footer={<><Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>Close</Button><Button onClick={handlePrint} className="ml-2">Print</Button></>}>
                <div id="print-section" className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto bg-gray-200 dark:bg-gray-900 p-4">
                    {selectedTemplate && selectedExamGroup && students.filter(s => selectedStudentIds.includes(s.id)).map(student => (
                        <AdmitCard 
                            key={student.id} 
                            template={selectedTemplate} 
                            student={student} 
                            examGroup={selectedExamGroup}
                            classroomName={classroomMap.get(student.classroomId) || ''}
                            schedule={schedules.filter(s => s.examGroupId === filters.examGroupId && s.classroomId === filters.classroomId)}
                        />
                    ))}
                </div>
            </Modal>
        </div>
    );
};

export default PrintAdmitCard;
