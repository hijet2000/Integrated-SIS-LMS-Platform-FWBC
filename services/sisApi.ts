// FIX: Created services/sisApi.ts to provide mock data and APIs, resolving module not found errors.
import { createMockApi, mockApi } from './api';
import type { 
    Student, Classroom, Guardian, StudentGuardian, FeeInvoice, Attendance, Grade, 
    Program, Subject, Curriculum, Teacher, Timetable, TimetableSlot, StudentLeaveApplication,
    CertificateTemplate, IssuedCertificate, IdCardTemplate, CommunicationLog, Notice,
    AdmissionEnquiry, Visitor, Complaint, PhoneCallLog, PostalDispatch, PostalReceive, SetupItem,
    FeeType, FeeGroup, FeeMaster, FeeReminderLog, Income, Expense, IncomeHead, ExpenseHead,
    OnlineExam, OnlineExamResult, Question, ExamGroup, ExamSchedule, Mark, MarksheetTemplate, AdmitCardTemplate, MarksGrade,
    Assignment, AssignmentSubmission, Homework, HomeworkSubmission, Content,
    LibraryMember, Book, BookIssue, DigitalAsset, CatchupClass, CatchupPlaybackToken,
    Hostel, HostelRoom, RoomType, HostelAllocation, TransportRoute, Vehicle,
    InventoryItem, ItemCategory, Store, Supplier, StockReceive, ItemIssue,
    Alumni, AlumniEvent, AlumniEventRSVP,
    CmsEvent, CmsEventRsvp, CmsAlbum, CmsPhoto, CmsNews, OnlineAdmissionApplication, MultiClassEnrollment
} from '@/types';

// --- MOCK DATA ---
const mockClassrooms: Classroom[] = [
    { id: 'cls_1', siteId: 'site_123', name: 'Grade 10 - Section A', programId: 'prog_hs', capacity: 30, tutorId: 'teacher_1', stream: 'Science' },
    { id: 'cls_2', siteId: 'site_123', name: 'Grade 10 - Section B', programId: 'prog_hs', capacity: 30, tutorId: 'teacher_2' },
    { id: 'cls_3', siteId: 'site_123', name: 'Grade 5', programId: 'prog_ms', capacity: 25, tutorId: 'teacher_3' },
];

const mockStudents: Student[] = [
    { id: 'std_1', siteId: 'site_123', firstName: 'John', lastName: 'Doe', admissionNo: 'ADM1001', rollNo: '10A-01', dob: '2008-05-10', gender: 'Male', email: 'john.doe@example.com', phone: '123-456-7890', address: { street: '123 Main St', city: 'Anytown', state: 'CA', zip: '12345' }, classroomId: 'cls_1', status: 'ENROLLED', photoUrl: 'https://i.pravatar.cc/150?u=std_1', health: { allergies: 'Peanuts', medications: '', conditions: '', notes: '' }, discipline: [] },
    { id: 'std_2', siteId: 'site_123', firstName: 'Jane', lastName: 'Smith', admissionNo: 'ADM1002', rollNo: '10A-02', dob: '2008-06-15', gender: 'Female', email: 'jane.smith@example.com', phone: '123-456-7891', address: { street: '456 Oak Ave', city: 'Anytown', state: 'CA', zip: '12345' }, classroomId: 'cls_1', status: 'ENROLLED', photoUrl: 'https://i.pravatar.cc/150?u=std_2', health: { allergies: '', medications: 'Inhaler', conditions: 'Asthma', notes: '' }, discipline: [] },
    { id: 'std_3', siteId: 'site_123', firstName: 'Peter', lastName: 'Jones', admissionNo: 'ADM1003', rollNo: '05-01', dob: '2013-02-20', gender: 'Male', email: 'peter.jones@example.com', phone: '123-456-7892', address: { street: '789 Pine Ln', city: 'Anytown', state: 'CA', zip: '12345' }, classroomId: 'cls_3', status: 'ENROLLED', photoUrl: 'https://i.pravatar.cc/150?u=std_3', health: { allergies: '', medications: '', conditions: '', notes: '' }, discipline: [] },
    { id: 'std_4', siteId: 'site_123', firstName: 'Mary', lastName: 'Williams', admissionNo: 'ADM1004', rollNo: '10B-01', dob: '2008-03-12', gender: 'Female', email: 'mary.w@example.com', phone: '123-456-7893', address: { street: '321 Elm St', city: 'Anytown', state: 'CA', zip: '12345' }, classroomId: 'cls_2', status: 'GRADUATED', photoUrl: null, health: { allergies: '', medications: '', conditions: '', notes: '' }, discipline: [] },
];

