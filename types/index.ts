// types/index.ts

// Basic types
export type Role = 'school_admin' | 'teacher' | 'bursar' | 'student' | 'lms_admin' | 'super_admin' | 'librarian' | 'front_desk';
export type Action = 'create' | 'read' | 'update' | 'delete' | 'pay' | 'export' | 'issue' | 'manage';
export type Resource = 
  | 'school.students' | 'school.fees' | 'school.attendance' | 'school.academics' | 'school.grades' | 'school.faculty'
  | 'edu.courses' | 'edu.curriculum' | 'edu.assignments' | 'edu.quizzes' | 'edu.resources'
  | 'student.admission' | 'student.online-admission' | 'student.bulk' | 'student.categories' | 'student.multi-class'
  | 'attendance.reports' | 'attendance.approve-leave'
  | 'academics.timetable' | 'academics.assign-teacher' | 'academics.promote' | 'academics.subjects'
  | 'certificate.issue' | 'certificate.id-cards' | 'certificate.templates'
  | 'front-cms.events' | 'front-cms.gallery' | 'front-cms.news'
  | 'frontoffice.enquiry' | 'frontoffice.complaints' | 'frontoffice.calls' | 'frontoffice.postal' | 'frontoffice.setup' | 'frontoffice.visitors'
  | 'fees.master' | 'fees.reminders' | 'fees.search'
  | 'finance.income' | 'finance.expenses'
  | 'communicate.notices' | 'communicate.send' | 'communicate.logs'
  | 'downloads.content'
  | 'homework'
  | 'library' | 'library.members' | 'library.issue-return' | 'library.digital' | 'library.catchup'
  | 'hostel'
  | 'inventory'
  | 'transport'
  | 'exams.schedule' | 'exams.admit-card' | 'exams.marksheet' | 'exams.result' | 'exams.grades'
  | 'online-exams' | 'online-exams.question-bank' | 'online-exams.result'
  | 'alumni.events' | 'alumni.manage'
  | 'settings.roles';

// User and Auth
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  siteId: string;
}

// Common
export interface BaseEntity {
  id: string;
  siteId: string;
}

export interface SetupItem extends BaseEntity {
    name: string;
    description?: string;
}

// SIS Domain
export type StudentStatus = 'ENROLLED' | 'TRANSFERRED' | 'GRADUATED' | 'ARCHIVED';

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
    reportedBy: string;
}

export interface Student extends BaseEntity {
    firstName: string;
    lastName: string;
    admissionNo: string;
    rollNo: string;
    classroomId: string;
    dob: string;
    gender: 'Male' | 'Female' | 'Other';
    email: string | null;
    phone: string | null;
    status: StudentStatus;
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
    };
    photoUrl?: string;
    health: HealthInfo;
    discipline: DisciplineRecord[];
}
export interface Classroom extends BaseEntity {
    name: string;
    capacity: number;
    programId: string; // Links to a Program
    tutorId?: string; // Links to a Teacher
    stream?: string; // e.g., 'Science', 'Arts'
}

