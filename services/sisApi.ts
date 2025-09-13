import { createMockApi, mockApi } from './api';
import type { 
    Student, Classroom, Guardian, StudentGuardian, FeeInvoice, Attendance, Program, Subject, Curriculum, Teacher, Grade, Timetable, TimetableSlot, SubjectGroup, AlumniEvent, AlumniEventRSVP, Alumni, StudentLeaveApplication, StudentLeaveApplicationStatus, CertificateTemplate, IssuedCertificate, IdCardTemplate, CommunicationLog, Notice, Content, AdmitCardTemplate, MarksheetTemplate, ExamGroup, ExamSchedule, Mark, MarksGrade, FeeType, FeeGroup, FeeMaster, FeeReminderLog, Expense, ExpenseHead, Income, IncomeHead, AdmissionEnquiry, Complaint, PhoneCallLog, PostalDispatch, PostalReceive, Visitor, SetupItem, Homework, HomeworkSubmission, RoomType, HostelRoom, HostelAllocation, InventoryItem, ItemCategory, StockReceive, Supplier, Store, ItemIssue, LibraryMember, Book, BookIssue, OnlineExam, OnlineExamResult, Question, MultiClassEnrollment, TransportRoute, Vehicle, Hostel, DigitalAsset, CatchupClass, CmsEvent, CmsEventRsvp, CmsAlbum, CmsPhoto, CmsNews, CatchupPlaybackToken, OnlineAdmissionApplication,
} from '@/types';
import { useAuth } from '@/hooks/useAuth';

