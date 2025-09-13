// FIX: Created constants/sidebar.ts to define the sidebar navigation structure.
import type { NavItem } from '@/types/navigation';

export const SCHOOL_SIDEBAR: NavItem[] = [
  {
    label: 'General',
    children: [
      {
        label: 'Dashboard',
        path: '/school/:siteId',
        scope: 'school:read',
      },
      {
        label: 'Homework',
        path: '/school/:siteId/homework',
        scope: 'school:read',
      },
    ],
  },
  {
    label: 'Academics',
    children: [
      { label: 'Classes & Sections', path: '/school/:siteId/academics/classes', scope: 'school:read' },
      { label: 'Subjects', path: '/school/:siteId/academics/subjects', scope: 'school:read' },
      { label: 'Assign Class Teacher', path: '/school/:siteId/academics/assign-teacher', scope: 'school:write' },
      { label: 'Subject Group', path: '/school/:siteId/academics/subject-group', scope: 'school:write' },
      { label: 'Promote Students', path: '/school/:siteId/academics/promote-students', scope: 'school:write' },
      { label: 'Class Timetable', path: '/school/:siteId/academics/class-timetable', scope: 'school:read' },
      { label: 'Teachers Timetable', path: '/school/:siteId/academics/teachers-timetable', scope: 'school:read' },
    ],
  },
  {
    label: 'Student Information',
    children: [
      { label: 'Student Details', path: '/school/:siteId/students', scope: 'school:read' },
      { label: 'Student Admission', path: '/school/:siteId/student-admission', scope: 'school:write' },
      { label: 'Disabled Students', path: '/school/:siteId/disabled-students', scope: 'school:read' },
      { label: 'Bulk Delete', path: '/school/:siteId/bulk-delete', scope: 'school:write' },
      { label: 'Student Categories', path: '/school/:siteId/student-categories', scope: 'school:read' },
      { label: 'Online Admission', path: '/school/:siteId/online-admission', scope: 'school:read' },
      { label: 'Multi Class Student', path: '/school/:siteId/multi-class-student', scope: 'school:write' },
      { label: 'Batch Student Upload', path: '/school/:siteId/batch-student-upload', scope: 'school:write' },
    ],
  },
  {
    label: 'Attendance',
    children: [
        { label: 'Student Attendance', path: '/school/:siteId/attendance', scope: 'school:read' },
        { label: 'Attendance Reports', path: '/school/:siteId/attendance/records', scope: 'school:read' },
        { label: 'Approve Leave', path: '/school/:siteId/attendance/approve-leave', scope: 'school:write' },
    ]
  },
  {
    label: 'Examinations',
    children: [
        { label: 'Exam Group', path: '/school/:siteId/exams/exam-group', scope: 'school:read' },
        { label: 'Exam Schedule', path: '/school/:siteId/exams/exam-schedule', scope: 'school:read' },
        { label: 'Exam Result', path: '/school/:siteId/exams/exam-result', scope: 'school:read' },
        { label: 'Marks Grade', path: '/school/:siteId/exams/marks-grade', scope: 'school:read' },
        { label: 'Design Admit Card', path: '/school/:siteId/exams/design-admit-card', scope: 'school:write' },
        { label: 'Print Admit Card', path: '/school/:siteId/exams/print-admit-card', scope: 'school:read' },
        { label: 'Design Marksheet', path: '/school/:siteId/exams/design-marksheet', scope: 'school:write' },
        { label: 'Print Marksheet', path: '/school/:siteId/exams/print-marksheet', scope: 'school:read' },
    ]
  },
  {
    label: 'Online Examinations',
    children: [
        { label: 'Online Exam', path: '/school/:siteId/online-exams/online-exam', scope: 'school:read' },
        { label: 'Question Bank', path: '/school/:siteId/online-exams/question-bank', scope: 'school:read' },
        { label: 'Online Exam Result', path: '/school/:siteId/online-exams/online-exam-result', scope: 'school:read' },
    ]
  },
   {
    label: 'Fees Collection',
    children: [
        { label: 'Collect Fees', path: '/school/:siteId/fees', scope: 'school:write' },
        { label: 'Search Payments', path: '/school/:siteId/fees/search-payments', scope: 'school:read' },
        { label: 'Fees Master', path: '/school/:siteId/fees/fees-master', scope: 'school:read' },
        { label: 'Fees Reminder', path: '/school/:siteId/fees/fees-reminder', scope: 'school:read' },
        { label: 'Discounts', path: '/school/:siteId/fees/discounts', scope: 'school:read' },
    ]
  },
  {
    label: 'Finance',
    children: [
        { label: 'Income', path: '/school/:siteId/finance/income', scope: 'school:read' },
        { label: 'Expenses', path: '/school/:siteId/finance/expenses', scope: 'school:read' },
    ]
  },
  {
    label: 'Human Resource',
    children: [
        { label: 'Staff Directory', path: '/school/:siteId/faculty', scope: 'school:read' },
    ]
  },
  {
    label: 'Communicate',
    children: [
        { label: 'Notice Board', path: '/school/:siteId/communicate/notice-board', scope: 'school:read' },
        { label: 'Send Message', path: '/school/:siteId/communicate/send-message', scope: 'school:write' },
        { label: 'Communication Logs', path: '/school/:siteId/communicate/logs', scope: 'school:read' },
    ]
  },
   {
    label: 'Library',
    children: [
        { label: 'Book List', path: '/school/:siteId/library/book-list', scope: 'school:read' },
        { label: 'Issue / Return', path: '/school/:siteId/library/issue-return', scope: 'school:write' },
        { label: 'Add Member', path: '/school/:siteId/library/add-member', scope: 'school:write' },
        { label: 'Digital Library', path: '/school/:siteId/library/digital', scope: 'school:read' },
        { label: 'Catch-Up Classes', path: '/school/:siteId/library/catchup', scope: 'school:read' },
    ]
  },
  {
    label: 'Inventory',
    children: [
        { label: 'Add Stock', path: '/school/:siteId/inventory/add-stock', scope: 'school:write' },
        { label: 'Issue Item', path: '/school/:siteId/inventory/issue-item', scope: 'school:write' },
        { label: 'Inventory Setup', path: '/school/:siteId/inventory/setup', scope: 'school:write' },
    ]
  },
  {
    label: 'Transport',
    children: [
        { label: 'Routes', path: '/school/:siteId/transport/routes', scope: 'school:read' },
        { label: 'Vehicles', path: '/school/:siteId/transport/vehicles', scope: 'school:read' },
        { label: 'Assign Vehicle', path: '/school/:siteId/transport/assign-vehicle', scope: 'school:write' },
        { label: 'Vehicle Requests', path: '/school/:siteId/transport/vehicle-requests', scope: 'school:read' },
    ]
  },
  {
    label: 'Hostel',
    children: [
        { label: 'Hostels', path: '/school/:siteId/hostel/hostels', scope: 'school:read' },
        { label: 'Room Types', path: '/school/:siteId/hostel/room-type', scope: 'school:read' },
        { label: 'Rooms', path: '/school/:siteId/hostel/rooms', scope: 'school:read' },
        { label: 'Allocate Room', path: '/school/:siteId/hostel/allocate-room', scope: 'school:write' },
    ]
  },
   {
    label: 'Certificate',
    children: [
        { label: 'Student Certificate', path: '/school/:siteId/certificate/student-certificate', scope: 'school:write' },
        { label: 'Staff Certificate', path: '/school/:siteId/certificate/staff-certificate', scope: 'school:write' },
        { label: 'Design ID Card', path: '/school/:siteId/certificate/id-card-designer', scope: 'school:write' },
        { label: 'Print Student ID Card', path: '/school/:siteId/certificate/student-id-card', scope: 'school:write' },
        { label: 'Print Staff ID Card', path: '/school/:siteId/certificate/staff-id-card', scope: 'school:write' },
    ]
  },
  {
    label: 'Alumni',
    children: [
        { label: 'Manage Alumni', path: '/school/:siteId/alumni/manage', scope: 'school:read' },
        { label: 'Events', path: '/school/:siteId/alumni/events', scope: 'school:read' },
    ]
  },
  {
    label: 'Reports',
    children: [
        { label: 'Student Report', path: '/school/:siteId/reports/student-report', scope: 'school:admin' },
        { label: 'Finance Report', path: '/school/:siteId/reports/finance-report', scope: 'school:admin' },
        { label: 'User Log', path: '/school/:siteId/reports/user-log', scope: 'school:admin' },
        { label: 'Audit Trail', path: '/school/:siteId/reports/audit-trail', scope: 'school:admin' },
    ]
  },
];