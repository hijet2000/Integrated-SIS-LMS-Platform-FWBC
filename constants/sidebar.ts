
import type { NavItem } from '@/types/navigation';

export const SCHOOL_SIDEBAR: NavItem[] = [
  { label: 'Dashboard', path: '/school/:siteId/dashboard', icon: 'LayoutDashboard', scope: 'school:read' },

  {
    label: 'Front Office', icon: 'ReceptionBell', scope: 'school:read', children: [
      { label: 'Admission Enquiry', path: '/school/:siteId/front-office/admission-enquiry' },
      { label: 'Visitor Book', path: '/school/:siteId/front-office/visitor-book' },
      { label: 'Phone Call Log', path: '/school/:siteId/front-office/phone-calls' },
      { label: 'Postal Dispatch', path: '/school/:siteId/front-office/postal-dispatch' },
      { label: 'Postal Receive', path: '/school/:siteId/front-office/postal-receive' },
      { label: 'Complain Register', path: '/school/:siteId/front-office/complaints' },
      { label: 'Setup Front Office', path: '/school/:siteId/front-office/setup' },
    ]
  },

  {
    label: 'Student Information', icon: 'GraduationCap', children: [
      { label: 'Student Details', path: '/school/:siteId/students' },
      { label: 'Student Admission', path: '/school/:siteId/students/admission' },
      { label: 'Online Admission', path: '/school/:siteId/students/online-admission' },
      { label: 'Disabled Students', path: '/school/:siteId/students/disabled' },
      { label: 'Multi Class Student', path: '/school/:siteId/students/multi-class' },
      { label: 'Bulk Delete', path: '/school/:siteId/students/bulk-delete' },
      { label: 'Categories / House / Disable Reason', path: '/school/:siteId/students/classifications' },
    ]
  },

  {
    label: 'Fees & Finance', icon: 'Wallet', scope: 'school:write', children: [
      { label: 'Collect Fees', path: '/school/:siteId/finance/collect' },
      { label: 'Search Payments / Due Fees', path: '/school/:siteId/finance/search' },
      { label: 'Fees Master / Group / Type', path: '/school/:siteId/finance/fees-config' },
      { label: 'Discounts / Carry Forward', path: '/school/:siteId/finance/discounts' },
      { label: 'Fees Reminder', path: '/school/:siteId/finance/reminders' },
      { label: 'Income (Add/Search/Heads)', path: '/school/:siteId/finance/income' },
      { label: 'Expenses (Add/Search/Heads)', path: '/school/:siteId/finance/expenses' },
    ]
  },

  {
    label: 'Attendance', icon: 'CalendarCheck', children: [
      { label: 'Student Attendance', path: '/school/:siteId/attendance/mark' },
      { label: 'Attendance by Date', path: '/school/:siteId/attendance/by-date' },
      { label: 'Attendance Records', path: '/school/:siteId/attendance/records' },
      { label: 'Approve Leave', path: '/school/:siteId/attendance/leave-approval' },
    ]
  },

  {
    label: 'Examinations', icon: 'ClipboardList', children: [
      { label: 'Exam Group / Schedule', path: '/school/:siteId/exams/schedule' },
      { label: 'Exam Result', path: '/school/:siteId/exams/results' },
      { label: 'Design / Print Admit Card', path: '/school/:siteId/exams/admit-cards' },
      { label: 'Design / Print Marksheet', path: '/school/:siteId/exams/marksheets' },
      { label: 'Marks Grade', path: '/school/:siteId/exams/grades' },
    ]
  },

  {
    label: 'Online Examinations', icon: 'MonitorPlay', children: [
      { label: 'Online Exam', path: '/school/:siteId/online-exams' },
      { label: 'Question Bank', path: '/school/:siteId/online-exams/questions' },
      { label: 'Online Exam Result', path: '/school/:siteId/online-exams/results' },
    ]
  },

  {
    label: 'Academics', icon: 'BookOpen', children: [
      { label: 'Class Timetable', path: '/school/:siteId/academics/class-timetable' },
      { label: 'Teachers Timetable', path: '/school/:siteId/academics/teacher-timetable' },
      { label: 'Assign Class Teacher', path: '/school/:siteId/academics/assign-class-teacher' },
      { label: 'Promote Students', path: '/school/:siteId/academics/promotions' },
      { label: 'Subject Group / Subjects', path: '/school/:siteId/academics/subjects' },
      { label: 'Class / Sections', path: '/school/:siteId/academics/classes' },
    ]
  },

  { label: 'Homework', icon: 'NotebookPen', path: '/school/:siteId/homework' },

  {
    label: 'Library', icon: 'Library', children: [
      { label: 'Book List', path: '/school/:siteId/library/books' },
      { label: 'Issue / Return', path: '/school/:siteId/library/circulation' },
      { label: 'Add Student / Staff Member', path: '/school/:siteId/library/members' },
      { label: 'Digital (eBooks / Audio / Video)', path: '/school/:siteId/library/digital' },
      { label: 'Catch-Up Classes', path: '/school/:siteId/library/catchup' },
    ]
  },

  {
    label: 'Download Center', icon: 'Download', children: [
      { label: 'Upload Content', path: '/school/:siteId/downloads/content' },
      { label: 'Assignments', path: '/school/:siteId/downloads/assignments' },
      { label: 'Study Material', path: '/school/:siteId/downloads/study-material' },
      { label: 'Syllabus', path: '/school/:siteId/downloads/syllabus' },
      { label: 'Other Downloads', path: '/school/:siteId/downloads/others' },
    ]
  },

  {
    label: 'Communicate', icon: 'Megaphone', children: [
      { label: 'Notice Board', path: '/school/:siteId/comms/notices' },
      { label: 'Send Email / SMS', path: '/school/:siteId/comms/send' },
      { label: 'Logs', path: '/school/:siteId/comms/logs' },
    ]
  },

  {
    label: 'Live Classes', icon: 'Video', children: [
      { label: 'Zoom (Classes/Meetings/Reports/Setting)', path: '/school/:siteId/live/zoom' },
      { label: 'Gmeet (Classes/Meetings/Reports/Setting)', path: '/school/:siteId/live/gmeet' },
      { label: 'Own Live (Integrated)', path: '/school/:siteId/live/classroom' }, // your custom SFU
    ]
  },

  {
    label: 'Inventory', icon: 'Package', children: [
      { label: 'Issue Item', path: '/school/:siteId/inventory/issue' },
      { label: 'Add Stock / Item', path: '/school/:siteId/inventory/stock' },
      { label: 'Category / Store / Supplier', path: '/school/:siteId/inventory/config' },
    ]
  },

  {
    label: 'Transport', icon: 'BusFront', children: [
      { label: 'Routes', path: '/school/:siteId/transport/routes' },
      { label: 'Vehicles', path: '/school/:siteId/transport/vehicles' },
      { label: 'Assign Vehicle', path: '/school/:siteId/transport/assign' },
      { label: 'Vehicle Requests & Approval', path: '/school/:siteId/transport/requests' },
    ]
  },

  {
    label: 'Hostel', icon: 'BedDouble', children: [
      { label: 'Hostel', path: '/school/:siteId/hostel/blocks' },
      { label: 'Room Type', path: '/school/:siteId/hostel/room-types' },
      { label: 'Rooms', path: '/school/:siteId/hostel/rooms' },
    ]
  },

  {
    label: 'Certificate', icon: 'Award', children: [
      { label: 'Student/Staff Certificates', path: '/school/:siteId/certificates' },
      { label: 'Generate & Print', path: '/school/:siteId/certificates/batch' },
      { label: 'ID Cards (Student/Staff)', path: '/school/:siteId/certificates/id-cards' },
    ]
  },

  {
    label: 'Alumni', icon: 'UsersRound', children: [
      { label: 'Manage Alumni', path: '/school/:siteId/alumni' },
      { label: 'Events', path: '/school/:siteId/alumni/events' },
    ]
  },

  {
    label: 'Front CMS', icon: 'Globe', scope: 'school:admin', children: [
      { label: 'Event', path: '/school/:siteId/cms/events' },
      { label: 'Gallery', path: '/school/:siteId/cms/gallery' },
      { label: 'News', path: '/school/:siteId/cms/news' },
      { label: 'Media Manager', path: '/school/:siteId/cms/media' },
      { label: 'Pages', path: '/school/:siteId/cms/pages' },
      { label: 'Menus', path: '/school/:siteId/cms/menus' },
      { label: 'Banner Images', path: '/school/:siteId/cms/banners' },
    ]
  },

  {
    label: 'Reports', icon: 'BarChart3', children: [
      { label: 'Student', path: '/school/:siteId/reports/students' },
      { label: 'Finance', path: '/school/:siteId/reports/finance' },
      { label: 'Attendance', path: '/school/:siteId/reports/attendance' },
      { label: 'Examinations', path: '/school/:siteId/reports/exams' },
      { label: 'Lesson Plan', path: '/school/:siteId/reports/lesson-plan' },
      { label: 'HR', path: '/school/:siteId/reports/hr' },
      { label: 'Library', path: '/school/:siteId/reports/library' },
      { label: 'Inventory', path: '/school/:siteId/reports/inventory' },
      { label: 'Transport', path: '/school/:siteId/reports/transport' },
      { label: 'Hostel', path: '/school/:siteId/reports/hostel' },
      { label: 'Alumni', path: '/school/:siteId/reports/alumni' },
      { label: 'User Log', path: '/school/:siteId/reports/user-log' },
      { label: 'Audit Trail', path: '/school/:siteId/reports/audit' },
    ]
  },

  {
    label: 'System Settings', icon: 'Settings', scope: 'school:admin', children: [
      { label: 'General / Session / Notification', path: '/school/:siteId/settings/general' },
      { label: 'SMS / Email / Payment Methods', path: '/school/:siteId/settings/integrations' },
      { label: 'Print Header & Footer', path: '/school/:siteId/settings/print' },
      { label: 'Front CMS Setting', path: '/school/:siteId/settings/cms' },
      { label: 'Roles & Permissions', path: '/school/:siteId/settings/rbac' },
      { label: 'Backup / Restore', path: '/school/:siteId/settings/backup' },
      { label: 'Languages / Users / Modules', path: '/school/:siteId/settings/users-modules' },
      { label: 'Custom Fields / Captcha', path: '/school/:siteId/settings/customization' },
      { label: 'System Fields / Student Profile Update', path: '/school/:siteId/settings/system-fields' },
      { label: 'File Types / System Update', path: '/school/:siteId/settings/system-update' },
    ]
  },
];