// --- MOCK DATA ---
const programs: Program[] = [
    { id: 'prog_1', siteId: 'site_123', name: 'Grade 10', level: 'Secondary', duration: 1, session: '2024-2025', feeGroupId: 'fg_1' },
    { id: 'prog_2', siteId: 'site_123', name: 'Grade 11', level: 'Secondary', duration: 1, session: '2024-2025', feeGroupId: 'fg_2' },
];
const classrooms: Classroom[] = [
    { id: 'cls_1', siteId: 'site_123', name: 'Grade 10 - Section A', capacity: 30, programId: 'prog_1', tutorId: 'tch_1' },
    { id: 'cls_2', siteId: 'site_123', name: 'Grade 10 - Section B', capacity: 30, programId: 'prog_1' },
    { id: 'cls_3', siteId: 'site_123', name: 'Grade 11 - Science', capacity: 25, programId: 'prog_2', stream: 'Science', tutorId: 'tch_2' },
];
const students: Student[] = [
    { id: 'std_1', siteId: 'site_123', firstName: 'John', lastName: 'Doe', admissionNo: 'A001', rollNo: '10A01', classroomId: 'cls_1', dob: '2008-05-10', gender: 'Male', email: 'john.doe@example.com', phone: '123-456-7890', status: 'ENROLLED', address: { street: '123 Main St', city: 'Anytown', state: 'CA', zip: '12345' }, health: { allergies: '', medications: '', conditions: '', notes: '' }, discipline: [] },
    { id: 'std_2', siteId: 'site_123', firstName: 'Jane', lastName: 'Smith', admissionNo: 'A002', rollNo: '10A02', classroomId: 'cls_1', dob: '2008-07-22', gender: 'Female', email: 'jane.smith@example.com', phone: '123-456-7891', status: 'ENROLLED', address: { street: '456 Oak Ave', city: 'Anytown', state: 'CA', zip: '12345' }, health: { allergies: 'Peanuts', medications: '', conditions: '', notes: '' }, discipline: [] },
    { id: 'std_3', siteId: 'site_123', firstName: 'Peter', lastName: 'Jones', admissionNo: 'B001', rollNo: '11S01', classroomId: 'cls_3', dob: '2007-02-15', gender: 'Male', email: 'peter.jones@example.com', phone: '123-456-7892', status: 'ENROLLED', address: { street: '789 Pine Ln', city: 'Anytown', state: 'CA', zip: '12345' }, health: { allergies: '', medications: '', conditions: '', notes: '' }, discipline: [] },
    { id: 'std_4', siteId: 'site_123', firstName: 'Mary', lastName: 'Williams', admissionNo: 'C001', rollNo: '11S02', classroomId: 'cls_3', dob: '2007-09-01', gender: 'Female', email: null, phone: null, status: 'TRANSFERRED', address: { street: '101 Maple Dr', city: 'Anytown', state: 'CA', zip: '12345' }, health: { allergies: '', medications: '', conditions: '', notes: '' }, discipline: [] },
];
const guardians: Guardian[] = [
    { id: 'grd_1', siteId: 'site_123', name: 'Robert Doe', email: 'robert.doe@example.com', phone: '234-567-8901', occupation: 'Engineer' },
    { id: 'grd_2', siteId: 'site_123', name: 'Maria Doe', email: 'maria.doe@example.com', phone: '234-567-8902', occupation: 'Doctor' },
    { id: 'grd_3', siteId: 'site_123', name: 'David Smith', email: 'david.smith@example.com', phone: '234-567-8903', occupation: 'Lawyer' },
];
const studentGuardians: StudentGuardian[] = [
    { id: 'sg_1', siteId: 'site_123', studentId: 'std_1', guardianId: 'grd_1', relation: 'Father', isPrimary: true },
    { id: 'sg_2', siteId: 'site_123', studentId: 'std_1', guardianId: 'grd_2', relation: 'Mother', isPrimary: false },
    { id: 'sg_3', siteId: 'site_123', studentId: 'std_2', guardianId: 'grd_3', relation: 'Father', isPrimary: true },
];
const teachers: Teacher[] = [
    { id: 'tch_1', siteId: 'site_123', name: 'Mr. Davis', email: 'davis@school.com', department: 'Mathematics' },
    { id: 'tch_2', siteId: 'site_123', name: 'Ms. Martinez', email: 'martinez@school.com', department: 'Science' },
];
const subjects: Subject[] = [
    { id: 'sub_1', siteId: 'site_123', name: 'Mathematics 10', code: 'MATH10', type: 'Core', maxMarks: 100, passingMarks: 40, teacherId: 'tch_1' },
    { id: 'sub_2', siteId: 'site_123', name: 'Physics 11', code: 'PHY11', type: 'Core', maxMarks: 100, passingMarks: 40, teacherId: 'tch_2' },
];
const invoices: FeeInvoice[] = [
    { id: 'inv_1', siteId: 'site_123', studentId: 'std_1', term: 'Term 1 Tuition', amount: 1200, paidAmount: 1200, dueDate: '2024-08-15', status: 'PAID', paidOn: '2024-08-10', transactionId: 'TXN12345' },
    { id: 'inv_2', siteId: 'site_123', studentId: 'std_2', term: 'Term 1 Tuition', amount: 1200, paidAmount: 600, dueDate: '2024-08-15', status: 'PARTIALLY_PAID' },
    { id: 'inv_3', siteId: 'site_123', studentId: 'std_3', term: 'Term 1 Tuition', amount: 1500, paidAmount: 0, dueDate: '2024-08-15', status: 'OVERDUE' },
];
let attendance: Attendance[] = [
    { id: 'att_1', siteId: 'site_123', studentId: 'std_1', date: new Date().toISOString().split('T')[0], status: 'PRESENT' },
    { id: 'att_2', siteId: 'site_123', studentId: 'std_2', date: new Date().toISOString().split('T')[0], status: 'ABSENT', reason: 'Sick' },
];
const onlineAdmissionApplications: OnlineAdmissionApplication[] = [
    { id: 'oa_1', siteId: 'site_123', applicantFirstName: 'Emily', applicantLastName: 'Brown', applicantDob: '2009-01-01', applicantGender: 'Female', classSought: 'Grade 10', guardianName: 'Sarah Brown', guardianRelation: 'Mother', guardianPhone: '555-1234', guardianEmail: 'sarah.b@email.com', submissionDate: '2024-06-20', status: 'Approved', notes: 'Seems promising.' }
];

// --- API IMPLEMENTATIONS ---

