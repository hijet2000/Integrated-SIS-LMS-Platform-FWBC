import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
    getStudentById, 
    getGradesForStudent, 
    getInvoicesForStudent,
    getGuardiansForStudent,
    updateStudentHealthInfo,
    addDisciplineRecord,
    updateDisciplineRecord,
    deleteDisciplineRecord,
    updateStudent,
    getAttendanceForStudent,
} from '@/services/sisApi';
import type { Student, Grade, FeeInvoice, Guardian, StudentGuardian, HealthInfo, DisciplineRecord, StudentStatus, Attendance } from '@/types';
import { useCan } from '@/hooks/useCan';
import { useAuth } from '@/hooks/useAuth';

const statusColors: { [key: string]: string } = {
    ENROLLED: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    TRANSFERRED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    GRADUATED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    ARCHIVED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const feeStatusColors: { [key: string]: string } = {
    DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    ISSUED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    PAID: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

type Tab = 'overview' | 'guardians' | 'health' | 'discipline' | 'grades' | 'fees' | 'attendance';

// --- TAB COMPONENTS ---

const GuardiansTab: React.FC<{ studentId: string }> = ({ studentId }) => {
    const { data, isLoading } = useQuery<{ guardian: Guardian, relation: StudentGuardian }[], Error>({
        queryKey: ['guardians', studentId],
        queryFn: () => getGuardiansForStudent(studentId),
    });
    if (isLoading) return <div className="flex justify-center p-4"><Spinner /></div>;
    return (
        <div className="space-y-4">
            {data?.map(({ guardian, relation }) => (
                <div key={guardian.id} className="p-3 border dark:border-gray-700 rounded-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold">{guardian.name} {relation.isPrimary && <span className="text-xs font-bold text-indigo-600">(Primary)</span>}</p>
                            <p className="text-sm text-gray-500">{relation.relation}</p>
                        </div>
                        <div className="text-right text-sm">
                            <p>{guardian.email}</p>
                            <p>{guardian.phone}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const HealthTab: React.FC<{ student: Student, canUpdate: boolean }> = ({ student, canUpdate }) => {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [healthInfo, setHealthInfo] = useState<HealthInfo>(student.health);

    const mutation = useMutation({
        mutationFn: (newHealthInfo: HealthInfo) => updateStudentHealthInfo(student.id, newHealthInfo),
        onSuccess: (updatedStudent) => {
            queryClient.setQueryData(['student', student.id], updatedStudent);
            setIsEditing(false);
        },
        onError: () => alert('Failed to save health info.')
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setHealthInfo({ ...healthInfo, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        mutation.mutate(healthInfo);
    };

    return (
        <div>
            {isEditing ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Allergies</label>
                        <textarea name="allergies" value={healthInfo.allergies} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Medications</label>
                        <textarea name="medications" value={healthInfo.medications} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Conditions</label>
                        <textarea name="conditions" value={healthInfo.conditions} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">General Notes</label>
                        <textarea name="notes" value={healthInfo.notes} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleSave} isLoading={mutation.isPending}>Save</Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3 text-sm">
                    <p><strong>Allergies:</strong> {student.health.allergies || 'N/A'}</p>
                    <p><strong>Medications:</strong> {student.health.medications || 'N/A'}</p>
                    <p><strong>Conditions:</strong> {student.health.conditions || 'N/A'}</p>
                    <p><strong>Notes:</strong> {student.health.notes || 'N/A'}</p>
                    {canUpdate && <div className="pt-2"><Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>Edit</Button></div>}
                </div>
            )}
        </div>
    );
};

const DisciplineTab: React.FC<{ student: Student, canUpdate: boolean, canDelete: boolean }> = ({ student, canUpdate, canDelete }) => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
    const [editedRecord, setEditedRecord] = useState<Partial<DisciplineRecord>>({});
    const [newRecord, setNewRecord] = useState({ date: new Date().toISOString().split('T')[0], incident: '', actionTaken: '' });

    const addMutation = useMutation({
        // FIX: Corrected logical error by explicitly passing properties to addDisciplineRecord.
        mutationFn: (record: Omit<DisciplineRecord, 'id' | 'reportedBy'>) => addDisciplineRecord(student.id, { ...record, reportedBy: user!.id }),
        onSuccess: (updatedStudent) => {
            queryClient.setQueryData(['student', student.id], updatedStudent);
            setShowForm(false);
            setNewRecord({ date: new Date().toISOString().split('T')[0], incident: '', actionTaken: '' });
        },
        onError: () => alert('Failed to add record.')
    });

    const updateMutation = useMutation({
        mutationFn: (record: Partial<DisciplineRecord>) => updateDisciplineRecord(student.id, record.id!, { incident: record.incident, actionTaken: record.actionTaken }),
        onSuccess: (updatedStudent) => {
            queryClient.setQueryData(['student', student.id], updatedStudent);
            setEditingRecordId(null);
        },
        onError: () => alert('Failed to update record.')
    });

    const deleteMutation = useMutation({
        mutationFn: (recordId: string) => deleteDisciplineRecord(student.id, recordId),
        onSuccess: (updatedStudent) => {
            queryClient.setQueryData(['student', student.id], updatedStudent);
        },
        onError: () => alert('Failed to delete record.')
    });

    const handleEditClick = (record: DisciplineRecord) => {
        setEditingRecordId(record.id);
        setEditedRecord(record);
    };

    const handleDeleteClick = (recordId: string) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            deleteMutation.mutate(recordId);
        }
    };

    return (
        <div className="space-y-4">
            {student.discipline.map(record => (
                editingRecordId === record.id ? (
                    <div key={record.id} className="p-3 border dark:border-gray-700 rounded-md space-y-3">
                         <textarea placeholder="Incident description" value={editedRecord.incident} onChange={e => setEditedRecord({...editedRecord, incident: e.target.value})} rows={2} className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/>
                        <textarea placeholder="Action taken" value={editedRecord.actionTaken} onChange={e => setEditedRecord({...editedRecord, actionTaken: e.target.value})} rows={2} className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/>
                        <div className="flex justify-end space-x-2">
                             <Button variant="secondary" size="sm" onClick={() => setEditingRecordId(null)}>Cancel</Button>
                             <Button size="sm" onClick={() => updateMutation.mutate(editedRecord)} isLoading={updateMutation.isPending}>Save</Button>
                        </div>
                    </div>
                ) : (
                    <div key={record.id} className="p-3 border dark:border-gray-700 rounded-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold">{record.incident}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{record.actionTaken}</p>
                                <p className="text-xs text-gray-400 mt-1">Date: {new Date(record.date + 'T00:00:00').toLocaleDateString()}</p>
                            </div>
                            <div className="flex space-x-2 flex-shrink-0 ml-2">
                                {canUpdate && <Button variant="secondary" size="sm" onClick={() => handleEditClick(record)}>Edit</Button>}
                                {canDelete && <Button variant="danger" size="sm" onClick={() => handleDeleteClick(record.id)} isLoading={deleteMutation.isPending && deleteMutation.variables === record.id}>Delete</Button>}
                            </div>
                        </div>
                    </div>
                )
            ))}
            {student.discipline.length === 0 && !showForm && <p className="text-gray-500">No disciplinary records found.</p>}

            {canUpdate && (
                showForm ? (
                    <div className="p-3 border dark:border-gray-700 rounded-md space-y-3">
                        <input type="date" value={newRecord.date} onChange={e => setNewRecord({...newRecord, date: e.target.value})} className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/>
                        <textarea placeholder="Incident description" value={newRecord.incident} onChange={e => setNewRecord({...newRecord, incident: e.target.value})} rows={2} className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/>
                        <textarea placeholder="Action taken" value={newRecord.actionTaken} onChange={e => setNewRecord({...newRecord, actionTaken: e.target.value})} rows={2} className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/>
                        <div className="flex justify-end space-x-2">
                             <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                             <Button onClick={() => addMutation.mutate(newRecord)} isLoading={addMutation.isPending}>Add Record</Button>
                        </div>
                    </div>
                ) : (
                    <Button size="sm" variant="secondary" onClick={() => setShowForm(true)}>Add Record</Button>
                )
            )}
        </div>
    );
};

const GradesTab: React.FC<{ studentId: string }> = ({ studentId }) => {
    const { data: grades, isLoading, isError } = useQuery<Grade[], Error>({
        queryKey: ['grades', studentId],
        queryFn: () => getGradesForStudent(studentId),
    });
    if (isLoading) return <div className="flex justify-center p-4"><Spinner /></div>;
    if (isError) return <p className="text-red-500">Failed to load grades.</p>;
    if (!grades || grades.length === 0) return <p className="text-gray-500">No grades recorded.</p>;
    
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Grade</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {grades?.map(g => (
                        <tr key={g.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{g.subjectName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{g.itemName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{g.score}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{g.gradeLetter}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const FeesTab: React.FC<{ studentId: string }> = ({ studentId }) => {
    const { data: invoices, isLoading, isError } = useQuery<FeeInvoice[], Error>({
        queryKey: ['invoices', studentId],
        queryFn: () => getInvoicesForStudent(studentId),
    });
    if (isLoading) return <div className="flex justify-center p-4"><Spinner /></div>;
    if (isError) return <p className="text-red-500">Failed to load fee information.</p>;
    if (!invoices || invoices.length === 0) return <p className="text-gray-500">No fee invoices found.</p>;

    return (
        <div className="space-y-3">
            {invoices?.map(i => (
                <div key={i.id} className="p-3 border dark:border-gray-700 rounded-md flex justify-between items-center">
                    <div>
                        <p className="font-semibold">{i.term} - ${i.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Due: {new Date(i.dueDate + 'T00:00:00').toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${feeStatusColors[i.status]}`}>{i.status}</span>
                </div>
            ))}
        </div>
    );
};

const AttendanceTab: React.FC<{ studentId: string }> = ({ studentId }) => {
    const { data: attendance, isLoading } = useQuery<Attendance[], Error>({
        queryKey: ['studentAttendance', studentId],
        queryFn: () => getAttendanceForStudent(studentId),
    });

    const stats = useMemo(() => {
        if (!attendance) return { present: 0, absent: 0, late: 0, excused: 0, total: 0, percentage: 0 };
        const counts = { present: 0, absent: 0, late: 0, excused: 0 };
        attendance.forEach(rec => {
            if (rec.status === 'PRESENT') counts.present++;
            if (rec.status === 'ABSENT') counts.absent++;
            if (rec.status === 'LATE') counts.late++;
            if (rec.status === 'EXCUSED') counts.excused++;
        });
        const total = attendance.length;
        const attended = counts.present + counts.late + counts.excused;
        const percentage = total > 0 ? (attended / total) * 100 : 100;
        return { ...counts, total, percentage };
    }, [attendance]);

    const recentAbsences = useMemo(() => {
        return attendance?.filter(r => r.status === 'ABSENT').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5) || [];
    }, [attendance]);
    
    if (isLoading) return <div className="flex justify-center p-4"><Spinner /></div>;
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                <Card><CardContent>
                    <p className="text-2xl font-bold">{stats.percentage.toFixed(1)}%</p>
                    <p className="text-sm text-gray-500">Overall Attendance</p>
                </CardContent></Card>
                 <Card><CardContent>
                    <p className="text-2xl font-bold">{stats.present}</p>
                    <p className="text-sm text-gray-500">Present</p>
                </CardContent></Card>
                 <Card><CardContent>
                    <p className="text-2xl font-bold text-red-500">{stats.absent}</p>
                    <p className="text-sm text-gray-500">Absent</p>
                </CardContent></Card>
                <Card><CardContent>
                    <p className="text-2xl font-bold text-yellow-500">{stats.late}</p>
                    <p className="text-sm text-gray-500">Late</p>
                </CardContent></Card>
                <Card><CardContent>
                    <p className="text-2xl font-bold text-blue-500">{stats.excused}</p>
                    <p className="text-sm text-gray-500">Excused</p>
                </CardContent></Card>
                 <Card><CardContent>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-gray-500">Total Days Recorded</p>
                </CardContent></Card>
            </div>
            <div>
                <h4 className="font-semibold mb-2">Recent Absences</h4>
                {recentAbsences.length > 0 ? (
                    <ul className="space-y-2">
                        {recentAbsences.map(rec => (
                             <li key={rec.id} className="text-sm p-2 border dark:border-gray-700 rounded-md">
                                {new Date(rec.date + 'T00:00:00').toLocaleDateString()} - Reason: {rec.reason || 'Not provided'}
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-sm text-gray-500">No absences recorded recently.</p>}
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---

const StudentProfile: React.FC = () => {
    const { siteId, studentId } = useParams<{ siteId: string, studentId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [isEditing, setIsEditing] = useState(false);

    const { data: student, isLoading, isError, error, refetch } = useQuery<Student | undefined, Error>({
        queryKey: ['student', studentId],
        queryFn: () => getStudentById(studentId!),
        enabled: !!studentId,
    });
    
    const [editFormState, setEditFormState] = useState<Partial<Student>>({});

    const updateMutation = useMutation<Student, Error, Partial<Student>>({
        mutationFn: (updates: Partial<Student>) => updateStudent(studentId!, updates),
        onSuccess: (updatedStudent) => {
            queryClient.setQueryData(['student', studentId], updatedStudent);
            queryClient.invalidateQueries({ queryKey: ['students', siteId] });
            setIsEditing(false);
        },
        onError: (err: Error) => alert(`Failed to update profile: ${err.message}`)
    });

    const handleEditClick = () => {
        if (student) {
            setEditFormState(student);
            setIsEditing(true);
        }
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setEditFormState({});
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setEditFormState(prev => ({
                ...prev,
                address: { ...prev.address!, [addressField]: value }
            }));
        } else {
            setEditFormState(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditFormState(prev => ({ ...prev, photoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSave = () => {
        updateMutation.mutate(editFormState);
    };

    const canUpdate = can('update', 'school.students', { kind: 'site', id: siteId! });
    const canDelete = can('delete', 'school.students', { kind: 'site', id: siteId! });

    if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
    if (isError) return <ErrorState title="Failed to load student" message={error.message} onRetry={refetch} />;
    if (!student) return <ErrorState title="Student not found" message="This student does not exist." />;

    const photoSrc = isEditing ? editFormState.photoUrl : student.photoUrl;

    return (
        <div>
            <div className="mb-4">
                <Link to={`/school/${siteId}/students`} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">&larr; Back to Students</Link>
            </div>
            <PageHeader
                title={`${student.firstName} ${student.lastName}`}
                subtitle={
                    !isEditing && <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[student.status]}`}>
                        {student.status}
                    </span>
                }
                actions={canUpdate && !isEditing && <Button onClick={handleEditClick}>Edit Profile</Button>}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader><h3 className="font-semibold">Student Details</h3></CardHeader>
                        <CardContent>
                             <div className="flex flex-col items-center">
                                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 mb-4 flex items-center justify-center overflow-hidden">
                                    {photoSrc ? (
                                        <img src={photoSrc} alt="Student" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-400 text-4xl">{student.firstName[0]}{student.lastName[0]}</span>
                                    )}
                                </div>
                                {isEditing && (
                                    <div className="mb-4">
                                        <label htmlFor="photo-upload" className="cursor-pointer text-sm text-indigo-600 hover:underline">Change Photo</label>
                                        <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                    </div>
                                )}
                            </div>
                            {isEditing ? (
                                <div className="space-y-4 text-sm">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="font-medium block mb-1">First Name</label><input type="text" name="firstName" value={editFormState.firstName || ''} onChange={handleFormChange} className="w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
                                        <div><label className="font-medium block mb-1">Last Name</label><input type="text" name="lastName" value={editFormState.lastName || ''} onChange={handleFormChange} className="w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
                                    </div>
                                    <div><label className="font-medium block mb-1">Email</label><input type="email" name="email" value={editFormState.email || ''} onChange={handleFormChange} className="w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="font-medium block mb-1">Date of Birth</label><input type="date" name="dob" value={editFormState.dob || ''} onChange={handleFormChange} className="w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"/></div>
                                        <div><label className="font-medium block mb-1">Status</label><select name="status" value={editFormState.status} onChange={handleFormChange} className="w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600"><option>ENROLLED</option><option>TRANSFERRED</option><option>GRADUATED</option><option>ARCHIVED</option></select></div>
                                    </div>
                                    <div><label className="font-medium block mb-1">Address</label><input type="text" name="address.street" value={editFormState.address?.street || ''} onChange={handleFormChange} className="w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600" placeholder="Street"/></div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <input type="text" name="address.city" value={editFormState.address?.city || ''} onChange={handleFormChange} className="w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600" placeholder="City"/>
                                        <input type="text" name="address.state" value={editFormState.address?.state || ''} onChange={handleFormChange} className="w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600" placeholder="State"/>
                                        <input type="text" name="address.zip" value={editFormState.address?.zip || ''} onChange={handleFormChange} className="w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600" placeholder="Zip"/>
                                    </div>
                                    <div className="flex justify-end space-x-2 pt-2">
                                        <Button variant="secondary" onClick={handleCancelClick}>Cancel</Button>
                                        <Button onClick={handleSave} isLoading={updateMutation.isPending}>Save Changes</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 text-sm text-center">
                                    <p><strong>Email:</strong> {student.email || 'N/A'}</p>
                                    <p><strong>Date of Birth:</strong> {new Date(student.dob + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <p><strong>Address:</strong> {`${student.address.street}, ${student.address.city}, ${student.address.state} ${student.address.zip}`}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2">
                     <Card>
                        <div className="border-b border-gray-200 dark:border-gray-700">
                             <div className="overflow-x-auto">
                                <nav className="flex space-x-4 px-4">
                                    <button onClick={() => setActiveTab('overview')} className={`shrink-0 -mb-px py-3 px-1 text-sm font-medium ${activeTab === 'overview' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Overview</button>
                                    <button onClick={() => setActiveTab('attendance')} className={`shrink-0 -mb-px py-3 px-1 text-sm font-medium ${activeTab === 'attendance' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Attendance</button>
                                    <button onClick={() => setActiveTab('guardians')} className={`shrink-0 -mb-px py-3 px-1 text-sm font-medium ${activeTab === 'guardians' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Guardians</button>
                                    <button onClick={() => setActiveTab('health')} className={`shrink-0 -mb-px py-3 px-1 text-sm font-medium ${activeTab === 'health' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Health</button>
                                    <button onClick={() => setActiveTab('discipline')} className={`shrink-0 -mb-px py-3 px-1 text-sm font-medium ${activeTab === 'discipline' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Discipline</button>
                                    <button onClick={() => setActiveTab('grades')} className={`shrink-0 -mb-px py-3 px-1 text-sm font-medium ${activeTab === 'grades' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Grades</button>
                                    <button onClick={() => setActiveTab('fees')} className={`shrink-0 -mb-px py-3 px-1 text-sm font-medium ${activeTab === 'fees' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Fees</button>
                                </nav>
                            </div>
                        </div>
                        <CardContent>
                            {activeTab === 'overview' && <div><p className="text-gray-500">Class information and other overview details would be displayed here.</p></div>}
                            {activeTab === 'attendance' && <AttendanceTab studentId={student.id} />}
                            {activeTab === 'guardians' && <GuardiansTab studentId={student.id} />}
                            {activeTab === 'health' && <HealthTab student={student} canUpdate={canUpdate} />}
                            {activeTab === 'discipline' && <DisciplineTab student={student} canUpdate={canUpdate} canDelete={canDelete} />}
                            {activeTab === 'grades' && <GradesTab studentId={student.id} />}
                            {activeTab === 'fees' && <FeesTab studentId={student.id} />}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;