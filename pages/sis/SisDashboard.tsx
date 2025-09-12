
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

const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.283.356-1.857m0 0a3.001 3.001 0 015.288 0M12 14a4 4 0 100-8 4 4 0 000 8z" /></svg>;
const AttendanceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const FeeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;

const SisDashboard: React.FC = () => {
    const { siteId } = useParams();

    return (
        <div>
            <PageHeader title="School Information System" subtitle="Overview of school operations." />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Active Students" value="482" icon={<UsersIcon />} color="bg-blue-500" />
                <StatCard title="Daily Attendance" value="95.4%" icon={<AttendanceIcon />} color="bg-green-500" />
                <StatCard title="Fees Collected (Term)" value="88%" icon={<FeeIcon />} color="bg-yellow-500" />
            </div>

            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Quick Actions</h3>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {/* FIX: Corrected link to follow /school/:siteId/students pattern */}
                        <Link to={`/school/${siteId}/students`} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition">
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Manage Students</span>
                        </Link>
                         {/* FIX: Corrected link to follow /school/:siteId/attendance pattern */}
                         <Link to={`/school/${siteId}/attendance`} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition">
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Record Attendance</span>
                        </Link>
                         {/* FIX: Corrected link to follow /school/:siteId/fees pattern */}
                         <Link to={`/school/${siteId}/fees`} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition">
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Process Fees</span>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SisDashboard;
