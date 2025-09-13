// FIX: Created constants/index.ts to define ROLES and PERMISSIONS and resolve module not found errors.
import type { Role } from '@/types';

export const ROLES: Role[] = ['super_admin', 'school_admin', 'bursar', 'teacher', 'student', 'lms_admin', 'librarian', 'front_desk'];