export interface Guardian extends BaseEntity {
    name: string;
    email: string | null;
    phone: string | null;
    occupation: string | null;
}
export interface StudentGuardian extends BaseEntity {
    studentId: string;
    guardianId: string;
    relation: string;
    isPrimary: boolean;
}
export type FeeInvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID' | 'CANCELLED';
export interface FeeInvoice extends BaseEntity {
    studentId: string;
    term: string; // e.g., 'Term 1 Fees'
    amount: number;
    paidAmount: number;
    dueDate: string;
    status: FeeInvoiceStatus;
    paidOn?: string;
    transactionId?: string;
}
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export interface Attendance extends BaseEntity {
    studentId: string;
    date: string; // YYYY-MM-DD
    status: AttendanceStatus;
    reason?: string | null;
}
export interface Program extends BaseEntity {
    name: string;
    code?: string;
    level: string; // e.g., 'Primary', 'Secondary'
    duration: number; // in years
    feeGroupId?: string;
    session?: string;
}
export interface Subject extends BaseEntity {
    name: string;
    code: string;
    type: 'Core' | 'Elective' | 'Practical' | 'Theory';
    maxMarks: number;
    passingMarks: number;
    teacherId?: string;
}
export interface Curriculum extends BaseEntity {
    programId: string;
    year: number; // e.g., Year 1 of the program
    subjects: string[]; // array of subject IDs
    status: 'DRAFT' | 'PUBLISHED';
}
export interface Teacher extends BaseEntity {
    name: string;
    email: string;
    department: string;
}
export interface Grade extends BaseEntity {
    studentId: string;
    subjectName: string;
    itemName: string; // e.g., 'Mid-term Exam', 'Homework 1'
    score: number;
    gradeLetter: string;
}
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export interface TimetableSlot {
    dayOfWeek: DayOfWeek;
    period: number;
    subjectId: string;
    teacherId: string;
    room?: string;
}
export interface Timetable extends BaseEntity {
    classroomId: string;
    slots: TimetableSlot[];
}
export interface SubjectGroup extends BaseEntity {
    name: string;
    classroomId: string;
    subjectIds: string[];
    description?: string;
}
export type AlumniEventType = 'Reunion' | 'Career Fair' | 'Fundraiser' | 'Webinar' | 'Other';
export interface AlumniEvent extends BaseEntity {
    title: string;
    description: string;
    eventDate: string; // ISO
    venue: string;
    eventType: AlumniEventType;
    rsvpRequired: boolean;
    ticketPrice?: number;
}
export interface AlumniEventRSVP extends BaseEntity {
    eventId: string;
    alumniId: string;
    status: 'Attending' | 'Maybe' | 'Not Attending';
}
export interface Alumni extends BaseEntity {
    name: string;
    studentId?: string; // original student ID
    graduationYear: number;
    lastClassroomId: string;
    email?: string;
    phone?: string;
    occupation?: string;
    organization?: string;
}
export type StudentLeaveApplicationStatus = 'Pending' | 'Approved' | 'Rejected';
export interface StudentLeaveApplication extends BaseEntity {
    studentId: string;
    fromDate: string;
    toDate: string;
    reason: string;
    status: StudentLeaveApplicationStatus;
    appliedOn: string;
}
export interface CertificateTemplate extends BaseEntity {
    name: string;
    recipientType: 'Student' | 'Staff';
    body: string; // with placeholders like {{name}}, {{class}}
}
export interface IssuedCertificate extends BaseEntity {
    serialId: string;
    templateId: string;
    issuedToId: string;
    recipientName: string;
    issueDate: string;
    issuedById: string;
    issuedByName: string;
    status: 'Valid' | 'Revoked';
}
export interface IdCardTemplate extends BaseEntity {
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
export type CommunicationLogStatus = 'Pending' | 'Sent' | 'Delivered' | 'Failed';
export interface CommunicationLog extends BaseEntity {
    channel: 'Notice' | 'Email' | 'SMS';
    subject?: string;
    messageSnippet: string;
    fullMessage: string;
    senderId: string; // user ID
    recipientsDescription: string;
    sentAt: string; // ISO
    status: CommunicationLogStatus;
    failureReason?: string;
}
export type Priority = 'Urgent' | 'Regular' | 'Info';
export type Audience = 'All' | 'Students' | 'Staff' | 'Parents' | 'Class';
export interface Notice extends BaseEntity {
    title: string;
    description: string;
    publishDate: string;
    expiryDate?: string;
    priority: Priority;
    audience: Audience;
    audienceIds?: string[]; // e.g., class IDs
    attachmentUrl?: string;
    fileName?: string;
    createdBy: string; // user ID
    createdAt: string; // ISO
}
export type ContentCategory = 'Syllabus' | 'Class Notes' | 'Revision Guide' | 'Supplementary Reading' | 'Lab Manual' | 'Assignment Resource' | 'Circular' | 'Policy' | 'Form' | 'Miscellaneous';
export interface Content extends BaseEntity {
    title: string;
    description?: string;
    classroomId: string;
    subjectId?: string;
    category: ContentCategory;
    accessLevel: 'Public' | 'Restricted';
    attachmentUrl: string;
    fileName: string;
    uploadedBy: string; // User ID
    createdAt: string; // ISO
}
export interface AdmitCardTemplate extends BaseEntity {
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
export interface MarksheetTemplate extends BaseEntity {
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
export interface ExamGroup extends BaseEntity {
    name: string;
    examType: 'Term' | 'Test' | 'Final';
}
export interface ExamSchedule extends BaseEntity {
    examGroupId: string;
    classroomId: string;
    subjectId: string;
    examDate: string;
    startTime: string; // HH:mm
    endTime: string;
    roomNo: string;
    maxMarks: number;
    minMarks: number;
    invigilatorId?: string; // teacher ID
}
export interface MarksGrade extends BaseEntity {
    name: string; // A+, B, etc.
    minPercentage: number;
    description: string;
}
export interface Mark extends BaseEntity {
    studentId: string;
    examScheduleId: string;
    marksObtained: number;
}
export interface FeeType extends SetupItem {}
export interface FeeGroup extends SetupItem {
    feeTypeIds: string[];
}
export interface FeeMaster extends BaseEntity {
    feeGroupId: string;
    classroomId: string;
    amount: number;
    dueDate: string;
}
export interface FeeReminderLog extends BaseEntity {
    studentId: string;
    channel: 'SMS' | 'Email';
    dateSent: string;
    status: 'Sent' | 'Failed';
}
export interface ExpenseHead extends SetupItem {}
export interface Expense extends BaseEntity {
    expenseHeadId: string;
    name: string;
    amount: number;
    expenseDate: string;
    description?: string;
    enteredBy: string; // User ID
}
export interface IncomeHead extends SetupItem {}
export interface Income extends BaseEntity {
    incomeHeadId: string;
    name: string;
    amount: number;
    incomeDate: string;
    description?: string;
    enteredBy: string;
}
export type AdmissionEnquiryStatus = 'ACTIVE' | 'PASSIVE' | 'DEAD' | 'WON' | 'LOST';
export type AdmissionEnquirySourceValue = 'Online' | 'Phone' | 'Walk-in' | 'Referral' | 'Letter' | 'Other';
export interface AdmissionEnquiry extends BaseEntity {
    name: string;
    phone: string;
    email: string;
    address: string;
    description: string;
    note: string;
    enquiryDate: string;
    nextFollowUpDate: string;
    assignedTo: string; // User ID
    reference: string;
    source: AdmissionEnquirySourceValue;
    classSought: string;
    numberOfChildren: number;
    status: AdmissionEnquiryStatus;
}
export type ComplaintPriority = 'Low' | 'Medium' | 'High';
export type ComplaintStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export interface Complaint extends BaseEntity {
    complaintType: string;
    complainantName: string;
    phone: string;
    date: string;
    description: string;
    actionTaken: string;
    assignedTo: string; // User ID
    status: ComplaintStatus;
    priority: ComplaintPriority;
    source: string;
}
export type CallTypeValue = 'Incoming' | 'Outgoing';
export interface PhoneCallLog extends BaseEntity {
    name: string;
    phone: string;
    date: string; // ISO
    callDuration: string;
    description: string;
    nextFollowUpDate?: string;
    callType: CallTypeValue;
    purpose: string;
    assignedTo?: string;
}
export type DispatchMode = 'Post' | 'Courier' | 'Hand Delivery' | 'Other';
export interface PostalDispatch extends BaseEntity {
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
export interface PostalReceive extends BaseEntity {
    fromTitle: string;
    referenceNo: string;
    toTitle: string;
    receiveDate: string;
    mode: DispatchMode;
    docType?: string;
    notes?: string;
    acknowledged: boolean;
}
export interface Visitor extends BaseEntity {
    name: string;
    phone: string;
    purpose: string;
    toMeet: string; // Staff name or department
    numberOfPersons: number;
    checkIn: string; // ISO
    checkOut?: string; // ISO
    notes?: string;
}
export type HomeworkStatus = 'Pending' | 'Completed' | 'Late';
export type SubmissionStatus = 'Assigned' | 'Submitted' | 'Late' | 'Graded';
export interface Homework extends BaseEntity {
    title: string;
    classroomId: string;
    subjectId: string;
    assignDate: string;
    dueDate: string;
    description: string;
    createdBy: string;
    // FIX: Add attachment properties to allow homework files to be downloadable.
    attachmentUrl?: string;
    fileName?: string;
}
export interface HomeworkSubmission extends BaseEntity {
    homeworkId: string;
    studentId: string;
    submissionDate: string;
    status: SubmissionStatus;
    marks?: number;
    remarks?: string;
}
export interface RoomType extends SetupItem {
    bedCapacity: number;
}
export interface HostelRoom extends BaseEntity {
    hostelId: string;
    roomTypeId: string;
    roomNumber: string;
    capacity: number;
    costPerBed: number;
    status: 'Available' | 'Full';
}
export interface HostelAllocation extends BaseEntity {
    studentId: string;
    roomId: string;
    allocatedOn: string;
}
export interface InventoryItem extends BaseEntity {
    name: string;
    categoryId: string;
    unit: string;
    minStockLevel: number;
}
export interface ItemCategory extends SetupItem {}
export interface StockReceive extends BaseEntity {
    itemId: string;
    supplierId?: string;
    storeId: string;
    quantity: number;
    purchasePrice: number;
    date: string;
}
export interface Supplier extends SetupItem {}
export interface Store extends SetupItem {}
export interface ItemIssue extends BaseEntity {
    itemId: string;
    issueTo: string; // User ID
    quantity: number;
    issueDate: string;
}
export type LibraryMemberStatus = 'Active' | 'Suspended' | 'Inactive';
export interface LibraryMember extends BaseEntity {
    userId: string;
    memberType: 'Student' | 'Teacher';
    libraryCardNo: string;
    status: LibraryMemberStatus;
}
export interface Book extends BaseEntity {
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
export interface BookIssue extends BaseEntity {
    bookId: string;
    memberId: string;
    issueDate: string;
    dueDate: string;
    returnDate?: string;
    status: 'Issued' | 'Returned' | 'Lost';
}
export type OnlineExamStatus = 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';
export interface OnlineExam extends BaseEntity {
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
export interface OnlineExamResult extends BaseEntity {
    onlineExamId: string;
    studentId: string;
    score: number;
}
export type QuestionType = 'MCQ' | 'True/False' | 'Short Answer' | 'Long Answer';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export interface Question extends BaseEntity {
    question: string;
    type: QuestionType;
    subjectId: string;
    classroomId: string;
    options: string[];
    correctAnswers: number[]; // indices of correct options
    marks: number;
    difficulty: Difficulty;
}
export interface MultiClassEnrollment extends BaseEntity {
    studentId: string;
    classroomId: string;
}
export interface TransportRoute extends SetupItem {}
export interface Vehicle extends BaseEntity {
    registrationNo: string;
    type: 'Bus' | 'Van' | 'Car';
    capacity: number;
    fuelType: 'Petrol' | 'Diesel' | 'Electric';
    driverId?: string; // teacher/staff ID
    isAvailable: boolean;
}
export interface Hostel extends SetupItem {
    type: 'Boys' | 'Girls';
    address: string;
    intake: number;
}
export type DigitalKind = 'EBOOK' | 'AUDIO' | 'VIDEO';
export interface DigitalAsset extends BaseEntity {
    title: string;
    kind: DigitalKind;
    subject: string;
    classId?: string;
    coverUrl?: string;
    storageKey: string; // URL or path
    drm: 'NONE' | 'FAIRPLAY' | 'WIDEVINE';
}
export type VideoHost = 'YOUTUBE' | 'SELF';
export interface CatchupClass extends BaseEntity {
    title: string;
    description?: string;
    classId: string;
    subjectId: string;
    date: string;
    host: VideoHost;
    sourceKey: string; // Video ID or URL
    durationSec: number;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}
export type CmsEventStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
export type CmsEventAudience = 'Public' | 'Parents' | 'Students' | 'Staff' | 'Alumni';
export interface CmsEvent extends BaseEntity {
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
    createdBy: string; // User ID
    createdAt: string; // ISO
    rsvpEnabled: boolean;
    ticketCapacity?: number;
    ticketPrice?: number;
}
export interface CmsEventRsvp extends BaseEntity {
    eventId: string;
    name: string;
    email: string;
    phone?: string;
}
export interface CmsAlbum extends BaseEntity {
    name: string;
    description: string;
    coverImageUrl: string;
    createdBy: string;
    createdAt: string;
}
export interface CmsPhoto extends BaseEntity {
    albumId: string;
    url: string;
    caption?: string;
    orderIndex: number;
}
export type CmsNewsStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
export interface CmsNews extends BaseEntity {
    title: string;
    slug: string;
    summary: string;
    content: string;
    authorId: string; // User ID
    featuredImageUrl: string;
    status: CmsNewsStatus;
    isFeatured: boolean;
    tags: string[];
    publishedAt: string; // ISO
    createdAt: string; // ISO
    createdBy: string; // User ID
}
export interface CatchupPrompt {
    id: string;
    catchupId: string;
    atSec: number;
    text: string;
}
export interface CatchupQuiz {
    passingPct: number;
    questions: {
        items: { q: string; options: string[]; answerIndex: number }[];
    };
}
export interface CatchupPlaybackToken {
    src: string;
    host: 'YOUTUBE' | 'SELF';
    rules: {
        minPct: number;
        allowFwdWindowSec: number;
    };
    prompts: Omit<CatchupPrompt, 'catchupId'>[];
    quiz: CatchupQuiz | null;
    watermark: {
        name: string;
        userId: string;
        ts: string;
    };
}

// Online Admission
export type OnlineAdmissionApplicationStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Converted';
export interface OnlineAdmissionApplication extends BaseEntity {
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

// LMS types
export interface Course extends BaseEntity {
    code: string;
    title: string;
    description: string;
    status: 'DRAFT' | 'OPEN' | 'CLOSED';
    visibility: 'PUBLIC' | 'SITE' | 'PRIVATE';
    teachers: string[];
}
export interface Module extends BaseEntity {
    courseId: string;
    title: string;
    summary: string;
    orderIndex: number;
}
export interface Lesson extends BaseEntity {
    moduleId: string;
    title: string;
    contentHtml: string;
    orderIndex: number;
    status: 'DRAFT' | 'PUBLISHED';
}
export interface EduCurriculum extends BaseEntity {
    version: string;
    status: 'DRAFT' | 'PUBLISHED';
    objectives: string[];
}
export interface EduAssignment extends BaseEntity {
    courseId: string;
    title: string;
    dueAt: string;
    totalMarks: number;
}
export interface Quiz extends BaseEntity {
    courseId: string;
    title: string;
    published: boolean;
    timeLimit: number; // in minutes
}
export interface EduResource extends BaseEntity {
    title: string;
    type: 'PDF' | 'Video' | 'Link' | 'File';
    url: string;
    access: 'FREE' | 'PAID';
    price?: number;
}
