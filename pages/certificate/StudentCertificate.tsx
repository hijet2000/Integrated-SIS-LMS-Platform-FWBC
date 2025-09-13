import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { useCan } from '@/hooks/useCan';
import { useAuth } from '@/constants/useAuth';
import { certificateTemplateApi, issuedCertificateApi, getStudents, getClassrooms } from '@/services/sisApi';
import type { CertificateTemplate, IssuedCertificate, Student, Classroom } from '@/types';

// --- Certificate Preview Component ---
const CertificatePreview: React.FC<{
  template: CertificateTemplate;
  student: Student;
  classroomName: string;
  issuedCertificate?: IssuedCertificate;
}> = ({ template, student, classroomName, issuedCertificate }) => {
  const verificationUrl = issuedCertificate
    ? `${window.location.origin}/verify/${issuedCertificate.serialId}`
    : 'Verification link will be generated upon issuance.';
    
  const qrCodeUrl = issuedCertificate
    ? `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(verificationUrl)}`
    : 'https://via.placeholder.com/100';

  const bodyText = template.body
    .replace('{{name}}', `${student.firstName} ${student.lastName}`)
    .replace('{{class}}', classroomName); 

  return (
    <div className="border-2 border-gray-400 p-8 rounded-lg bg-white w-full aspect-[297/210] max-w-4xl mx-auto shadow-lg text-black print:shadow-none print:border-black flex flex-col font-serif">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">FAITH-EDU Institutions</h1>
        <h2 className="text-2xl mt-4 underline">{template.name}</h2>
      </div>
      <div className="flex-grow text-lg leading-relaxed">
        <p className="whitespace-pre-wrap">{bodyText}</p>
      </div>
      <div className="flex justify-between items-end mt-12 text-sm">
        <div>
          <p>Date: {issuedCertificate ? new Date(issuedCertificate.issueDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
          <p>Serial No: {issuedCertificate?.serialId || 'N/A'}</p>
          <p>Issued By: {issuedCertificate?.issuedByName || 'N/A'}</p>
        </div>
        <div className="flex items-center space-x-4">
          <img src={qrCodeUrl} alt="Verification QR Code" className="w-24 h-24" />
          <div className="text-center">
            <p className="border-t-2 border-dotted border-gray-500 pt-2 w-48">[Principal's Signature]</p>
            <p className="font-bold">Principal</p>
          </div>
        </div>
      </div>
    </div>
  );
};


const StudentCertificate: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    const { user } = useAuth();

    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [generatedCertificate, setGeneratedCertificate] = useState<IssuedCertificate | null>(null);

    const canIssue = can('create', 'certificate.issue', { kind: 'site', id: siteId! });

    const { data: templates = [] } = useQuery<CertificateTemplate[], Error>({ queryKey: ['certificateTemplates', siteId], queryFn: () => certificateTemplateApi.get(siteId!) });
    const { data: students = [] } = useQuery<Student[], Error>({ queryKey: ['students', siteId], queryFn: () => getStudents(siteId!) });
    const { data: classrooms = [] } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!) });
    
    const classroomMap = useMemo(() => new Map(classrooms.map(c => [c.id, c.name])), [classrooms]);

    const issueMutation = useMutation<IssuedCertificate, Error, Omit<IssuedCertificate, 'id'|'siteId'>>({
        mutationFn: (data) => issuedCertificateApi.add(data),
        onSuccess: (newCert) => {
            queryClient.invalidateQueries({ queryKey: ['issuedCertificates', siteId] });
            setGeneratedCertificate(newCert);
            alert('Certificate issued successfully!');
        },
        onError: (err) => alert(`Failed to issue certificate: ${err.message}`),
    });

    const selectedTemplate = useMemo(() => templates.find(t => t.id === selectedTemplateId), [templates, selectedTemplateId]);
    const selectedStudent = useMemo(() => students.find(s => s.id === selectedStudentId), [students, selectedStudentId]);

    const handleGenerate = () => {
        if (!selectedTemplate || !selectedStudent || !user) return;
        
        const studentTemplates = templates.filter(t => t.recipientType === 'Student');
        if (!studentTemplates.some(t => t.id === selectedTemplateId)) {
            alert('This template is not for students.');
            return;
        }

        const newCertData: Omit<IssuedCertificate, 'id'|'siteId'> = {
            serialId: `CERT-${Date.now()}`,
            templateId: selectedTemplate.id,
            issuedToId: selectedStudent.id,
            issueDate: new Date().toISOString().split('T')[0],
            status: 'Valid',
            recipientName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
            issuedById: user.id,
            issuedByName: user.name,
        };
        issueMutation.mutate(newCertData);
    };

    return (
        <div>
            <PageHeader title="Generate Student Certificate" />

            <Card className="mb-6">
                <CardHeader><h3 className="font-semibold">Select Criteria</h3></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Certificate Template</label>
                        <select value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)} className="mt-1 w-full rounded-md">
                            <option value="">-- Select Template --</option>
                            {templates.filter(t => t.recipientType === 'Student').map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Student</label>
                        <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className="mt-1 w-full rounded-md">
                            <option value="">-- Select Student --</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNo})</option>)}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {selectedTemplate && selectedStudent && (
                 <Card>
                    <CardHeader className="flex justify-between items-center">
                        <h3 className="font-semibold">Preview</h3>
                         <Button onClick={handleGenerate} disabled={!canIssue || issueMutation.isPending} isLoading={issueMutation.isPending}>
                            {generatedCertificate ? 'Re-generate' : 'Generate & Issue'}
                         </Button>
                    </CardHeader>
                    <CardContent className="bg-gray-100 dark:bg-gray-900 p-8">
                        <CertificatePreview 
                            template={selectedTemplate} 
                            student={selectedStudent} 
                            classroomName={classroomMap.get(selectedStudent.classroomId) || 'N/A'}
                            issuedCertificate={generatedCertificate ?? undefined} 
                        />
                    </CardContent>
                 </Card>
            )}
        </div>
    );
};

export default StudentCertificate;