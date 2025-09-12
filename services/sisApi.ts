import { createMockApi, mockApi, mockApiError } from './api';
import type {
  Student, Classroom, Guardian, StudentGuardian, FeeInvoice, Attendance, Program, Subject, Curriculum, Teacher, Grade,
  StudentLeaveApplication, StudentLeaveApplicationStatus, OnlineAdmissionApplication, OnlineAdmissionApplicationStatus,
  AdmissionEnquiry, Visitor, PhoneCallLog, PostalDispatch, PostalReceive, Complaint, SetupItem,
  ExamGroup, ExamSchedule, Mark, MarksGrade, AdmitCardTemplate, MarksheetTemplate,
  OnlineExam, OnlineExamResult, Question, MultiClassEnrollment,
  FeeType, FeeGroup, FeeMaster, FeeReminderLog, Expense, ExpenseHead, Income, IncomeHead,
  TransportRoute, Vehicle,
  Hostel, RoomType, HostelRoom, HostelAllocation,
  InventoryItem, ItemCategory, Store, Supplier, StockReceive, ItemIssue,
  LibraryMember, LibraryMemberStatus, Book, BookIssue,
  Notice, CommunicationLog,
  Homework, HomeworkSubmission, Assignment, AssignmentSubmission,
  AlumniEvent, AlumniEventRSVP, Alumni,
  Content, DigitalAsset, CatchupClass, DigitalViewToken, CatchupPlaybackToken, IdCardTemplate,
  Timetable, TimetableSlot, SubjectGroup,
} from '@/types';

// --- MOCK DATA ---

const classrooms: Classroom[] = [
  { id: 'cls_1', siteId: 'site_123', name: 'Grade 10 - A', programId: 'prog_1', capacity: 30, tutorId: 'teacher_1' },
  { id: 'cls_2', siteId: 'site_123', name: 'Grade 10 - B', programId: 'prog_1', capacity: 30, tutorId: 'teacher_2' },
  { id: 'cls_3', siteId: 'site_123', name: 'Grade 11 - Science', programId: 'prog_2', capacity: 25, tutorId: 'teacher_3', stream: 'Science' },
];

const students: Student[] = [
  { id: 'std_1', siteId: 'site_123', admissionNo: 'A001', rollNo: '10A-01', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '123-456-7890', dob: '2008-05-10', gender: 'Male', classroomId: 'cls_1', status: 'ENROLLED', photoUrl: 'https://i.pravatar.cc/150?u=std_1', address: { street: '123 Main St', city: 'Anytown', state: 'CA', zip: '12345' }, health: { allergies: 'Peanuts', medications: 'None', conditions: 'Asthma', notes: '' }, discipline: [] },
  { id: 'std_2', siteId: 'site_123', admissionNo: 'A002', rollNo: '10A-02', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phone: '123-456-7891', dob: '2008-07-15', gender: 'Female', classroomId: 'cls_1', status: 'ENROLLED', photoUrl: 'https://i.pravatar.cc/150?u=std_2', address: { street: '456 Oak Ave', city: 'Anytown', state: 'CA', zip: '12345' }, health: { allergies: '', medications: '', conditions: '', notes: '' }, discipline: [] },
  { id: 'std_3', siteId: 'site_123', admissionNo: 'A003', rollNo: '10B-01', firstName: 'Peter', lastName: 'Jones', email: 'peter.jones@example.com', phone: '123-456-7892', dob: '2008-03-20', gender: 'Male', classroomId: 'cls_2', status: 'ENROLLED', photoUrl: 'https://i.pravatar.cc/150?u=std_3', address: { street: '789 Pine Rd', city: 'Anytown', state: 'CA', zip: '12345' }, health: { allergies: '', medications: '', conditions: '', notes: '' }, discipline: [{ id: 'dr_1', date: '2024-05-10', incident: 'Skipped class', actionTaken: 'Detention', reportedBy: 'teacher_1' }] },
  { id: 'std_4', siteId: 'site_123', admissionNo: 'A004', rollNo: '11S-01', firstName: 'Mary', lastName: 'Williams', email: 'mary.w@example.com', phone: '123-456-7893', dob: '2007-11-30', gender: 'Female', classroomId: 'cls_3', status: 'GRADUATED', photoUrl: 'https://i.pravatar.cc/150?u=std_4', address: { street: '101 Maple Ln', city: 'Anytown', state: 'CA', zip: '12345' }, health: { allergies: '', medications: '', conditions: '', notes: '' }, discipline: [] },
];

