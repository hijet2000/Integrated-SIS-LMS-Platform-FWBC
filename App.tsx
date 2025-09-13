import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
// FIX: Added default export to pages/finance/Expenses.tsx to resolve lazy loading issue.
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
const VerifyCertificate = React.lazy(() => import('@/pages/VerifyCertificate'));

const CmsEvents = React.lazy(() => import('@/pages/front-cms/Events'));
const CmsGallery = React.lazy(() => import('@/pages/front-cms/Gallery'));
const CmsNews = React.lazy(() => import('@/pages/front-cms/News'));
const CmsBannerImages = React.lazy(() => import('@/pages/front-cms/BannerImages'));
// FIX: Corrected import path for MediaManager component and added a default export to the file to resolve the module not found error.
const CmsMediaManager = React.lazy(() => import('@/pages/front-cms/MediaManager'));
// FIX: Corrected import path for PagesMenus component and added a default export to the file to resolve the module not found error.
const CmsPagesMenus = React.lazy(() => import('@/pages/front-cms/PagesMenus'));

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Spinner size="lg" /></div>}>
            <Routes>
              {/* Public Verification Route */}
              <Route path="/verify/:serialId" element={<VerifyCertificate />} />
              
              <Route path="/" element={<Navigate to="/dashboard/site_123" replace />} />

              {/* Encapsulate all main app routes within the MainLayout */}
              <Route element={<MainLayout />}>
                <Route path="/dashboard/:siteId" element={<Dashboard />} />

                {/* SIS Routes */}
                <Route path="/school/:siteId" element={<SisDashboard />} />
                <Route path="/school/:siteId/students" element={<Students />} />
                <Route path="/school/:siteId/students/:studentId" element={<StudentProfile />} />
                <Route path="/school/:siteId/fees" element={<Fees />} />
                <Route path="/school/:siteId/attendance" element={<Attendance />} />
                <Route path="/school/:siteId/attendance/records" element={<AttendanceRecords />} />
                <Route path="/school/:siteId/academics" element={<Academics />} />
                <Route path="/school/:siteId/grades" element={<Grades />} />
                <Route path="/school/:siteId/faculty" element={<Faculty />} />

                {/* Student Management Routes */}
                <Route path="/student/:siteId/admission" element={<StudentAdmission/>} />
                <Route path="/student/:siteId/bulk-delete" element={<BulkDelete/>} />
                <Route path="/student/:siteId/categories" element={<Categories/>} />
                <Route path="/student/:siteId/disabled-students" element={<DisabledStudents/>} />
                <Route path="/student/:siteId/multi-class-student" element={<MultiClassStudent/>} />
                <Route path="/student/:siteId/online-admission" element={<OnlineAdmission/>} />
                <Route path="/student/:siteId/batch-upload" element={<BatchStudentUpload/>} />

                {/* Attendance */}
                <Route path="/attendance/:siteId/approve-leave" element={<ApproveLeave/>} />

                {/* Academics Routes */}
                <Route path="/academics/:siteId/timetable" element={<ClassTimetable/>} />
                <Route path="/academics/:siteId/teachers-timetable" element={<TeachersTimetable/>} />
                <Route path="/academics/:siteId/assign-teacher" element={<AssignTeacher/>} />
                <Route path="/academics/:siteId/subjects" element={<Subjects/>} />
                <Route path="/academics/:siteId/classes" element={<ClassesAndSections/>} />
                <Route path="/academics/:siteId/subject-group" element={<SubjectGroup/>} />
                <Route path="/academics/:siteId/promote" element={<PromoteStudents/>} />

                {/* LMS Routes */}
                <Route path="/education/:siteId" element={<LmsDashboard />} />
                <Route path="/education/:siteId/courses" element={<Courses />} />
                <Route path="/education/:siteId/courses/:courseId" element={<CourseDetail />} />
                <Route path="/education/:siteId/curriculum" element={<LmsCurriculum />} />
                <Route path="/education/:siteId/assignments" element={<Assignments />} />
                <Route path="/education/:siteId/quizzes" element={<Quizzes />} />
                <Route path="/education/:siteId/resources" element={<Resources />} />
                
                {/* Exams Routes */}
                <Route path="/exams/:siteId/group" element={<ExamsDashboard/>} />
                <Route path="/exams/:siteId/schedule" element={<ExamSchedule/>} />
                <Route path="/exams/:siteId/result" element={<ExamResult/>} />
                <Route path="/exams/:siteId/design-admit-card" element={<DesignAdmitCard/>} />
                <Route path="/exams/:siteId/print-admit-card" element={<PrintAdmitCard/>} />
                <Route path="/exams/:siteId/design-marksheet" element={<DesignMarksheet/>} />
                <Route path="/exams/:siteId/print-marksheet" element={<PrintMarksheet/>} />
                <Route path="/exams/:siteId/grades" element={<MarksGrade/>} />
                
                {/* Online Exams */}
                <Route path="/online-exams/:siteId/exam" element={<OnlineExamsDashboard/>} />
                <Route path="/online-exams/:siteId/question-bank" element={<QuestionBank/>} />
                <Route path="/online-exams/:siteId/result" element={<OnlineExamResult/>} />
                
                {/* Front Office */}
                <Route path="/front-office/:siteId" element={<FrontOfficeDashboard/>} />
                <Route path="/front-office/:siteId/admission-enquiry" element={<AdmissionEnquiry/>} />
                <Route path="/front-office/:siteId/visitor-book" element={<VisitorBook/>} />
                <Route path="/front-office/:siteId/phone-call-log" element={<PhoneCallLog/>} />
                <Route path="/front-office/:siteId/postal-dispatch" element={<PostalDispatch/>} />
                <Route path="/front-office/:siteId/postal-receive" element={<PostalReceive/>} />
                <Route path="/front-office/:siteId/complain" element={<Complain/>} />
                <Route path="/front-office/:siteId/setup" element={<FrontOfficeSetup/>} />

                {/* Fees Collection */}
                <Route path="/fees/:siteId/master" element={<FeesMaster/>} />
                <Route path="/fees/:siteId/reminders" element={<FeesReminder/>} />
                <Route path="/fees/:siteId/search" element={<SearchPayments/>} />

                {/* Finance */}
                <Route path="/finance/:siteId/income" element={<Income/>} />
                <Route path="/finance/:siteId/expenses" element={<Expenses/>} />
                
                {/* Communicate */}
                <Route path="/communicate/:siteId/notice-board" element={<NoticeBoard/>} />
                <Route path="/communicate/:siteId/send-message" element={<SendMessage/>} />
                <Route path="/communicate/:siteId/logs" element={<Logs/>} />
                
                {/* Downloads */}
                <Route path="/downloads/:siteId/assignments" element={<AssignmentsDownload/>} />
                <Route path="/downloads/:siteId/syllabus" element={<Syllabus/>} />
                <Route path="/downloads/:siteId/other" element={<OtherDownloads/>} />
                <Route path="/downloads/:siteId/upload" element={<UploadContent/>} />
                
                {/* Homework */}
                <Route path="/homework/:siteId/add" element={<Homework/>} />
                
                {/* Library */}
                <Route path="/library/:siteId/books" element={<BookList/>} />
                <Route path="/library/:siteId/members" element={<AddMember/>} />
                <Route path="/library/:siteId/issue-return" element={<IssueReturn/>} />
                <Route path="/library/:siteId/digital" element={<DigitalLibrary/>} />
                <Route path="/library/:siteId/viewer/:assetId" element={<DigitalViewer/>} />
                <Route path="/library/:siteId/catchup" element={<CatchUpClasses/>} />
                <Route path="/library/:siteId/catchup/:catchupId" element={<CatchUpViewer/>} />

                {/* Certificate Routes */}
                <Route path="/certificate/:siteId/student-certificate" element={<StudentCertificate />} />
                <Route path="/certificate/:siteId/staff-certificate" element={<StaffCertificate />} />
                <Route path="/certificate/:siteId/student-id-card" element={<StudentIdCard />} />
                <Route path="/certificate/:siteId/staff-id-card" element={<StaffIdCard />} />
                <Route path="/certificate/:siteId/id-card-designer" element={<IdCardDesigner />} />

                {/* Front CMS Routes */}
                <Route path="/front-cms/:siteId/events" element={<CmsEvents />} />
                <Route path="/front-cms/:siteId/gallery" element={<CmsGallery />} />
                <Route path="/front-cms/:siteId/news" element={<CmsNews />} />
                <Route path="/front-cms/:siteId/banner-images" element={<CmsBannerImages />} />
                <Route path="/front-cms/:siteId/media-manager" element={<CmsMediaManager />} />
                <Route path="/front-cms/:siteId/pages-menus" element={<CmsPagesMenus />} />

                {/* Settings */}
                <Route path="/settings/:siteId/roles" element={<Roles/>} />
                
                {/* 404 Not Found */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;