const mockGuardians: Guardian[] = [
    { id: 'grd_1', siteId: 'site_123', name: 'Robert Doe', email: 'robert.doe@example.com', phone: '234-567-8901', occupation: 'Engineer' },
    { id: 'grd_2', siteId: 'site_123', name: 'Maria Smith', email: 'maria.smith@example.com', phone: '234-567-8902', occupation: 'Doctor' },
];

const mockStudentGuardians: StudentGuardian[] = [
    { studentId: 'std_1', guardianId: 'grd_1', relation: 'Father', isPrimary: true },
    { studentId: 'std_2', guardianId: 'grd_2', relation: 'Mother', isPrimary: true },
];

const mockInvoices: FeeInvoice[] = [
    { id: 'inv_1', siteId: 'site_123', studentId: 'std_1', term: 'Term 1 Fees', amount: 1200, paidAmount: 1200, dueDate: '2024-08-01', status: 'PAID', paidOn: '2024-07-25', transactionId: 'TXN12345' },
    { id: 'inv_2', siteId: 'site_123', studentId: 'std_2', term: 'Term 1 Fees', amount: 1200, paidAmount: 600, dueDate: '2024-08-01', status: 'PARTIALLY_PAID' },
    { id: 'inv_3', siteId: 'site_123', studentId: 'std_3', term: 'Term 1 Fees', amount: 1000, paidAmount: 0, dueDate: '2024-08-01', status: 'OVERDUE' },
];

const mockAttendance: Attendance[] = [
    { id: 'att_1', siteId: 'site_123', studentId: 'std_1', date: '2024-09-02', status: 'PRESENT' },
    { id: 'att_2', siteId: 'site_123', studentId: 'std_2', date: '2024-09-02', status: 'LATE', reason: 'Traffic' },
    { id: 'att_3', siteId: 'site_123', studentId: 'std_1', date: '2024-09-03', status: 'ABSENT', reason: "Doctor's appointment" },
];

const mockTeachers: Teacher[] = [
    { id: 'teacher_1', siteId: 'site_123', name: 'Alice Johnson', email: 'alice.j@school.com', department: 'Science' },
    { id: 'teacher_2', siteId: 'site_123', name: 'Bob Williams', email: 'bob.w@school.com', department: 'Mathematics' },
    { id: 'teacher_3', siteId: 'site_123', name: 'Charlie Brown', email: 'charlie.b@school.com', department: 'English' },
];

