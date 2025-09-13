
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
import { getAdmissionEnquiries, getClassrooms, addStudentAdmission } from '@/services/sisApi';
import type { Classroom, AdmissionEnquiry, OnlineAdmissionApplication, Student, Guardian } from '@/types';

// FIX: Added a default export to resolve the module loading error in App.tsx.
const StudentAdmission: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const can = useCan();

    const [activeTab, setActiveTab] = useState('new'); // 'new' or 'import'
    const [formState, setFormState] = useState({
        student: {
            firstName: '', lastName: '', admissionNo: '', rollNo: '', dob: '', gender: 'Male', email: '', phone: '',
            address: { street: '', city: '', state: '', zip: '' }, classroomId: '',
        },
        father: { name: '', phone: '', occupation: '' },
        mother: { name: '', phone: '', occupation: '' },
        guardian: { isFather: true, name: '', phone: '', occupation: '' },
    });

    // Pre-fill form from online admission application if available
    useEffect(() => {
        const application: OnlineAdmissionApplication | undefined = location.state?.fromApplication;
        if (application) {
            setFormState(prev => ({
                ...prev,
                student: {
                    ...prev.student,
                    firstName: application.applicantFirstName,
                    lastName: application.applicantLastName,
                    dob: application.applicantDob,
                    gender: application.applicantGender,
                    classroomId: classrooms.find(c => c.name === application.classSought)?.id || '',
                },
                guardian: {
                    ...prev.guardian,
                    name: application.guardianName,
                    phone: application.guardianPhone,
                    isFather: application.guardianRelation.toLowerCase() === 'father',
                }
            }));
        }
    }, [location.state]);


    const canCreate = can('create', 'student.admission', { kind: 'site', id: siteId! });

    const { data: classrooms = [], isLoading: isLoadingClassrooms } = useQuery<Classroom[], Error>({
        queryKey: ['classrooms', siteId],
        queryFn: () => getClassrooms(siteId!),
    });
    
    const admissionMutation = useMutation({
        mutationFn: (data: any) => addStudentAdmission(data),
        onSuccess: (newStudent) => {
            queryClient.invalidateQueries({ queryKey: ['students', siteId] });
            alert('Student admitted successfully!');
            navigate(`/school/${siteId}/students/${newStudent.id}`);
        },
        onError: (err: Error) => alert(`Admission failed: ${err.message}`),
    });

    const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(p => ({ ...p, student: { ...p.student, [name]: value } }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        admissionMutation.mutate(formState);
    };

    if (!canCreate) {
        return <ErrorState title="Access Denied" message="You do not have permission to admit new students." />;
    }

    return (
        <div>
            <PageHeader title="Student Admission" subtitle="Enroll a new student into the school."/>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader><h3 className="font-semibold text-lg">Student Details</h3></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                             <div><label>First Name *</label><input name="firstName" value={formState.student.firstName} onChange={handleStudentChange} required className="w-full rounded-md"/></div>
                             <div><label>Last Name *</label><input name="lastName" value={formState.student.lastName} onChange={handleStudentChange} required className="w-full rounded-md"/></div>
                             <div><label>Gender *</label><select name="gender" value={formState.student.gender} onChange={handleStudentChange} required className="w-full rounded-md"><option>Male</option><option>Female</option><option>Other</option></select></div>
                             <div><label>Date of Birth *</label><input type="date" name="dob" value={formState.student.dob} onChange={handleStudentChange} required className="w-full rounded-md"/></div>
                             <div><label>Admission No *</label><input name="admissionNo" value={formState.student.admissionNo} onChange={handleStudentChange} required className="w-full rounded-md"/></div>
                             <div><label>Roll No</label><input name="rollNo" value={formState.student.rollNo} onChange={handleStudentChange} className="w-full rounded-md"/></div>
                             <div><label>Class *</label><select name="classroomId" value={formState.student.classroomId} onChange={handleStudentChange} required className="w-full rounded-md"><option value="">Select Class</option>{classrooms.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                        </div>
                    </CardContent>
                </Card>
                
                 <Card className="mt-6">
                    <CardHeader><h3 className="font-semibold text-lg">Contact & Guardian Information</h3></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label>Student Email</label><input type="email" name="email" value={formState.student.email} onChange={handleStudentChange} className="w-full rounded-md"/></div>
                            <div><label>Student Phone</label><input type="tel" name="phone" value={formState.student.phone} onChange={handleStudentChange} className="w-full rounded-md"/></div>
                            <div><label>Father's Name</label><input name="name" value={formState.father.name} onChange={e => setFormState(p=>({...p, father: {...p.father, name: e.target.value}}))} className="w-full rounded-md"/></div>
                            <div><label>Father's Phone</label><input type="tel" name="phone" value={formState.father.phone} onChange={e => setFormState(p=>({...p, father: {...p.father, phone: e.target.value}}))} className="w-full rounded-md"/></div>
                            <div><label>Mother's Name</label><input name="name" value={formState.mother.name} onChange={e => setFormState(p=>({...p, mother: {...p.mother, name: e.target.value}}))} className="w-full rounded-md"/></div>
                            <div><label>Mother's Phone</label><input type="tel" name="phone" value={formState.mother.phone} onChange={e => setFormState(p=>({...p, mother: {...p.mother, phone: e.target.value}}))} className="w-full rounded-md"/></div>
                        </div>
                    </CardContent>
                    <CardFooter className="text-right">
                        <Button type="submit" isLoading={admissionMutation.isPending}>Admit Student</Button>
                    </CardFooter>
                 </Card>
            </form>
        </div>
    );
};

export default StudentAdmission;
