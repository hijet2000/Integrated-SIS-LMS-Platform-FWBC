// FIX: Created types/index.ts to define all application types and resolve module not found errors.
import type { NavItem as NavigationItem } from './navigation';

// --- Core Auth & Permissions ---
export type Role = 'school_admin' | 'teacher' | 'bursar' | 'student' | 'lms_admin' | 'super_admin' | 'librarian' | 'front_desk';
export type Scope = 'school:read' | 'school:write' | 'school:admin';
export type NavItem = NavigationItem;

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  siteId: string;
  scopes: Scope[];
};

// --- SIS (School Information System) ---

export type StudentStatus = 'ENROLLED' | 'TRANSFERRED' | 'GRADUATED' | 'ARCHIVED';

export interface Student {
  id: string;
  siteId: string;
  firstName: string;
  lastName: string;
  admissionNo: string;
  rollNo: string;
  dob: string; // YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Other';
  email: string | null;
  phone: string | null;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  classroomId: string;
  status: StudentStatus;
  photoUrl: string | null;
  health: HealthInfo;
  discipline: DisciplineRecord[];
}

export interface Guardian {
  id: string;
  siteId: string;
  name: string;
  email: string | null;
  phone: string | null;
  occupation: string | null;
}

export interface StudentGuardian {
  studentId: string;
  guardianId: string;
  relation: string;
  isPrimary: boolean;
}

export interface Classroom {
  id: string;
  siteId: string;
  name: string; // e.g., "Grade 10 - Section A"
  programId: string; // Links to Program (e.g., "Grade 10")
  capacity: number;
  tutorId?: string; // Teacher ID
  stream?: string; // e.g., "Science", "Arts"
}

export interface Teacher {
  id: string;
  siteId: string;
  name: string;
  email: string;
  department: string;
}

export type FeeInvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID' | 'CANCELLED';

