import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/hooks/useAuth';

import MainLayout from '@/components/layout/MainLayout';
import Spinner from '@/components/ui/Spinner';
import NotFound from '@/pages/NotFound';

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const SisDashboard = React.lazy(() => import('@/pages/sis/SisDashboard'));
const Students = React.lazy(() => import('@/pages/sis/Students'));
const StudentProfile = React.lazy(() => import('@/pages/sis/StudentProfile'));
const Fees = React.lazy(() => import('@/pages/sis/Fees'));
const Attendance = React.lazy(() => import('@/pages/sis/Attendance'));
const AttendanceRecords = React.lazy(() => import('@/pages/sis/AttendanceRecords'));
const Academics = React.lazy(() => import('@/pages/sis/Academics'));
const Grades = React.lazy(() => import('@/pages/sis/Grades'));
const Faculty = React.lazy(() => import('@/pages/sis/Faculty'));

const LmsDashboard = React.lazy(() => import('@/pages/lms/LmsDashboard'));
const Courses = React.lazy(() => import('@/pages/lms/Courses'));
const CourseDetail = React.lazy(() => import('@/pages/lms/CourseDetail'));
const LmsCurriculum = React.lazy(() => import('@/pages/lms/Curriculum'));
const Assignments = React.lazy(() => import('@/pages/lms/Assignments'));
const Quizzes = React.lazy(() => import('@/pages/lms/Quizzes'));
const Resources = React.lazy(() => import('@/pages/lms/Resources'));

const StudentAdmission = React.lazy(() => import('@/pages/student/StudentAdmission'));
const BulkDelete = React.lazy(() => import('@/pages/student/BulkDelete'));
const Categories = React.lazy(() => import('@/pages/student/Categories'));
const DisabledStudents = React.lazy(() => import('@/pages/student/DisabledStudents'));
const MultiClassStudent = React.lazy(() => import('@/pages/student/MultiClassStudent'));
const OnlineAdmission = React.lazy(() => import('@/pages/student/OnlineAdmission'));
const BatchStudentUpload = React.lazy(() => import('@/pages/student/BatchStudentUpload'));

const ApproveLeave = React.lazy(() => import('@/pages/attendance/ApproveLeave'));

const AcademicsMain = React.lazy(() => import('@/pages/academics/Academics'));
const AssignTeacher = React.lazy(() => import('@/pages/academics/AssignTeacher'));
const ClassesAndSections = React.lazy(() => import('@/pages/academics/ClassesAndSections'));
const ClassTimetable = React.lazy(() => import('@/pages/academics/ClassTimetable'));
const PromoteStudents = React.lazy(() => import('@/pages/academics/PromoteStudents'));
const SubjectGroup = React.lazy(() => import('@/pages/academics/SubjectGroup'));
const Subjects = React.lazy(() => import('@/pages/academics/Subjects'));
const TeachersTimetable = React.lazy(() => import('@/pages/academics/TeachersTimetable'));

const ExamsDashboard = React.lazy(() => import('@/pages/exams/ExamGroup'));
const ExamSchedule = React.lazy(() => import('@/pages/exams/ExamSchedule'));
const ExamResult = React.lazy(() => import('@/pages/exams/ExamResult'));
const DesignAdmitCard = React.lazy(() => import('@/pages/exams/DesignAdmitCard'));
const PrintAdmitCard = React.lazy(() => import('@/pages/exams/PrintAdmitCard'));
const DesignMarksheet = React.lazy(() => import('@/pages/exams/DesignMarksheet'));
const PrintMarksheet = React.lazy(() => import('@/pages/exams/PrintMarksheet'));
const MarksGrade = React.lazy(() => import('@/pages/exams/MarksGrade'));

const OnlineExamsDashboard = React.lazy(() => import('@/pages/online-exams/OnlineExam'));
const QuestionBank = React.lazy(() => import('@/pages/online-exams/QuestionBank'));
const OnlineExamResult = React.lazy(() => import('@/pages/online-exams/OnlineExamResult'));

