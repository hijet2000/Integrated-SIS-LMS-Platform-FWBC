import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { useCan } from '@/hooks/useCan';
import type { Action, Resource } from '@/types';

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
    permission?: { action: Action, resource: Resource };
    children?: NavItem[];
}

const navConfig: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard/:siteId', icon: <Icon path="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /> },
    {
        label: 'Student Information',
        icon: <Icon path="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" />,
        permission: { action: 'read', resource: 'school.students'},
        children: [
            { label: 'Student Details', href: '/school/:siteId/students', icon: <></> },
            { label: 'Student Admission', href: '/student/:siteId/admission', permission: { action: 'create', resource: 'student.admission' }, icon: <></> },
            { label: 'Online Admission', href: '/student/:siteId/online-admission', permission: { action: 'read', resource: 'student.online-admission' }, icon: <></> },
        ],
    },
    {
        label: 'Academics',
        icon: <Icon path="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
        permission: { action: 'read', resource: 'school.academics'},
        children: [
            { label: 'Class Timetable', href: '/academics/:siteId/timetable', icon: <></> },
            { label: 'Subjects', href: '/academics/:siteId/subjects', icon: <></> },
            { label: 'Class & Sections', href: '/academics/:siteId/classes', icon: <></> },
        ]
    },
    {
        label: 'Certificate',
        icon: <Icon path="M15 5v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5m11 0a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2m11 0v0a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-1" />,
        permission: { action: 'read', resource: 'certificate.issue' },
        children: [
            { label: 'Student Certificate', href: '/certificate/:siteId/student-certificate', icon: <></> },
            { label: 'Staff Certificate', href: '/certificate/:siteId/staff-certificate', icon: <></> },
            { label: 'Student ID Card', href: '/certificate/:siteId/student-id-card', permission: { action: 'read', resource: 'certificate.id-cards' }, icon: <></> },
            { label: 'Staff ID Card', href: '/certificate/:siteId/staff-id-card', permission: { action: 'read', resource: 'certificate.id-cards' }, icon: <></> },
            { label: 'ID Card Designer', href: '/certificate/:siteId/id-card-designer', permission: { action: 'read', resource: 'certificate.templates' }, icon: <></> },
        ]
    },
    {
        label: 'Front CMS',
        icon: <Icon path="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />,
        permission: { action: 'read', resource: 'front-cms.events' },
        children: [
            { label: 'Events', href: '/front-cms/:siteId/events', icon: <></>, permission: { action: 'read', resource: 'front-cms.events' } },
            { label: 'Gallery', href: '/front-cms/:siteId/gallery', icon: <></>, permission: { action: 'read', resource: 'front-cms.gallery' } },
            { label: 'News', href: '/front-cms/:siteId/news', icon: <></>, permission: { action: 'read', resource: 'front-cms.news' } },
            { label: 'Banner Images', href: '/front-cms/:siteId/banner-images', icon: <></> },
            { label: 'Media Manager', href: '/front-cms/:siteId/media-manager', icon: <></> },
            { label: 'Pages & Menus', href: '/front-cms/:siteId/pages-menus', icon: <></> },
        ]
    },
];


const SidebarLink: React.FC<{ item: NavItem }> = ({ item }) => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();

    if (item.permission && !can(item.permission.action, item.permission.resource, { kind: 'site', id: siteId! })) {
        return null;
    }
    
    const path = item.href ? item.href.replace(':siteId', siteId || 'site_123') : '#';
    
    return (
        <NavLink
            to={path}
            end={item.href?.split('/').pop() === ':siteId'} // end should be true for base paths
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

const SidebarDropdown: React.FC<{ item: NavItem; defaultOpen?: boolean }> = ({ item, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();
    
    if (item.permission && !can(item.permission.action, item.permission.resource, { kind: 'site', id: siteId! })) {
        return null;
    }

    const accessibleChildren = item.children?.filter(child => 
        !child.permission || can(child.permission.action, child.permission.resource, { kind: 'site', id: siteId! })
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
                <Icon path={isOpen ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} className="w-4 h-4" />
            </button>
            {isOpen && (
                <div className="pl-6 mt-1 space-y-1">
                    {accessibleChildren.map(child => (
                        <SidebarLink key={child.label} item={{...child, icon: <></>}} />
                    ))}
                </div>
            )}
        </div>
    );
};


const Sidebar: React.FC = () => {
    const location = useLocation();
    
    return (
        <aside className="w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">FaithEdu</h1>
            </div>
            <nav className="p-4 space-y-2">
                {navConfig.map(item => {
                    const isParentActive = item.children?.some(child => child.href && location.pathname.startsWith(child.href.split('/:')[0]));
                    return item.children 
                        ? <SidebarDropdown key={item.label} item={item} defaultOpen={isParentActive} /> 
                        : <SidebarLink key={item.label} item={item} />
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;