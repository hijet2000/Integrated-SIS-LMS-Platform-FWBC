import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import { getAdmissionEnquiries, getVisitors, getComplaints } from '@/services/sisApi';
// FIX: Changed import path from @/constants to @/types to correct the module resolution error.
import type { AdmissionEnquiry, Visitor, Complaint } from '@/types';

// --- Stat Card Component ---
const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; isLoading?: boolean }> = ({ title, value, icon, color, isLoading = false }) => (
    <Card>
        <CardContent className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
                {isLoading 
                    ? <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mt-1" /> 
                    : <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
                }
            </div>
        </CardContent>
    </Card>
);

// --- Icon Components ---
const EnquiryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const VisitorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg>;
// FIX: Corrected a typo in the strokeWidth attribute of the SVG path.
const ComplaintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2z" /></svg>;

const subModules = [
  {
    title: 'Admission Enquiry',
    description: 'Log and manage new student enquiries, track sources, follow-ups.',
    href: 'admission-enquiry',
  },
  {
    title: 'Visitor Book',
    description: 'Record external visitors to campus (purpose, in/out time).',
    href: 'visitor-book',
  },
  {
    title: 'Phone Call Log',
    description: 'Track incoming/outgoing calls, purpose, next follow-up.',
    href: 'phone-call-log',
  },
  {
    title: 'Postal Dispatch',
    description: 'Register outgoing posts/letters/parcels with references.',
    href: 'postal-dispatch',
  },
  {
    title: 'Postal Receive',
    description: 'Track incoming posts/letters with sender details.',
    href: 'postal-receive',
  },
  {
    title: 'Complain (Register)',
    description: 'Log complaints (from students/parents/staff), assign staff, track resolutions.',
    href: 'complain',
  },
  {
    title: 'Setup Front Office',
    description: 'Configure categories used above — e.g., enquiry sources, purposes, complaint types.',
    href: 'setup',
  },
];

const ModuleCard: React.FC<{ to: string, title: string, description: string }> = ({ to, title, description }) => (
    <Link to={to} className="block group">
        <Card className="h-full flex flex-col hover:shadow-lg hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-all duration-200 border border-transparent">
            <CardHeader>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{title}</h3>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-gray-500 dark:text-gray-400 mt-1">{description}</p>
            </CardContent>
            <CardFooter>
                 <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                    Go to Module &rarr;
                </span>
            </CardFooter>
        </Card>
    </Link>
);

const FrontOfficeDashboard: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();

    const { data: enquiries, isLoading: isLoadingEnquiries } = useQuery<AdmissionEnquiry[], Error>({
        queryKey: ['admissionEnquiries', siteId],
        queryFn: () => getAdmissionEnquiries(siteId!),
        enabled: !!siteId,
    });

    const { data: visitors, isLoading: isLoadingVisitors } = useQuery<Visitor[], Error>({
        queryKey: ['visitors', siteId],
        queryFn: () => getVisitors(siteId!),
        enabled: !!siteId,
    });

    const { data: complaints, isLoading: isLoadingComplaints } = useQuery<Complaint[], Error>({
        queryKey: ['complaints', siteId],
        queryFn: () => getComplaints(siteId!),
        enabled: !!siteId,
    });

    const stats = useMemo(() => ({
        activeEnquiries: enquiries?.filter(e => e.status === 'ACTIVE').length ?? 0,
        visitorsOnCampus: visitors?.filter(v => !v.checkOut).length ?? 0,
        openComplaints: complaints?.filter(c => c.status === 'Open' || c.status === 'In Progress').length ?? 0,
    }), [enquiries, visitors, complaints]);

    const isLoadingStats = isLoadingEnquiries || isLoadingVisitors || isLoadingComplaints;

    return (
        <div>
            <PageHeader
                title="Front Office"
                subtitle="Daily front-desk operations, admissions, and enquiries."
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Active Enquiries" value={stats.activeEnquiries.toString()} icon={<EnquiryIcon />} color="bg-blue-500" isLoading={isLoadingStats} />
                <StatCard title="Visitors On Campus" value={stats.visitorsOnCampus.toString()} icon={<VisitorIcon />} color="bg-green-500" isLoading={isLoadingStats} />
                <StatCard title="Open Complaints" value={stats.openComplaints.toString()} icon={<ComplaintIcon />} color="bg-red-500" isLoading={isLoadingStats} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {subModules.map(module => (
                    <ModuleCard 
                        key={module.title}
                        to={`/front-office/${siteId}/${module.href}`}
                        title={module.title}
                        description={module.description}
                    />
                ))}
            </div>
        </div>
    );
};

export default FrontOfficeDashboard;