const FrontOfficeDashboard = React.lazy(() => import('@/pages/frontoffice/FrontOfficeDashboard'));
const AdmissionEnquiry = React.lazy(() => import('@/pages/frontoffice/AdmissionEnquiry'));
const VisitorBook = React.lazy(() => import('@/pages/frontoffice/VisitorBook'));
const PhoneCallLog = React.lazy(() => import('@/pages/frontoffice/PhoneCallLog'));
const PostalDispatch = React.lazy(() => import('@/pages/frontoffice/PostalDispatch'));
const PostalReceive = React.lazy(() => import('@/pages/frontoffice/PostalReceive'));
const Complain = React.lazy(() => import('@/pages/frontoffice/Complain'));
const FrontOfficeSetup = React.lazy(() => import('@/pages/frontoffice/Setup'));

const FeesDashboard = React.lazy(() => import('@/pages/fees/FeesMaster'));
const FeesMaster = React.lazy(() => import('@/pages/fees/FeesMaster'));
const FeesReminder = React.lazy(() => import('@/pages/fees/FeesReminder'));
const SearchPayments = React.lazy(() => import('@/pages/fees/SearchPayments'));

const FinanceDashboard = React.lazy(() => import('@/pages/finance/Income'));
const Income = React.lazy(() => import('@/pages/finance/Income'));
const Expenses = React.lazy(() => import('@/pages/finance/Expenses'));

const CommunicateDashboard = React.lazy(() => import('@/pages/communicate/NoticeBoard'));
const NoticeBoard = React.lazy(() => import('@/pages/communicate/NoticeBoard'));
const SendMessage = React.lazy(() => import('@/pages/communicate/SendMessage'));
const Logs = React.lazy(() => import('@/pages/communicate/Logs'));

const DownloadsDashboard = React.lazy(() => import('@/pages/downloads/Assignments'));
const AssignmentsDownload = React.lazy(() => import('@/pages/downloads/Assignments'));
const Syllabus = React.lazy(() => import('@/pages/downloads/Syllabus'));
const OtherDownloads = React.lazy(() => import('@/pages/downloads/OtherDownloads'));
const UploadContent = React.lazy(() => import('@/pages/downloads/UploadContent'));

const Homework = React.lazy(() => import('@/pages/homework/AddHomework'));

const LibraryDashboard = React.lazy(() => import('@/pages/library/BookList'));
const BookList = React.lazy(() => import('@/pages/library/BookList'));
const AddMember = React.lazy(() => import('@/pages/library/AddMember'));
const IssueReturn = React.lazy(() => import('@/pages/library/IssueReturn'));
const DigitalLibrary = React.lazy(() => import('@/pages/library/DigitalLibrary'));
const DigitalViewer = React.lazy(() => import('@/pages/library/DigitalViewer'));
const CatchUpClasses = React.lazy(() => import('@/pages/library/CatchUpClasses'));
const CatchUpViewer = React.lazy(() => import('@/pages/library/CatchUpViewer'));

const Roles = React.lazy(() => import('@/pages/settings/Roles'));

const StudentCertificate = React.lazy(() => import('@/pages/certificate/StudentCertificate'));
const StaffCertificate = React.lazy(() => import('@/pages/certificate/StaffCertificate'));
const StudentIdCard = React.lazy(() => import('@/pages/certificate/StudentIdCard'));
const StaffIdCard = React.lazy(() => import('@/pages/certificate/StaffIdCard'));
const IdCardDesigner = React.lazy(() => import('@/pages/certificate/IdCardDesigner'));


