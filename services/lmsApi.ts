
import { mockApi } from './api';
// FIX: Corrected import path for LMS types.
import type { Course, Module, Lesson, EduCurriculum, EduAssignment, Quiz, EduResource } from '@/types';

const courses: Course[] = [
  { id: 'crs_1', siteId: 'site_123', code: 'MATH101', title: 'Introduction to Algebra', description: 'Learn the fundamentals of algebra.', status: 'OPEN', visibility: 'SITE', teachers: ['user_teacher'] },
  { id: 'crs_2', siteId: 'site_123', code: 'SCI201', title: 'Biology for Beginners', description: 'Explore the world of living organisms.', status: 'OPEN', visibility: 'SITE', teachers: ['user_teacher'] },
  { id: 'crs_3', siteId: 'site_123', code: 'ENG101', title: 'English Literature', description: 'A survey of classic literature.', status: 'DRAFT', visibility: 'PRIVATE', teachers: [] },
  { id: 'crs_4', siteId: 'site_456', code: 'HIST301', title: 'World History', description: 'A course for another site.', status: 'OPEN', visibility: 'SITE', teachers: [] },
];

const modules: Module[] = [
    { id: 'mod_1', siteId: 'site_123', courseId: 'crs_1', title: 'Module 1: Basic Operations', orderIndex: 1, summary: 'Addition, subtraction, multiplication, and division.' },
    { id: 'mod_2', siteId: 'site_123', courseId: 'crs_1', title: 'Module 2: Equations', orderIndex: 2, summary: 'Solving for variables.' },
    { id: 'mod_3', siteId: 'site_123', courseId: 'crs_2', title: 'Module 1: The Cell', orderIndex: 1, summary: 'Understanding cellular biology.' },
];

const lessons: Lesson[] = [
    { id: 'les_1', siteId: 'site_123', moduleId: 'mod_1', title: 'Lesson 1.1: Addition', orderIndex: 1, contentHtml: '<p>This is a lesson on addition.</p>', status: 'PUBLISHED' },
    { id: 'les_2', siteId: 'site_123', moduleId: 'mod_1', title: 'Lesson 1.2: Subtraction', orderIndex: 2, contentHtml: '<p>This is a lesson on subtraction.</p>', status: 'PUBLISHED' },
    { id: 'les_3', siteId: 'site_123', moduleId: 'mod_2', title: 'Lesson 2.1: Simple Equations', orderIndex: 1, contentHtml: '<p>Solving for x.</p>', status: 'PUBLISHED' },
    { id: 'les_4', siteId: 'site_123', moduleId: 'mod_3', title: 'Lesson 1.1: What is a cell?', orderIndex: 1, contentHtml: '<p>The basic building block of life.</p>', status: 'DRAFT' },
];

const eduCurricula: EduCurriculum[] = [
    { id: 'ecur_1', siteId: 'site_123', version: 'v1.2', status: 'PUBLISHED', objectives: ['Understand basic algebra', 'Solve linear equations'] },
    { id: 'ecur_2', siteId: 'site_123', version: 'v1.3', status: 'DRAFT', objectives: ['Advanced algebraic concepts'] },
];

const eduAssignments: EduAssignment[] = [
    { id: 'asgn_1', siteId: 'site_123', courseId: 'crs_1', title: 'Homework 1: Operations', dueAt: '2024-09-15', totalMarks: 100 },
    { id: 'asgn_2', siteId: 'site_123', courseId: 'crs_2', title: 'Lab Report: Cell Observation', dueAt: '2024-09-20', totalMarks: 50 },
];

const quizzes: Quiz[] = [
    { id: 'quiz_1', siteId: 'site_123', courseId: 'crs_1', title: 'Chapter 1 Quiz', published: true, timeLimit: 20 },
    { id: 'quiz_2', siteId: 'site_123', courseId: 'crs_1', title: 'Mid-term Quiz', published: false, timeLimit: 45 },
];

// FIX: Updated the type annotation from `Resource[]` to `EduResource[]` to match the renamed type.
const resources: EduResource[] = [
    { id: 'res_1', siteId: 'site_123', title: 'Algebra Cheatsheet', type: 'PDF', url: '/mock/algebra.pdf', access: 'FREE' },
    { id: 'res_2', siteId: 'site_123', title: 'Biology Video Series', type: 'Video', url: '/mock/bio-series', access: 'PAID', price: 29.99 },
    { id: 'res_3', siteId: 'site_123', title: 'External Math Resources', type: 'Link', url: 'https://www.khanacademy.org/math', access: 'FREE' },
];

// Courses
export const getCourses = (siteId: string): Promise<Course[]> => mockApi(courses.filter(c => c.siteId === siteId));
export const getCourseById = (courseId: string): Promise<Course | undefined> => mockApi(courses.find(c => c.id === courseId));
export const createCourse = (siteId: string, courseData: Omit<Course, 'id' | 'siteId'>): Promise<Course> => {
    const newCourse: Course = {
        ...courseData,
        id: `crs_${Date.now()}`,
        siteId: siteId,
    };
    courses.push(newCourse);
    return mockApi(newCourse);
};

// Modules and Lessons
export const getModulesForCourse = (courseId: string): Promise<Module[]> => mockApi(modules.filter(m => m.courseId === courseId));
export const getLessonsForModule = (moduleId: string): Promise<Lesson[]> => mockApi(lessons.filter(l => l.moduleId === moduleId));

// New LMS Endpoints
export const getEduCurricula = (siteId: string): Promise<EduCurriculum[]> => mockApi(eduCurricula.filter(c => c.siteId === siteId));
export const getEduAssignments = (siteId: string): Promise<EduAssignment[]> => mockApi(eduAssignments.filter(a => a.siteId === siteId));
export const getQuizzes = (siteId: string): Promise<Quiz[]> => mockApi(quizzes.filter(q => q.siteId === siteId));
// FIX: Updated the return type from `Promise<Resource[]>` to `Promise<EduResource[]>`.
export const getResources = (siteId: string): Promise<EduResource[]> => mockApi(resources.filter(r => r.siteId === siteId));