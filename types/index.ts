// FIX: Define and export all types here instead of circular import.

// --- Basic & Auth Types ---
export type Role = 'school_admin' | 'teacher' | 'bursar' | 'student' | 'lms_admin' | 'super_admin' | 'librarian' | 'front_desk';
export type Action = 'create' | 'read' | 'update' | 'delete' | 'pay' | 'export';
export type Resource = 
    | 'school.students' | 'student.bulk' | 'student.categories' | 'student.online-admission' | 'student.admission' | 'student.multi-class'
    | 'school.academics' | 'academics.assign-teacher' | 'academics.promote' | 'academics.subjects' | 'academics.timetable'
    | 'school.attendance' | 'attendance.reports' | 'attendance.approve-leave'
    | 'school.faculty'
    | 'school.fees' | 'fees.master' | 'fees.reminders' | 'fees.search'
    | 'school.grades'
    | 'edu.courses' | 'edu.assignments' | 'edu.curriculum' | 'edu.quizzes' | 'edu.resources'
    | 'settings.roles'
    | 'frontoffice.enquiry' | 'frontoffice.visitors' | 'frontoffice.calls' | 'frontoffice.postal' | 'frontoffice.complaints' | 'frontoffice.setup'
    | 'finance.expenses' | 'finance.income'
    | 'inventory' | 'hostel' | 'transport'
    | 'library' | 'library.members' | 'library.issue-return' | 'library.digital' | 'library.catchup'
    | 'homework'
    | 'communicate.notices' | 'communicate.send' | 'communicate.logs'
    | 'downloads.content'
    | 'exams.schedule' | 'exams.result' | 'exams.grades' | 'exams.admit-card' | 'exams.marksheet'
    | 'online-exams' | 'online-exams.result' | 'online-exams.question-bank'
    | 'alumni.manage' | 'alumni.events'
    | 'certificate.generate' | 'certificate.id-card-designer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  siteId: string;
}

export const ROLES: Role[] = [
    'school_admin',
    'teacher',
    'bursar',
    'student',
    'lms_admin',
    'super_admin',
    'librarian',
    'front_desk',
];

type PermissionsMap = {
    [key in Role]?: {
        [key in Resource]?: Action[];
    };
};