export interface FeeInvoice {
  id: string;
  siteId: string;
  studentId: string;
  term: string; // e.g., "Term 1 Fees", "Bus Fees - April"
  amount: number;
  paidAmount: number;
  dueDate: string; // YYYY-MM-DD
  status: FeeInvoiceStatus;
  paidOn?: string; // YYYY-MM-DD
  transactionId?: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export interface Attendance {
    id: string;
    siteId: string;
    studentId: string;
    date: string; // YYYY-MM-DD
    status: AttendanceStatus;
    reason?: string | null;
}

export interface Grade {
    id: string;
    siteId: string;
    studentId: string;
    subjectName: string;
    itemName: string; // e.g., "Mid-term Exam", "Homework 1"
    score: number;
    gradeLetter: string;
}

export interface HealthInfo {
    allergies: string;
    medications: string;
    conditions: string;
    notes: string;
}

export interface DisciplineRecord {
    id: string;
    date: string; // YYYY-MM-DD
    incident: string;
    actionTaken: string;
    reportedBy: string; // User ID
}

export interface Program {
  id: string;
  siteId: string;
  name: string; // e.g. "Primary School", "High School"
  level: string; // e.g. "K-5", "9-12"
  duration: number; // in years
  code?: string;
  session?: string;
  feeGroupId?: string;
}

export interface Subject {
  id: string;
  siteId: string;
  name: string;
  code: string;
  type: 'Core' | 'Elective' | 'Practical' | 'Theory';
  maxMarks: number;
  passingMarks: number;
  teacherId?: string;
}

// FIX: Added SubjectGroup type definition.
export interface SubjectGroup extends SetupItem {
    classroomId: string;
    subjectIds: string[];
}

export interface Curriculum {
  id: string;
  siteId: string;
  programId: string;
  year: number; // e.g., for year 1 of the program
  subjects: string[]; // array of subject IDs
  status: 'DRAFT' | 'PUBLISHED';
}

// --- LMS (Learning Management System) ---

export interface Course {
  id: string;
  siteId: string;
  code: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'OPEN' | 'CLOSED';
  visibility: 'PRIVATE' | 'SITE' | 'PUBLIC';
  teachers: string[]; // array of teacher user IDs
}

export interface Module {
  id: string;
  siteId: string;
  courseId: string;
  title: string;
  summary: string;
  orderIndex: number;
}

export interface Lesson {
  id: string;
  siteId: string;
  moduleId: string;
  title: string;
  contentHtml: string;
  orderIndex: number;
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
    dueAt: string; // ISO Date String
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
    type: 'PDF' | 'Video' | 'Link' | 'Document';
    url: string;
    access: 'FREE' | 'PAID';
    price?: number;
}

// --- Generic Setup Item ---
export interface SetupItem {
  id: string;
  siteId: string;
  name: string;
  description?: string;
}

export type StudentCategory = SetupItem;
export type StudentHouse = SetupItem;
export type DisableReason = SetupItem;
export type VisitorPurpose = SetupItem;
export type EnquirySource = SetupItem;
export type ComplaintType = SetupItem;
export type EnquiryReference = SetupItem;
export type IncomeHead = SetupItem;
export type ExpenseHead = SetupItem;
export type ItemCategory = SetupItem;
export type Store = SetupItem;
export type Supplier = SetupItem;

// --- Transport ---
export interface TransportRoute {
  id: string;
  siteId: string;
  name: string;
  description?: string;
}

export interface Vehicle {
    id: string;
    siteId: string;
    registrationNo: string;
    type: 'Bus' | 'Van' | 'Car';
    capacity: number;
    fuelType: 'Petrol' | 'Diesel' | 'Electric';
    driverId?: string; // Teacher/Staff ID
    isAvailable: boolean;
}

// --- Hostel ---
export interface Hostel {
  id: string;
  siteId: string;
  name: string;
  type: 'Boys' | 'Girls';
  address: string;
  intake: number; // total capacity
}

export interface RoomType {
  id: string;
  siteId: string;
  name: string; // e.g., "2-Seater AC"
  description: string;
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
  status: 'Available' | 'Full' | 'Maintenance';
}

export interface HostelAllocation {
    id: string;
    siteId: string;
    studentId: string;
    roomId: string;
    allocatedOn: string; // YYYY-MM-DD
}

// --- Exams ---

export interface ExamGroup {
    id: string;
    siteId: string;
    name: string; // e.g., Mid-Term Exams 2024
    examType: 'Term' | 'Test' | 'Final';
}

export interface ExamSchedule {
    id: string;
    siteId: string;
    examGroupId: string;
    classroomId: string;
    subjectId: string;
    examDate: string; // YYYY-MM-DD
    startTime: string; // HH:MM
    endTime: string; // HH:MM
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
    name: string; // e.g., "A+", "B"
    minPercentage: number;
    description: string;
}

// FIX: Added AdmitCardTemplate type definition.
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
// FIX: Added MarksheetTemplate type definition.
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

// --- Timetable ---
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

// --- Attendance ---
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

// --- Certificates ---
export interface CertificateTemplate {
    id: string;
    siteId: string;
    name: string;
    recipientType: 'Student' | 'Staff';
    body: string;
}

export interface IdCardTemplate {
    id: string;
    siteId: string;
    name: string;
    type: 'Student' | 'Staff';
    backgroundColor?: string;
    textColor?: string;
    backgroundImageUrl?: string;
    logoUrl?: string;
    showPhoto?: boolean;
    showQRCode?: boolean;
    showBloodGroup?: boolean;
    showGuardian?: boolean;
    showValidity?: boolean;
}

export interface IssuedCertificate {
    id: string;
    siteId: string;
    serialId: string;
    templateId: string;
    issuedToId: string; // student or staff id
    issueDate: string; // YYYY-MM-DD
    status: 'Valid' | 'Revoked';
    recipientName: string;
    issuedById: string; // user id
    issuedByName: string;
}

// --- Front Office ---
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
    note?: string; // internal notes
    enquiryDate: string; // YYYY-MM-DD
    nextFollowUpDate?: string;
    assignedTo?: string; // staff id
    reference?: string;
    source: AdmissionEnquirySourceValue;
    classSought: string;
    numberOfChildren?: number;
    status: AdmissionEnquiryStatus;
}

