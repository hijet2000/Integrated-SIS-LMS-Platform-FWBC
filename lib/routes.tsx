
import React from 'react';
import { SCHOOL_SIDEBAR } from '@/constants/sidebar';
import type { NavItem } from '@/types/navigation';

import MainLayout from '@/components/layout/MainLayout';
import RequireScope from '@/auth/RequireScope';
import Placeholder from '@/components/ui/Placeholder';

// --- Lazy Load ALL components ---
// This map connects a path to its component.
const componentMap: { [key: string]: React.LazyExoticComponent<React.FC<any>> } = {
    '/school/:siteId/dashboard': React.lazy(() => import('@/pages/sis/SisDashboard')),
    '/school/:siteId/front-office/admission-enquiry': React.lazy(() => import('@/pages/frontoffice/AdmissionEnquiry')),
    '/school/:siteId/front-office/visitor-book': React.lazy(() => import('@/pages/frontoffice/VisitorBook')),
    '/school/:siteId/front-office/phone-calls': React.lazy(() => import('@/pages/frontoffice/PhoneCallLog')),
    '/school/:siteId/front-office/postal-dispatch': React.lazy(() => import('@/pages/frontoffice/PostalDispatch')),
    '/school/:siteId/front-office/postal-receive': React.lazy(() => import('@/pages/frontoffice/PostalReceive')),
    '/school/:siteId/front-office/complaints': React.lazy(() => import('@/pages/frontoffice/Complain')),
    '/school/:siteId/front-office/setup': React.lazy(() => import('@/pages/frontoffice/Setup')),
    '/school/:siteId/students': React.lazy(() => import('@/pages/sis/Students')),
    '/school/:siteId/students/admission': React.lazy(() => import('@/pages/student/StudentAdmission')),
    '/school/:siteId/students/online-admission': React.lazy(() => import('@/pages/student/OnlineAdmission')),
    '/school/:siteId/students/disabled': React.lazy(() => import('@/pages/student/DisabledStudents')),
    '/school/:siteId/students/multi-class': React.lazy(() => import('@/pages/student/MultiClassStudent')),
    '/school/:siteId/students/bulk-delete': React.lazy(() => import('@/pages/student/BulkDelete')),
    '/school/:siteId/students/classifications': React.lazy(() => import('@/pages/student/Categories')),
    '/school/:siteId/finance/collect': React.lazy(() => import('@/pages/sis/Fees')),
    '/school/:siteId/finance/search': React.lazy(() => import('@/pages/fees/SearchPayments')),
    '/school/:siteId/finance/fees-config': React.lazy(() => import('@/pages/fees/FeesMaster')),
    '/school/:siteId/finance/discounts': React.lazy(() => import('@/pages/fees/Discounts')),
    '/school/:siteId/finance/reminders': React.lazy(() => import('@/pages/fees/FeesReminder')),
    '/school/:siteId/finance/income': React.lazy(() => import('@/pages/finance/Income')),
    '/school/:siteId/finance/expenses': React.lazy(() => import('@/pages/finance/Expenses')),
    '/school/:siteId/attendance/mark': React.lazy(() => import('@/pages/sis/Attendance')),
    '/school/:siteId/attendance/by-date': React.lazy(() => import('@/pages/sis/Attendance')),
    '/school/:siteId/attendance/records': React.lazy(() => import('@/pages/sis/AttendanceRecords')),
    '/school/:siteId/attendance/leave-approval': React.lazy(() => import('@/pages/attendance/ApproveLeave')),
    '/school/:siteId/exams/schedule': React.lazy(() => import('@/pages/exams/ExamSchedule')),
    '/school/:siteId/exams/results': React.lazy(() => import('@/pages/exams/ExamResult')),
    '/school/:siteId/exams/admit-cards': React.lazy(() => import('@/pages/exams/DesignAdmitCard')),
    '/school/:siteId/exams/marksheets': React.lazy(() => import('@/pages/exams/DesignMarksheet')),
    '/school/:siteId/exams/grades': React.lazy(() => import('@/pages/exams/MarksGrade')),
    '/school/:siteId/online-exams': React.lazy(() => import('@/pages/online-exams/OnlineExam')),
    '/school/:siteId/online-exams/questions': React.lazy(() => import('@/pages/online-exams/QuestionBank')),
    '/school/:siteId/online-exams/results': React.lazy(() => import('@/pages/online-exams/OnlineExamResult')),
    '/school/:siteId/academics/class-timetable': React.lazy(() => import('@/pages/academics/ClassTimetable')),
    '/school/:siteId/academics/teacher-timetable': React.lazy(() => import('@/pages/academics/TeachersTimetable')),
    '/school/:siteId/academics/assign-class-teacher': React.lazy(() => import('@/pages/academics/AssignTeacher')),
    '/school/:siteId/academics/promotions': React.lazy(() => import('@/pages/academics/PromoteStudents')),
    '/school/:siteId/academics/subjects': React.lazy(() => import('@/pages/academics/Subjects')),
    '/school/:siteId/academics/classes': React.lazy(() => import('@/pages/academics/ClassesAndSections')),
    '/school/:siteId/homework': React.lazy(() => import('@/pages/homework/AddHomework')),
    '/school/:siteId/library/books': React.lazy(() => import('@/pages/library/BookList')),
    '/school/:siteId/library/circulation': React.lazy(() => import('@/pages/library/IssueReturn')),
    '/school/:siteId/library/members': React.lazy(() => import('@/pages/library/AddMember')),
    '/school/:siteId/library/digital': React.lazy(() => import('@/pages/library/DigitalLibrary')),
    '/school/:siteId/library/catchup': React.lazy(() => import('@/pages/library/CatchUpClasses')),
    '/school/:siteId/downloads/content': React.lazy(() => import('@/pages/downloads/UploadContent')),
    '/school/:siteId/downloads/assignments': React.lazy(() => import('@/pages/downloads/Assignments')),
    '/school/:siteId/downloads/study-material': React.lazy(() => import('@/pages/downloads/StudyMaterial')),
    '/school/:siteId/downloads/syllabus': React.lazy(() => import('@/pages/downloads/Syllabus')),
    '/school/:siteId/downloads/others': React.lazy(() => import('@/pages/downloads/OtherDownloads')),
    '/school/:siteId/comms/notices': React.lazy(() => import('@/pages/communicate/NoticeBoard')),
    '/school/:siteId/comms/send': React.lazy(() => import('@/pages/communicate/SendMessage')),
    '/school/:siteId/comms/logs': React.lazy(() => import('@/pages/communicate/Logs')),
    '/school/:siteId/live/zoom': React.lazy(() => import('@/pages/live-classes/Zoom')),
    '/school/:siteId/live/gmeet': React.lazy(() => import('@/pages/live-classes/Gmeet')),
    '/school/:siteId/live/classroom': React.lazy(() => import('@/pages/live-classes/SelfHosted')),
    '/school/:siteId/inventory/issue': React.lazy(() => import('@/pages/inventory/IssueItem')),
    '/school/:siteId/inventory/stock': React.lazy(() => import('@/pages/inventory/AddStock')),
    '/school/:siteId/inventory/config': React.lazy(() => import('@/pages/inventory/Setup')),
    '/school/:siteId/transport/routes': React.lazy(() => import('@/pages/transport/Routes')),
    '/school/:siteId/transport/vehicles': React.lazy(() => import('@/pages/transport/Vehicles')),
    '/school/:siteId/transport/assign': React.lazy(() => import('@/pages/transport/AssignVehicle')),
    '/school/:siteId/transport/requests': React.lazy(() => import('@/pages/transport/VehicleRequests')),
    '/school/:siteId/hostel/blocks': React.lazy(() => import('@/pages/hostel/Hostels')),
    '/school/:siteId/hostel/room-types': React.lazy(() => import('@/pages/hostel/RoomType')),
    '/school/:siteId/hostel/rooms': React.lazy(() => import('@/pages/hostel/Rooms')),
    '/school/:siteId/certificates': React.lazy(() => import('@/pages/certificate/StudentCertificate')),
    '/school/:siteId/certificates/batch': React.lazy(() => import('@/pages/certificate/PrintAdmitCard')),
    '/school/:siteId/certificates/id-cards': React.lazy(() => import('@/pages/certificate/StudentIdCard')),
    '/school/:siteId/alumni': React.lazy(() => import('@/pages/alumni/ManageAlumni')),
    '/school/:siteId/alumni/events': React.lazy(() => import('@/pages/alumni/Events')),
    '/school/:siteId/cms/events': React.lazy(() => import('@/pages/front-cms/Events')),
    '/school/:siteId/cms/gallery': React.lazy(() => import('@/pages/front-cms/Gallery')),
    '/school/:siteId/cms/news': React.lazy(() => import('@/pages/front-cms/News')),
    '/school/:siteId/cms/media': React.lazy(() => import('@/pages/front-cms/MediaManager')),
    '/school/:siteId/cms/pages': React.lazy(() => import('@/pages/front-cms/PagesMenus')),
    '/school/:siteId/cms/menus': React.lazy(() => import('@/pages/front-cms/PagesMenus')),
    '/school/:siteId/cms/banners': React.lazy(() => import('@/pages/front-cms/BannerImages')),
    '/school/:siteId/reports/students': React.lazy(() => import('@/pages/reports/StudentReport')),
    '/school/:siteId/reports/finance': React.lazy(() => import('@/pages/reports/FinanceReport')),
    '/school/:siteId/reports/attendance': React.lazy(() => import('@/pages/sis/AttendanceRecords')),
    '/school/:siteId/reports/exams': React.lazy(() => import('@/pages/exams/ExamResult')),
    '/school/:siteId/reports/user-log': React.lazy(() => import('@/pages/reports/UserLog')),
    '/school/:siteId/reports/audit': React.lazy(() => import('@/pages/reports/AuditTrail')),
    '/school/:siteId/settings/general': React.lazy(() => import('@/pages/settings/General')),
    '/school/:siteId/settings/rbac': React.lazy(() => import('@/pages/settings/Roles')),
};

// --- Route Generation ---

// Helper to flatten the nested sidebar structure into a list of routes
function flattenSidebarItems(items: NavItem[]): NavItem[] {
  const flatList: NavItem[] = [];
  
  function recurse(item: NavItem) {
    if (item.path) {
      flatList.push(item);
    }
    if (item.children) {
      item.children.forEach(recurse);
    }
  }

  items.forEach(recurse);
  return flatList;
}

const allNavItems = flattenSidebarItems(SCHOOL_SIDEBAR);

export const schoolRoutes = allNavItems
  .filter(item => item.path)
  .map(route => {
    const Component = componentMap[route.path!] ?? (({title}) => <Placeholder title={title} />);
    const props = !componentMap[route.path!] ? { title: route.label } : {};
    
    let element = <Component {...props} />;
    
    if (route.scope) {
        element = <RequireScope scope={route.scope}>{element}</RequireScope>;
    }

    return {
        path: route.path!,
        element: <MainLayout>{element}</MainLayout>
    };
});