export const PERMISSIONS: PermissionsMap = {
    super_admin: {
        // Super admin has all permissions implicitly, handled in useCan
    },
    school_admin: {
        'school.students': ['create', 'read', 'update', 'delete', 'export'],
        'student.bulk': ['delete'],
        'student.categories': ['create', 'read', 'update', 'delete'],
        'student.online-admission': ['read', 'update'],
        'student.admission': ['create'],
        'student.multi-class': ['create', 'read', 'update', 'delete'],
        'school.academics': ['create', 'read', 'update', 'delete'],
        'academics.assign-teacher': ['read', 'update'],
        'academics.promote': ['read', 'update'],
        'academics.subjects': ['read', 'create', 'update', 'delete'],
        'academics.timetable': ['read', 'update'],
        'school.attendance': ['create', 'read', 'update', 'delete'],
        'attendance.reports': ['read', 'export'],
        'attendance.approve-leave': ['create', 'read', 'update'],
        'school.faculty': ['create', 'read', 'update', 'delete'],
        'school.fees': ['read', 'pay'],
        'fees.master': ['create', 'read', 'update', 'delete'],
        'fees.reminders': ['create', 'read'],
        'fees.search': ['read'],
        'school.grades': ['create', 'read', 'update', 'delete'],
        'edu.courses': ['create', 'read', 'update', 'delete'],
        'edu.assignments': ['create', 'read', 'update', 'delete'],
        'edu.curriculum': ['create', 'read', 'update', 'delete'],
        'edu.quizzes': ['create', 'read', 'update', 'delete'],
        'edu.resources': ['create', 'read', 'update', 'delete', 'pay'],
        'settings.roles': ['read'],
        'frontoffice.enquiry': ['create', 'read', 'update', 'delete'],
        'frontoffice.visitors': ['create', 'read', 'update', 'delete'],
        'frontoffice.calls': ['create', 'read', 'update', 'delete'],
        'frontoffice.postal': ['create', 'read', 'update', 'delete'],
        'frontoffice.complaints': ['create', 'read', 'update', 'delete'],
        'frontoffice.setup': ['create', 'read', 'update', 'delete'],
        'finance.expenses': ['create', 'read', 'update', 'delete'],
        'finance.income': ['create', 'read', 'update', 'delete'],
        'inventory': ['update'],
        'hostel': ['update'],
        'transport': ['update'],
        'library': ['create', 'read', 'update', 'delete'],
        'library.members': ['create', 'read', 'update', 'delete'],
        'library.issue-return': ['create', 'read', 'update'],
        'library.digital': ['create', 'read', 'update', 'delete'],
        'library.catchup': ['create', 'read', 'update', 'delete'],
        'homework': ['read', 'update'],
        'communicate.notices': ['create', 'read', 'update', 'delete'],
        'communicate.send': ['create'],
        'communicate.logs': ['read', 'export'],
        'downloads.content': ['create', 'read', 'update', 'delete'],
        'exams.schedule': ['create', 'read', 'update', 'delete'],
        'exams.result': ['create', 'read'],
        'exams.grades': ['create', 'read', 'update', 'delete'],
        'exams.admit-card': ['create', 'read', 'update', 'delete'],
        'exams.marksheet': ['create', 'read', 'update', 'delete'],
        'online-exams': ['create', 'read', 'update', 'delete'],
        'online-exams.result': ['read'],
        'online-exams.question-bank': ['update'],
        'alumni.manage': ['update'],
        'alumni.events': ['update'],
        'certificate.generate': ['create', 'read'],
        'certificate.id-card-designer': ['create', 'read', 'update', 'delete'],
    },
    teacher: {
        'school.students': ['read'],
        'school.academics': ['read'],
        'school.attendance': ['create', 'read'],
        'edu.courses': ['read', 'update'],
        'edu.assignments': ['read', 'update'],
        'homework': ['update'],
        'library.digital': ['read'],
        'library.catchup': ['read'],
        'downloads.content': ['read'],
        'communicate.notices': ['read'],
        'communicate.logs': ['read'],
        'certificate.generate': ['read'],
    },
    bursar: {
        'school.fees': ['read', 'pay'],
        'fees.master': ['read'],
        'fees.reminders': ['create', 'read'],
        'fees.search': ['read'],
        'finance.expenses': ['create', 'read', 'update', 'delete'],
        'finance.income': ['create', 'read', 'update', 'delete'],
    },
    student: {
        'school.attendance': ['read'],
        'school.fees': ['read'],
        'school.grades': ['read'],
        'edu.courses': ['read'],
        'edu.assignments': ['read'],
        'edu.resources': ['read', 'pay'],
        'library': ['read'],
        'library.digital': ['read'],
        'library.catchup': ['read'],
        'homework': ['read'],
        'communicate.notices': ['read'],
        'downloads.content': ['read'],
    },
    lms_admin: {
        'edu.courses': ['create', 'read', 'update', 'delete'],
        'edu.assignments': ['create', 'read', 'update', 'delete'],
        'edu.curriculum': ['create', 'read', 'update', 'delete'],
        'edu.quizzes': ['create', 'read', 'update', 'delete'],
        'edu.resources': ['create', 'read', 'update', 'delete'],
    },
    librarian: {
        'library': ['create', 'read', 'update', 'delete'],
        'library.members': ['create', 'read', 'update', 'delete'],
        'library.issue-return': ['create', 'read', 'update'],
        'library.digital': ['create', 'read', 'update', 'delete'],
        'library.catchup': ['create', 'read', 'update', 'delete'],
    },
    front_desk: {
        'frontoffice.enquiry': ['create', 'read', 'update'],
        'frontoffice.visitors': ['create', 'read', 'update'],
        'frontoffice.calls': ['create', 'read', 'update'],
        'frontoffice.postal': ['create', 'read', 'update'],
        'frontoffice.complaints': ['create', 'read', 'update'],
        'communicate.notices': ['read'],
    }
};