const guardians: Guardian[] = [
  { id: 'grd_1', siteId: 'site_123', name: 'David Doe', email: 'david.doe@example.com', phone: '555-111-2222', occupation: 'Engineer' },
  { id: 'grd_2', siteId: 'site_123', name: 'Sarah Smith', email: 'sarah.smith@example.com', phone: '555-333-4444', occupation: 'Doctor' },
];

const studentGuardians: StudentGuardian[] = [
  { id: 'sg_1', siteId: 'site_123', studentId: 'std_1', guardianId: 'grd_1', relation: 'Father', isPrimary: true },
  { id: 'sg_2', siteId: 'site_123', studentId: 'std_2', guardianId: 'grd_2', relation: 'Mother', isPrimary: true },
];

const feeInvoices: FeeInvoice[] = [
  { id: 'inv_1', siteId: 'site_123', studentId: 'std_1', term: 'Term 1 Fees', amount: 1200, paidAmount: 1200, dueDate: '2024-08-15', status: 'PAID', paidOn: '2024-08-10', transactionId: 'TX12345' },
  { id: 'inv_2', siteId: 'site_123', studentId: 'std_2', term: 'Term 1 Fees', amount: 1200, paidAmount: 600, dueDate: '2024-08-15', status: 'PARTIALLY_PAID' },
  { id: 'inv_3', siteId: 'site_123', studentId: 'std_3', term: 'Term 1 Fees', amount: 1200, paidAmount: 0, dueDate: '2024-08-15', status: 'OVERDUE' },
];

const attendances: Attendance[] = [
    { id: 'att_1', siteId: 'site_123', studentId: 'std_1', date: '2024-09-01', status: 'PRESENT', reason: null },
    { id: 'att_2', siteId: 'site_123', studentId: 'std_2', date: '2024-09-01', status: 'ABSENT', reason: 'Sick' },
];

const teachers: Teacher[] = [
    {id: 'teacher_1', siteId: 'site_123', name: 'Mr. Robert Davis', email: 'robert.d@school.com', department: 'Mathematics' },
    {id: 'teacher_2', siteId: 'site_123', name: 'Ms. Emily White', email: 'emily.w@school.com', department: 'Science' },
    {id: 'teacher_3', siteId: 'site_123', name: 'Dr. Charles Harris', email: 'charles.h@school.com', department: 'Science' },
];

const programs: Program[] = [
    { id: 'prog_1', siteId: 'site_123', name: 'Grade 10', code: 'G10', level: 'Secondary', duration: 1, session: '2024-2025', feeGroupId: 'fg_1' },
    { id: 'prog_2', siteId: 'site_123', name: 'Grade 11', code: 'G11', level: 'Secondary', duration: 1, session: '2024-2025', feeGroupId: 'fg_1'  },
];

const subjects: Subject[] = [
    { id: 'sub_1', siteId: 'site_123', name: 'Mathematics 10', code: 'MATH10', maxMarks: 100, passingMarks: 40, type: 'Core', teacherId: 'teacher_1' },
    { id: 'sub_2', siteId: 'site_123', name: 'Physics 11', code: 'PHY11', maxMarks: 100, passingMarks: 40, type: 'Core', teacherId: 'teacher_3' },
];

const curricula: Curriculum[] = [
    { id: 'cur_1', siteId: 'site_123', programId: 'prog_1', year: 10, subjects: ['sub_1'], status: 'PUBLISHED' },
];

const grades: Grade[] = [
    { id: 'grd_1', siteId: 'site_123', studentId: 'std_1', subjectName: 'Mathematics 10', itemName: 'Mid-Term', score: 85, gradeLetter: 'A' },
];

const studentLeaveApplications: StudentLeaveApplication[] = [
    { id: 'sla_1', siteId: 'site_123', studentId: 'std_1', fromDate: '2024-09-05', toDate: '2024-09-06', reason: 'Family function', status: 'Approved', appliedOn: '2024-09-04' },
    { id: 'sla_2', siteId: 'site_123', studentId: 'std_2', fromDate: '2024-09-10', toDate: '2024-09-10', reason: 'Not feeling well', status: 'Pending', appliedOn: '2024-09-09' },
];