export interface Visitor {
    id: string;
    siteId: string;
    name: string;
    phone: string;
    idCard?: string;
    purpose: string;
    checkIn: string; // ISO DateTime
    checkOut?: string;
    notes?: string;
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
    assignedTo?: string; // staff id
    actionTaken?: string;
    status: ComplaintStatus;
}

export type CallTypeValue = 'Incoming' | 'Outgoing';
export interface PhoneCallLog {
    id: string;
    siteId: string;
    callType: CallTypeValue;
    name: string;
    phone: string;
    date: string; // ISO DateTime
    callDuration?: string;
    purpose: string;
    description?: string;
    assignedTo?: string; // staff id
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

// --- Finance ---
// FIX: Added FeeType, FeeGroup, and FeeMaster type definitions.
export type FeeType = SetupItem;
export type FeeGroup = SetupItem & { feeTypeIds: string[] };
export interface FeeMaster {
  id: string;
  siteId: string;
  feeGroupId: string;
  classroomId: string;
  amount: number;
  dueDate: string;
}
export interface Income {
    id: string;
    siteId: string;
    incomeHeadId: string;
    name: string; // name or reference
    amount: number;
    incomeDate: string;
    description?: string;
    enteredBy: string; // user id
    attachmentUrl?: string;
}
export interface Expense {
    id: string;
    siteId: string;
    expenseHeadId: string;
    name: string;
    amount: number;
    expenseDate: string;
    description?: string;
    enteredBy: string; // user id
    attachmentUrl?: string;
}
export interface FeeReminderLog {
    id: string;
    siteId: string;
    studentId: string;
    channel: 'SMS' | 'Email';
    dateSent: string;
    status: 'Sent' | 'Failed';
}

// --- Communicate ---
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
    audienceIds?: string[];
    attachmentUrl?: string;
    fileName?: string;
    createdBy: string;
    createdAt: string;
}
export type CommunicationLogStatus = 'Pending' | 'Sent' | 'Delivered' | 'Failed';
export interface CommunicationLog {
    id: string;
    siteId: string;
    channel: 'Notice' | 'Email' | 'SMS';
    recipientsDescription: string;
    subject?: string;
    messageSnippet: string;
    fullMessage: string;
    senderId: string; // user id
    sentAt: string; // ISO datetime
    status: CommunicationLogStatus;
    failureReason?: string;
}


// --- Downloads ---
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
    uploadedBy: string;
    createdAt: string;
}
export interface Assignment {
    id: string;
    siteId: string;
    title: string;
    classroomId: string;
    subjectId: string;
    dueDate: string;
    attachmentUrl?: string;
    fileName?: string;
}
export type AssignmentSubmissionStatus = 'Assigned' | 'Submitted' | 'Late' | 'Graded';
export interface AssignmentSubmission {
    id: string;
    siteId: string;
    assignmentId: string;
    studentId: string;
    status: AssignmentSubmissionStatus;
}


// --- Homework ---
export type HomeworkStatus = 'Pending' | 'Completed';
export type SubmissionStatus = 'Assigned' | 'Submitted' | 'Late' | 'Graded';
export interface Homework {
    id: string;
    siteId: string;
    classroomId: string;
    subjectId: string;
    title: string;
    description: string;
    assignDate: string;
    dueDate: string;
    createdBy: string; // teacher id
}
export interface HomeworkSubmission {
    id: string;
    siteId: string;
    homeworkId: string;
    studentId: string;
    submissionDate?: string;
    status: SubmissionStatus;
    marks?: number;
    remarks?: string;
}

// --- Online Exams ---
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
    submittedAt: string;
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

// --- Alumni ---
export interface Alumni {
    id: string;
    siteId: string;
    name: string;
    studentId: string;
    graduationYear: number;
    lastClassroomId: string;
    email: string;
    phone: string;
    occupation: string;
    organization: string;
}
export type AlumniEventType = 'Reunion' | 'Career Fair' | 'Fundraiser' | 'Webinar' | 'Other';
export interface AlumniEvent {
    id: string;
    siteId: string;
    title: string;
    description: string;
    eventDate: string;
    venue: string;
    eventType: AlumniEventType;
    rsvpRequired: boolean;
    ticketPrice: number;
}
export interface AlumniEventRSVP {
    id: string;
    siteId: string;
    eventId: string;
    alumniId: string;
    status: 'Attending' | 'Not Attending' | 'Maybe';
}