// Student related
export const getStudents = (siteId: string): Promise<Student[]> => mockApi(students.filter(s => s.siteId === siteId));
export const getStudentById = (studentId: string): Promise<Student | undefined> => mockApi(students.find(s => s.id === studentId));
export const getStudentsByClassroom = (classroomId: string): Promise<Student[]> => mockApi(students.filter(s => s.classroomId === classroomId));
export const updateStudent = (id: string, updates: Partial<Student>): Promise<Student> => {
    const index = students.findIndex(s => s.id === id);
    if (index > -1) {
        students[index] = { ...students[index], ...updates };
        return mockApi(students[index]);
    }
    return Promise.reject(new Error('Student not found'));
};
export const addStudentAdmission = (data: { student: Omit<Student, 'id'|'siteId'>, father: Partial<Guardian>, mother: Partial<Guardian> }): Promise<Student> => {
    const newStudent = { ...data.student, id: `std_${Date.now()}`, siteId: 'site_123' } as Student;
    students.push(newStudent);
    // In a real app, you'd create/update guardians and link them.
    return mockApi(newStudent);
};
export const deleteStudent = (id: string): Promise<{ success: boolean }> => {
    const index = students.findIndex(s => s.id === id);
    if (index > -1) {
        students.splice(index, 1);
        return mockApi({ success: true });
    }
    return Promise.reject(new Error('Student not found'));
};
export const bulkDeleteStudents = (ids: string[]): Promise<{ success: boolean }> => {
    const initialLength = students.length;
    students = students.filter(s => !ids.includes(s.id));
    return mockApi({ success: students.length < initialLength });
};
export const getGuardians = (siteId: string): Promise<Guardian[]> => mockApi(guardians.filter(g => g.siteId === siteId));
export const getStudentGuardians = (siteId: string): Promise<StudentGuardian[]> => mockApi(studentGuardians.filter(sg => sg.siteId === siteId));
export const getGuardiansForStudent = (studentId: string): Promise<{ guardian: Guardian, relation: StudentGuardian }[]> => {
    const relations = studentGuardians.filter(sg => sg.studentId === studentId);
    const guardianIds = relations.map(r => r.guardianId);
    const studentGuardiansData = guardians.filter(g => guardianIds.includes(g.id));
    const result = relations.map(relation => ({
        relation,
        guardian: studentGuardiansData.find(g => g.id === relation.guardianId)!
    }));
    return mockApi(result);
};

// Academic related
export const getClassrooms = (siteId: string): Promise<Classroom[]> => mockApi(classrooms.filter(c => c.siteId === siteId));
export const getTeachers = (siteId: string): Promise<Teacher[]> => mockApi(teachers.filter(t => t.siteId === siteId));
export const getSubjects = (siteId: string): Promise<Subject[]> => mockApi(subjects.filter(s => s.siteId === siteId));
export const updateClassroom = (id: string, updates: Partial<Classroom>): Promise<Classroom> => {
    const index = classrooms.findIndex(c => c.id === id);
    if (index > -1) {
        classrooms[index] = { ...classrooms[index], ...updates };
        return mockApi(classrooms[index]);
    }
    return Promise.reject(new Error('Classroom not found'));
};

// Attendance
export const getAttendanceForClass = (classroomId: string, date: string): Promise<Attendance[]> => mockApi(attendance.filter(a => {
    const student = students.find(s => s.id === a.studentId);
    return student?.classroomId === classroomId && a.date === date;
}));
export const saveAttendance = (records: Partial<Attendance>[]): Promise<{ success: boolean }> => {
    records.forEach(record => {
        const existingIndex = attendance.findIndex(a => a.studentId === record.studentId && a.date === record.date);
        if (existingIndex > -1) {
            attendance[existingIndex] = { ...attendance[existingIndex], ...record } as Attendance;
        } else {
            attendance.push({ id: `att_${Date.now()}_${record.studentId}`, siteId: 'site_123', ...record } as Attendance);
        }
    });
    return mockApi({ success: true });
};
export const getAttendanceForDateRange = (classroomId: string, startDate: string, endDate: string): Promise<Attendance[]> => mockApi([]);
export const getAttendanceForStudent = (studentId: string): Promise<Attendance[]> => mockApi(attendance.filter(a => a.studentId === studentId));

// Health & Discipline
export const updateStudentHealthInfo = (studentId: string, healthInfo: HealthInfo): Promise<Student> => updateStudent(studentId, { health: healthInfo });
export const addDisciplineRecord = (studentId: string, record: Omit<DisciplineRecord, 'id'>): Promise<Student> => {
    const student = students.find(s => s.id === studentId);
    if (student) {
        student.discipline.push({ ...record, id: `disc_${Date.now()}` });
        return updateStudent(studentId, { discipline: student.discipline });
    }
    return Promise.reject(new Error('Student not found'));
};
export const updateDisciplineRecord = (studentId: string, recordId: string, updates: Partial<DisciplineRecord>): Promise<Student> => Promise.resolve(students[0]);
export const deleteDisciplineRecord = (studentId: string, recordId: string): Promise<Student> => Promise.resolve(students[0]);