const onlineAdmissionApplications: OnlineAdmissionApplication[] = [
    { id: 'oaa_1', siteId: 'site_123', applicantFirstName: 'Test', applicantLastName: 'Applicant', applicantDob: '2009-01-01', applicantGender: 'Male', classSought: 'Grade 10 - A', guardianName: 'Test Parent', guardianRelation: 'Father', guardianPhone: '555-555-5555', guardianEmail: 'test@parent.com', submissionDate: '2024-08-01', status: 'Approved' },
];

const admissionEnquiries: AdmissionEnquiry[] = [
    { id: 'enq_1', siteId: 'site_123', name: 'Prospective Parent', phone: '987-654-3210', enquiryDate: '2024-08-15', source: 'Online', classSought: 'Grade 10 - A', description: 'Wants to know about fees.', status: 'ACTIVE', numberOfChildren: 1 }
];

const visitors: Visitor[] = [
    { id: 'vis_1', siteId: 'site_123', purpose: 'Meeting', name: 'Contractor Bob', phone: '111-222-3333', toMeet: 'Mr. Robert Davis', numberOfPersons: 1, checkIn: new Date().toISOString() }
];

const phoneCallLogs: PhoneCallLog[] = [];
const postalDispatches: PostalDispatch[] = [];
const postalReceives: PostalReceive[] = [];
const complaints: Complaint[] = [];

const setupItems: { [key: string]: SetupItem[] } = {
    visitorPurposes: [{id: 'vp_1', siteId: 'site_123', name: 'Meeting with Teacher'}],
    enquirySources: [{id: 'es_1', siteId: 'site_123', name: 'Website Form'}],
    complaintTypes: [{id: 'ct_1', siteId: 'site_123', name: 'Bullying'}],
    enquiryReferences: [{id: 'er_1', siteId: 'site_123', name: 'Friend Referral'}],
};

const examGroups: ExamGroup[] = [{ id: 'eg_1', siteId: 'site_123', name: 'Mid-Term Exams 2024', examType: 'Term'}];
const examSchedules: ExamSchedule[] = [{ id: 'exs_1', siteId: 'site_123', examGroupId: 'eg_1', classroomId: 'cls_1', subjectId: 'sub_1', examDate: '2024-10-10', startTime: '09:00', endTime: '12:00', roomNo: '101', maxMarks: 100, minMarks: 40 }];
const marks: Mark[] = [{ id: 'm_1', siteId: 'site_123', studentId: 'std_1', examScheduleId: 'exs_1', marksObtained: 88 }];
const marksGrades: MarksGrade[] = [{ id: 'mg_1', siteId: 'site_123', name: 'A+', minPercentage: 90, description: 'Outstanding' }];
const admitCardTemplates: AdmitCardTemplate[] = [{ id: 'act_1', siteId: 'site_123', name: 'Standard Admit Card', settings: { showPhoto: true, showGuardian: true, showAddress: false, showTimetable: true, showQRCode: true, instructions: 'Do not bring electronic devices.' } }];
const marksheetTemplates: MarksheetTemplate[] = [{ id: 'mst_1', siteId: 'site_123', name: 'Standard Marksheet', settings: { showPhoto: true, showRank: true, showAttendance: true, showGradePoint: true, teacherRemarks: true, principalSignature: true } }];
const onlineExams: OnlineExam[] = [];
const onlineExamResults: OnlineExamResult[] = [];
const questions: Question[] = [];
const multiClassEnrollments: MultiClassEnrollment[] = [];

const feeTypes: FeeType[] = [];
const feeGroups: FeeGroup[] = [];
const feeMasters: FeeMaster[] = [];
const feeReminderLogs: FeeReminderLog[] = [];

const expenseHeads: ExpenseHead[] = [];
const expenses: Expense[] = [];
const incomeHeads: IncomeHead[] = [];
const incomes: Income[] = [];
const transportRoutes: TransportRoute[] = [];
const vehicles: Vehicle[] = [];
const hostels: Hostel[] = [];
const roomTypes: RoomType[] = [];
const hostelRooms: HostelRoom[] = [];
const roomAllocations: HostelAllocation[] = [];

const inventoryItems: InventoryItem[] = [];
const itemCategories: ItemCategory[] = [];
const stores: Store[] = [];
const suppliers: Supplier[] = [];
const stockReceives: StockReceive[] = [];
const itemIssues: ItemIssue[] = [];