// --- SIS Domain Types ---

export interface Address {
    street: string;
    city: string;
    state: string;
    zip: string;
}

export interface HealthInfo {
    allergies: string;
    medications: string;
    conditions: string;
    notes: string;
}

export interface DisciplineRecord {
    id: string;
    date: string;
    incident: string;
    actionTaken: string;
    reportedBy: string; // teacherId or adminId
}

export type StudentStatus = 'ENROLLED' | 'TRANSFERRED' | 'GRADUATED' | 'ARCHIVED';

export interface Student {
    id: string;
    siteId: string;
    admissionNo: string;
    rollNo: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dob: string;
    gender: 'Male' | 'Female' | 'Other';
    classroomId: string;
    status: StudentStatus;
    photoUrl?: string;
    address: Address;
    health: HealthInfo;
    discipline: DisciplineRecord[];
    // Extended fields for specific modules
    bloodGroup?: string;
    category?: string;
    nationality?: string;
    admissionDate?: string;
}

export interface Classroom {
  id: string;
  siteId: string;
  name: string;
  programId: string;
  capacity: number;
  tutorId?: string;
  stream?: string;
}

export interface Guardian {
    id: string;
    siteId: string;
    name: string;
    email: string;
    phone: string;
    occupation: string;
}

export interface StudentGuardian {
    id: string;
    siteId: string;
    studentId: string;
    guardianId: string;
    relation: 'Father' | 'Mother' | 'Guardian';
    isPrimary: boolean;
}

