

// FIX: Create comprehensive type definitions for the application to resolve widespread 'module not found' and 'cannot find name' errors.

// --- General & Auth ---
export type Role = 'super_admin' | 'school_admin' | 'bursar' | 'teacher' | 'student' | 'lms_admin' | 'librarian' | 'front_desk';
// FIX: Expanded Scope to include all possible values to resolve type conflicts across the application.
export type Scope = 'school:read' | 'school:write' | 'school:admin' | 'library:read' | 'library:write' | 'lms:admin' | 'attendance:read' | 'attendance:write';
export type Priority = 'Urgent' | 'Regular' | 'Info';
export type Audience = 'All' | 'Students' | 'Staff' | 'Parents' | 'Class';

export interface SetupItem {
    id: string;
    siteId: string;
    name: string;
    description?: string;
}

// --- Student Information System (SIS) ---

export type StudentStatus = 'ENROLLED' | 'TRANSFERRED' | 'GRADUATED' | 'ARCHIVED';

export interface Address {
    street: string;
    city: string;
    state: string;
    zip: string;
}

export interface HealthInfo {
    allergies?: string;
    medications?: string;
    conditions?: string;
    notes?: string;
}

export interface DisciplineRecord {
    id: string;
    date: string;
    incident: string;
    actionTaken: string;
    reportedBy: string; // User ID
}

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
    address: Address;
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

export interface Teacher {
    id: string;
    siteId: string;
    name: string;
    email: string;
    department: string;
}

export interface Program {
    id: string;
    siteId: string;
    name: string;
    code?: string;
    level: string;
    duration: number;
    session?: string;
    feeGroupId?: string;
}

export interface Classroom {
    id: string;
    siteId: string;
    name: string;
    programId: string;
    capacity: number;
    tutorId: string | null;
    stream?: string;
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

export interface Curriculum {
    id: string;
    siteId: string;
    programId: string;
    year: number;
    subjects: string[];
    status: 'DRAFT' | 'PUBLISHED';
}

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

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface Attendance {
    id: string;
    siteId: string;
    studentId: string;
    date: string; // YYYY-MM-DD
    status: AttendanceStatus;
    reason?: string | null;
}

export type StudentLeaveApplicationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface StudentLeaveApplication {
    id: string;
    siteId: string;
    studentId: string;
    fromDate: string;
    toDate: string;
    reason: string;
    appliedOn: string;
    status: StudentLeaveApplicationStatus;
}

export interface Grade {
    id: string;
    siteId: string;
    studentId: string;
    subjectName: string;
    itemName: string; // e.g., Mid-term, Quiz 1
    score: number;
    gradeLetter: string;
}

export interface MultiClassEnrollment {
    id: string;
    siteId: string;
    studentId: string;
    classroomId: string;
}

// --- Fees & Finance ---
export type FeeInvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID' | 'CANCELLED';

export interface FeeInvoice {
    id: string;
    siteId: string;
    studentId: string;
    term: string;
    amount: number;
    paidAmount: number;
    dueDate: string; // YYYY-MM-DD
    status: FeeInvoiceStatus;
    paidOn?: string;
    transactionId?: string;
}

export interface FeeType extends SetupItem {}
export interface FeeGroup extends SetupItem {
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

export interface IncomeHead extends SetupItem {}
export interface ExpenseHead extends SetupItem {}

export interface Income {
    id: string;
    siteId: string;
    incomeHeadId: string;
    name: string;
    amount: number;
    incomeDate: string;
    description?: string;
    enteredBy: string;
}

export interface Expense {
    id: string;
    siteId: string;
    expenseHeadId: string;
    name: string;
    amount: number;
    expenseDate: string;
    description?: string;
    enteredBy: string;
}

// --- Examinations ---
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
    name: string; // e.g., 'A+', 'B'
    minPercentage: number;
    description?: string;
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
    }
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
    }
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
    isPass: boolean;
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
    options: string[]; // for MCQ
    correctAnswers: number[]; // indices of correct options
    marks: number;
    difficulty: Difficulty;
}

// --- Homework ---
export type HomeworkStatus = 'Pending' | 'Evaluated';
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
    attachmentUrl?: string;
    createdBy: string;
    status?: HomeworkStatus;
}

export interface Assignment {
    id: string;
    siteId: string;
    classroomId: string;
    subjectId: string;
    title: string;
    description?: string;
    dueDate: string;
    attachmentUrl?: string;
    fileName?: string;
    maxMarks: number;
}

export interface HomeworkSubmission {
    id: string;
    homeworkId: string;
    studentId: string;
    submissionDate: string;
    fileUrl?: string;
    remarks?: string;
    marks?: number;
    status: SubmissionStatus;
}

export interface AssignmentSubmission {
    id: string;
    // FIX: Add missing siteId property
    siteId: string;
    assignmentId: string;
    studentId: string;
    submissionDate?: string;
    fileUrl?: string;
    remarks?: string;
    marks?: number;
    status: SubmissionStatus;
}

// --- Content & Downloads ---
export type ContentCategory = 'Syllabus' | 'Class Notes' | 'Revision Guide' | 'Supplementary Reading' | 'Lab Manual' | 'Assignment Resource' | 'Circular' | 'Policy' | 'Form' | 'Miscellaneous';
export type AccessLevel = 'Public' | 'Restricted';

export interface Content {
    id: string;
    siteId: string;
    title: string;
    description?: string;
    classroomId: string;
    subjectId?: string;
    category: ContentCategory;
    accessLevel: AccessLevel;
    attachmentUrl: string;
    fileName: string;
    uploadedBy: string; // userId
    createdAt: string;
}