const libraryMembers: LibraryMember[] = [];
const books: Book[] = [];
const bookIssues: BookIssue[] = [];
const digitalAssets: DigitalAsset[] = [];
const catchupClasses: CatchupClass[] = [];

const notices: Notice[] = [];
const communicationLogs: CommunicationLog[] = [];
const homeworks: Homework[] = [];
const homeworkSubmissions: HomeworkSubmission[] = [];
const assignments: Assignment[] = [];
const assignmentSubmissions: AssignmentSubmission[] = [];

const alumniEvents: AlumniEvent[] = [];
const alumniEventRsvps: AlumniEventRSVP[] = [];
const alumni: Alumni[] = [];
const content: Content[] = [];

const idCardTemplates: IdCardTemplate[] = [
    {
        id: 'idt_1',
        siteId: 'site_123',
        name: 'Standard Student ID',
        type: 'Student',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        logoUrl: '/school-logo.png', // a mock url
        showPhoto: true,
        showQRCode: true,
        showBloodGroup: true,
        showGuardian: true,
        showValidity: true,
    },
    {
        id: 'idt_2',
        siteId: 'site_123',
        name: 'Minimal Staff ID',
        type: 'Staff',
        backgroundColor: '#f0f4f8',
        textColor: '#1a202c',
        logoUrl: '/school-logo.png',
        showPhoto: true,
        showQRCode: true,
        showBloodGroup: false,
        showGuardian: false,
        showValidity: true,
    }
];

const timetables: Timetable[] = [];
const subjectGroups: SubjectGroup[] = [];
const studentCategories: SetupItem[] = [];
const studentHouses: SetupItem[] = [];
const disableReasons: SetupItem[] = [];


// --- API IMPLEMENTATIONS ---

// Student Info
export const studentApi = createMockApi<Student>('student', students);
export const getStudents = (siteId: string) => studentApi.get(siteId);
export const getStudentById = (id: string) => studentApi.getById(id);
export const deleteStudent = (id: string) => studentApi.delete(id);
export const bulkDeleteStudents = (ids: string[]) => mockApi(ids.forEach(id => studentApi.delete(id)));
export const updateStudent = (id: string, updates: Partial<Student>) => studentApi.update(id, updates);
export const updateStudentHealthInfo = (id: string, healthInfo: any) => studentApi.update(id, { health: healthInfo });
export const addDisciplineRecord = (studentId: string, record: any) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
        student.discipline.push({ ...record, id: `dr_${Date.now()}`});
        return mockApi(student);
    }
    return mockApiError(404, 'Student not found');
}
export const updateDisciplineRecord = (studentId: string, recordId: string, updates: any) => {
    const student = students.find(s => s.id === studentId);
    const recordIndex = student?.discipline.findIndex(r => r.id === recordId);
    if (student && recordIndex !== undefined && recordIndex > -1) {
        student.discipline[recordIndex] = { ...student.discipline[recordIndex], ...updates };
        return mockApi(student);
    }
    return mockApiError(404, 'Record not found');
};
export const deleteDisciplineRecord = (studentId: string, recordId: string) => {
     const student = students.find(s => s.id === studentId);
    if (student) {
        student.discipline = student.discipline.filter(r => r.id !== recordId);
        return mockApi(student);
    }
    return mockApiError(404, 'Student not found');
};

export const addStudentAdmission = (data: { student: any, father: any, mother: any }) => {
    return studentApi.add(data.student);
}

// FIX: Add missing mock APIs for timetables
export const getTimetables = (siteId: string) => mockApi(timetables.filter(t => t.siteId === siteId));
export const getTimetableForClass = (classroomId: string) => mockApi(timetables.find(t => t.classroomId === classroomId));
export const saveTimetableForClass = (classroomId: string, newSlots: TimetableSlot[]) => {
    let timetable = timetables.find(t => t.classroomId === classroomId);
    if (timetable) {
        timetable.slots = newSlots;
    } else {
        timetable = { id: `tt_${Date.now()}`, siteId: 'site_123', classroomId, slots: newSlots };
        timetables.push(timetable);
    }
    return mockApi(timetable);
};

// FIX: Add missing mock APIs for student categories, houses, and disable reasons
export const studentCategoryApi = createMockApi<SetupItem>('studentCategory', studentCategories);
export const studentHouseApi = createMockApi<SetupItem>('studentHouse', studentHouses);
export const disableReasonApi = createMockApi<SetupItem>('disableReason', disableReasons);