export interface FeeInvoice {
    id: string;
    siteId: string;
    studentId: string;
    term: string;
    amount: number;
    paidAmount: number;
    dueDate: string;
    status: 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID' | 'CANCELLED';
    paidOn?: string;
    transactionId?: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export interface Attendance {
    id: string;
    siteId: string;
    studentId: string;
    date: string;
    status: AttendanceStatus;
    reason: string | null;
}

export interface Program {
    id: string;
    siteId: string;
    name: string;
    code: string;
    level: string;
    duration: number;
    session: string;
    feeGroupId: string;
}

export interface Subject {
    id: string;
    siteId: string;
    name: string;
    code: string;
    maxMarks: number;
    passingMarks: number;
    type: 'Core' | 'Elective' | 'Practical' | 'Theory';
    teacherId?: string;
}

export interface Curriculum {
    id: string;
    siteId: string;
    programId: string;
    year: number;
    subjects: string[]; // array of subject IDs
    status: 'DRAFT' | 'PUBLISHED';
}

export interface Teacher {
    id: string;
    siteId: string;
    name: string;
    email: string;
    department: string;
}

export interface Grade {
    id: string;
    siteId: string;
    studentId: string;
    subjectName: string;
    itemName: string; // e.g., Mid-Term, Quiz 1
    score: number;
    gradeLetter: string;
}

export type StudentLeaveApplicationStatus = 'Pending' | 'Approved' | 'Rejected';
export interface StudentLeaveApplication {
    id: string;
    siteId: string;
    studentId: string;
    fromDate: string;
    toDate: string;
    reason: string;
    status: StudentLeaveApplicationStatus;
    appliedOn: string;
}

export type OnlineAdmissionApplicationStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Converted';
export interface OnlineAdmissionApplication {
    id: string;
    siteId: string;
    applicantFirstName: string;
    applicantLastName: string;
    applicantDob: string;
    applicantGender: 'Male' | 'Female' | 'Other';
    classSought: string;
    guardianName: string;
    guardianRelation: string;
    guardianPhone: string;
    guardianEmail: string;
    submissionDate: string;
    status: OnlineAdmissionApplicationStatus;
    notes?: string;
}

export type AdmissionEnquiryStatus = 'ACTIVE' | 'PASSIVE' | 'DEAD' | 'WON' | 'LOST';
export type AdmissionEnquirySourceValue = 'Online' | 'Phone' | 'Walk-in' | 'Referral' | 'Letter' | 'Other';

export interface AdmissionEnquiry {
    id: string;
    siteId: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    description?: string;
    note?: string;
    enquiryDate: string;
    nextFollowUpDate?: string;
    assignedTo?: string; // teacherId
    reference?: string;
    source: AdmissionEnquirySourceValue;
    classSought: string;
    numberOfChildren: number;
    status: AdmissionEnquiryStatus;
}

export interface Visitor {
    id: string;
    siteId: string;
    purpose: string;
    name: string;
    phone: string;
    toMeet: string; // staff name
    numberOfPersons: number;
    checkIn: string; // ISO datetime
    checkOut?: string; // ISO datetime
    notes?: string;
}

export type CallTypeValue = 'Incoming' | 'Outgoing';
export interface PhoneCallLog {
    id: string;
    siteId: string;
    callType: CallTypeValue;
    name: string;
    phone: string;
    date: string; // ISO datetime
    callDuration?: string;
    purpose: string;
    description?: string;
    assignedTo?: string; // staffId
    nextFollowUpDate?: string;
}

export type DispatchMode = 'Post' | 'Courier' | 'Hand Delivery' | 'Other';
export interface PostalDispatch {
    id: string;
    siteId: string;
    toTitle: string;
    referenceNo: string;
    address: string;
    fromTitle: string;
    dispatchDate: string;
    mode: DispatchMode;
    trackingNumber?: string;
    charges?: number;
    notes?: string;
}

export interface PostalReceive {
    id: string;
    siteId: string;
    fromTitle: string;
    referenceNo: string;
    toTitle: string;
    receiveDate: string;
    mode: DispatchMode;
    docType?: string;
    notes?: string;
    acknowledged: boolean;
}

export type ComplaintPriority = 'Low' | 'Medium' | 'High';
export type ComplaintStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export interface Complaint {
    id: string;
    siteId: string;
    complainantName: string;
    phone: string;
    complaintType: string;
    source: string;
    date: string;
    description: string;
    priority: ComplaintPriority;
    assignedTo?: string; // staffId
    actionTaken?: string;
    status: ComplaintStatus;
}

export interface SetupItem {
    id: string;
    siteId: string;
    name: string;
    description?: string;
}

export interface ExamGroup {
    id: string;
    siteId: string;
    name: string;
    examType: 'Term' | 'Test' | 'Final';
}

export interface ExamSchedule {
    id: string;
    siteId: string;
    examGroupId: string;
    classroomId: string;
    subjectId: string;
    examDate: string;
    startTime: string;
    endTime: string;
    roomNo: string;
    maxMarks: number;
    minMarks: number;
    invigilatorId?: string;
}

export interface Mark {
    id: string;
    siteId: string;
    studentId: string;
    examScheduleId: string;
    marksObtained: number;
}

export interface MarksGrade {
    id: string;
    siteId: string;
    name: string;
    minPercentage: number;
    description: string;
}

export interface AdmitCardTemplate {
    id: string;
    siteId: string;
    name: string;
    settings: {
        showPhoto: boolean;
        showGuardian: boolean;
        showAddress: boolean;
        showTimetable: boolean;
        showQRCode: boolean;
        instructions: string;
    };
}

export interface MarksheetTemplate {
    id: string;
    siteId: string;
    name: string;
    settings: {
        showPhoto: boolean;
        showRank: boolean;
        showAttendance: boolean;
        showGradePoint: boolean;
        teacherRemarks: boolean;
        principalSignature: boolean;
    };
}

export type OnlineExamStatus = 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';
export interface OnlineExam {
    id: string;
    siteId: string;
    title: string;
    classroomId: string;
    subjectId: string;
    examDate: string;
    startTime: string;
    duration: number; // in minutes
    totalMarks: number;
    passingMarks: number;
    status: OnlineExamStatus;
}

export interface OnlineExamResult {
    id: string;
    siteId: string;
    onlineExamId: string;
    studentId: string;
    score: number;
}

export type QuestionType = 'MCQ' | 'True/False' | 'Short Answer' | 'Long Answer';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export interface Question {
    id: string;
    siteId: string;
    question: string;
    type: QuestionType;
    subjectId: string;
    classroomId: string;
    options: string[];
    correctAnswers: number[]; // indices of correct options
    marks: number;
    difficulty: Difficulty;
}

export interface MultiClassEnrollment {
    id: string;
    siteId: string;
    studentId: string;
    classroomId: string;
}

export interface FeeType extends SetupItem {}
export interface FeeGroup {
    id: string;
    siteId: string;
    name: string;
    feeTypeIds: string[];
}
export interface FeeMaster {
    id: string;
    siteId: string;
    feeGroupId: string;
    classroomId: string;
    amount: number;
    dueDate: string;
}

export interface FeeReminderLog {
    id: string;
    siteId: string;
    studentId: string;
    channel: 'SMS' | 'Email';
    dateSent: string;
    status: 'Sent' | 'Failed';
}

export interface ExpenseHead extends SetupItem {}
export interface Expense {
    id: string;
    siteId: string;
    expenseHeadId: string;
    name: string;
    amount: number;
    expenseDate: string;
    description?: string;
    enteredBy: string; // userId
    proofUrl?: string;
}

export interface IncomeHead extends SetupItem {}
export interface Income {
    id: string;
    siteId: string;
    incomeHeadId: string;
    name: string;
    amount: number;
    incomeDate: string;
    description?: string;
    enteredBy: string; // userId
    proofUrl?: string;
}

export interface TransportRoute extends SetupItem {}
export interface Vehicle {
    id: string;
    siteId: string;
    registrationNo: string;
    type: 'Bus' | 'Van' | 'Car';
    capacity: number;
    fuelType: 'Petrol' | 'Diesel' | 'Electric';
    driverId?: string; // teacherId
    isAvailable: boolean;
}

export interface Hostel extends SetupItem {
    type: 'Boys' | 'Girls';
    address: string;
    intake: number;
}
export interface RoomType extends SetupItem {
    bedCapacity: number;
}
export interface HostelRoom {
    id: string;
    siteId: string;
    hostelId: string;
    roomTypeId: string;
    roomNumber: string;
    capacity: number;
    costPerBed: number;
    status: 'Available' | 'Occupied' | 'Maintenance';
}
export interface HostelAllocation {
    id: string;
    siteId: string;
    studentId: string;
    roomId: string;
    allocatedOn: string;
}

export interface InventoryItem extends SetupItem {
    categoryId: string;
    unit: string;
    minStockLevel: number;
}
export interface ItemCategory extends SetupItem {}
export interface Store extends SetupItem {}
export interface Supplier extends SetupItem {}
export interface StockReceive {
    id: string;
    siteId: string;
    itemId: string;
    supplierId?: string;
    storeId: string;
    quantity: number;
    purchasePrice?: number;
    date: string;
}
export interface ItemIssue {
    id: string;
    siteId: string;
    itemId: string;
    issueTo: string; // userId
    quantity: number;
    issueDate: string;
}

export type LibraryMemberStatus = 'Active' | 'Suspended' | 'Inactive';
export interface LibraryMember {
    id: string;
    siteId: string;
    userId: string;
    memberType: 'Student' | 'Teacher';
    libraryCardNo: string;
    status: LibraryMemberStatus;
}

export interface Book {
    id: string;
    siteId: string;
    title: string;
    author: string;
    isbn: string;
    publisher: string;
    year: number;
    edition: string;
    category: string;
    language: string;
    quantity: number;
    available: number;
    shelf: string;
    coverUrl?: string;
}

export interface BookIssue {
    id: string;
    siteId: string;
    bookId: string;
    memberId: string;
    issueDate: string;
    dueDate: string;
    returnDate?: string;
    status: 'Issued' | 'Returned' | 'Lost';
}

export type Priority = 'Urgent' | 'Regular' | 'Info';
export type Audience = 'All' | 'Students' | 'Staff' | 'Parents' | 'Class';
export interface Notice {
    id: string;
    siteId: string;
    title: string;
    description: string;
    publishDate: string;
    expiryDate?: string;
    priority: Priority;
    audience: Audience;
    audienceIds?: string[]; // e.g., classroom IDs
    attachmentUrl?: string;
    fileName?: string;
    createdBy: string; // userId
    createdAt: string; // ISO datetime
}

export type CommunicationLogStatus = 'Pending' | 'Sent' | 'Delivered' | 'Failed';
export interface CommunicationLog {
    id: string;
    siteId: string;
    channel: 'Notice' | 'Email' | 'SMS';
    senderId: string;
    recipientsDescription: string;
    subject?: string;
    messageSnippet: string;
    fullMessage: string;
    sentAt: string; // ISO datetime
    status: CommunicationLogStatus;
    failureReason?: string;
}

export type HomeworkStatus = 'Pending' | 'Evaluated';
export interface Homework {
    id: string;
    siteId: string;
    classroomId: string;
    subjectId: string;
    title: string;
    description: string;
    assignDate: string;
    dueDate: string;
    attachmentUrl?: string;
    status?: HomeworkStatus;
    createdBy: string; // teacherId
}

export type SubmissionStatus = 'Assigned' | 'Submitted' | 'Late' | 'Graded';
export interface HomeworkSubmission {
    id: string;
    siteId: string;
    homeworkId: string;
    studentId: string;
    submissionDate?: string;
    status: SubmissionStatus;
    attachmentUrl?: string;
    marks?: number;
    remarks?: string;
}

export type ContentCategory = 'Syllabus' | 'Class Notes' | 'Revision Guide' | 'Supplementary Reading' | 'Lab Manual' | 'Assignment Resource' | 'Circular' | 'Policy' | 'Form' | 'Miscellaneous';
export interface Content {
    id: string;
    siteId: string;
    title: string;
    description?: string;
    classroomId: string;
    subjectId?: string;
    category: ContentCategory;
    accessLevel: 'Public' | 'Restricted';
    attachmentUrl: string;
    fileName: string;
    uploadedBy: string; // userId
    createdAt: string; // ISO datetime
}

export interface Assignment {
    id: string;
    siteId: string;
    classroomId: string;
    subjectId: string;
    title: string;
    dueDate: string;
    attachmentUrl?: string;
    fileName?: string;
}
export interface AssignmentSubmission {
    id: string;
    siteId: string;
    assignmentId: string;
    studentId: string;
    submissionDate?: string;
    status: SubmissionStatus;
    attachmentUrl?: string;
    marks?: number;
    remarks?: string;
}

export type AlumniEventType = 'Reunion' | 'Career Fair' | 'Fundraiser' | 'Webinar' | 'Other';
export interface AlumniEvent {
    id: string;
    siteId: string;
    title: string;
    description: string;
    eventDate: string; // ISO datetime
    venue: string;
    eventType: AlumniEventType;
    rsvpRequired: boolean;
    ticketPrice?: number;
}
export interface AlumniEventRSVP {
    id: string;
    siteId: string;
    eventId: string;
    alumniId: string;
    status: 'Attending' | 'Maybe' | 'Not Attending';
}
export interface Alumni {
    id: string;
    siteId: string;
    name: string;
    studentId?: string;
    graduationYear: number;
    lastClassroomId: string;
    email?: string;
    phone?: string;
    occupation?: string;
    organization?: string;
}

export type DigitalKind = 'EBOOK' | 'AUDIO' | 'VIDEO';
export interface DigitalAsset {
    id: string;
    siteId: string;
    title: string;
    subject?: string;
    classId?: string;
    kind: DigitalKind;
    storageKey: string; // URL, path, etc.
    coverUrl?: string;
    drm: 'NONE' | 'FAIRPLAY' | 'WIDEVINE';
}

export interface DigitalViewToken {
    src: string;
    watermark: {
        userId: string;
        name: string;
        ts: number;
    };
}
export type VideoHost = 'YOUTUBE' | 'SELF';
export interface CatchupClass {
    id: string;
    siteId: string;
    title: string;
    description?: string;
    classId: string;
    subjectId: string;
    date: string;
    host: VideoHost;
    sourceKey: string;
    durationSec: number;
    status: 'DRAFT' | 'PUBLISHED';
}
export interface CatchupPrompt {
    id: string;
    catchupId: string;
    atSec: number;
    text: string;
}
export interface CatchupQuiz {
    passPct: number;
    questions: {
        items: {
            q: string;
            options: string[];
            correct: number;
        }[];
    };
}
export interface CatchupPlaybackToken {
    src: string;
    host: VideoHost;
    rules: {
        minPct: number;
        allowFwdWindowSec: number;
    };
    prompts: CatchupPrompt[];
    quiz?: CatchupQuiz;
}

export interface IdCardTemplate {
    id: string;
    siteId: string;
    name: string;
    type: 'Student' | 'Staff';
    backgroundColor: string;
    textColor: string;
    backgroundImageUrl?: string;
    logoUrl?: string;
    showPhoto: boolean;
    showQRCode: boolean;
    showBloodGroup: boolean;
    showGuardian: boolean;
    showValidity: boolean;
}

// --- LMS Domain Types ---

export interface Course {
    id: string;
    siteId: string;
    code: string;
    title: string;
    description: string;
    status: 'OPEN' | 'CLOSED' | 'DRAFT';
    visibility: 'SITE' | 'PUBLIC' | 'PRIVATE';
    teachers: string[]; // array of user IDs
}

export interface Module {
    id: string;
    siteId: string;
    courseId: string;
    title: string;
    orderIndex: number;
    summary: string;
}

export interface Lesson {
    id: string;
    siteId: string;
    moduleId: string;
    title: string;
    orderIndex: number;
    contentHtml: string;
    status: 'DRAFT' | 'PUBLISHED';
}

export interface EduCurriculum {
    id: string;
    siteId: string;
    version: string;
    status: 'DRAFT' | 'PUBLISHED';
    objectives: string[];
}

export interface EduAssignment {
    id: string;
    siteId: string;
    courseId: string;
    title: string;
    dueAt: string;
    totalMarks: number;
}

export interface Quiz {
    id: string;
    siteId: string;
    courseId: string;
    title: string;
    published: boolean;
    timeLimit: number; // in minutes
}

export interface EduResource {
    id: string;
    siteId: string;
    title: string;
    type: 'PDF' | 'Video' | 'Link' | 'File';
    url: string;
    access: 'FREE' | 'PAID';
    price?: number;
}


// Timetable
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface TimetableSlot {
    dayOfWeek: DayOfWeek;
    period: number;
    subjectId: string;
    teacherId: string;
    room?: string;
}

export interface Timetable {
    id: string;
    siteId: string;
    classroomId: string;
    slots: TimetableSlot[];
}

// Student Categories
export interface SubjectGroup {
  id: string;
  siteId: string;
  name: string;
  classroomId: string;
  subjectIds: string[];
  description: string;
}
