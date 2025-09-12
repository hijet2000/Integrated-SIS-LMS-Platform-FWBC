import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import { getCatchupClassById } from '@/services/sisApi';
import { useAuth } from '@/hooks/useAuth';
import Watermark from '@/components/digital/Watermark';
import CatchupPlayer from '@/components/catchup/CatchupPlayer';

const CatchUpViewer: React.FC = () => {
    const { siteId, catchupId } = useParams<{ siteId: string; catchupId: string }>();
    const { user } = useAuth();

    const { data: catchupClass, isLoading, isError, error } = useQuery({
        queryKey: ['catchupClass', catchupId],
        queryFn: () => getCatchupClassById(catchupId!),
        enabled: !!catchupId,
    });
    
    const watermarkText = user ? `${user.name} • ${user.id}\n${new Date().toLocaleString()}` : '';

    return (
        <div className="select-none">
            <div className="mb-4">
                <Link to={`/library/${siteId}/catchup`} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">&larr; Back to Catch-Up Classes</Link>
            </div>

            {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
            
            {isError && <ErrorState title="Error" message={error?.message || "Could not load this class."} />}
            
            {!isLoading && catchupClass && (
                <>
                    <PageHeader
                        title={catchupClass.title}
                        subtitle={<>
                            <span>Recorded on {new Date(catchupClass.date).toLocaleDateString()}</span>
                            {catchupClass.description && ` • ${catchupClass.description}`}
                        </>}
                    />
                    <div className="relative mt-6">
                        <Watermark text={watermarkText} />
                        <CatchupPlayer catchupId={catchupId!} />
                    </div>
                </>
            )}
        </div>
    );
};

export default CatchUpViewer;