export const classroomApi = createMockApi<Classroom>('classroom', classrooms);
export const getClassrooms = (siteId: string) => classroomApi.get(siteId);
export const getStudentsByClassroom = (classroomId: string) => mockApi(students.filter(s => s.classroomId === classroomId));
export const updateClassroom = (id: string, updates: Partial<Classroom>) => classroomApi.update(id, updates);

export const guardianApi = createMockApi<Guardian>('guardian', guardians);
export const getGuardians = (siteId: string) => guardianApi.get(siteId);

export const studentGuardianApi = createMockApi<StudentGuardian>('studentGuardian', studentGuardians);
export const getStudentGuardians = (siteId: string) => studentGuardianApi.get(siteId);
export const getGuardiansForStudent = (studentId: string) => {
    const relations = studentGuardians.filter(sg => sg.studentId === studentId);
    const guardianIds = relations.map(r => r.guardianId);
    const studentGuardiansData = guardians.filter(g => guardianIds.includes(g.id));
    const result = studentGuardiansData.map(guardian => ({
        guardian,
        relation: relations.find(r => r.guardianId === guardian.id)!
    }));
    return mockApi(result);
};
export const getInvoicesForStudent = (studentId: string) => mockApi(feeInvoices.filter(i => i.studentId === studentId));
export const getGradesForStudent = (studentId: string) => mockApi(grades.filter(g => g.studentId === studentId));
export const getAttendanceForStudent = (studentId: string) => mockApi(attendances.filter(a => a.studentId === studentId));

// Fees
export const getInvoices = (siteId: string) => mockApi(feeInvoices.filter(i => i.siteId === siteId));
export const recordPayment = (invoiceId: string, amount: number, method: string) => {
    const invoice = feeInvoices.find(i => i.id === invoiceId);
    if (invoice) {
        invoice.paidAmount += amount;
        if (invoice.paidAmount >= invoice.amount) {
            invoice.status = 'PAID';
        } else {
            invoice.status = 'PARTIALLY_PAID';
        }
        invoice.paidOn = new Date().toISOString().split('T')[0];
        invoice.transactionId = `TX_${Date.now()}`;
        return mockApi({ success: true, receipt: `RECEIPT_${Date.now()}`});
    }
    return mockApiError(404, 'Invoice not found');
};

// Attendance
export const getAttendanceForClass = (classroomId: string, date: string) => {
    const studentIds = students.filter(s => s.classroomId === classroomId).map(s => s.id);
    return mockApi(attendances.filter(a => studentIds.includes(a.studentId) && a.date === date));
};
export const saveAttendance = (records: any[]) => {
    records.forEach(record => {
        const existing = attendances.find(a => a.studentId === record.studentId && a.date === record.date);
        if (existing) {
            existing.status = record.status;
            existing.reason = record.reason;
        } else {
            attendances.push({ ...record, id: `att_${Date.now()}_${record.studentId}`, siteId: 'site_123' });
        }
    });
    return mockApi({ success: true });
};
export const getAttendanceForDateRange = (classroomId: string, startDate: string, endDate: string) => {
    const studentIds = students.filter(s => s.classroomId === classroomId).map(s => s.id);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return mockApi(attendances.filter(a => {
        const aDate = new Date(a.date);
        return studentIds.includes(a.studentId) && aDate >= start && aDate <= end;
    }));
}

// Academics
export const programApi = createMockApi<Program>('program', programs);
export const getPrograms = (siteId: string) => programApi.get(siteId);
export const subjectApi = createMockApi<Subject>('subject', subjects);
export const getSubjects = (siteId: string) => subjectApi.get(siteId);
export const getCurricula = (siteId: string) => mockApi(curricula.filter(c => c.siteId === siteId));
export const getTeachers = (siteId: string) => mockApi(teachers.filter(t => t.siteId === siteId));
export const getGradesBySite = (siteId: string) => mockApi(grades.filter(g => g.siteId === siteId));
export const getMultiClassEnrollments = (siteId: string) => mockApi(multiClassEnrollments.filter(e => e.siteId === siteId));
export const addMultiClassEnrollment = (data: { studentId: string, classroomId: string }) => {
    const newEnrollment: MultiClassEnrollment = { ...data, id: `mce_${Date.now()}`, siteId: 'site_123' };
    multiClassEnrollments.push(newEnrollment);
    return mockApi(newEnrollment);
};
export const deleteMultiClassEnrollment = (id: string) => {
    const index = multiClassEnrollments.findIndex(e => e.id === id);
    if(index > -1) {
        multiClassEnrollments.splice(index, 1);
        return mockApi({ success: true });
    }
    return mockApiError(404, 'Not found');
};

