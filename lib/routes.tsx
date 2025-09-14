import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import RequireScope from '@/auth/RequireScope';
// FIX: Import Scope from the central types file.
import type { Scope } from '@/types';

// Dashboards
const SisDashboard = React.lazy(() => import('@/pages/sis/SisDashboard'));
const LmsDashboard = React.lazy(() => import('@/pages/lms/LmsDashboard'));
const FrontOfficeDashboard = React.lazy(() => import('@/pages/frontoffice/FrontOfficeDashboard'));

// SIS Modules
const Students = React.lazy(() => import('@/pages/sis/Students'));
const StudentProfile = React.lazy(() => import('@/pages/sis/StudentProfile'));
const Fees = React.lazy(() => import('@/pages/sis/Fees'));
const Faculty = React.lazy(() => import('@/pages/sis/Faculty'));
const Grades = React.lazy(() => import('@/pages/sis/Grades'));
const Attendance = React.lazy(() => import('@/pages/sis/Attendance'));
const AttendanceRecords = React.lazy(() => import('@/pages/sis/AttendanceRecords'));
// FIX: Import the new ClassesAndSections component instead of the generic Academics one for this route.
const ClassesAndSections = React.lazy(() => import('@/academics/ClassesAndSections'));
const Subjects = React.lazy(() => import('@/academics/Subjects'));
const SubjectGroup = React.lazy(() => import('@/academics/SubjectGroup'));
const AssignTeacher = React.lazy(() => import('@/academics/AssignTeacher'));
const PromoteStudents = React.lazy(() => import('@/academics/PromoteStudents'));
const ClassTimetable = React.lazy(() => import('@/academics/ClassTimetable'));
const TeachersTimetable = React.lazy(() => import('@/academics/TeachersTimetable'));

// Student Management
const StudentAdmission = React.lazy(() => import('@/pages/student/StudentAdmission'));
const DisabledStudents = React.lazy(() => import('@/pages/student/DisabledStudents'));
const BulkDelete = React.lazy(() => import('@/pages/student/BulkDelete'));
const Categories = React.lazy(() => import('@/pages/student/Categories'));
const OnlineAdmission = React.lazy(() => import('@/pages/student/OnlineAdmission'));
const MultiClassStudent = React.lazy(() => import('@/pages/student/MultiClassStudent'));
const BatchStudentUpload = React.lazy(() => import('@/pages/student/BatchStudentUpload'));

// Attendance
const ApproveLeave = React.lazy(() => import('@/pages/attendance/ApproveLeave'));

// Examinations
const ExamGroup = React.lazy(() => import('@/pages/exams/ExamGroup'));
const ExamSchedule = React.lazy(() => import('@/pages/exams/ExamSchedule'));
const ExamResult = React.lazy(() => import('@/pages/exams/ExamResult'));
const MarksGrade = React.lazy(() => import('@/pages/exams/MarksGrade'));
const DesignAdmitCard = React.lazy(() => import('@/pages/exams/DesignAdmitCard'));
const PrintAdmitCard = React.lazy(() => import('@/pages/exams/PrintAdmitCard'));
const DesignMarksheet = React.lazy(() => import('@/pages/exams/DesignMarksheet'));
const PrintMarksheet = React.lazy(() => import('@/pages/exams/PrintMarksheet'));

// Online Exams
const OnlineExam = React.lazy(() => import('@/pages/online-exams/OnlineExam'));
const QuestionBank = React.lazy(() => import('@/pages/online-exams/QuestionBank'));
const OnlineExamResult = React.lazy(() => import('@/pages/online-exams/OnlineExamResult'));

// Fees
const SearchPayments = React.lazy(() => import('@/pages/fees/SearchPayments'));
const FeesMaster = React.lazy(() => import('@/pages/fees/FeesMaster'));
const FeesReminder = React.lazy(() => import('@/pages/fees/FeesReminder'));
const Discounts = React.lazy(() => import('@/pages/fees/Discounts'));

// Finance
const Income = React.lazy(() => import('@/pages/finance/Income'));
const Expenses = React.lazy(() => import('@/pages/finance/Expenses'));

