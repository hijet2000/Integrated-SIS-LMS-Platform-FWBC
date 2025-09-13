import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
// FIX: Import useAuth to get the current user's information for issuing certificates.
import { useAuth } from '@/constants/useAuth';
import { idCardTemplateApi, issuedCertificateApi, getStudentsByClassroom, getClassrooms } from '@/services/sisApi';
import type { IdCardTemplate, IssuedCertificate, Student, Classroom } from '@/types';

// --- ID Card Preview Component (for print modal) ---
const IdCard: React.FC<{ 
    template: IdCardTemplate, 
    student: Student,
    classroomName: string,
    serialId: string;
}> = ({ template, student, classroomName, serialId }) => {
    const verificationUrl = `${window.location.origin}/verify/${serialId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(verificationUrl)}`;
    
    return (
        <div 
            className="w-full max-w-xs aspect-[54/86] p-2 rounded-lg shadow-md flex flex-col text-xs relative overflow-hidden bg-white text-black print:shadow-none print:border"
            style={{ backgroundColor: template.backgroundColor, color: template.textColor }}
        >
            <div className="flex items-center space-x-2 border-b pb-1 border-current/20">
                {template.logoUrl && <img src={template.logoUrl} alt="Logo" className="h-8 w-8 object-contain"/>}
                <div>
                    <h3 className="font-bold text-xs">FAITH-EDU Institutions</h3>
                    <p className="opacity-80 text-[10px]">Student ID Card</p>
                </div>
            </div>
            
            <div className="flex-grow flex flex-col items-center justify-center text-center mt-2">
                {template.showPhoto && (
                    <div className="w-20 h-20 border-2 border-current/30 bg-black/10 rounded-md mb-2 flex items-center justify-center text-current/50 overflow-hidden">
                       {student.photoUrl ? <img src={student.photoUrl} alt="student" className="w-full h-full object-cover"/> : 'Photo'}
                    </div>
                )}
                <h4 className="font-bold text-base">{student.firstName} {student.lastName}</h4>
                <p>Class: {classroomName}</p>
                <p>Admission No: {student.admissionNo}</p>
            </div>

            <div className="flex justify-between items-end mt-2">
                {template.showQRCode && <div className="w-16 h-16 bg-white p-1 rounded-sm"><img src={qrCodeUrl} alt="QR Code"/></div>}
                <div className="text-right">
                     {template.showValidity && <p className="text-[10px] mt-1">Valid Till: 2025-06-30</p>}
                </div>
            </div>
        </div>
    );
};

const StudentIdCard: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    // FIX: Get the current user to add issuer details to the certificate.
    const { user } = useAuth();

    const [filters, setFilters] = useState({ classroomId: '', templateId: '' });
    const [generatedCards, setGeneratedCards] = useState<IssuedCertificate[]>([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const canCreate = can('create', 'certificate.id-cards', { kind: 'site', id: siteId! });

    const { data: templates = [] } = useQuery<IdCardTemplate[], Error>({ queryKey: ['idCardTemplates', siteId], queryFn: () => idCardTemplateApi.get(siteId!) });
    const { data: classrooms = [] } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!) });
    const { data: students = [], isLoading: isLoadingStudents } = useQuery<Student[], Error>({ 
        queryKey: ['studentsByClass', filters.classroomId], 
        queryFn: () => getStudentsByClassroom(filters.classroomId), 
        enabled: !!filters.classroomId 
    });
    
    const issueMutation = useMutation<IssuedCertificate[], Error, Omit<IssuedCertificate, 'id'|'siteId'>[]>({
        mutationFn: (data) => Promise.all(data.map(d => issuedCertificateApi.add(d))),
        onSuccess: (newCerts) => {
            queryClient.invalidateQueries({ queryKey: ['issuedCertificates', siteId] });
            setGeneratedCards(newCerts);
            setIsPreviewOpen(true);
        },
        onError: (err) => alert(`Failed to issue cards: ${err.message}`),
    });

    const selectedTemplate = useMemo(() => templates.find(t => t.id === filters.templateId), [templates, filters.templateId]);
    const classroomMap = useMemo(() => new Map(classrooms.map(c => [c.id, c.name])), [classrooms]);
    
    const handleGenerate = () => {
        if (!selectedTemplate || students.length === 0 || !user) return;
        
        const cardsToIssue: Omit<IssuedCertificate, 'id'|'siteId'>[] = students.map(student => ({
            serialId: `ID-${Date.now()}-${student.id.slice(-4)}`,
            templateId: selectedTemplate.id,
            issuedToId: student.id,
            issueDate: new Date().toISOString().split('T')[0],
            status: 'Valid',
            recipientName: `${student.firstName} ${student.lastName}`,
            // FIX: Added missing issuedById and issuedByName properties from the authenticated user.
            issuedById: user.id,
            issuedByName: user.name,
        }));
        
        issueMutation.mutate(cardsToIssue);
    };
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
             <style>{`@media print { body * { visibility: hidden; } #print-section, #print-section * { visibility: visible; } #print-section { position: absolute; left: 0; top: 0; right: 0; } .printable-card { page-break-inside: avoid; } }`}</style>
            <PageHeader title="Generate Student ID Card" />
             <Card>
                <CardHeader><h3 className="font-semibold">Select Criteria</h3></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Classroom</label>
                        <select value={filters.classroomId} onChange={e => setFilters(f => ({...f, classroomId: e.target.value}))} className="mt-1 w-full rounded-md">
                            <option value="">-- Select Class --</option>
                            {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">ID Card Template</label>
                        <select value={filters.templateId} onChange={e => setFilters(f => ({...f, templateId: e.target.value}))} className="mt-1 w-full rounded-md">
                            <option value="">-- Select Template --</option>
                            {templates.filter(t => t.type === 'Student').map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div className="self-end">
                        <Button onClick={handleGenerate} disabled={!filters.classroomId || !filters.templateId || isLoadingStudents || !canCreate} isLoading={issueMutation.isPending}>
                            Generate for {students.length} Students
                        </Button>
                    </div>
                </CardContent>
            </Card>

             <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title={`Generated ID Cards (${generatedCards.length})`}
                footer={<><Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>Close</Button><Button onClick={handlePrint} className="ml-2">Print</Button></>}>
                <div id="print-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto bg-gray-200 dark:bg-gray-900 p-4">
                    {selectedTemplate && generatedCards.map(card => {
                        const student = students.find(s => s.id === card.issuedToId);
                        if (!student) return null;
                        const classroomName = classroomMap.get(student.classroomId) || 'N/A';
                        return (
                            <div key={card.id} className="printable-card">
                                <IdCard template={selectedTemplate} student={student} classroomName={classroomName} serialId={card.serialId} />
                            </div>
                        )
                    })}
                </div>
            </Modal>
        </div>
    );
};

export default StudentIdCard;