export const subjectGroupApi = createMockApi<SubjectGroup>('subjectGroup', subjectGroups);


// Student Leave
export const getStudentLeaveApplications = (siteId: string) => mockApi(studentLeaveApplications.filter(a => a.siteId === siteId));
export const addStudentLeaveApplication = (app: any) => {
    const newApp = { ...app, id: `sla_${Date.now()}`, siteId: 'site_123' };
    studentLeaveApplications.push(newApp);
    return mockApi(newApp);
};
export const updateStudentLeaveApplicationStatus = (id: string, status: StudentLeaveApplicationStatus) => {
    const app = studentLeaveApplications.find(a => a.id === id);
    if (app) {
        app.status = status;
        return mockApi(app);
    }
    return mockApiError(404, 'Not found');
}

// Online Admission
export const getOnlineAdmissionApplications = (siteId: string) => mockApi(onlineAdmissionApplications.filter(a => a.siteId === siteId));
export const updateOnlineAdmissionApplicationStatus = (id: string, status: OnlineAdmissionApplicationStatus) => {
    const app = onlineAdmissionApplications.find(a => a.id === id);
    if (app) {
        app.status = status;
        return mockApi(app);
    }
    return mockApiError(404, 'Not found');
}


// Front Office
export const getAdmissionEnquiries = (siteId: string) => mockApi(admissionEnquiries.filter(e => e.siteId === siteId));
export const addAdmissionEnquiry = (enq: any) => { const newEnq = {...enq, id: `enq_${Date.now()}`, siteId: 'site_123'}; admissionEnquiries.push(newEnq); return mockApi(newEnq); };
export const updateAdmissionEnquiry = (id: string, updates: any) => { const i = admissionEnquiries.findIndex(e=>e.id===id); if (i > -1) { admissionEnquiries[i] = {...admissionEnquiries[i], ...updates}; return mockApi(admissionEnquiries[i]); } return mockApiError(404, 'Not found'); };
export const deleteAdmissionEnquiry = (id: string) => { const i = admissionEnquiries.findIndex(e=>e.id===id); if (i > -1) { admissionEnquiries.splice(i,1); return mockApi({success: true}); } return mockApiError(404, 'Not found'); };

export const getVisitors = (siteId: string) => mockApi(visitors.filter(v => v.siteId === siteId));
export const addVisitor = (vis: any) => { const newVis = {...vis, id: `vis_${Date.now()}`, siteId: 'site_123'}; visitors.push(newVis); return mockApi(newVis); };
export const updateVisitor = (id: string, updates: any) => { const i = visitors.findIndex(e=>e.id===id); if (i > -1) { visitors[i] = {...visitors[i], ...updates}; return mockApi(visitors[i]); } return mockApiError(404, 'Not found'); };
export const deleteVisitor = (id: string) => { const i = visitors.findIndex(e=>e.id===id); if (i > -1) { visitors.splice(i,1); return mockApi({success: true}); } return mockApiError(404, 'Not found'); };

export const phoneCallLogApi = createMockApi<PhoneCallLog>('phoneCallLog', phoneCallLogs);
export const getPhoneCallLogs = (siteId: string) => phoneCallLogApi.get(siteId);
export const addPhoneCallLog = (log: any) => phoneCallLogApi.add(log);
export const updatePhoneCallLog = (id: string, updates: any) => phoneCallLogApi.update(id, updates);
export const deletePhoneCallLog = (id: string) => phoneCallLogApi.delete(id);

export const postalDispatchApi = createMockApi<PostalDispatch>('postalDispatch', postalDispatches);
export const getPostalDispatches = (siteId: string) => postalDispatchApi.get(siteId);
export const addPostalDispatch = (data: any) => postalDispatchApi.add(data);
export const updatePostalDispatch = (id: string, updates: any) => postalDispatchApi.update(id, updates);
export const deletePostalDispatch = (id: string) => postalDispatchApi.delete(id);

