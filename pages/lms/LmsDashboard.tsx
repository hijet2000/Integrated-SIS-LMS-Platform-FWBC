
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { useParams, Link } from 'react-router-dom';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <Card>
        <CardContent className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
            </div>
        </CardContent>
    </Card>
);

const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const UserCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;

const LmsDashboard: React.FC = () => {
    const { siteId } = useParams();

    return (
        <div>
            <PageHeader title="Learning Management System" subtitle="Manage courses, content, and student engagement." />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Active Courses" value="23" icon={<BookIcon />} color="bg-blue-500" />
                <StatCard title="Total Enrollments" value="1,289" icon={<UserCheckIcon />} color="bg-green-500" />
                <StatCard title="Pending Grading" value="47" icon={<ClipboardListIcon />} color="bg-yellow-500" />
            </div>

             <div className="mt-8">
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Quick Actions</h3>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {/* FIX: Corrected link to follow /education/:siteId/courses pattern */}
                        <Link to={`/education/${siteId}/courses`} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition">
                            <span className="text-teal-600 dark:text-teal-400 font-semibold">Manage Courses</span>
                        </Link>
                         <Link to={`/education/${siteId}/assignments`} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition">
                            <span className="text-teal-600 dark:text-teal-400 font-semibold">Grade Assignments</span>
                        </Link>
                         <Link to={`/education/${siteId}/resources`} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition">
                            <span className="text-teal-600 dark:text-teal-400 font-semibold">Resource Library</span>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LmsDashboard;