// Fees
export const getInvoices = (siteId: string): Promise<FeeInvoice[]> => mockApi(invoices);
export const getInvoicesForStudent = (studentId: string): Promise<FeeInvoice[]> => mockApi(invoices.filter(i => i.studentId === studentId));
export const recordPayment = (invoiceId: string, amount: number, method: string): Promise<{ success: true }> => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (invoice) {
        invoice.paidAmount += amount;
        if (invoice.paidAmount >= invoice.amount) {
            invoice.status = 'PAID';
        } else {
            invoice.status = 'PARTIALLY_PAID';
        }
        invoice.paidOn = new Date().toISOString().split('T')[0];
        invoice.transactionId = `TXN_MOCK_${Date.now()}`;
        return mockApi({ success: true });
    }
    return Promise.reject(new Error('Invoice not found'));
};
export const getFeeReminderLogs = (siteId: string): Promise<FeeReminderLog[]> => mockApi([]);
export const sendFeeReminders = (studentIds: string[], channel: 'SMS'|'Email'): Promise<{ success: true }> => mockApi({ success: true });


// Grades
export const getGradesForStudent = (studentId: string): Promise<Grade[]> => mockApi([]);
export const getGradesBySite = (siteId: string): Promise<Grade[]> => mockApi([]);


// Online Admission
export const getOnlineAdmissionApplications = (siteId: string): Promise<OnlineAdmissionApplication[]> => mockApi(onlineAdmissionApplications);
// IMPROVEMENT: Centralized the type definition for `OnlineAdmissionApplicationStatus`
export const updateOnlineAdmissionApplicationStatus = (applicationId: string, status: OnlineAdmissionApplication['status']): Promise<OnlineAdmissionApplication> => {
    const app = onlineAdmissionApplications.find(a => a.id === applicationId);
    if (app) {
        app.status = status;
        return mockApi(app);
    }
    return Promise.reject(new Error('Application not found'));
};

// Generic CRUD APIs
export const programApi = createMockApi<Program>('program', programs);
export const classroomApi = createMockApi<Classroom>('classroom', classrooms);
export const subjectApi = createMockApi<Subject>('subject', subjects);
export const subjectGroupApi = createMockApi<SubjectGroup>('subjectGroup', []);
export const alumniEventApi = createMockApi<AlumniEvent>('alumniEvent', []);
export const alumniEventRsvpApi = createMockApi<AlumniEventRSVP>('alumniRsvp', []);
export const alumniApi = createMockApi<Alumni>('alumni', []);
export const certificateTemplateApi = createMockApi<CertificateTemplate>('certTemplate', []);
export const issuedCertificateApi = createMockApi<IssuedCertificate>('issuedCert', []);
export const idCardTemplateApi = createMockApi<IdCardTemplate>('idCardTemplate', []);
export const communicationLogApi = createMockApi<CommunicationLog>('commLog', []);
export const noticeApi = createMockApi<Notice>('notice', []);
export const contentApi = createMockApi<Content>('content', []);
export const admitCardTemplateApi = createMockApi<AdmitCardTemplate>('admitCardTemplate', []);
export const marksheetTemplateApi = createMockApi<MarksheetTemplate>('marksheetTemplate', []);
export const examGroupApi = createMockApi<ExamGroup>('examGroup', []);
export const marksGradeApi = createMockApi<MarksGrade>('marksGrade', []);
export const feeTypeApi = createMockApi<FeeType>('feeType', []);
export const feeGroupApi = createMockApi<FeeGroup>('feeGroup', []);
export const feeMasterApi = createMockApi<FeeMaster>('feeMaster', []);
export const expenseHeadApi = createMockApi<ExpenseHead>('expenseHead', []);
export const incomeHeadApi = createMockApi<IncomeHead>('incomeHead', []);
export const complaintTypeApi = createMockApi<SetupItem>('complaintType', []);
export const enquirySourceApi = createMockApi<SetupItem>('enquirySource', []);
export const enquiryReferenceApi = createMockApi<SetupItem>('enquiryReference', []);
export const visitorPurposeApi = createMockApi<SetupItem>('visitorPurpose', []);
export const homeworkApi = createMockApi<Homework>('homework', []);
export const roomTypeApi = createMockApi<RoomType>('roomType', []);
export const hostelApi = createMockApi<Hostel>('hostel', []);
export const hostelRoomApi = createMockApi<HostelRoom>('hostelRoom', []);
export const roomAllocationApi = createMockApi<HostelAllocation>('roomAllocation', []);
export const inventoryItemApi = createMockApi<InventoryItem>('inventoryItem', []);
export const itemCategoryApi = createMockApi<ItemCategory>('itemCategory', []);
export const stockReceiveApi = createMockApi<StockReceive>('stockReceive', []);
export const supplierApi = createMockApi<Supplier>('supplier', []);
export const storeApi = createMockApi<Store>('store', []);
export const itemIssueApi = createMockApi<ItemIssue>('itemIssue', []);
export const libraryMemberApi = createMockApi<LibraryMember>('libraryMember', []);
export const bookApi = createMockApi<Book>('book', []);
export const bookIssueApi = createMockApi<BookIssue>('bookIssue', []);
export const onlineExamApi = createMockApi<OnlineExam>('onlineExam', []);
export const questionApi = createMockApi<Question>('question', []);
export const transportRouteApi = createMockApi<TransportRoute>('transportRoute', []);
export const vehicleApi = createMockApi<Vehicle>('vehicle', []);
export const digitalAssetApi = createMockApi<DigitalAsset>('digitalAsset', []);
export const catchupClassApi = createMockApi<CatchupClass>('catchupClass', []);
export const cmsEventApi = createMockApi<CmsEvent>('cmsEvent', []);
export const cmsEventRsvpApi = createMockApi<CmsEventRsvp>('cmsRsvp', []);
export const cmsAlbumApi = createMockApi<CmsAlbum>('cmsAlbum', []);
export const cmsPhotoApi = createMockApi<CmsPhoto>('cmsPhoto', []);
export const cmsNewsApi = createMockApi<CmsNews>('cmsNews', []);
export const multiClassEnrollmentApi = createMockApi<MultiClassEnrollment>('multiClassEnrollment', []);