export const postalReceiveApi = createMockApi<PostalReceive>('postalReceive', postalReceives);
export const getPostalReceives = (siteId: string) => postalReceiveApi.get(siteId);
export const addPostalReceive = (data: any) => postalReceiveApi.add(data);
export const updatePostalReceive = (id: string, updates: any) => postalReceiveApi.update(id, updates);
export const deletePostalReceive = (id: string) => postalReceiveApi.delete(id);

export const complaintApi = createMockApi<Complaint>('complaint', complaints);
export const getComplaints = (siteId: string) => complaintApi.get(siteId);
export const addComplaint = (data: any) => complaintApi.add(data);
export const updateComplaint = (id: string, updates: any) => complaintApi.update(id, updates);
export const deleteComplaint = (id: string) => complaintApi.delete(id);

export const visitorPurposeApi = createMockApi<SetupItem>('visitorPurpose', setupItems.visitorPurposes);
export const enquirySourceApi = createMockApi<SetupItem>('enquirySource', setupItems.enquirySources);
export const complaintTypeApi = createMockApi<SetupItem>('complaintType', setupItems.complaintTypes);
export const enquiryReferenceApi = createMockApi<SetupItem>('enquiryReference', setupItems.enquiryReferences);

// Exams
export const getExamGroups = (siteId: string) => mockApi(examGroups.filter(g => g.siteId === siteId));
export const addExamGroup = (group: any) => { examGroups.push({...group, id: `eg_${Date.now()}`, siteId: 'site_123'}); return mockApi(group); }
export const updateExamGroup = (id: string, updates: any) => { const i = examGroups.findIndex(g=>g.id===id); if(i>-1) { examGroups[i] = {...examGroups[i], ...updates}; return mockApi(examGroups[i]); } return mockApiError(404, 'Not found'); };
export const deleteExamGroup = (id: string) => { const i = examGroups.findIndex(g=>g.id===id); if(i>-1) { examGroups.splice(i,1); return mockApi({success: true}); } return mockApiError(404, 'Not found'); };
export const examScheduleApi = createMockApi<ExamSchedule>('examSchedule', examSchedules);
export const getExamSchedules = (siteId: string) => examScheduleApi.get(siteId);
export const marksGradeApi = createMockApi<MarksGrade>('marksGrade', marksGrades);
export const admitCardTemplateApi = createMockApi<AdmitCardTemplate>('admitCardTemplate', admitCardTemplates);
export const marksheetTemplateApi = createMockApi<MarksheetTemplate>('marksheetTemplate', marksheetTemplates);
export const getMarks = (siteId: string, scheduleId: string) => mockApi(marks.filter(m => m.examScheduleId === scheduleId));
export const saveMarks = (marksToSave: any[]) => mockApi(marksToSave);
export const onlineExamApi = createMockApi<OnlineExam>('onlineExam', onlineExams);
export const getOnlineExamResults = (siteId: string, examId: string) => mockApi(onlineExamResults.filter(r => r.onlineExamId === examId));
export const questionApi = createMockApi<Question>('question', questions);
export const batchAddStudents = (data: any) => mockApi({ successCount: 1, errorCount: 0, errors: [] });
export const feeTypeApi = createMockApi<FeeType>('feeType', feeTypes);
export const feeGroupApi = createMockApi<FeeGroup>('feeGroup', feeGroups);
export const feeMasterApi = createMockApi<FeeMaster>('feeMaster', feeMasters);
export const getFeeReminderLogs = (siteId: string) => mockApi(feeReminderLogs.filter(l => l.siteId === siteId));
export const sendFeeReminders = (studentIds: string[], channel: string) => mockApi({success: true});
export const expenseHeadApi = createMockApi<ExpenseHead>('expenseHead', expenseHeads);
export const incomeHeadApi = createMockApi<IncomeHead>('incomeHead', incomeHeads);
export const getExpenses = (siteId: string) => mockApi(expenses.filter(e => e.siteId === siteId));
export const addExpense = (exp: any) => { expenses.push({...exp, id: `exp_${Date.now()}`, siteId: 'site_123'}); return mockApi(exp); };
export const updateExpense = (id: string, updates: any) => mockApi(updates);
export const deleteExpense = (id: string) => mockApi({ success: true });
export const getIncomes = (siteId: string) => mockApi(incomes.filter(i => i.siteId === siteId));
export const addIncome = (inc: any) => { incomes.push({...inc, id: `inc_${Date.now()}`, siteId: 'site_123'}); return mockApi(inc); };
export const updateIncome = (id: string, updates: any) => mockApi(updates);
export const deleteIncome = (id: string) => mockApi({ success: true });