// Homework
const AddHomework = React.lazy(() => import('@/pages/homework/AddHomework'));

// Communicate
const NoticeBoard = React.lazy(() => import('@/pages/communicate/NoticeBoard'));
const SendMessage = React.lazy(() => import('@/pages/communicate/SendMessage'));
const Logs = React.lazy(() => import('@/pages/communicate/Logs'));

// Library
const BookList = React.lazy(() => import('@/pages/library/BookList'));
const IssueReturn = React.lazy(() => import('@/pages/library/IssueReturn'));
const AddMember = React.lazy(() => import('@/pages/library/AddMember'));
const DigitalLibrary = React.lazy(() => import('@/pages/library/DigitalLibrary'));
const DigitalViewer = React.lazy(() => import('@/pages/library/DigitalViewer'));
const CatchUpClasses = React.lazy(() => import('@/pages/library/CatchUpClasses'));
const CatchUpViewer = React.lazy(() => import('@/pages/library/CatchUpViewer'));

// Inventory
const AddStock = React.lazy(() => import('@/pages/inventory/AddStock'));
const IssueItem = React.lazy(() => import('@/pages/inventory/IssueItem'));
const InventorySetup = React.lazy(() => import('@/pages/inventory/Setup'));
    
// Transport
const Routes = React.lazy(() => import('@/pages/transport/Routes'));
const Vehicles = React.lazy(() => import('@/pages/transport/Vehicles'));
const AssignVehicle = React.lazy(() => import('@/pages/transport/AssignVehicle'));
const VehicleRequests = React.lazy(() => import('@/pages/transport/VehicleRequests'));

// Hostel
const Hostels = React.lazy(() => import('@/pages/hostel/Hostels'));
const RoomType = React.lazy(() => import('@/pages/hostel/RoomType'));
const HostelRooms = React.lazy(() => import('@/pages/hostel/Rooms'));
const AllocateRoom = React.lazy(() => import('@/pages/hostel/AllocateRoom'));

// Certificate
const StudentCertificate = React.lazy(() => import('@/pages/certificate/StudentCertificate'));
const StaffCertificate = React.lazy(() => import('@/pages/certificate/StaffCertificate'));
const GenerateCertificate = React.lazy(() => import('@/pages/certificate/GenerateCertificate'));
const StudentIdCard = React.lazy(() => import('@/pages/certificate/StudentIdCard'));
const StaffIdCard = React.lazy(() => import('@/pages/certificate/StaffIdCard'));
const IdCardDesigner = React.lazy(() => import('@/pages/certificate/IdCardDesigner'));

// Alumni
const ManageAlumni = React.lazy(() => import('@/pages/alumni/ManageAlumni'));
const AlumniEvents = React.lazy(() => import('@/pages/alumni/Events'));

// Reports
const StudentReport = React.lazy(() => import('@/pages/reports/StudentReport'));
const FinanceReport = React.lazy(() => import('@/pages/reports/FinanceReport'));
const UserLog = React.lazy(() => import('@/pages/reports/UserLog'));
const AuditTrail = React.lazy(() => import('@/pages/reports/AuditTrail'));

// Front Office
const AdmissionEnquiry = React.lazy(() => import('@/pages/frontoffice/AdmissionEnquiry'));
const VisitorBook = React.lazy(() => import('@/pages/frontoffice/VisitorBook'));
const PhoneCallLog = React.lazy(() => import('@/pages/frontoffice/PhoneCallLog'));
const PostalDispatch = React.lazy(() => import('@/pages/frontoffice/PostalDispatch'));
const PostalReceive = React.lazy(() => import('@/pages/frontoffice/PostalReceive'));
const Complain = React.lazy(() => import('@/pages/frontoffice/Complain'));
const FrontOfficeSetup = React.lazy(() => import('@/pages/frontoffice/Setup'));

// LMS Modules
const Courses = React.lazy(() => import('@/pages/lms/Courses'));
const CourseDetail = React.lazy(() => import('@/pages/lms/CourseDetail'));
const Curriculum = React.lazy(() => import('@/pages/lms/Curriculum'));
const Assignments = React.lazy(() => import('@/pages/lms/Assignments'));
const Quizzes = React.lazy(() => import('@/pages/lms/Quizzes'));
const Resources = React.lazy(() => import('@/pages/lms/Resources'));