const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Spinner size="lg" /></div>}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard/site_123" replace />} />

              <Route path="/dashboard/:siteId" element={<MainLayout><Dashboard /></MainLayout>} />

              {/* SIS Routes */}
              <Route path="/school/:siteId" element={<MainLayout><SisDashboard /></MainLayout>} />
              <Route path="/school/:siteId/students" element={<MainLayout><Students /></MainLayout>} />
              <Route path="/school/:siteId/students/:studentId" element={<MainLayout><StudentProfile /></MainLayout>} />
              <Route path="/school/:siteId/fees" element={<MainLayout><Fees /></MainLayout>} />
              <Route path="/school/:siteId/attendance" element={<MainLayout><Attendance /></MainLayout>} />
              <Route path="/school/:siteId/attendance/records" element={<MainLayout><AttendanceRecords /></MainLayout>} />
              <Route path="/school/:siteId/academics" element={<MainLayout><Academics /></MainLayout>} />
              <Route path="/school/:siteId/grades" element={<MainLayout><Grades /></MainLayout>} />
              <Route path="/school/:siteId/faculty" element={<MainLayout><Faculty /></MainLayout>} />

              {/* Student Management Routes */}
              <Route path="/student/:siteId/admission" element={<MainLayout><StudentAdmission/></MainLayout>} />
              <Route path="/student/:siteId/bulk-delete" element={<MainLayout><BulkDelete/></MainLayout>} />
              <Route path="/student/:siteId/categories" element={<MainLayout><Categories/></MainLayout>} />
              <Route path="/student/:siteId/disabled-students" element={<MainLayout><DisabledStudents/></MainLayout>} />
              <Route path="/student/:siteId/multi-class-student" element={<MainLayout><MultiClassStudent/></MainLayout>} />
              <Route path="/student/:siteId/online-admission" element={<MainLayout><OnlineAdmission/></MainLayout>} />
              <Route path="/student/:siteId/batch-upload" element={<MainLayout><BatchStudentUpload/></MainLayout>} />

              {/* Attendance */}
              <Route path="/attendance/:siteId/approve-leave" element={<MainLayout><ApproveLeave/></MainLayout>} />

              {/* Academics Routes */}
              <Route path="/academics/:siteId/timetable" element={<MainLayout><ClassTimetable/></MainLayout>} />
              <Route path="/academics/:siteId/teachers-timetable" element={<MainLayout><TeachersTimetable/></MainLayout>} />
              <Route path="/academics/:siteId/assign-teacher" element={<MainLayout><AssignTeacher/></MainLayout>} />
              <Route path="/academics/:siteId/subjects" element={<MainLayout><Subjects/></MainLayout>} />
              <Route path="/academics/:siteId/classes" element={<MainLayout><ClassesAndSections/></MainLayout>} />
              <Route path="/academics/:siteId/subject-group" element={<MainLayout><SubjectGroup/></MainLayout>} />
              <Route path="/academics/:siteId/promote" element={<MainLayout><PromoteStudents/></MainLayout>} />

              {/* LMS Routes */}
              <Route path="/education/:siteId" element={<MainLayout><LmsDashboard /></MainLayout>} />
              <Route path="/education/:siteId/courses" element={<MainLayout><Courses /></MainLayout>} />
              <Route path="/education/:siteId/courses/:courseId" element={<MainLayout><CourseDetail /></MainLayout>} />
              <Route path="/education/:siteId/curriculum" element={<MainLayout><LmsCurriculum /></MainLayout>} />
              <Route path="/education/:siteId/assignments" element={<MainLayout><Assignments /></MainLayout>} />
              <Route path="/education/:siteId/quizzes" element={<MainLayout><Quizzes /></MainLayout>} />
              <Route path="/education/:siteId/resources" element={<MainLayout><Resources /></MainLayout>} />
              
              {/* Exams Routes */}
              <Route path="/exams/:siteId/group" element={<MainLayout><ExamsDashboard/></MainLayout>} />
              <Route path="/exams/:siteId/schedule" element={<MainLayout><ExamSchedule/></MainLayout>} />
              <Route path="/exams/:siteId/result" element={<MainLayout><ExamResult/></MainLayout>} />
              <Route path="/exams/:siteId/design-admit-card" element={<MainLayout><DesignAdmitCard/></MainLayout>} />
              <Route path="/exams/:siteId/print-admit-card" element={<MainLayout><PrintAdmitCard/></MainLayout>} />
              <Route path="/exams/:siteId/design-marksheet" element={<MainLayout><DesignMarksheet/></MainLayout>} />
              <Route path="/exams/:siteId/print-marksheet" element={<MainLayout><PrintMarksheet/></MainLayout>} />
              <Route path="/exams/:siteId/grades" element={<MainLayout><MarksGrade/></MainLayout>} />
              
              {/* Online Exams */}
              <Route path="/online-exams/:siteId/exam" element={<MainLayout><OnlineExamsDashboard/></MainLayout>} />
              <Route path="/online-exams/:siteId/question-bank" element={<MainLayout><QuestionBank/></MainLayout>} />
              <Route path="/online-exams/:siteId/result" element={<MainLayout><OnlineExamResult/></MainLayout>} />
              
              {/* Front Office */}
              <Route path="/front-office/:siteId" element={<MainLayout><FrontOfficeDashboard/></MainLayout>} />
              <Route path="/front-office/:siteId/admission-enquiry" element={<MainLayout><AdmissionEnquiry/></MainLayout>} />
              <Route path="/front-office/:siteId/visitor-book" element={<MainLayout><VisitorBook/></MainLayout>} />
              <Route path="/front-office/:siteId/phone-call-log" element={<MainLayout><PhoneCallLog/></MainLayout>} />
              <Route path="/front-office/:siteId/postal-dispatch" element={<MainLayout><PostalDispatch/></MainLayout>} />
              <Route path="/front-office/:siteId/postal-receive" element={<MainLayout><PostalReceive/></MainLayout>} />
              <Route path="/front-office/:siteId/complain" element={<MainLayout><Complain/></MainLayout>} />
              <Route path="/front-office/:siteId/setup" element={<MainLayout><FrontOfficeSetup/></MainLayout>} />

              {/* Fees Collection */}
              <Route path="/fees/:siteId/master" element={<MainLayout><FeesMaster/></MainLayout>} />
              <Route path="/fees/:siteId/reminders" element={<MainLayout><FeesReminder/></MainLayout>} />
              <Route path="/fees/:siteId/search" element={<MainLayout><SearchPayments/></MainLayout>} />

              {/* Finance */}
              <Route path="/finance/:siteId/income" element={<MainLayout><Income/></MainLayout>} />
              <Route path="/finance/:siteId/expenses" element={<MainLayout><Expenses/></MainLayout>} />
              
              {/* Communicate */}
              <Route path="/communicate/:siteId/notice-board" element={<MainLayout><NoticeBoard/></MainLayout>} />
              <Route path="/communicate/:siteId/send-message" element={<MainLayout><SendMessage/></MainLayout>} />
              <Route path="/communicate/:siteId/logs" element={<MainLayout><Logs/></MainLayout>} />
              
              {/* Downloads */}
              <Route path="/downloads/:siteId/assignments" element={<MainLayout><AssignmentsDownload/></MainLayout>} />
              <Route path="/downloads/:siteId/syllabus" element={<MainLayout><Syllabus/></MainLayout>} />
              <Route path="/downloads/:siteId/other" element={<MainLayout><OtherDownloads/></MainLayout>} />
              <Route path="/downloads/:siteId/upload" element={<MainLayout><UploadContent/></MainLayout>} />
              
              {/* Homework */}
              <Route path="/homework/:siteId/add" element={<MainLayout><Homework/></MainLayout>} />
              
              {/* Library */}
              <Route path="/library/:siteId/books" element={<MainLayout><BookList/></MainLayout>} />
              <Route path="/library/:siteId/members" element={<MainLayout><AddMember/></MainLayout>} />
              <Route path="/library/:siteId/issue-return" element={<MainLayout><IssueReturn/></MainLayout>} />
              <Route path="/library/:siteId/digital" element={<MainLayout><DigitalLibrary/></MainLayout>} />
              <Route path="/library/:siteId/viewer/:assetId" element={<MainLayout><DigitalViewer/></MainLayout>} />
              <Route path="/library/:siteId/catchup" element={<MainLayout><CatchUpClasses/></MainLayout>} />
              <Route path="/library/:siteId/catchup/:catchupId" element={<MainLayout><CatchUpViewer/></MainLayout>} />

              {/* Certificate Routes */}
              <Route path="/certificate/:siteId/student-certificate" element={<MainLayout><StudentCertificate /></MainLayout>} />
              <Route path="/certificate/:siteId/staff-certificate" element={<MainLayout><StaffCertificate /></MainLayout>} />
              <Route path="/certificate/:siteId/student-id-card" element={<MainLayout><StudentIdCard /></MainLayout>} />
              <Route path="/certificate/:siteId/staff-id-card" element={<MainLayout><StaffIdCard /></MainLayout>} />
              <Route path="/certificate/:siteId/id-card-designer" element={<MainLayout><IdCardDesigner /></MainLayout>} />

              {/* Settings */}
              <Route path="/settings/:siteId/roles" element={<MainLayout><Roles/></MainLayout>} />


              {/* 404 Not Found */}
              <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;