// More complex APIs
export const getCurricula = (siteId: string): Promise<Curriculum[]> => mockApi([]);
export const getTimetables = (siteId: string): Promise<Timetable[]> => mockApi([]);
export const getTimetableForClass = (classroomId: string): Promise<Timetable | undefined> => mockApi(undefined);
export const saveTimetableForClass = (classroomId: string, slots: TimetableSlot[]): Promise<{ success: boolean }> => mockApi({ success: true });
export const addExamGroup = (data: Omit<ExamGroup, 'id'|'siteId'>) => examGroupApi.add(data);
export const updateExamGroup = (id: string, data: ExamGroup) => examGroupApi.update(id, data);
export const deleteExamGroup = (id: string) => examGroupApi.delete(id);
export const examScheduleApi = createMockApi<ExamSchedule>('examSchedule', []);
export const getExamSchedules = (siteId: string) => examScheduleApi.get(siteId);
export const getMarks = (siteId: string, scheduleId: string): Promise<Mark[]> => mockApi([]);
export const saveMarks = (marks: Omit<Mark, 'id'|'siteId'>[]): Promise<{ success: boolean }> => mockApi({ success: true });
export const getExpenses = (siteId: string): Promise<Expense[]> => mockApi([]);
export const addExpense = (data: Omit<Expense, 'id'|'siteId'>) => mockApi({} as Expense);
export const updateExpense = (id: string, data: Expense) => mockApi(data);
export const deleteExpense = (id: string) => mockApi({ success: true });
export const getIncomes = (siteId: string): Promise<Income[]> => mockApi([]);
export const addIncome = (data: Omit<Income, 'id'|'siteId'>) => mockApi({} as Income);
export const updateIncome = (id: string, data: Income) => mockApi(data);
export const deleteIncome = (id: string) => mockApi({ success: true });
export const addAdmissionEnquiry = (data: Omit<AdmissionEnquiry, 'id'|'siteId'>) => mockApi({} as AdmissionEnquiry);
export const updateAdmissionEnquiry = (id: string, data: AdmissionEnquiry) => mockApi(data);
export const deleteAdmissionEnquiry = (id: string) => mockApi({ success: true });
export const getComplaints = (siteId: string): Promise<Complaint[]> => mockApi([]);
export const addComplaint = (data: Omit<Complaint, 'id'|'siteId'>) => mockApi({} as Complaint);
export const updateComplaint = (id: string, data: Complaint) => mockApi(data);
export const deleteComplaint = (id: string) => mockApi({ success: true });
export const getPhoneCallLogs = (siteId: string): Promise<PhoneCallLog[]> => mockApi([]);
export const addPhoneCallLog = (data: Omit<PhoneCallLog, 'id'|'siteId'>) => mockApi({} as PhoneCallLog);
export const updatePhoneCallLog = (id: string, data: PhoneCallLog) => mockApi(data);
export const deletePhoneCallLog = (id: string) => mockApi({ success: true });
export const getPostalDispatches = (siteId: string): Promise<PostalDispatch[]> => mockApi([]);
export const addPostalDispatch = (data: Omit<PostalDispatch, 'id'|'siteId'>) => mockApi({} as PostalDispatch);
export const updatePostalDispatch = (id: string, data: PostalDispatch) => mockApi(data);
export const deletePostalDispatch = (id: string) => mockApi({ success: true });
export const getPostalReceives = (siteId: string): Promise<PostalReceive[]> => mockApi([]);
export const addPostalReceive = (data: Omit<PostalReceive, 'id'|'siteId'>) => mockApi({} as PostalReceive);
export const updatePostalReceive = (id: string, data: PostalReceive) => mockApi(data);
export const deletePostalReceive = (id: string) => mockApi({ success: true });
export const getVisitors = (siteId: string): Promise<Visitor[]> => mockApi([]);
export const addVisitor = (data: Omit<Visitor, 'id'|'siteId'>) => mockApi({} as Visitor);
export const updateVisitor = (id: string, data: Visitor) => mockApi(data);
export const deleteVisitor = (id: string) => mockApi({ success: true });
export const addHomework = (data: Omit<Homework, 'id'|'siteId'>) => mockApi({} as Homework);
export const getHomeworkSubmissions = (homeworkId: string): Promise<HomeworkSubmission[]> => mockApi([]);
export const updateHomeworkSubmissions = (submissions: Partial<HomeworkSubmission>[]): Promise<{ success: true }> => mockApi({ success: true });
export const getOnlineExamResults = (siteId: string, examId: string): Promise<OnlineExamResult[]> => mockApi([]);
export const getMultiClassEnrollments = (siteId: string): Promise<MultiClassEnrollment[]> => multiClassEnrollmentApi.get(siteId);
export const addMultiClassEnrollment = (data: { studentId: string; classroomId: string; }) => multiClassEnrollmentApi.add(data as any);
export const deleteMultiClassEnrollment = (id: string) => multiClassEnrollmentApi.delete(id);
export const batchAddStudents = (students: any[]): Promise<any> => mockApi({ successCount: students.length, errorCount: 0, errors: [] });
export const listCatchupClasses = (params: any): Promise<CatchupClass[]> => mockApi([]);
export const getDigitalAssetById = (id: string): Promise<DigitalAsset> => mockApi({ id: 'da_1', siteId: 'site_123', title: 'Mock Video', kind: 'VIDEO', subject: 'Physics', storageKey: 'test', drm: 'NONE' });
export const getDigitalViewToken = (assetId: string): Promise<CatchupPlaybackToken> => mockApi({ src: 'https://storage.googleapis.com/shaka-demo-assets/angel-one-hls/hls.m3u8', host: 'SELF', rules: { minPct: 80, allowFwdWindowSec: 10 }, prompts: [], quiz: null, watermark: { name: 'Student User', userId: 'user_student', ts: new Date().toISOString() } });
export const logDigitalAudit = (data: any): Promise<{ success: true }> => mockApi({ success: true });
export const getCatchupClassById = (id: string): Promise<CatchupClass> => mockApi({} as CatchupClass);
export const verifyCertificate = (serialId: string): Promise<IssuedCertificate|undefined> => mockApi(undefined);
export const getCatchupPlaybackToken = (id: string): Promise<CatchupPlaybackToken> => mockApi({ src: 'M-V4sRsG-o8', host: 'YOUTUBE', rules: { minPct: 80, allowFwdWindowSec: 10 }, prompts: [{ id: 'p1', atSec: 15, text: 'Are you paying attention?' }], quiz: null, watermark: { name: 'Student User', userId: 'user_student', ts: new Date().toISOString() } });
export const postWatchBeat = (catchupId: string, payload: { posSec: number; deltaSec: number }): Promise<any> => mockApi({ success: true });
export const postPromptAck = (promptId: string): Promise<any> => mockApi({ success: true });
export const submitCatchupQuiz = (catchupId: string, answers: number[]): Promise<{ passed: boolean; scorePct: number }> => mockApi({ passed: true, scorePct: 100 });
export const finalizeCatchup = (catchupId: string): Promise<{ credited: boolean }> => mockApi({ credited: true });