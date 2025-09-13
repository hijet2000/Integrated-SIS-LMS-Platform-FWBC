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

const STEPS = [
    { id: 1, name: 'Personal Details' },
    { id: 2, name: 'Guardian Information' },
    { id: 3, name: 'Academic Details' },
    { id: 4, name: 'Upload Documents' },
];

const initialFormData = {
    // Student
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    bloodGroup: '',
    category: 'General',
    nationality: 'American',
    email: '',
    // FIX: Add missing 'phone' property to satisfy the Student type.
    phone: '',
    address: { street: '', city: '', state: '', zip: '' },
    photoUrl: null as string | null,

    // Academic
    admissionNo: '',
    rollNo: '',
    classroomId: '',
    admissionDate: new Date().toISOString().split('T')[0],

    // Guardians
    father: { name: '', occupation: '', phone: '', email: '', preferredComms: 'email' as 'email' | 'phone' },
    mother: { name: '', occupation: '', phone: '', email: '', preferredComms: 'phone' as 'email' | 'phone' },
};

const StudentAdmission: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const can = useCan();

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);
    const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);

    const enquiryToImport = location.state?.fromEnquiry as AdmissionEnquiry | undefined;
    const applicationToConvert = location.state?.fromApplication as OnlineAdmissionApplication | undefined;

    const canCreate = can('create', 'student.admission', { kind: 'site', id: siteId! });

    const { data: classrooms = [] } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!) });
    const { data: enquiries = [] } = useQuery<AdmissionEnquiry[], Error>({ queryKey: ['admissionEnquiries', siteId], queryFn: () => getAdmissionEnquiries(siteId!) });
    
    useEffect(() => {
        if (enquiryToImport) {
            const [firstName, ...lastNameParts] = enquiryToImport.name.split(' ');
            const lastName = lastNameParts.join(' ');
            
            setFormData(prev => ({
                ...prev,
                firstName: firstName || '',
                lastName: lastName || '',
                email: enquiryToImport.email || '',
                father: { ...prev.father, phone: enquiryToImport.phone },
                classroomId: classrooms.find(c => c.name === enquiryToImport.classSought)?.id || ''
            }));
        }
        if (applicationToConvert) {
            const guardianDetails = {
                name: applicationToConvert.guardianName,
                phone: applicationToConvert.guardianPhone,
                email: applicationToConvert.guardianEmail,
                preferredComms: 'email' as 'email' | 'phone'
            };
            
            setFormData(prev => ({
                ...initialFormData,
                firstName: applicationToConvert.applicantFirstName,
                lastName: applicationToConvert.applicantLastName,
                dob: applicationToConvert.applicantDob,
                gender: applicationToConvert.applicantGender,
                classroomId: classrooms.find(c => c.name === applicationToConvert.classSought)?.id || '',
                // Assign to father or mother based on relation, default to father
                father: applicationToConvert.guardianRelation === 'Father' ? { ...prev.father, ...guardianDetails } : prev.father,
                mother: applicationToConvert.guardianRelation === 'Mother' ? { ...prev.mother, ...guardianDetails } : prev.mother,
            }));
        }
    }, [enquiryToImport, applicationToConvert, classrooms]);

    const admissionMutation = useMutation<Student, Error, { student: Omit<Student, 'id'|'siteId'>, father: Partial<Guardian>, mother: Partial<Guardian> }>({
        mutationFn: (data: { student: Omit<Student, 'id'|'siteId'>, father: Partial<Guardian>, mother: Partial<Guardian> }) => addStudentAdmission(data),
        onSuccess: (newStudent) => {
            alert('Student admitted successfully!');
            queryClient.invalidateQueries({ queryKey: ['students', siteId] });
            navigate(`/school/${siteId}/students/${newStudent.id}`);
        },
        onError: (error: Error) => {
            alert(`Admission failed: ${error.message}`);
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const keys = name.split('.');

        if (keys.length > 1) {
            setFormData(prev => ({
                ...prev,
                [keys[0]]: {
                    // @ts-ignore
                    ...prev[keys[0]],
                    [keys[1]]: value,
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
     const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleImportFromEnquiry = (enquiry: AdmissionEnquiry) => {
        navigate(location.pathname, { state: { fromEnquiry: enquiry }, replace: true });
        setIsEnquiryModalOpen(false);
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { father, mother, ...studentData } = formData;
        admissionMutation.mutate({ 
            student: {
                ...studentData,
                status: 'ENROLLED',
                health: { allergies: '', medications: '', conditions: '', notes: '' },
                discipline: [],
            }, 
            father, 
            mother 
        });
    };

    if (!canCreate) {
        return <ErrorState title="Access Denied" message="You do not have permission to admit new students." />;
    }
    
    return (
        <div>
            <PageHeader title="Student Admission" subtitle="Add a new student to the system." />
            
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <nav aria-label="Progress">
                            <ol role="list" className="flex items-center">
                                {STEPS.map((step, stepIdx) => (
                                    <li key={step.name} className={`relative ${stepIdx !== STEPS.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className={`h-0.5 w-full ${step.id < currentStep ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                                        </div>
                                        <button onClick={() => setCurrentStep(step.id)} className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-indigo-600">
                                            <span className="text-indigo-600">{step.id}</span>
                                        </button>
                                        <span className="text-sm font-semibold mt-2 block">{step.name}</span>
                                    </li>
                                ))}
                            </ol>
                        </nav>
                        <Button variant="secondary" onClick={() => setIsEnquiryModalOpen(true)}>Import from Enquiry</Button>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="min-h-[400px]">
                        {/* Step 1: Personal Details */}
                        {currentStep === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div><label className="block text-sm font-medium">First Name <span className="text-red-500">*</span></label><input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="mt-1 w-full rounded-md"/></div>
                                <div><label className="block text-sm font-medium">Last Name <span className="text-red-500">*</span></label><input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="mt-1 w-full rounded-md"/></div>
                                <div><label className="block text-sm font-medium">Date of Birth <span className="text-red-500">*</span></label><input type="date" name="dob" value={formData.dob} onChange={handleInputChange} required className="mt-1 w-full rounded-md"/></div>
                                <div><label className="block text-sm font-medium">Gender</label><select name="gender" value={formData.gender} onChange={handleInputChange} className="mt-1 w-full rounded-md"><option>Male</option><option>Female</option><option>Other</option></select></div>
                                <div><label className="block text-sm font-medium">Blood Group</label><input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="mt-1 w-full rounded-md"/></div>
                                <div><label className="block text-sm font-medium">Nationality</label><input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} className="mt-1 w-full rounded-md"/></div>
                                <div><label className="block text-sm font-medium">Student Email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 w-full rounded-md"/></div>
                                {/* IMPROVEMENT: Add input for student phone number. */}
                                <div><label className="block text-sm font-medium">Student Phone</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 w-full rounded-md"/></div>
                            </div>
                        )}
                        {/* Step 2: Guardian Information */}
                        {currentStep === 2 && (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4 p-4 border rounded-md">
                                    <h4 className="font-semibold text-lg">Father's Details</h4>
                                    <div><label className="block text-sm font-medium">Name <span className="text-red-500">*</span></label><input type="text" name="father.name" value={formData.father.name} onChange={handleInputChange} required className="mt-1 w-full rounded-md"/></div>
                                    <div><label className="block text-sm font-medium">Phone</label><input type="tel" name="father.phone" value={formData.father.phone} onChange={handleInputChange} className="mt-1 w-full rounded-md"/></div>
                                    <div><label className="block text-sm font-medium">Email</label><input type="email" name="father.email" value={formData.father.email} onChange={handleInputChange} className="mt-1 w-full rounded-md"/></div>
                                    <div><label className="block text-sm font-medium">Occupation</label><input type="text" name="father.occupation" value={formData.father.occupation} onChange={handleInputChange} className="mt-1 w-full rounded-md"/></div>
                                    <div><label className="block text-sm font-medium">Preferred Contact</label><select name="father.preferredComms" value={formData.father.preferredComms} onChange={handleInputChange} className="mt-1 w-full rounded-md"><option value="email">Email</option><option value="phone">Phone</option></select></div>
                                </div>
                                <div className="space-y-4 p-4 border rounded-md">
                                     <h4 className="font-semibold text-lg">Mother's Details</h4>
                                    <div><label className="block text-sm font-medium">Name</label><input type="text" name="mother.name" value={formData.mother.name} onChange={handleInputChange} className="mt-1 w-full rounded-md"/></div>
                                    <div><label className="block text-sm font-medium">Phone</label><input type="tel" name="mother.phone" value={formData.mother.phone} onChange={handleInputChange} className="mt-1 w-full rounded-md"/></div>
                                    <div><label className="block text-sm font-medium">Email</label><input type="email" name="mother.email" value={formData.mother.email} onChange={handleInputChange} className="mt-1 w-full rounded-md"/></div>
                                    <div><label className="block text-sm font-medium">Occupation</label><input type="text" name="mother.occupation" value={formData.mother.occupation} onChange={handleInputChange} className="mt-1 w-full rounded-md"/></div>
                                    <div><label className="block text-sm font-medium">Preferred Contact</label><select name="mother.preferredComms" value={formData.mother.preferredComms} onChange={handleInputChange} className="mt-1 w-full rounded-md"><option value="email">Email</option><option value="phone">Phone</option></select></div>
                                </div>
                            </div>
                        )}
                         {/* Step 3: Academic Details */}
                        {currentStep === 3 && (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div><label className="block text-sm font-medium">Admission No <span className="text-red-500">*</span></label><input type="text" name="admissionNo" value={formData.admissionNo} onChange={handleInputChange} required className="mt-1 w-full rounded-md"/></div>
                                <div><label className="block text-sm font-medium">Roll No</label><input type="text" name="rollNo" value={formData.rollNo} onChange={handleInputChange} className="mt-1 w-full rounded-md"/></div>
                                <div><label className="block text-sm font-medium">Class <span className="text-red-500">*</span></label><select name="classroomId" value={formData.classroomId} onChange={handleInputChange} required className="mt-1 w-full rounded-md"><option value="">Select Class</option>{classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                                <div><label className="block text-sm font-medium">Admission Date</label><input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleInputChange} className="mt-1 w-full rounded-md"/></div>
                            </div>
                        )}
                        {/* Step 4: Documents */}
                        {currentStep === 4 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                        {formData.photoUrl ? <img src={formData.photoUrl} alt="Student" className="w-full h-full object-cover" /> : <span className="text-gray-400">Photo</span>}
                                    </div>
                                    <div><label className="block text-sm font-medium">Student Photo</label><input type="file" accept="image/*" onChange={handlePhotoChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/></div>
                                </div>
                                <div><label className="block text-sm font-medium">Birth Certificate</label><input type="file" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/></div>
                                <div><label className="block text-sm font-medium">Previous School Certificate</label><input type="file" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/></div>
                            </div>
                        )}

                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button type="button" variant="secondary" onClick={prevStep} disabled={currentStep === 1}>Previous</Button>
                        {currentStep < STEPS.length && <Button type="button" onClick={nextStep}>Next</Button>}
                        {currentStep === STEPS.length && <Button type="submit" isLoading={admissionMutation.isPending}>Admit Student</Button>}
                    </CardFooter>
                </form>
            </Card>

            <Modal isOpen={isEnquiryModalOpen} onClose={() => setIsEnquiryModalOpen(false)} title="Import from Admission Enquiry">
                <div className="max-h-[50vh] overflow-y-auto">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {enquiries.filter(e => e.status === 'ACTIVE' || e.status === 'WON').map(enquiry => (
                        <li key={enquiry.id} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md">
                            <button onClick={() => handleImportFromEnquiry(enquiry)} className="w-full text-left flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{enquiry.name}</p>
                                    <p className="text-sm text-gray-500">{enquiry.phone} | Seeking: {enquiry.classSought}</p>
                                </div>
                                <span className="text-indigo-600 font-semibold text-sm">Import &rarr;</span>
                            </button>
                        </li>
                    ))}
                    </ul>
                </div>
            </Modal>
        </div>
    );
};

export default StudentAdmission;