// --- Front CMS ---
export type CmsEventStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
export type CmsEventAudience = 'Public' | 'Parents' | 'Students' | 'Staff' | 'Alumni';
export interface CmsEvent {
  id: string;
  siteId: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  audience: CmsEventAudience[];
  coverImageUrl: string;
  status: CmsEventStatus;
  rsvpEnabled: boolean;
  ticketCapacity: number;
  ticketPrice: number;
  createdBy: string;
  createdAt: string;
}
export interface CmsEventRsvp {
    id: string;
    siteId: string;
    eventId: string;
    name: string;
    email: string;
    tickets: number;
}
export interface CmsAlbum {
    id: string;
    siteId: string;
    name: string;
    description: string;
    coverImageUrl: string;
    createdBy: string;
    createdAt: string;
}
export interface CmsPhoto {
    id: string;
    siteId: string;
    albumId: string;
    url: string;
    caption?: string;
    orderIndex: number;
}
export type CmsNewsStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
export interface CmsNews {
    id: string;
    siteId: string;
    title: string;
    slug: string;
    summary: string;
    content: string; // HTML
    featuredImageUrl: string;
    authorId: string;
    status: CmsNewsStatus;
    isFeatured: boolean;
    tags: string[];
    publishedAt: string;
    createdBy: string;
    createdAt: string;
}

// --- Inventory ---
export interface InventoryItem {
  id: string;
  siteId: string;
  name: string;
  categoryId: string;
  unit: string;
  minStockLevel: number;
}
export interface StockReceive {
  id: string;
  siteId: string;
  itemId: string;
  supplierId: string;
  storeId: string;
  quantity: number;
  purchasePrice: number;
  date: string;
}
export interface ItemIssue {
  id: string;
  siteId: string;
  itemId: string;
  issueTo: string; // student or staff id
  quantity: number;
  issueDate: string;
}


// --- Library ---
export type LibraryMemberStatus = 'Active' | 'Suspended' | 'Inactive';
export interface LibraryMember {
    id: string;
    siteId: string;
    userId: string; // student or teacher id
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
export type DigitalKind = 'EBOOK' | 'AUDIO' | 'VIDEO';
export interface DigitalAsset {
    id: string;
    siteId: string;
    title: string;
    kind: DigitalKind;
    subject: string;
    classId: string;
    storageKey: string; // URL, path, or identifier
    coverUrl?: string;
}

export type VideoHost = 'YOUTUBE' | 'SELF';
export interface CatchupClass {
    id: string;
    siteId: string;
    title: string;
    description: string;
    classId: string;
    subjectId: string;
    date: string;
    host: VideoHost;
    sourceKey: string;
    durationSec: number;
    status: 'DRAFT' | 'PUBLISHED';
}

export interface CatchupPlaybackToken {
    jwt: string;
    src: string;
    host: VideoHost;
    rules: {
        minPct: number;
        allowFwdWindowSec: number;
    };
    prompts: CatchupPrompt[];
    quiz?: CatchupQuiz;
    watermark: {
        userId: string;
        name: string;
        ts: string;
    };
}

export interface CatchupPrompt {
    id: string;
    catchupId: string;
    atSec: number;
    text: string;
}

export interface CatchupQuiz {
    minPassPct: number;
    questions: {
        items: { q: string; options: string[]; answerIndex: number }[];
    };
}

// FIX: Added OnlineAdmissionApplication and its status type.
export type OnlineAdmissionApplicationStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Converted';

export interface OnlineAdmissionApplication {
  id: string;
  siteId: string;
  applicantFirstName: string;
  applicantLastName: string;
  applicantDob: string; // YYYY-MM-DD
  applicantGender: 'Male' | 'Female' | 'Other';
  classSought: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianEmail: string;
  submissionDate: string; // ISO DateTime
  status: OnlineAdmissionApplicationStatus;
  notes?: string;
}

// FIX: Added MultiClassEnrollment type definition.
export interface MultiClassEnrollment {
  id: string;
  siteId: string;
  studentId: string;
  classroomId: string;
}