// Settings
const GeneralSettings = React.lazy(() => import('@/pages/settings/General'));
const Integrations = React.lazy(() => import('@/pages/settings/Integrations'));
const PrintSettings = React.lazy(() => import('@/pages/settings/Print'));
const CmsSettings = React.lazy(() => import('@/pages/settings/Cms'));
const Roles = React.lazy(() => import('@/pages/settings/Roles'));
const Backup = React.lazy(() => import('@/pages/settings/Backup'));
const UsersModules = React.lazy(() => import('@/pages/settings/UsersModules'));
const Customization = React.lazy(() => import('@/pages/settings/Customization'));
const SystemFields = React.lazy(() => import('@/pages/settings/SystemFields'));
const SystemUpdate = React.lazy(() => import('@/pages/settings/SystemUpdate'));


interface AppRoute {
    path: string;
    element: React.ReactNode;
    scope: Scope;
}

const routes: AppRoute[] = [
    // School (SIS) routes
    { path: '/school/:siteId', element: <SisDashboard />, scope: 'school:read' },
    { path: '/school/:siteId/students', element: <Students />, scope: 'school:read' },
    { path: '/school/:siteId/students/:studentId', element: <StudentProfile />, scope: 'school:read' },
    { path: '/school/:siteId/fees', element: <Fees />, scope: 'school:read' },
    { path: '/school/:siteId/faculty', element: <Faculty />, scope: 'school:read' },
    { path: '/school/:siteId/grades', element: <Grades />, scope: 'school:read' },
    { path: '/school/:siteId/attendance', element: <Attendance />, scope: 'school:read' },
    { path: '/school/:siteId/attendance/records', element: <AttendanceRecords />, scope: 'school:read' },
    // FIX: Use the new ClassesAndSections component for this route.
    { path: '/school/:siteId/academics/classes', element: <ClassesAndSections />, scope: 'school:read' },
    { path: '/school/:siteId/academics/subjects', element: <Subjects />, scope: 'school:read' },
    { path: '/school/:siteId/academics/subject-group', element: <SubjectGroup />, scope: 'school:write' },
    { path: '/school/:siteId/academics/assign-teacher', element: <AssignTeacher />, scope: 'school:write' },
    { path: '/school/:siteId/academics/promote-students', element: <PromoteStudents />, scope: 'school:write' },
    { path: '/school/:siteId/academics/class-timetable', element: <ClassTimetable />, scope: 'school:read' },
    { path: '/school/:siteId/academics/teachers-timetable', element: <TeachersTimetable />, scope: 'school:read' },

    // Student Management
    { path: '/school/:siteId/student-admission', element: <StudentAdmission />, scope: 'school:write' },
    { path: '/school/:siteId/disabled-students', element: <DisabledStudents />, scope: 'school:read' },
    { path: '/school/:siteId/bulk-delete', element: <BulkDelete />, scope: 'school:write' },
    { path: '/school/:siteId/student-categories', element: <Categories />, scope: 'school:read' },
    { path: '/school/:siteId/online-admission', element: <OnlineAdmission />, scope: 'school:read' },
    { path: '/school/:siteId/multi-class-student', element: <MultiClassStudent />, scope: 'school:write' },
    { path: '/school/:siteId/batch-student-upload', element: <BatchStudentUpload />, scope: 'school:write' },

    // Attendance
    { path: '/school/:siteId/attendance/approve-leave', element: <ApproveLeave />, scope: 'school:write' },

    // Examinations
    { path: '/school/:siteId/exams/exam-group', element: <ExamGroup />, scope: 'school:read' },
    { path: '/school/:siteId/exams/exam-schedule', element: <ExamSchedule />, scope: 'school:read' },
    { path: '/school/:siteId/exams/exam-result', element: <ExamResult />, scope: 'school:read' },
    { path: '/school/:siteId/exams/marks-grade', element: <MarksGrade />, scope: 'school:read' },
    { path: '/school/:siteId/exams/design-admit-card', element: <DesignAdmitCard />, scope: 'school:write' },
    { path: '/school/:siteId/exams/print-admit-card', element: <PrintAdmitCard />, scope: 'school:read' },
    { path: '/school/:siteId/exams/design-marksheet', element: <DesignMarksheet />, scope: 'school:write' },
    { path: '/school/:siteId/exams/print-marksheet', element: <PrintMarksheet />, scope: 'school:read' },
    
    // Online Exams
    { path: '/school/:siteId/online-exams/online-exam', element: <OnlineExam />, scope: 'school:read' },
    { path: '/school/:siteId/online-exams/question-bank', element: <QuestionBank />, scope: 'school:read' },
    { path: '/school/:siteId/online-exams/online-exam-result', element: <OnlineExamResult />, scope: 'school:read' },

    // Fees
    { path: '/school/:siteId/fees/search-payments', element: <SearchPayments />, scope: 'school:read' },
    { path: '/school/:siteId/fees/fees-master', element: <FeesMaster />, scope: 'school:read' },
    { path: '/school/:siteId/fees/fees-reminder', element: <FeesReminder />, scope: 'school:read' },
    { path: '/school/:siteId/fees/discounts', element: <Discounts />, scope: 'school:read' },

    // Finance
    { path: '/school/:siteId/finance/income', element: <Income />, scope: 'school:read' },
    { path: '/school/:siteId/finance/expenses', element: <Expenses />, scope: 'school:read' },

    // Homework
    { path: '/school/:siteId/homework', element: <AddHomework />, scope: 'school:read' },

    // Communicate
    { path: '/school/:siteId/communicate/notice-board', element: <NoticeBoard />, scope: 'school:read' },
    { path: '/school/:siteId/communicate/send-message', element: <SendMessage />, scope: 'school:write' },
    { path: '/school/:siteId/communicate/logs', element: <Logs />, scope: 'school:read' },

    // Library
    { path: '/school/:siteId/library/book-list', element: <BookList />, scope: 'school:read' },
    { path: '/school/:siteId/library/issue-return', element: <IssueReturn />, scope: 'school:write' },
    { path: '/school/:siteId/library/add-member', element: <AddMember />, scope: 'school:write' },
    { path: '/school/:siteId/library/digital', element: <DigitalLibrary />, scope: 'school:read' },
    { path: '/school/:siteId/library/viewer/:assetId', element: <DigitalViewer />, scope: 'school:read' },
    { path: '/school/:siteId/library/catchup', element: <CatchUpClasses />, scope: 'school:read' },
    { path: '/school/:siteId/library/catchup/:catchupId', element: <CatchUpViewer />, scope: 'school:read' },

    // Inventory
    { path: '/school/:siteId/inventory/add-stock', element: <AddStock />, scope: 'school:write' },
    { path: '/school/:siteId/inventory/issue-item', element: <IssueItem />, scope: 'school:write' },
    { path: '/school/:siteId/inventory/setup', element: <InventorySetup />, scope: 'school:write' },
    
    // Transport
    { path: '/school/:siteId/transport/routes', element: <Routes />, scope: 'school:read' },
    { path: '/school/:siteId/transport/vehicles', element: <Vehicles />, scope: 'school:read' },
    { path: '/school/:siteId/transport/assign-vehicle', element: <AssignVehicle />, scope: 'school:write' },
    { path: '/school/:siteId/transport/vehicle-requests', element: <VehicleRequests />, scope: 'school:read' },

    // Hostel
    { path: '/school/:siteId/hostel/hostels', element: <Hostels />, scope: 'school:read' },
    { path: '/school/:siteId/hostel/room-type', element: <RoomType />, scope: 'school:read' },
    { path: '/school/:siteId/hostel/rooms', element: <HostelRooms />, scope: 'school:read' },
    { path: '/school/:siteId/hostel/allocate-room', element: <AllocateRoom />, scope: 'school:write' },

    // Certificate
    { path: '/school/:siteId/certificate/student-certificate', element: <StudentCertificate />, scope: 'school:write' },
    { path: '/school/:siteId/certificate/staff-certificate', element: <StaffCertificate />, scope: 'school:write' },
    { path: '/school/:siteId/certificate/generate-certificate', element: <GenerateCertificate />, scope: 'school:write' },
    { path: '/school/:siteId/certificate/student-id-card', element: <StudentIdCard />, scope: 'school:write' },
    { path: '/school/:siteId/certificate/staff-id-card', element: <StaffIdCard />, scope: 'school:write' },
    { path: '/school/:siteId/certificate/id-card-designer', element: <IdCardDesigner />, scope: 'school:write' },
    
    // Alumni
    { path: '/school/:siteId/alumni/manage', element: <ManageAlumni />, scope: 'school:read' },
    { path: '/school/:siteId/alumni/events', element: <AlumniEvents />, scope: 'school:read' },

    // Reports
    { path: '/school/:siteId/reports/student-report', element: <StudentReport />, scope: 'school:admin' },
    { path: '/school/:siteId/reports/finance-report', element: <FinanceReport />, scope: 'school:admin' },
    { path: '/school/:siteId/reports/user-log', element: <UserLog />, scope: 'school:admin' },
    { path: '/school/:siteId/reports/audit-trail', element: <AuditTrail />, scope: 'school:admin' },

    // Front Office
    { path: '/front-office/:siteId', element: <FrontOfficeDashboard />, scope: 'school:read' },
    { path: '/front-office/:siteId/admission-enquiry', element: <AdmissionEnquiry />, scope: 'school:read' },
    { path: '/front-office/:siteId/visitor-book', element: <VisitorBook />, scope: 'school:read' },
    { path: '/front-office/:siteId/phone-call-log', element: <PhoneCallLog />, scope: 'school:read' },
    { path: '/front-office/:siteId/postal-dispatch', element: <PostalDispatch />, scope: 'school:read' },
    { path: '/front-office/:siteId/postal-receive', element: <PostalReceive />, scope: 'school:read' },
    { path: '/front-office/:siteId/complain', element: <Complain />, scope: 'school:read' },
    { path: '/front-office/:siteId/setup', element: <FrontOfficeSetup />, scope: 'school:write' },

    // Education (LMS) routes
    { path: '/education/:siteId', element: <LmsDashboard />, scope: 'school:read' },
    { path: '/education/:siteId/courses', element: <Courses />, scope: 'school:read' },
    { path: '/education/:siteId/courses/:courseId', element: <CourseDetail />, scope: 'school:read' },
    { path: '/education/:siteId/curriculum', element: <Curriculum />, scope: 'school:read' },
    { path: '/education/:siteId/assignments', element: <Assignments />, scope: 'school:read' },
    { path: '/education/:siteId/quizzes', element: <Quizzes />, scope: 'school:read' },
    { path: '/education/:siteId/resources', element: <Resources />, scope: 'school:read' },

    // Settings
    { path: '/school/:siteId/settings/general', element: <GeneralSettings />, scope: 'school:admin' },
    { path: '/school/:siteId/settings/integrations', element: <Integrations />, scope: 'school:admin' },
    { path: '/school/:siteId/settings/print', element: <PrintSettings />, scope: 'school:admin' },
    { path: '/school/:siteId/settings/cms', element: <CmsSettings />, scope: 'school:admin' },
    { path: '/school/:siteId/settings/rbac', element: <Roles />, scope: 'school:admin' },
    { path: '/school/:siteId/settings/backup', element: <Backup />, scope: 'school:admin' },
    { path: '/school/:siteId/settings/users-modules', element: <UsersModules />, scope: 'school:admin' },
    { path: '/school/:siteId/settings/customization', element: <Customization />, scope: 'school:admin' },
    { path: '/school/:siteId/settings/system-fields', element: <SystemFields />, scope: 'school:admin' },
    { path: '/school/:siteId/settings/system-update', element: <SystemUpdate />, scope: 'school:admin' },
];

export const schoolRoutes = routes.map(({ path, element, scope }) => ({
    path,
    element: <MainLayout><RequireScope scope={scope}>{element}</RequireScope></MainLayout>
}));