import React, { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useCan } from '@/hooks/useCan';

// A generic icon component
const Icon = ({ path, className = 'w-5 h-5' }: { path: string; className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path} />
    </svg>
);

interface NavItem {
    label: string;
    href?: string;
    icon: React.ReactNode;
    permission?: [string, string]; // [action, resource]
    children?: NavItem[];
}

const navConfig: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard/:siteId', icon: <Icon path="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /> },
    {
        label: 'Student Information',
        icon: <Icon path="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" />,
        permission: ['read', 'school.students'],
        children: [
            { label: 'Student Details', href: '/school/:siteId/students', icon: <></> },
            { label: 'Student Admission', href: '/student/:siteId/admission', permission: ['create', 'student.admission'], icon: <></> },
            { label: 'Bulk Delete', href: '/student/:siteId/bulk-delete', permission: ['delete', 'student.bulk'], icon: <></> },
            { label: 'Student Categories', href: '/student/:siteId/categories', permission: ['read', 'student.categories'], icon: <></> },
            { label: 'Student House', href: '/student/:siteId/categories', permission: ['read', 'student.categories'], icon: <></> },
            { label: 'Disable Reason', href: '/student/:siteId/categories', permission: ['read', 'student.categories'], icon: <></> },
            { label: 'Disabled Students', href: '/student/:siteId/disabled-students', icon: <></> },
            { label: 'Online Admission', href: '/student/:siteId/online-admission', permission: ['read', 'student.online-admission'], icon: <></> },
            { label: 'Multi Class Student', href: '/student/:siteId/multi-class-student', permission: ['read', 'student.multi-class'], icon: <></> },
            { label: 'Batch Student Upload', href: '/student/:siteId/batch-upload', permission: ['create', 'student.admission'], icon: <></> },
        ],
    },
    {
        label: 'Academics',
        icon: <Icon path="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
        permission: ['read', 'school.academics'],
        children: [
            { label: 'Class Timetable', href: '/academics/:siteId/timetable', icon: <></> },
            { label: 'Teachers Timetable', href: '/academics/:siteId/teachers-timetable', icon: <></> },
            { label: 'Assign Class Teacher', href: '/academics/:siteId/assign-teacher', icon: <></> },
            { label: 'Subjects', href: '/academics/:siteId/subjects', icon: <></> },
            { label: 'Class & Sections', href: '/academics/:siteId/classes', icon: <></> },
            { label: 'Subject Group', href: '/academics/:siteId/subject-group', icon: <></> },
            { label: 'Promote Students', href: '/academics/:siteId/promote', icon: <></> },
        ]
    },
    {
        label: 'Certificate',
        icon: <Icon path="M15 5v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5m11 0a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2m11 0v0a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-1" />,
        permission: ['read', 'certificate.generate'],
        children: [
            { label: 'Student Certificate', href: '/certificate/:siteId/student-certificate', icon: <></> },
            { label: 'Staff Certificate', href: '/certificate/:siteId/staff-certificate', icon: <></> },
            { label: 'Student ID Card', href: '/certificate/:siteId/student-id-card', icon: <></> },
            { label: 'Staff ID Card', href: '/certificate/:siteId/staff-id-card', icon: <></> },
            { label: 'ID Card Designer', href: '/certificate/:siteId/id-card-designer', permission: ['read', 'certificate.id-card-designer'], icon: <></> },
        ]
    },
];


const SidebarLink: React.FC<{ item: NavItem }> = ({ item }) => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();

    if (item.permission && !can(item.permission[0] as any, item.permission[1], { kind: 'site', id: siteId! })) {
        return null;
    }
    
    const path = item.href ? item.href.replace(':siteId', siteId || 'site_123') : '#';
    
    return (
        <NavLink
            to={path}
            className={({ isActive }) =>
                `flex items-center p-2 text-sm rounded-md transition-colors ${
                isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`
            }
        >
            {item.icon}
            <span className="ml-3">{item.label}</span>
        </NavLink>
    );
};

const SidebarDropdown: React.FC<{ item: NavItem }> = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();
    
    if (item.permission && !can(item.permission[0] as any, item.permission[1], { kind: 'site', id: siteId! })) {
        return null;
    }

    // Filter out children the user cannot access
    const accessibleChildren = item.children?.filter(child => 
        !child.permission || can(child.permission[0] as any, child.permission[1], { kind: 'site', id: siteId! })
    ) || [];

    if (accessibleChildren.length === 0) return null;

    return (
         <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-2 text-sm text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
                <div className="flex items-center">
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                </div>
                <Icon path={isOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} className="w-4 h-4" />
            </button>
            {isOpen && (
                <div className="pl-6 mt-1 space-y-1">
                    {accessibleChildren.map(child => (
                        <SidebarLink key={child.label} item={child} />
                    ))}
                </div>
            )}
        </div>
    );
};


const Sidebar: React.FC = () => {
    return (
        <aside className="w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">FaithEdu</h1>
            </div>
            <nav className="p-4 space-y-2">
                {navConfig.map(item => (
                    item.children ? <SidebarDropdown key={item.label} item={item} /> : <SidebarLink key={item.label} item={item} />
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;