// --- API FUNCTIONS ---
export const getStudents = (siteId: string): Promise<Student[]> => mockApi(mockStudents.filter(s => s.siteId === siteId));
export const getStudentById = (studentId: string): Promise<Student | undefined> => mockApi(mockStudents.find(s => s.id === studentId));
export const getClassrooms = (siteId: string): Promise<Classroom[]> => mockApi(mockClassrooms.filter(c => c.siteId === siteId));
export const getGuardians = (siteId: string): Promise<Guardian[]> => mockApi(mockGuardians.filter(g => g.siteId === siteId));
export const getStudentGuardians = (siteId: string): Promise<StudentGuardian[]> => mockApi(mockStudentGuardians);
export const getInvoices = (siteId: string): Promise<FeeInvoice[]> => mockApi(mockInvoices.filter(i => i.siteId === siteId));
export const getInvoicesForStudent = (studentId: string): Promise<FeeInvoice[]> => mockApi(mockInvoices.filter(i => i.studentId === studentId));
export const getAttendanceForClass = (classroomId: string, date: string): Promise<Attendance[]> => mockApi([]);
export const getStudentsByClassroom = (classroomId: string): Promise<Student[]> => mockApi(mockStudents.filter(s => s.classroomId === classroomId));
export const getTeachers = (siteId: string): Promise<Teacher[]> => mockApi(mockTeachers.filter(t => t.siteId === siteId));
export const getPrograms = (siteId: string): Promise<Program[]> => mockApi([{ id: 'prog_hs', siteId: 'site_123', name: 'High School', level: '9-12', duration: 4 }, { id: 'prog_ms', siteId: 'site_123', name: 'Middle School', level: '5-8', duration: 4 }]);
export const getSubjects = (siteId: string): Promise<Subject[]> => mockApi([{ id: 'sub_1', siteId: 'site_123', name: 'Physics', code: 'PHY101', type: 'Core', maxMarks: 100, passingMarks: 40 }]);
export const getCurricula = (siteId: string): Promise<Curriculum[]> => mockApi([{ id: 'cur_1', siteId: 'site_123', programId: 'prog_hs', year: 1, subjects: ['sub_1'], status: 'PUBLISHED' }]);
export const getGradesBySite = (siteId: string): Promise<Grade[]> => mockApi([{ id: 'grd_1', siteId: 'site_123', studentId: 'std_1', subjectName: 'Physics', itemName: 'Mid-term', score: 85, gradeLetter: 'A' }]);
export const getGradesForStudent = (studentId: string): Promise<Grade[]> => mockApi([]);
export const getGuardiansForStudent = (studentId: string): Promise<{ guardian: Guardian, relation: StudentGuardian }[]> => mockApi([]);
export const updateStudentHealthInfo = (studentId: string, healthInfo: any): Promise<Student> => mockApi(mockStudents[0]);
export const addDisciplineRecord = (studentId: string, record: any): Promise<Student> => mockApi(mockStudents[0]);
export const updateDisciplineRecord = (studentId: string, recordId: string, updates: any): Promise<Student> => mockApi(mockStudents[0]);
export const deleteDisciplineRecord = (studentId: string, recordId: string): Promise<Student> => mockApi(mockStudents[0]);
export const updateStudent = (studentId: string, updates: Partial<Student>): Promise<Student> => mockApi({ ...mockStudents.find(s=>s.id === studentId)!, ...updates });
export const getAttendanceForStudent = (studentId: string): Promise<Attendance[]> => mockApi(mockAttendance.filter(a => a.studentId === studentId));
export const deleteStudent = (studentId: string): Promise<{ success: boolean }> => mockApi({ success: true });
export const bulkDeleteStudents = (studentIds: string[]): Promise<{ success: boolean }> => mockApi({ success: true });
export const recordPayment = (invoiceId: string, amount: number, method: string): Promise<{ success: boolean }> => mockApi({ success: true });
export const saveAttendance = (records: any[]): Promise<{ success: boolean }> => mockApi({ success: true });
export const getAttendanceForDateRange = (classroomId: string, startDate: string, endDate: string): Promise<Attendance[]> => mockApi(mockAttendance);
export const getTimetableForClass = (classroomId: string): Promise<Timetable | undefined> => mockApi(undefined);
export const saveTimetableForClass = (classroomId: string, slots: TimetableSlot[]): Promise<Timetable> => mockApi({ id: 'tt_1', siteId: 'site_123', classroomId, slots });
export const getTimetables = (siteId: string): Promise<Timetable[]> => mockApi([]);
export const updateClassroom = (classroomId: string, updates: Partial<Classroom>): Promise<Classroom> => mockApi({ ...mockClassrooms.find(c => c.id === classroomId)!, ...updates });
export const getStudentLeaveApplications = (siteId: string): Promise<StudentLeaveApplication[]> => mockApi([]);
export const addStudentLeaveApplication = (application: any): Promise<StudentLeaveApplication> => mockApi({ id: 'leave_1', siteId: 'site_123', ...application });
export const updateStudentLeaveApplicationStatus = (id: string, status: any): Promise<StudentLeaveApplication> => mockApi({ id, siteId: 'site_123', studentId: 'std_1', fromDate: '', toDate: '', reason: '', appliedOn: '', status });
export const verifyCertificate = (serialId: string): Promise<IssuedCertificate | undefined> => mockApi(undefined);
export const getOnlineAdmissionApplications = (siteId: string): Promise<OnlineAdmissionApplication[]> => mockApi([]);
export const updateOnlineAdmissionApplicationStatus = (applicationId: string, status: any): Promise<OnlineAdmissionApplication> => mockApi({} as any);
export const addStudentAdmission = (data: { student: Omit<Student, 'id'|'siteId'>, father: Partial<Guardian>, mother: Partial<Guardian> }): Promise<Student> => mockApi({ id: 'std_new', siteId: 'site_123', ...data.student } as Student);
export const getAdmissionEnquiries = (siteId: string): Promise<AdmissionEnquiry[]> => mockApi([]);
export const addAdmissionEnquiry = (enquiry: any): Promise<AdmissionEnquiry> => mockApi({ id: 'enq_1', ...enquiry });
export const updateAdmissionEnquiry = (id: string, enquiry: any): Promise<AdmissionEnquiry> => mockApi({ id, ...enquiry });
export const deleteAdmissionEnquiry = (id: string): Promise<{ success: boolean }> => mockApi({ success: true });
export const getComplaints = (siteId: string): Promise<Complaint[]> => mockApi([]);
export const addComplaint = (complaint: any): Promise<Complaint> => mockApi({ id: 'comp_1', ...complaint });
export const updateComplaint = (id: string, complaint: any): Promise<Complaint> => mockApi({ id, ...complaint });
export const deleteComplaint = (id: string): Promise<{ success: boolean }> => mockApi({ success: true });
export const getPhoneCallLogs = (siteId: string): Promise<PhoneCallLog[]> => mockApi([]);
export const addPhoneCallLog = (log: any): Promise<PhoneCallLog> => mockApi({ id: 'call_1', ...log });
export const updatePhoneCallLog = (id: string, log: any): Promise<PhoneCallLog> => mockApi({ id, ...log });
export const deletePhoneCallLog = (id: string): Promise<{ success: boolean }> => mockApi({ success: true });
export const getPostalDispatches = (siteId: string): Promise<PostalDispatch[]> => mockApi([]);
export const addPostalDispatch = (dispatch: any): Promise<PostalDispatch> => mockApi({ id: 'pd_1', ...dispatch });
export const updatePostalDispatch = (id: string, dispatch: any): Promise<PostalDispatch> => mockApi({ id, ...dispatch });
export const deletePostalDispatch = (id: string): Promise<{ success: boolean }> => mockApi({ success: true });
export const getPostalReceives = (siteId: string): Promise<PostalReceive[]> => mockApi([]);
export const addPostalReceive = (record: any): Promise<PostalReceive> => mockApi({ id: 'pr_1', ...record });
export const updatePostalReceive = (id: string, record: any): Promise<PostalReceive> => mockApi({ id, ...record });
export const deletePostalReceive = (id: string): Promise<{ success: boolean }> => mockApi({ success: true });
export const getMultiClassEnrollments = (siteId: string): Promise<MultiClassEnrollment[]> => mockApi([]);
export const addMultiClassEnrollment = (enrollment: any): Promise<MultiClassEnrollment> => mockApi({ id: 'mce_1', ...enrollment });
export const deleteMultiClassEnrollment = (id: string): Promise<{ success: boolean }> => mockApi({ success: true });
export const batchAddStudents = (students: any[]): Promise<any> => mockApi({ successCount: students.length, errorCount: 0, errors: [] });
export const getExamGroups = (siteId: string): Promise<ExamGroup[]> => mockApi([]);
export const addExamGroup = (group: any): Promise<ExamGroup> => mockApi({ id: 'eg_1', ...group });
export const updateExamGroup = (id: string, group: any): Promise<ExamGroup> => mockApi({ id, ...group });
export const deleteExamGroup = (id: string): Promise<{ success: boolean }> => mockApi({ success: true });
export const getExamSchedules = (siteId: string): Promise<ExamSchedule[]> => mockApi([]);
export const getMarks = (siteId: string, scheduleId: string): Promise<Mark[]> => mockApi([]);
export const saveMarks = (marks: Omit<Mark, 'id'|'siteId'>[]): Promise<{ success: boolean }> => mockApi({ success: true });
export const getFeeReminderLogs = (siteId: string): Promise<FeeReminderLog[]> => mockApi([]);
export const sendFeeReminders = (studentIds: string[], channel: 'SMS' | 'Email'): Promise<{ success: boolean }> => mockApi({ success: true });
export const getIncomes = (siteId: string): Promise<Income[]> => mockApi([]);
export const addIncome = (income: any): Promise<Income> => mockApi({ id: 'inc_1', ...income });
export const updateIncome = (id: string, income: any): Promise<Income> => mockApi({ id, ...income });
export const deleteIncome = (id: string): Promise<{ success: boolean }> => mockApi({ success: true });
export const getExpenses = (siteId: string): Promise<Expense[]> => mockApi([]);
export const addExpense = (expense: any): Promise<Expense> => mockApi({ id: 'exp_1', ...expense });
export const updateExpense = (id: string, expense: any): Promise<Expense> => mockApi({ id, ...expense });
export const deleteExpense = (id: string): Promise<{ success: boolean }> => mockApi({ success: true });
export const getVisitors = (siteId: string): Promise<Visitor[]> => mockApi([]);
export const getOnlineExamResults = (siteId: string, examId: string): Promise<OnlineExamResult[]> => mockApi([]);
export const getHomeworkSubmissions = (homeworkId: string): Promise<HomeworkSubmission[]> => mockApi([]);
export const updateHomeworkSubmissions = (updates: Partial<HomeworkSubmission>[]): Promise<{ success: boolean }> => mockApi({ success: true });
export const addHomework = (homework: any): Promise<Homework> => mockApi({ id: 'hw_1', ...homework });
export const getDigitalAssetById = (assetId: string): Promise<DigitalAsset> => mockApi({ id: assetId, siteId: 'site_123', title: 'Sample Video', kind: 'VIDEO', subject: 'General', classId: 'cls_1', storageKey: 'M-V4sRsG-o8' });
export const getDigitalViewToken = (assetId: string): Promise<CatchupPlaybackToken> => mockApi({ jwt: 'token', src: 'M-V4sRsG-o8', host: 'YOUTUBE', rules: { minPct: 80, allowFwdWindowSec: 10 }, prompts: [], watermark: { userId: 'user_student', name: 'Student User', ts: new Date().toISOString() } });
export const logDigitalAudit = (payload: any): Promise<void> => mockApi(undefined);
export const getCatchupClassById = (catchupId: string): Promise<CatchupClass> => mockApi({ id: catchupId, siteId: 'site_123', title: 'Sample Catch-up', description: 'A recorded class', classId: 'cls_1', subjectId: 'sub_1', date: '2024-09-01', host: 'YOUTUBE', sourceKey: 'M-V4sRsG-o8', durationSec: 300, status: 'PUBLISHED' });
export const listCatchupClasses = (params: any): Promise<CatchupClass[]> => mockApi([]);
export const getCatchupPlaybackToken = (catchupId: string): Promise<CatchupPlaybackToken> => mockApi({ jwt: 'token', src: 'M-V4sRsG-o8', host: 'YOUTUBE', rules: { minPct: 80, allowFwdWindowSec: 10 }, prompts: [{ id: 'p1', atSec: 30, text: 'Are you paying attention?', catchupId }], quiz: { minPassPct: 70, questions: { items: [] } }, watermark: { userId: 'user_student', name: 'Student User', ts: new Date().toISOString() } });
export const postWatchBeat = (catchupId: string, payload: any): Promise<void> => mockApi(undefined);
export const postPromptAck = (promptId: string): Promise<void> => mockApi(undefined);
export const submitCatchupQuiz = (catchupId: string, answers: number[]): Promise<{ passed: boolean; scorePct: number }> => mockApi({ passed: true, scorePct: 100 });
export const finalizeCatchup = (catchupId: string): Promise<{ credited: boolean }> => mockApi({ credited: true });

