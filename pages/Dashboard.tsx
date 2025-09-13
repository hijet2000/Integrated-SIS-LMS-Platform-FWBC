import React from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { useAuth } from '@/constants/useAuth';

const SchoolIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 22v-4a2 2 0 1 0-4 0v4"/><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/><path d="M18 5v17"/><path d="M6 5v17"/><path d="M12 5v17"/><path d="M2 12h20"/><path d="M2 7h20"/><path d="M12 2v3"/></svg>;
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-teal-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>;

const DashboardCard: React.FC<{ to: string, title: string, description: string, icon: React.ReactNode }> = ({ to, title, description, icon }) => (
    <Link to={to} className="block group">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center space-x-6 hover:shadow-lg hover:scale-105 transition-transform duration-200">
            <div>{icon}</div>
            <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{title}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{description}</p>
            </div>
        </div>
    </Link>
);


const Dashboard: React.FC = () => {
    const { siteId } = useParams();
    const { user } = useAuth();

    return (
        <div>
            <PageHeader title={`Welcome, ${user?.name}!`} subtitle="Select a module to get started." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <DashboardCard 
                    to={`/school/${siteId}`}
                    title="School Information System (SIS)"
                    description="Manage students, faculty, attendance, fees, and academics."
                    icon={<SchoolIcon />}
                />
                <DashboardCard 
                    to={`/education/${siteId}`}
                    title="Learning Management System (LMS)"
                    description="Create courses, manage lessons, assignments, and track progress."
                    icon={<BookIcon />}
                />
            </div>
        </div>
    );
};

export default Dashboard;