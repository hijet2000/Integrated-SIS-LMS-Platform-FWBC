import type { Role, Resource, Action } from '@/types';

export const ROLES: Role[] = ['super_admin', 'school_admin', 'lms_admin', 'bursar', 'teacher', 'librarian', 'front_desk', 'student'];

type PermissionsMap = {
  [key in Role]?: {
    [key in Resource]?: Action[];
  };
};

export const PERMISSIONS: PermissionsMap = {
    super_admin: {}, // Handled specially in useCan
    school_admin: {
        'school.students': ['create', 'read', 'update', 'delete'],
        'school.fees': ['read', 'pay'],
        'school.attendance': ['create', 'read', 'update'],
        'school.academics': ['create', 'read', 'update', 'delete'],
        'school.grades': ['create', 'read', 'update'],
        'school.faculty': ['create', 'read', 'update', 'delete'],
        'student.admission': ['create', 'read', 'update'],
        'student.online-admission': ['read', 'update'],
        'student.bulk': ['delete'],
        'student.categories': ['create', 'read', 'update', 'delete'],
        'student.multi-class': ['create', 'read', 'delete'],
        'attendance.reports': ['read', 'export'],
        'attendance.approve-leave': ['create', 'read', 'update'],
        'academics.timetable': ['create', 'read', 'update', 'delete'],
        'academics.assign-teacher': ['read', 'update'],
        'academics.promote': ['update'],
        'academics.subjects': ['create', 'read', 'update', 'delete'],
        'settings.roles': ['read'],
    },
    lms_admin: {
        'edu.courses': ['create', 'read', 'update', 'delete'],
        'edu.curriculum': ['create', 'read', 'update', 'delete'],
        'edu.assignments': ['create', 'read', 'update', 'delete'],
        'edu.quizzes': ['create', 'read', 'update', 'delete'],
        'edu.resources': ['create', 'read', 'update', 'delete', 'pay'],
    },
    bursar: {
        'school.fees': ['read', 'pay'],
        'fees.master': ['create', 'read', 'update', 'delete'],
        'fees.reminders': ['read', 'create'],
        'fees.search': ['read'],
        'finance.income': ['create', 'read', 'update', 'delete'],
        'finance.expenses': ['create', 'read', 'update', 'delete'],
    },
    teacher: {
        'school.students': ['read'],
        'school.attendance': ['create', 'read'],
        'school.grades': ['create', 'read'],
        'edu.courses': ['read'],
        'edu.assignments': ['read'],
        'edu.quizzes': ['read'],
        'homework': ['create', 'read', 'update'],
        'communicate.notices': ['create', 'read', 'update', 'delete'],
        'communicate.send': ['create'],
        'communicate.logs': ['read'],
        'downloads.content': ['read', 'create', 'update', 'delete'],
    },
    librarian: {
        'library': ['create', 'read', 'update', 'delete'],
        'library.members': ['create', 'read', 'update', 'delete'],
        'library.issue-return': ['create', 'read', 'update'],
        'library.digital': ['create', 'read', 'update', 'delete'],
        'library.catchup': ['read', 'create', 'update', 'delete'],
    },
    front_desk: {
        'frontoffice.enquiry': ['create', 'read', 'update', 'delete'],
        'frontoffice.visitors': ['create', 'read', 'update', 'delete'],
        'frontoffice.calls': ['create', 'read', 'update', 'delete'],
        'frontoffice.postal': ['create', 'read', 'update', 'delete'],
        'frontoffice.complaints': ['create', 'read', 'update', 'delete'],
        'frontoffice.setup': ['create', 'read', 'update', 'delete'],
    },
    student: {
        'school.students': ['read'],
        'school.fees': ['read'],
        'school.attendance': ['read'],
        'school.grades': ['read'],
        'edu.courses': ['read'],
        'downloads.content': ['read'],
        'library': ['read'],
        'library.digital': ['read'],
        'library.catchup': ['read'],
        'communicate.notices': ['read'],
    }
};