// --- MOCK API FACTORIES ---
export const studentCategoryApi = createMockApi<SetupItem>('studentCategory', []);
export const studentHouseApi = createMockApi<SetupItem>('studentHouse', []);
export const disableReasonApi = createMockApi<SetupItem>('disableReason', []);
export const visitorPurposeApi = createMockApi<SetupItem>('visitorPurpose', []);
export const enquirySourceApi = createMockApi<SetupItem>('enquirySource', []);
export const complaintTypeApi = createMockApi<SetupItem>('complaintType', []);
export const enquiryReferenceApi = createMockApi<SetupItem>('enquiryReference', []);
export const incomeHeadApi = createMockApi<IncomeHead>('incomeHead', []);
export const expenseHeadApi = createMockApi<ExpenseHead>('expenseHead', []);
export const programApi = createMockApi<Program>('program', []);
export const classroomApi = createMockApi<Classroom>('classroom', mockClassrooms);
export const subjectApi = createMockApi<Subject>('subject', []);
// FIX: Added missing mock API exports
export const feeTypeApi = createMockApi<FeeType>('feeType', []);
export const feeGroupApi = createMockApi<FeeGroup>('feeGroup', []);
export const feeMasterApi = createMockApi<FeeMaster>('feeMaster', []);
export const examScheduleApi = createMockApi<ExamSchedule>('examSchedule', []);
export const subjectGroupApi = createMockApi<any>('subjectGroup', []);
export const admitCardTemplateApi = createMockApi<AdmitCardTemplate>('admitCardTemplate', []);
export const marksheetTemplateApi = createMockApi<MarksheetTemplate>('marksheetTemplate', []);
export const marksGradeApi = createMockApi<MarksGrade>('marksGrade', []);
export const onlineExamApi = createMockApi<OnlineExam>('onlineExam', []);
export const questionApi = createMockApi<Question>('question', []);
export const transportRouteApi = createMockApi<TransportRoute>('transportRoute', []);
export const vehicleApi = createMockApi<Vehicle>('vehicle', []);
export const hostelApi = createMockApi<Hostel>('hostel', []);
export const roomTypeApi = createMockApi<RoomType>('roomType', []);
export const hostelRoomApi = createMockApi<HostelRoom>('hostelRoom', []);
export const roomAllocationApi = createMockApi<HostelAllocation>('roomAllocation', []);
export const inventoryItemApi = createMockApi<InventoryItem>('inventoryItem', []);
export const itemCategoryApi = createMockApi<ItemCategory>('itemCategory', []);
export const storeApi = createMockApi<Store>('store', []);
export const supplierApi = createMockApi<Supplier>('supplier', []);
export const stockReceiveApi = createMockApi<StockReceive>('stockReceive', []);
export const itemIssueApi = createMockApi<ItemIssue>('itemIssue', []);
export const homeworkApi = createMockApi<Homework>('homework', []);
export const assignmentApi = createMockApi<Assignment>('assignment', []);
export const assignmentSubmissionApi = createMockApi<AssignmentSubmission>('assignmentSubmission', []);
export const contentApi = createMockApi<Content>('content', []);
export const libraryMemberApi = createMockApi<LibraryMember>('libraryMember', []);
export const bookApi = createMockApi<Book>('book', []);
export const bookIssueApi = createMockApi<BookIssue>('bookIssue', []);
export const digitalAssetApi = createMockApi<DigitalAsset>('digitalAsset', []);
export const catchupClassApi = createMockApi<CatchupClass>('catchupClass', []);
export const certificateTemplateApi = createMockApi<CertificateTemplate>('certificateTemplate', []);
export const issuedCertificateApi = createMockApi<IssuedCertificate>('issuedCertificate', []);
export const idCardTemplateApi = createMockApi<IdCardTemplate>('idCardTemplate', []);
export const communicationLogApi = createMockApi<CommunicationLog>('communicationLog', []);
export const noticeApi = createMockApi<Notice>('notice', []);
export const alumniApi = createMockApi<Alumni>('alumni', []);
export const alumniEventApi = createMockApi<AlumniEvent>('alumniEvent', []);
export const alumniEventRsvpApi = createMockApi<AlumniEventRSVP>('alumniEventRsvp', []);
export const cmsEventApi = createMockApi<CmsEvent>('cmsEvent', []);
export const cmsEventRsvpApi = createMockApi<CmsEventRsvp>('cmsEventRsvp', []);
export const cmsAlbumApi = createMockApi<CmsAlbum>('cmsAlbum', []);
export const cmsPhotoApi = createMockApi<CmsPhoto>('cmsPhoto', []);
export const cmsNewsApi = createMockApi<CmsNews>('cmsNews', []);
