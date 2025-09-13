
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
import { 
    getExamGroups, 
    getClassrooms, 
    marksheetTemplateApi, 
    getStudentsByClassroom,
    getExamSchedules,
    getMarks,
    getSubjects,
} from '@/services/sisApi';
import type { MarksheetTemplate, ExamGroup, Classroom, Student, ExamSchedule, Mark, Subject } from '@/types';

// Simple hardcoded grading logic
const calculateGrade = (marks: number, maxMarks: number, minMarks: number): { grade: string; status: 'Pass' | 'Fail' } => {
    // FIX: Corrected a reference error by changing 'score' to 'marks' to match the function parameter.
    if (marks < minMarks) return { grade: 'F', status: 'Fail' };
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 90) return { grade: 'A+', status: 'Pass' };
    if (percentage >= 80) return { grade: 'A', status: 'Pass' };
    if (percentage >= 70) return { grade: 'B', status: 'Pass' };
    if (percentage >= 60) return { grade: 'C', status: 'Pass' };
    if (percentage >= 50) return { grade: 'D', status: 'Pass' };
    return { grade: 'E', status: 'Pass' };
};

// --- Marksheet Render Component (for print modal) ---
const Marksheet: React.FC<{ 
    template: MarksheetTemplate, 
    student: Student, 
    examGroup: ExamGroup,
    classroomName: string,
    marksData: { subjectName: string; marksObtained: number; maxMarks: number; grade: string }[],
    summary: { totalMarks: number; totalMaxMarks: number; percentage: number; status: string }
}> = ({ template, student, examGroup, classroomName, marksData, summary }) => (
    <div className="border-2 border-gray-400 p-4 rounded-lg bg-white w-full aspect-[210/297] max-w-2xl mx-auto shadow-lg text-black print:shadow-none print:border-black flex flex-col text-xs">
        <div className="text-center border-b-2 pb-2">
            <h2 className="text-lg font-bold">Your School Name</h2>
            <p className="text-sm">Report Card - {examGroup.name}</p>
        </div>
        <div className="flex mt-2 space-x-2">
            {template.settings.showPhoto && (
                 <div className="w-20 h-20 border bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    {student.photoUrl ? <img src={student.photoUrl} alt="student" className="w-full h-full object-cover"/> : 'Photo'}
                </div>
            )}
            <div className="text-xs space-y-0.5 grid grid-cols-2 gap-x-4">
                <p><strong>Name:</strong> {student.firstName} {student.lastName}</p>
                <p><strong>Roll No:</strong> {student.rollNo}</p>
                <p><strong>Class:</strong> {classroomName}</p>
                {template.settings.showAttendance && <p><strong>Attendance:</strong> 95.8%</p>}
            </div>
        </div>
        <div className="mt-2">
            <table className="w-full text-xs mt-1 border-collapse border">
                <thead><tr>
                    <th className="border p-1">Subject</th>
                    <th className="border p-1">Max Marks</th>
                    <th className="border p-1">Marks Obtained</th>
                    {template.settings.showGradePoint && <th className="border p-1">Grade</th>}
                </tr></thead>
                <tbody>
                    {marksData.map(m => (
                        <tr key={m.subjectName}>
                            <td className="border p-1">{m.subjectName}</td>
                            <td className="border p-1 text-center">{m.maxMarks}</td>
                            <td className="border p-1 text-center">{m.marksObtained}</td>
                            {template.settings.showGradePoint && <td className="border p-1 text-center font-bold">{m.grade}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="mt-2 text-xs text-center font-bold border-t pt-1">
            <p>Total: {summary.totalMarks} / {summary.totalMaxMarks} | Percentage: {summary.percentage.toFixed(2)}% | Result: <span className={summary.status === 'Pass' ? 'text-green-700' : 'text-red-700'}>{summary.status}</span></p>
            {template.settings.showRank && <p>Rank: 3 / 45</p>}
        </div>
        {template.settings.teacherRemarks && (
             <div className="mt-2 text-xs">
                <h4 className="font-bold">Teacher's Remarks:</h4>
                <p className="border-b h-6">Excellent performance. Keep it up.</p>
            </div>
        )}
        <div className="flex justify-between items-end mt-auto pt-2 text-xs">
             <p className="border-t w-28 text-center pt-1">Class Teacher</p>
             {template.settings.principalSignature && <p className="border-t w-28 text-center pt-1">Principal</p>}
        </div>
    </div>
);

// --- Main Page Component ---
const PrintMarksheet: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();

    const [filters, setFilters] = useState({ examGroupId: '', classroomId: '', templateId: '' });
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const canRead = can('read', 'exams.marksheet', { kind: 'site', id: siteId! });
    
    // Data Queries
    const { data: templates = [] } = useQuery<MarksheetTemplate[], Error>({ queryKey: ['marksheetTemplates', siteId], queryFn: () => marksheetTemplateApi.get(siteId!), enabled: canRead });
    const { data: examGroups = [] } = useQuery<ExamGroup[], Error>({ queryKey: ['examGroups', siteId], queryFn: () => getExamGroups(siteId!), enabled: canRead });
    const { data: classrooms = [] } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!), enabled: canRead });
    const { data: subjects = [] } = useQuery<Subject[], Error>({ queryKey: ['subjects', siteId], queryFn: () => getSubjects(siteId!), enabled: canRead });
    const { data: schedules = [] } = useQuery<ExamSchedule[], Error>({ queryKey: ['examSchedules', siteId], queryFn: () => getExamSchedules(siteId!), enabled: canRead });
    const { data: students = [] } = useQuery<Student[], Error>({ queryKey: ['studentsByClass', filters.classroomId], queryFn: () => getStudentsByClassroom(filters.classroomId), enabled: canRead && !!filters.classroomId });
    
    const relevantSchedules = useMemo(() => schedules.filter(s => s.examGroupId === filters.examGroupId && s.classroomId === filters.classroomId), [schedules, filters]);
    const { data: allMarks = [] } = useQuery<Mark[], Error>({
        queryKey: ['marksForSchedules', relevantSchedules.map(s => s.id)],
        queryFn: () => Promise.all(relevantSchedules.map(s => getMarks(siteId!, s.id))).then(results => results.flat()),
        enabled: relevantSchedules.length > 0,
    });

    // Memoized data
    const selectedTemplate = useMemo(() => templates.find(t => t.id === filters.templateId), [templates, filters.templateId]);
    const selectedExamGroup = useMemo(() => examGroups.find(t => t.id === filters.examGroupId), [examGroups, filters.examGroupId]);
    const classroomMap = useMemo(() => new Map(classrooms.map(c => [c.id, c.name])), [classrooms]);
    const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);
    
    const studentMarksData = useMemo(() => {
        const data = new Map<string, { marksData: any[], summary: any }>();
        students.forEach(student => {
            let totalMarks = 0, totalMaxMarks = 0, failedSubjects = 0;
            const marksData = relevantSchedules.map(schedule => {
                const mark = allMarks.find(m => m.studentId === student.id && m.examScheduleId === schedule.id);
                const marksObtained = mark?.marksObtained ?? 0;
                totalMarks += marksObtained;
                totalMaxMarks += schedule.maxMarks;
                if (marksObtained < schedule.minMarks) failedSubjects++;
                return {
                    subjectName: subjectMap.get(schedule.subjectId) || 'Unknown',
                    marksObtained,
                    maxMarks: schedule.maxMarks,
                    grade: calculateGrade(marksObtained, schedule.maxMarks, schedule.minMarks).grade,
                };
            });
            const percentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;
            const summary = { totalMarks, totalMaxMarks, percentage, status: failedSubjects > 0 ? 'Fail' : 'Pass' };
            data.set(student.id, { marksData, summary });
        });
        return data;
    }, [students, allMarks, relevantSchedules, subjectMap]);
    
    const handleGenerate = () => {
        if (selectedStudentIds.length === 0) { alert('Please select at least one student.'); return; }
        setIsPreviewOpen(true);
    };

    const handlePrint = () => { window.print(); };
    
    if (!canRead) return <ErrorState title="Access Denied" message="You do not have permission to print marksheets." />;

    return (
        <div>
            <style>{`@media print { body * { visibility: hidden; } #print-section, #print-section * { visibility: visible; } #print-section { position: absolute; left: 0; top: 0; right: 0; } .printable-marksheet { page-break-inside: avoid; } }`}</style>

            <PageHeader title="Print Marksheet" subtitle="Generate and print student report cards." />
            
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
                <div id="print-section" className="grid grid-cols-1 gap-4 max-h-[70vh] overflow-y-auto bg-gray-200 dark:bg-gray-900 p-4">
                    {selectedTemplate && selectedExamGroup && students.filter(s => selectedStudentIds.includes(s.id)).map(student => {
                        const data = studentMarksData.get(student.id);
                        if (!data) return null;
                        return (
                            <div key={student.id} className="printable-marksheet">
                                <Marksheet 
                                    template={selectedTemplate} 
                                    student={student} 
                                    examGroup={selectedExamGroup}
                                    classroomName={classroomMap.get(student.classroomId) || ''}
                                    marksData={data.marksData}
                                    summary={data.summary}
                                />
                            </div>
                        )
                    })}
                </div>
            </Modal>
        </div>
    );
};

export default PrintMarksheet;