// --- Library ---
export type LibraryMemberStatus = 'Active' | 'Suspended' | 'Inactive';
export interface LibraryMember {
    id: string;
    siteId: string;
    userId: string; // Can be student or teacher ID
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
    publisher?: string;
    year?: number;
    edition?: string;
    category?: string;
    language?: string;
    quantity: number;
    available: number;
    shelf?: string;
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
    storageKey: string;
    coverUrl?: string;
}
export type VideoHost = 'YOUTUBE' | 'VIMEO' | 'SELF';
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
export interface CatchupQuizQuestion {
    q: string;
    options: string[];
    correct: number;
}
export interface CatchupQuiz {
    minPassPct: number;
    questions: { items: CatchupQuizQuestion[] };
}
export interface CatchupPlaybackToken {
    jwt: string;
    src: string;
    host: VideoHost;
    rules: { minPct: number; allowFwdWindowSec: number };
    prompts: CatchupPrompt[];
    quiz?: CatchupQuiz;
    watermark: { userId: string; name: string; ts: string };
}

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
    driverId?: string;
    isAvailable: boolean;
}

// --- Hostel ---
export interface Hostel {
    id: string;
    siteId: string;
    name: string;
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

// --- Inventory ---
export interface ItemCategory extends SetupItem {}
export interface Store extends SetupItem {}
export interface Supplier extends SetupItem {}
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
    issueTo: string; // user id
    quantity: number;
    issueDate: string;
}

// --- Certificates ---
export interface CertificateTemplate {
    id: string;
    siteId: string;
    name: string;
    body: string;
    recipientType: 'Student' | 'Staff';
}
export interface IdCardTemplate {
    id: string;
    siteId: string;
    name: string;
    type: 'Student' | 'Staff';
    backgroundColor: string;
    textColor: string;
    logoUrl?: string;
    backgroundImageUrl?: string;
    showPhoto: boolean;
    showQRCode: boolean;
    showBloodGroup: boolean;
    showGuardian: boolean;
    showValidity: boolean;
}
export interface IssuedCertificate {
    id: string;
    siteId: string;
    serialId: string;
    templateId: string;
    issuedToId: string;
    issueDate: string;
    status: 'Valid' | 'Revoked';
    recipientName: string;
    issuedById: string;
    issuedByName: string;
}

// --- Communication ---
export type CommunicationLogStatus = 'Pending' | 'Sent' | 'Delivered' | 'Failed';
export interface CommunicationLog {
    id: string;
    siteId: string;
    channel: 'Notice' | 'Email' | 'SMS';
    recipientsDescription: string;
    subject?: string;
    messageSnippet: string;
    fullMessage: string;
    senderId: string;
    sentAt: string;
    status: CommunicationLogStatus;
    failureReason?: string;
}
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
    createdBy: string;
    createdAt: string;
}

// --- Front Office ---
export type AdmissionEnquirySourceValue = 'Online' | 'Phone' | 'Walk-in' | 'Referral' | 'Letter' | 'Other';
export type AdmissionEnquiryStatus = 'ACTIVE' | 'PASSIVE' | 'DEAD' | 'WON' | 'LOST';

export interface AdmissionEnquiry {
    id: string;
    siteId: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    description: string;
    note: string;
    enquiryDate: string;
    nextFollowUpDate?: string;
    assignedTo?: string; // Teacher/staff ID
    reference?: string;
    source: AdmissionEnquirySourceValue;
    classSought: string;
    numberOfChildren: number;
    status: AdmissionEnquiryStatus;
}
export interface Visitor {
    id: string;
    siteId: string;
    name: string;
    purpose: string;
    phone: string;
    checkIn: string; // ISO DateTime
    checkOut?: string; // ISO DateTime
    idCard?: string;
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
    assignedTo?: string; // Staff ID
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
    callDuration: string;
    purpose: string;
    description?: string;
    assignedTo?: string;
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

// --- Online Admission ---
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

// --- Alumni ---
export type AlumniEventType = 'Reunion' | 'Career Fair' | 'Fundraiser' | 'Webinar' | 'Other';
export interface Alumni {
    id: string;
    siteId: string;
    name: string;
    studentId?: string; // original student ID
    graduationYear: number;
    lastClassroomId: string;
    email?: string;
    phone?: string;
    occupation?: string;
    organization?: string;
}
export interface AlumniEvent {
    id: string;
    siteId: string;
    title: string;
    description?: string;
    eventDate: string; // ISO DateTime
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
    guests: number;
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
    startDate: string; // ISO
    endDate: string; // ISO
    venue: string;
    audience: CmsEventAudience[];
    coverImageUrl: string;
    status: CmsEventStatus;
    createdBy: string;
    createdAt: string;
    rsvpEnabled: boolean;
    ticketCapacity?: number;
    ticketPrice?: number;
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
    description?: string;
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
    createdBy: string;
    createdAt: string;
    publishedAt: string;
}


// --- Learning Management System (LMS) ---

export interface Course {
    id: string;
    siteId: string;
    code: string;
    title: string;
    description: string;
    status: 'DRAFT' | 'OPEN' | 'CLOSED';
    visibility: 'PUBLIC' | 'SITE' | 'PRIVATE';
    teachers: string[];
}

export interface Module {
    id: string;
    siteId: string;
    courseId: string;
    title: string;
    orderIndex: number;
    summary?: string;
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
    type: 'PDF' | 'Video' | 'Link' | 'Document';
    url: string;
    access: 'FREE' | 'PAID';
    price?: number;
}
export interface SubjectGroup {
    id: string;
    siteId: string;
    name: string;
    classroomId: string;
    subjectIds: string[];
    description?: string;
}