export const transportRouteApi = createMockApi<TransportRoute>('transportRoute', transportRoutes);
export const vehicleApi = createMockApi<Vehicle>('vehicle', vehicles);

export const hostelApi = createMockApi<Hostel>('hostel', hostels);
export const roomTypeApi = createMockApi<RoomType>('roomType', roomTypes);
export const hostelRoomApi = createMockApi<HostelRoom>('hostelRoom', hostelRooms);
export const roomAllocationApi = createMockApi<HostelAllocation>('roomAllocation', roomAllocations);

export const inventoryItemApi = createMockApi<InventoryItem>('inventoryItem', inventoryItems);
export const itemCategoryApi = createMockApi<ItemCategory>('itemCategory', itemCategories);
export const storeApi = createMockApi<Store>('store', stores);
export const supplierApi = createMockApi<Supplier>('supplier', suppliers);
export const stockReceiveApi = createMockApi<StockReceive>('stockReceive', stockReceives);
export const itemIssueApi = createMockApi<ItemIssue>('itemIssue', itemIssues);

export const libraryMemberApi = createMockApi<LibraryMember>('libraryMember', libraryMembers);
export const bookApi = createMockApi<Book>('book', books);
export const bookIssueApi = createMockApi<BookIssue>('bookIssue', bookIssues);

export const noticeApi = createMockApi<Notice>('notice', notices);
export const communicationLogApi = createMockApi<CommunicationLog>('communicationLog', communicationLogs);
export const homeworkApi = createMockApi<Homework>('homework', homeworks);
export const addHomework = (hw: any) => homeworkApi.add(hw);
export const getHomeworkSubmissions = (homeworkId: string) => mockApi(homeworkSubmissions.filter(s => s.homeworkId === homeworkId));
export const updateHomeworkSubmissions = (updates: any[]) => mockApi({ success: true });

export const assignmentApi = createMockApi<Assignment>('assignment', assignments);
export const assignmentSubmissionApi = createMockApi<AssignmentSubmission>('assignmentSubmission', assignmentSubmissions);

export const alumniEventApi = createMockApi<AlumniEvent>('alumniEvent', alumniEvents);
export const alumniEventRsvpApi = createMockApi<AlumniEventRSVP>('alumniEventRsvp', alumniEventRsvps);
export const alumniApi = createMockApi<Alumni>('alumni', alumni);
export const contentApi = createMockApi<Content>('content', content);

export const digitalAssetApi = createMockApi<DigitalAsset>('digitalAsset', digitalAssets);
export const getDigitalAssetById = (id: string) => digitalAssetApi.getById(id);
export const getDigitalViewToken = (assetId: string): Promise<DigitalViewToken> => mockApi({ src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', watermark: { userId: 'user_student', name: 'Student User', ts: Date.now() } });
export const logDigitalAudit = (payload: any) => mockApi({ success: true });

export const catchupClassApi = createMockApi<CatchupClass>('catchupClass', catchupClasses);
export const listCatchupClasses = (params: any) => catchupClassApi.get(params.siteId);
export const getCatchupClassById = (id: string) => catchupClassApi.getById(id);
export const getCatchupPlaybackToken = (catchupId: string): Promise<CatchupPlaybackToken> => mockApi({ src: 'M-V4sRsG-o8', host: 'YOUTUBE', rules: { minPct: 80, allowFwdWindowSec: 10 }, prompts: [{id: 'p1', catchupId, atSec: 120, text: 'Are you still watching?'}], quiz: { passPct: 60, questions: { items: [{q: 'Question 1?', options: ['A', 'B'], correct: 0}]} } });
export const postWatchBeat = (catchupId: string, payload: any) => mockApi({ ok: true });
export const postPromptAck = (promptId: string) => mockApi({ ok: true });
export const submitCatchupQuiz = (catchupId: string, answers: number[]): Promise<{ passed: boolean; scorePct: number }> => mockApi({ passed: true, scorePct: 100 });
export const finalizeCatchup = (catchupId: string): Promise<{ credited: boolean }> => mockApi({ credited: true });

export const idCardTemplateApi = createMockApi<IdCardTemplate>('idCardTemplate', idCardTemplates);